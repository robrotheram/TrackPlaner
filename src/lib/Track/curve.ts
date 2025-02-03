import { Arc, Point } from "@/types";
import { TrackPack } from ".";
import { TrackPieceBase, tieThikness, tieSpacing, tieWidth, tieHeight, railWidth, } from "./base";
import { ToRadians } from "./utils";

export class TrackCurvedPiece extends TrackPieceBase {
    startAngle: number;
    endAngle: number;
    radius: number;

    constructor(code: string, x: number, y: number, rotation: number, startAngle: number, endAngle: number, radius: number) {
        super(x, y, rotation);
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.radius = radius;
        this.code = code;
    }

    getMarkerPoints() {
        const { origin, startAngle, endAngle } = this.getArc(this.x, this.y);
        const start = {
            x: origin.x + Math.cos(startAngle) * this.radius,
            y: origin.y + Math.sin(startAngle) * this.radius,
        };
        const end = {
            x: origin.x + Math.cos(endAngle) * this.radius,
            y: origin.y + Math.sin(endAngle) * this.radius,
        };
        return { center: this.getCenter(), start, end };
    }

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        const { center, start, end } = this.getMarkerPoints()
        this.markers(ctx, center, start, end);

        const { origin, startAngle, endAngle, } = this.getArc(0, 0);

        ctx.save();
        ctx.translate(this.x + origin.x, this.y + origin.y);
        const arcLength = this.radius * (endAngle - startAngle);
        for (let i = tieThikness; i < arcLength - tieThikness / 2; i += tieSpacing) {

            const angle = startAngle + (i / arcLength) * (endAngle - startAngle);
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(this.radius - tieWidth, -tieHeight / 2);
            ctx.lineTo(this.radius + tieWidth, -tieHeight / 2);
            ctx.closePath();
            ctx.strokeStyle = isSelected ? 'red' : '#000';
            ctx.lineWidth = tieThikness;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? 'red' : '#9B9B97';
        ctx.lineWidth = 2;
        ctx.arc(origin.x, origin.y, this.radius - railWidth, startAngle, endAngle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, this.radius + railWidth, startAngle, endAngle);
        ctx.stroke();


        ctx.restore();
    }

    isSelectable(x: number, y: number, tolerance = 20) {
        const { origin } = this.getArc();
        const dx = x - origin.x;
        const dy = y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if point is within the tolerance band of the arc radius
        if (Math.abs(distance - this.radius) > tolerance) {
            return false;
        }

        // Rotate the point to align with the arc's rotation
        const rotatedDx = dx * Math.cos(-ToRadians(this.rotation)) - dy * Math.sin(-ToRadians(this.rotation));
        const rotatedDy = dx * Math.sin(-ToRadians(this.rotation)) + dy * Math.cos(-ToRadians(this.rotation));

        // Calculate the angle of the rotated point
        let angle = Math.atan2(rotatedDy, rotatedDx);

        // Normalize angles to 0-2π range
        const normalizeAngle = (a: number) => (a < 0 ? a + 2 * Math.PI : a) % (2 * Math.PI);

        const normalizedStart = normalizeAngle(ToRadians(this.startAngle));
        const normalizedEnd = normalizeAngle(ToRadians(this.endAngle));
        angle = normalizeAngle(angle);
        if (normalizedStart <= normalizedEnd) {
            return angle >= normalizedStart && angle <= normalizedEnd;
        } else {
            return angle >= normalizedStart || angle <= normalizedEnd;
        }
    }

    getCenter(x = this.x, y = this.y): Point {
        const midAngle = (ToRadians(this.startAngle) + ToRadians(this.endAngle)) / 2;
        return { x: x + this.radius * Math.cos(midAngle), y: y + this.radius * Math.sin(midAngle) };
    }

    getArc(x1 = this.x, y1 = this.y): Arc {
        const { x: h, y: k } = this.getCenter(x1, y1);
        let theta = Math.atan2(h - x1, k - y1);
        theta += ((ToRadians(this.startAngle) + ToRadians(this.endAngle)) + Math.PI / 2) + ToRadians(this.rotation);

        let x = h + this.radius * Math.cos(theta);
        let y = k + this.radius * Math.sin(theta);

        const startAngle = ToRadians(this.startAngle) + ToRadians(this.rotation);
        const endAngle = ToRadians(this.endAngle) + ToRadians(this.rotation);

        return { origin: { x, y }, radius: this.radius, startAngle, endAngle };
    }

    getArcLength(): number {
        let theta = ToRadians(this.endAngle) - ToRadians(this.startAngle);
        if (theta < 0) {
            theta += 2 * Math.PI;
        }
        return (this.radius - railWidth) * theta;
    }

    clone(): TrackCurvedPiece {
        return new TrackCurvedPiece(this.code, this.x, this.y, this.rotation, this.startAngle, this.endAngle, this.radius);
    }

    serialise(): TrackPack {
        return {
            code: this.code,
            type: "curve",
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            radius: this.radius,
            position: { x: this.x, y: this.y },
            rotation: this.rotation
        }
    }

}

