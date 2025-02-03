import { Point } from "@/types";
import { TrackPack } from ".";
import { ToRadians } from "./utils";

export const railWidth = 8; // Railwidth /2
export const tieWidth = 15; // Width of track /2
export const tieHeight = 2;
export const tieSpacing = 6.25;
export const tieThikness = 3;
export const gridSize = 5;

export abstract class TrackPieceBase {
    x: number;
    y: number;
    rotation: number;
    code: string;

    constructor(x: number, y: number, rotation: number) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.code = '';
    }

    abstract draw(ctx: CanvasRenderingContext2D, isSelected?: boolean): void;
    abstract isSelectable(x: number, y: number, tolerance: number): boolean;
    abstract getCenter(): { x: number, y: number };
    abstract clone(): TrackPieceBase;
    abstract getMarkerPoints():{center:Point, start:Point, end:Point}
    abstract serialise():TrackPack

    setLocation(x: number, y: number): void {
        const { start, end } = this.getMarkerPoints();
        const startOffsetX = x - start.x;
        const startOffsetY = y - start.y;
        const endOffsetX = x - end.x;
        const endOffsetY = y - end.y;

        // Determine which endpoint is closer to the new position
        const startDistance = Math.hypot(startOffsetX, startOffsetY);
        const endDistance = Math.hypot(endOffsetX, endOffsetY);

        if (startDistance < endDistance) {
            // Update the position based on the start endpoint
            this.x += startOffsetX;
            this.y += startOffsetY;
        } else {
            // Update the position based on the end endpoint
            this.x += endOffsetX;
            this.y += endOffsetY;
        }
    }

    setRotation(rotation: number) {
        rotation +=this.rotation
        this.rotation = rotation >= 0 ? rotation % 360 : (rotation % 360 + 360) % 360;
        console.log(this.rotation)
    }

    private drawMarker(ctx: CanvasRenderingContext2D, point: Point, color: string) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    markers(ctx: CanvasRenderingContext2D, ...points:Point[]) {
        const colors = ["red", "blue", "green", "yellow", "purple"];
        points.forEach((p,index) => {
            this.drawMarker(ctx, p,  colors[index % colors.length]);
        })
    }

    calculateRotationCosSin(rotation: number) {
        const rad = ToRadians(rotation);
        return { cos: Math.cos(rad), sin: Math.sin(rad) };
    }
   
}