import { Point } from "@/types";
import { TrackPack } from ".";
import { railWidth, tieSpacing, tieThikness, tieWidth, TrackPieceBase } from "./base";
import { ToRadians } from "./utils";

export class TrackStraightPiece extends TrackPieceBase {
    length: number;

    constructor(code: string, x: number, y: number, rotation: number, length: number) {
        super(x, y, rotation);
        this.length = length;
        this.code = code;
    }

    getCenter() {
        const { cos, sin } = this.calculateRotationCosSin(this.rotation);
        return {
            x: this.x + (this.length / 2) * cos,
            y: this.y + (this.length / 2) * sin,
        };
    }

    setRotation(angle: number) {
        const center = this.getCenter();
        const newRotation = this.rotation + angle;
        const { cos, sin } = this.calculateRotationCosSin(angle);

        // Rotate around center
        const dx = this.x - center.x;
        const dy = this.y - center.y;
        this.x = center.x + dx * cos - dy * sin;
        this.y = center.y + dx * sin + dy * cos;
        this.rotation = newRotation;
    }

    getMarkerPoints() {
        const center = this.getCenter();
        const { cos, sin } = this.calculateRotationCosSin(this.rotation);
        const start: Point = {
            x: center.x - (this.length / 2) * cos,
            y: center.y - (this.length / 2) * sin,
        };
        const end: Point = {
            x: center.x + (this.length / 2) * cos,
            y: center.y + (this.length / 2) * sin,
        };
        return { center, start, end };
    }

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        const { center, start, end } = this.getMarkerPoints();
        this.isDev && this.markers(ctx, center, start, end);  
        ctx.save();
    
        for (let i = 0 + tieThikness * 2; i < this.length - tieThikness / 2; i += tieSpacing) {
            const tieCenterX = start.x + i * Math.cos(ToRadians(this.rotation));
            const tieCenterY = start.y + i * Math.sin(ToRadians(this.rotation));
            const { sin, cos } = this.calculateRotationCosSin(this.rotation);
            
            const tieStartX = tieCenterX - tieWidth * sin;
            const tieStartY = tieCenterY + tieWidth * cos;
            const tieEndX = tieCenterX + tieWidth * sin;
            const tieEndY = tieCenterY - tieWidth * cos;
        
            ctx.beginPath();
            ctx.moveTo(tieStartX, tieStartY);
            ctx.lineTo(tieEndX, tieEndY);
            ctx.strokeStyle = isSelected ? 'red' : '#000';
            ctx.lineWidth = tieThikness;
            ctx.stroke();
        }

        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        const { cos, sin } = this.calculateRotationCosSin(this.rotation);
        const offsetX = railWidth * -sin;
        const offsetY = railWidth * cos;
        
        ctx.moveTo(start.x + offsetX, start.y + offsetY);
        ctx.lineTo(end.x + offsetX, end.y + offsetY);
        
        ctx.moveTo(start.x - offsetX, start.y - offsetY);
        ctx.lineTo(end.x - offsetX, end.y - offsetY);
        
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
    
        const { cos } = this.calculateRotationCosSin(this.rotation);
        const railOffsetY = railWidth * cos;
    
        return (
            (rotatedX >= -this.length / 2 && rotatedX <= this.length / 2) && 
            (
                Math.abs(rotatedY - railOffsetY) < tolerance ||  
                Math.abs(rotatedY + railOffsetY) < tolerance    
            )
        );
    }
    
    clone(): TrackStraightPiece {
        return new TrackStraightPiece(this.code, this.x, this.y, this.rotation, this.length);
    }

    serialise(): TrackPack {
        return {
            code: this.code,
            type: "straight",
            length: this.length,
            position: { x: this.x, y: this.y },
            rotation: this.rotation,
        };
    }
}
