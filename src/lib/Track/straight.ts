import { Arc, railWidth, tieSpacing, tieThikness, tieWidth, ToRadians, TrackPieceBase } from "./base";

export class TrackStraightPiece extends TrackPieceBase {
    length: number;

    constructor(code: string, x: number, y: number, rotation: number, length: number) {
        super(x, y, rotation);
        this.length = length;
        this.code = code;
    }

    markers(ctx:CanvasRenderingContext2D) {
        const center = this.getCenter();
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();

        const startX = center.x - this.length / 2 * Math.cos(ToRadians(this.rotation));
        const startY = center.y - this.length / 2 * Math.sin(ToRadians(this.rotation));

        ctx.beginPath();
        ctx.arc(startX, startY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();

        const endX = center.x + this.length / 2 * Math.cos(ToRadians(this.rotation));
        const endY = center.y + this.length / 2 * Math.sin(ToRadians(this.rotation));

        ctx.beginPath();
        ctx.arc(endX, endY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'purple';
        ctx.fill();
    }
    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        this.markers(ctx);
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


