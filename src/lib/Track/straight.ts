import { Point, railWidth, tieSpacing, tieThikness, tieWidth, ToRadians, TrackPieceBase } from "./base";

export class TrackStraightPiece extends TrackPieceBase {
    length: number;

    constructor(code: string, x: number, y: number, rotation: number, length: number) {
        super(x, y, rotation);
        this.length = length;
        this.code = code;
    }

    getMarkerPoints() {
        const center = this.getCenter();
        const { cos, sin } = this.calculateRotationCosSin(this.rotation);

        const halfLength = this.length / 2;
        const start: Point = {
            x: center.x - halfLength * cos,
            y: center.y - halfLength * sin,
        };
        const end: Point = {
            x: center.x + halfLength * cos,
            y: center.y + halfLength * sin,
        };
       

        return { center, start, end };
    }

  
    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        const {center, start, end} = this.getMarkerPoints()
        this.markers(ctx, center, start, end);
        ctx.save();
        ctx.translate(this.x + this.length / 2, this.y);
        ctx.rotate(ToRadians(this.rotation));


        for (let i = -this.length / 2 + tieThikness * 2; i < this.length / 2 - tieThikness / 2; i += tieSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, -tieWidth);
            ctx.lineTo(i, tieWidth);
            ctx.strokeStyle = isSelected ? 'red' : '#000';
            ctx.lineWidth = tieThikness;
            ctx.stroke();
        }
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-this.length / 2, -railWidth);
        ctx.lineTo(this.length / 2, -railWidth);
        ctx.moveTo(-this.length / 2, railWidth);
        ctx.lineTo(this.length / 2, railWidth);
        ctx.stroke();


        ctx.restore();
    }

    isSelectable(x: number, y: number, tolerance = 20) {
        const center = this.getCenter();
        const dx = x - center.x;
        const dy = y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) - ToRadians(this.rotation);
        const rotatedX = distance * Math.cos(angle);
        const rotatedY = distance * Math.sin(angle);
        return rotatedX >= -this.length / 2 && rotatedX <= this.length / 2 && Math.abs(rotatedY) < tolerance;
    }

    getCenter() {
        return { x: this.x + this.length / 2, y: this.y };
    }

    clone(): TrackStraightPiece {
        return new TrackStraightPiece(this.code, this.x, this.y, this.rotation, this.length);
    }
}


