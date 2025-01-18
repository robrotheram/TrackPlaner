const railWidth = 4;
const tieWidth = 10;
const tieHeight = 2;
const tieSpacing = 15;
const gridSize = 5;

abstract class TrackPieceBase {
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

    setLocation(x: number, y: number) {
        const center = this.getCenter();
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        this.x = Math.round((x - dx) / gridSize) * gridSize;
        this.y = Math.round((y - dy) / gridSize) * gridSize;
    }

    setRotation(rotation: number) {
        this.rotation = ((rotation % 360) + 360) % 360;
    }

    protected setupContext(ctx: CanvasRenderingContext2D, isSelected = false) {
        const center = this.getCenter();
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.strokeStyle = isSelected ? 'red' : '#000';
        ctx.lineWidth = railWidth;
    }
}

class TrackStraightPiece extends TrackPieceBase {
    length: number;

    constructor(code: string, x: number, y: number, rotation: number, length: number) {
        super(x, y, rotation);
        this.length = length;
        this.code = code;
    }

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        this.setupContext(ctx, isSelected);
        ctx.save();
        ctx.translate(this.x + this.length / 2, this.y);
        ctx.rotate(ToRadians(this.rotation));

        ctx.beginPath();
        ctx.moveTo(-this.length / 2, -railWidth);
        ctx.lineTo(this.length / 2, -railWidth);
        ctx.moveTo(-this.length / 2, railWidth);
        ctx.lineTo(this.length / 2, railWidth);
        ctx.stroke();

        for (let i = -this.length / 2 + tieSpacing / 2; i < this.length / 2; i += tieSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, -tieWidth);
            ctx.lineTo(i, tieWidth);
            ctx.stroke();
        }
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

type Point = { x: number; y: number };
type Arc = { origin: Point; radius: number; startAngle: number; endAngle: number };

class TrackCurvedPiece extends TrackPieceBase {
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

    draw(ctx: CanvasRenderingContext2D, isSelected?: boolean) {
        this.setupContext(ctx, isSelected);
        ctx.save();
        ctx.translate(this.x, this.y);

        const { origin, startAngle, endAngle } = this.getArc(0,0);

        ctx.beginPath();
        ctx.arc(origin.x, origin.y, this.radius - railWidth, startAngle, endAngle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, this.radius + railWidth, startAngle, endAngle);
        ctx.stroke();

        ctx.translate(origin.x, origin.y);
        const arcLength = this.radius * (endAngle - startAngle);
        for (let i = tieSpacing / 2; i < arcLength + tieSpacing / 2; i += tieSpacing) {
            const angle = startAngle + (i / arcLength) * (endAngle - startAngle);
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(this.radius - tieWidth, -tieHeight / 2);
            ctx.lineTo(this.radius + tieWidth, -tieHeight / 2);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    isSelectable(x: number, y: number, tolerance = 20) {
        const { origin } = this.getArc();
        const dx = x - origin.x;
        const dy = y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius - tolerance || distance > this.radius + tolerance) {
            return false;
        }

        let angle = Math.atan2(dy, dx) - ToRadians(this.rotation);
        const normalizeAngle = (a: number) => (a < 0 ? a + 2 * Math.PI : a);
        const normalizedStart = normalizeAngle(ToRadians(this.startAngle));
        const normalizedEnd = normalizeAngle(ToRadians(this.endAngle));
        angle = normalizeAngle(angle);

        if (normalizedStart < normalizedEnd) {
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

        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;

        const startAngle = ToRadians(this.startAngle) + ToRadians(this.rotation);
        const endAngle = ToRadians(this.endAngle) + ToRadians(this.rotation);

        return { origin: { x, y }, radius: this.radius, startAngle, endAngle };
    }

    setLocation(x: number, y: number): void {
        const center = this.getCenter();
        const dx = center.x - this.x;
        const dy = center.y - this.y;
        this.x = Math.round((x - dx) / gridSize) * gridSize;
        this.y = Math.round((y - dy) / gridSize) * gridSize;

        const radiusRemainder = this.radius % gridSize;
        const correction = radiusRemainder <= gridSize / 2 ? -radiusRemainder : gridSize - radiusRemainder;
        if (correction !== 0) {
            this.x += correction;
            this.y += correction;
        }
    }

    clone(): TrackCurvedPiece {
        return new TrackCurvedPiece(this.code, this.x, this.y, this.rotation, this.startAngle, this.endAngle, this.radius);
    }
}

export { TrackPieceBase, TrackStraightPiece, TrackCurvedPiece };

export function ToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 /  Math.PI);
}