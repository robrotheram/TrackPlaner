import { Measurement, Point } from "@/types";
import { TrackPieceBase } from "../Track";


const drawPerpendicularMarkers = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point
) => {
    const markerLength = 10;

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

export const calculateDistance = (p1: Point, p2: Point) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

export const arePointsClose = (p1: Point, p2: Point, threshold: number): boolean => {
    return calculateDistance(p1, p2) <= threshold;
};

export const isPointNearLine = (point: Point, line: Measurement, threshold = 5) => {
    const { start, end } = line;

    // Calculate distance from the point to the line segment
    const A = point.x - start.x;
    const B = point.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let closest: Point;
    if (param < 0) {
        closest = start;
    } else if (param > 1) {
        closest = end;
    } else {
        closest = { x: start.x + param * C, y: start.y + param * D };
    }

    return calculateDistance(point, closest) <= threshold;
};
// Draw lines and distances on the canvas
export const drawMeasurements = (ctx: CanvasRenderingContext2D, measurements: Measurement[]) => {
    measurements.forEach(({ start, end, distance }) => {
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw perpendicular markers at the start and end points
        drawPerpendicularMarkers(ctx, start, end);

        // Draw the distance text
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(
            `${distance.toFixed(0)} cm`,
            (start.x + end.x) / 2,
            (start.y + end.y) / 2
        );
    });
};

export const findNearestEndpoint = (
    currentPiece: any,
    allTracks: any[],
    currentPoint: Point,
    threshold: number
): { point: Point | null; track: TrackPieceBase | null } => {
    let nearestPoint: Point | null = null;
    let nearestTrack: TrackPieceBase | null = null;
    let minDistance = threshold;

    allTracks.forEach(track => {
        if (track === currentPiece) return;

        const markers = track.getMarkerPoints();
        const endpoints = [markers.start, markers.end];

        endpoints.forEach(point => {
            const dx = point.x - currentPoint.x;
            const dy = point.y - currentPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
                nearestTrack = track;
            }
        });
    });

    return { point: nearestPoint, track: nearestTrack };
};