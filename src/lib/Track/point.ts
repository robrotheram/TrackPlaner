import { railWidth, ToRadians, Point, tieSpacing, tieThikness, tieWidth } from "./base";
import { TrackCurvedPiece } from "./curve";

export abstract class TrackPointPiece extends TrackCurvedPiece {
    length: number;

    constructor(
        code: string,
        x: number,
        y: number,
        rotation: number,
        startAngle: number,
        endAngle: number,
        radius: number,
        length: number

    ) {
        super(code, x, y, rotation, startAngle, endAngle, radius);
        this.length = length;
    }

    abstract getDirectionMultiplier(): number;

    getMarkerPoints() {
        const center = this.getCenter();
        const { cos, sin } = this.calculateRotationCosSin(this.rotation);
        const directionMultiplier = this.getDirectionMultiplier();

        const halfLength = this.length / 2;
        const start: Point = {
            x: center.x - halfLength * cos,
            y: center.y - halfLength * sin,
        };
        const end: Point = {
            x: center.x + halfLength * cos,
            y: center.y + halfLength * sin,
        };
        const arcOrigin: Point = {
            x: start.x + (this.radius*directionMultiplier) * Math.cos(ToRadians(this.rotation + 90)),
            y: start.y + (this.radius*directionMultiplier) * Math.sin(ToRadians(this.rotation + 90)),
        };

        return { center, start, end, arcOrigin };
    }

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        const { center, start, end, arcOrigin } = this.getMarkerPoints();
        const directionMultiplier = this.getDirectionMultiplier();

        // Calculate the start and end angles correctly depending on the handedness
        const startAngle = ToRadians(this.startAngle) + ToRadians(this.rotation - (90*directionMultiplier));
        const endAngle = ToRadians(this.endAngle) + ToRadians(this.rotation -(directionMultiplier === 1 ? 90 : -45)); 

        // Adjust for right-handed or left-handed points
        let adjustedStartAngle = startAngle;
        let adjustedEndAngle = endAngle;

        // Right-handed track (clockwise): use the angles as is
        if (directionMultiplier === 1) {
            adjustedStartAngle = startAngle;
            adjustedEndAngle = endAngle;
        }
        // Left-handed track (counter-clockwise): swap the angles
        else {
            adjustedStartAngle = endAngle;
            adjustedEndAngle = startAngle;
        }

        ctx.save();
        this.markers(ctx, center, start, end, arcOrigin);

        // Draw ties
        ctx.save();
        ctx.translate(this.x + this.length / 2, this.y);
        ctx.rotate(ToRadians(this.rotation));
        const halfLength = this.length / 2;
        for (let i = -halfLength + tieThikness * 2; i < halfLength - tieThikness / 2; i += tieSpacing) {
            const d = distanceToArc(arcOrigin, start.x, start.y, i + halfLength);
            ctx.beginPath();
            ctx.moveTo(i, -tieWidth*directionMultiplier);
            ctx.lineTo(i, (tieWidth + d)*directionMultiplier);
            ctx.strokeStyle = isSelected ? 'red' : '#000';
            ctx.lineWidth = tieThikness;
            ctx.lineCap = "butt";
            ctx.stroke();
        }
        ctx.restore();

        // Draw rails with the corrected start and end angles
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(
            arcOrigin.x,
            arcOrigin.y,
            this.radius - railWidth,
            adjustedStartAngle,
            adjustedEndAngle
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            arcOrigin.x,
            arcOrigin.y,
            this.radius + railWidth,
            adjustedStartAngle,
            adjustedEndAngle
        );
        ctx.stroke();

        ctx.restore();
        ctx.save();
        ctx.translate(this.x + this.length / 2, this.y);
        ctx.rotate(ToRadians(this.rotation));

         

        // Draw straight track section
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-this.length / 2, -railWidth);
        ctx.lineTo(this.length / 2, -railWidth);
        ctx.moveTo(-this.length / 2, railWidth);
        ctx.lineTo(this.length / 2, railWidth);
        ctx.stroke();

       
        ctx.restore();
    }

    getCenter(x1 = this.x, y1 = this.y): Point {
        return { x: x1 + this.length / 2, y: y1 };
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
        const handedness = this.getDirectionMultiplier() === 1 ? "right" : "left";
        return handedness === "right"
            ? new RightHandedTrackPointPiece(this.code, this.x, this.y, this.rotation, this.length)
            : new LeftHandedTrackPointPiece(this.code, this.x, this.y, this.rotation, this.length);
    }

    private calculateRotationCosSin(rotation: number) {
        const rad = ToRadians(rotation);
        return { cos: Math.cos(rad), sin: Math.sin(rad) };
    }

    markers(ctx: CanvasRenderingContext2D, center: Point, start: Point, end: Point, _:Point) {
        this.drawMarker(ctx, center, 'blue');
        this.drawMarker(ctx, start, 'red');
        this.drawMarker(ctx, end, 'purple');
        // this.drawMarker(ctx, origin, 'green');
    }

    private drawMarker(ctx: CanvasRenderingContext2D, point: Point, color: string) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// Utility function for distance calculation
const distanceToArc = (
    origin: Point,
    px: number,
    py: number,
    d: number
): number => {
    const dx = px - origin.x;
    const dy = py - origin.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    const ux = dy / length;
    const uy = -dx / length;

    const pxLine = px + d * ux;
    const pyLine = py + d * uy;

    return Math.abs(Math.sqrt((pxLine - origin.x) ** 2 + (pyLine - origin.y) ** 2) - length);
};


export class LeftHandedTrackPointPiece extends TrackPointPiece {
    constructor(
        code: string,
        x: number,
        y: number,
        rotation: number,
        length: number
    ) {
        super(code, x, y, rotation, 0, 22.5, 438, length);
    }

    getDirectionMultiplier(): number {
        return -1;
    }
}


export class RightHandedTrackPointPiece extends TrackPointPiece {
    constructor(
        code: string,
        x: number,
        y: number,
        rotation: number,
        length: number
    ) {
        super(code, x, y, rotation, 0, 22.5, 438, length);
    }

    getDirectionMultiplier(): number {
        return 1;
    }
}
