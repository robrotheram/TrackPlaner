import { railWidth, ToRadians, Point, tieSpacing, tieThikness, tieWidth, Arc, tieHeight } from "./base";
import { TrackCurvedPiece } from "./curve";

export class TrackPointPiece extends TrackCurvedPiece {
    length: number

    constructor(code: string, x: number, y: number, rotation: number, startAngle: number, endAngle: number, radius: number) {
        super(code, x, y, rotation, startAngle, endAngle, radius);
        this.length = 168;
    }

    getMarkerPoints() {
        const center = this.getCenter();
        const start: Point = {
            x: center.x - this.length / 2 * Math.cos(ToRadians(this.rotation)),
            y: center.y - this.length / 2 * Math.sin(ToRadians(this.rotation))
        }
        const end: Point = {
            x: center.x + this.length / 2 * Math.cos(ToRadians(this.rotation)),
            y: center.y + this.length / 2 * Math.sin(ToRadians(this.rotation))
        }
        const arcOrigin = {
            x: start.x + this.radius * Math.cos(ToRadians(this.rotation + 90)),
            y: start.y + this.radius * Math.sin(ToRadians(this.rotation + 90))
        }
        return { center, start, end, arcOrigin }
    }

    markers(ctx: CanvasRenderingContext2D, center: Point, start: Point, end: Point) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'purple';
        ctx.fill();
    }

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        const { center, start, end, arcOrigin} = this.getMarkerPoints()
        const startAngle = ToRadians(this.startAngle) + ToRadians(this.rotation - 90);
        const endAngle = ToRadians(this.endAngle) + ToRadians(this.rotation - 90);

        ctx.save()
        this.markers(ctx, center, start, end)
       
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = "round"
        ctx.beginPath();
        ctx.arc(
            arcOrigin.x,
            arcOrigin.y,
            this.radius-railWidth,
            startAngle,
            endAngle
        ); 
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            arcOrigin.x,
            arcOrigin.y,
            this.radius+railWidth,
            startAngle,
            endAngle
        ); 
        ctx.stroke();


        ctx.restore();
        ctx.save();
        ctx.translate(this.x + this.length / 2, this.y);
        ctx.rotate(ToRadians(this.rotation));
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = "round"



        ctx.beginPath();
        ctx.moveTo(-this.length / 2, -railWidth);
        ctx.lineTo(this.length / 2, -railWidth);
        ctx.moveTo(-this.length / 2, railWidth);
        ctx.lineTo(this.length / 2, railWidth);
        ctx.stroke();


        for (let i = -this.length / 2 + tieThikness * 2; i < this.length / 2 - tieThikness / 2; i += tieSpacing) {
            const d = distanceToArc(arcOrigin, start.x, start.y, i+this.length / 2)
            ctx.beginPath();
            ctx.moveTo(i, -tieWidth);
            ctx.lineTo(i, tieWidth + d);
            ctx.strokeStyle = isSelected ? 'red' : '#000';
            ctx.lineWidth = tieThikness;
             ctx.lineCap = "butt"
            ctx.stroke();
        }
        ctx.restore();

    }

    getCenter(x1 = this.x, y1 = this.y): Point {
        return { x: x1 + this.length / 2, y: this.y };
    }


    setLocation(x: number, y: number): void {
        const center = this.getCenter();
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        this.x = Math.round((x - dx))// / gridSize) * gridSize;
        this.y = Math.round((y - dy))// / gridSize) * gridSize;
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

    clone(): TrackPointPiece {
        return new TrackPointPiece(this.code, this.x, this.y, this.rotation, this.startAngle, this.endAngle, this.radius);
    }
}


const distanceToArc = (
    origin: Point,
    px: number, // x-coordinate of the line's starting point (on the arc)
    py: number, // y-coordinate of the line's starting point (on the arc)
    d: number   // distance along the line from the starting point
) => {
    // Calculate the direction vector of the line (perpendicular to the arc)
    const dx = px - origin.x; // x-component of the vector from center to start point
    const dy = py - origin.y; // y-component of the vector from center to start point
    const length = Math.sqrt(dx * dx + dy * dy); // Length of the vector (should equal the radius)

    // Unit vector for the perpendicular line direction
    const ux = dy / length; // Perpendicular x-component
    const uy = -dx / length; // Perpendicular y-component

    // Coordinates of the point P on the line at distance d
    const pxLine = px + d * ux;
    const pyLine = py + d * uy;

    // Distance from the arc's center to point P on the line
    const distanceFromCenterToP = Math.sqrt(
        (pxLine - origin.x) ** 2 + (pyLine - origin.y) ** 2
    );

    // Distance from point P to the arc
    const distanceToArc = Math.abs(distanceFromCenterToP - length);

    return distanceToArc;
}