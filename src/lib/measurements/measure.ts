import { Point } from "@/types";
import { calculateDistance } from "./utils";

export class Measurement  {
    id: string; 
    start: Point;
    end: Point;
    distance: number;

    constructor(start: Point) {
        this.id = Math.random().toString(36).slice(2, 9); 
        this.start = start;
        this.end = start;
        this.distance = 0;
    }

    setEnd(end: Point) {
        this.end = end;
        this.distance = calculateDistance(this.start, this.end);
    }

    drawPerpendicularMarkers = (ctx: CanvasRenderingContext2D) => {
        const markerLength = 10;
        const start = this.start;
        const end = this.end;
    
        // Calculate the angle of the line
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
    
        // Perpendicular angle
        const perpendicularAngle = angle + Math.PI / 2;
    
        // Draw start perpendicular marker
        const startMarkerX1 = start.x + markerLength * Math.cos(perpendicularAngle);
        const startMarkerY1 = start.y + markerLength * Math.sin(perpendicularAngle);
        const startMarkerX2 = start.x - markerLength * Math.cos(perpendicularAngle);
        const startMarkerY2 = start.y - markerLength * Math.sin(perpendicularAngle);
    
        ctx.beginPath();
        ctx.moveTo(startMarkerX1, startMarkerY1);
        ctx.lineTo(startMarkerX2, startMarkerY2);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    
        // Draw end perpendicular marker
        const endMarkerX1 = end.x + markerLength * Math.cos(perpendicularAngle);
        const endMarkerY1 = end.y + markerLength * Math.sin(perpendicularAngle);
        const endMarkerX2 = end.x - markerLength * Math.cos(perpendicularAngle);
        const endMarkerY2 = end.y - markerLength * Math.sin(perpendicularAngle);
    
        ctx.beginPath();
        ctx.moveTo(endMarkerX1, endMarkerY1);
        ctx.lineTo(endMarkerX2, endMarkerY2);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    };


    draw = (ctx: CanvasRenderingContext2D) => {

            // Draw the line
            ctx.beginPath();
            ctx.moveTo(this.start.x, this.start.y);
            ctx.lineTo(this.end.x, this.end.y);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.stroke();
    
            // Draw perpendicular markers at the start and end points
            this.drawPerpendicularMarkers(ctx);
    
            // Draw the distance text
            ctx.font = "16px Arial";
            ctx.fillStyle = "red";
            ctx.fillText(
                `${this.distance.toFixed(0)} cm`,
                (this.start.x + this.end.x) / 2,
                (this.start.y + this.end.y) / 2
            );
    };

    serialise = () => {
        return {
            id: this.id,
            start: { x: this.start.x, y: this.start.y },
            end: { x: this.end.x, y: this.end.y },
            distance: this.distance,
        };
    }   
    
}


