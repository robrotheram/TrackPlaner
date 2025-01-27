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
    

    setLocation(x: number, y: number) {
        const center = this.getCenter();
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        this.x = Math.round((x - dx) / gridSize) * gridSize;
        this.y = Math.round((y - dy) / 1) * 1;
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

export function ToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 /  Math.PI);
}

export type Point = { x: number; y: number };
export type Arc = { origin: Point; radius: number; startAngle: number; endAngle: number };