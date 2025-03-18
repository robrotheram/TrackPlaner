import { CanvasState, Point, Theme } from "@/types"
import { TrackPieceBase } from "../track";

export const DrawGrid = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    state: CanvasState
) => {
    const minorGridSize = 10;
    const majorGridSize = 100;
    ctx.save();

    let left = -(canvas.width / state.scale) - canvas.width
    let top = -(canvas.height / state.scale) - canvas.height
    let right = (canvas.width / state.scale) +canvas.width - state.offsetX
    let bottom = canvas.height / state.scale + canvas.height - state.offsetY    
    
    ctx.strokeStyle = theme.gridColor;

    if (state.scale > 0.2) {
        ctx.lineWidth = 0.5 ;
        ctx.globalAlpha = theme.gridOpacity * 0.5;

        ctx.beginPath();
        for (let x = left; x < right; x += minorGridSize) {
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
        }
        for (let y = top; y < bottom; y += minorGridSize) {
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
        }
    }

    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.globalAlpha = theme.gridOpacity;

    for (let x = left; x < right; x += majorGridSize) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
    }

    for (let y = top; y < bottom; y += majorGridSize) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
    }
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
};


// Add utility functions
export const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
};

export const getPinchAngle = (touches: React.TouchList) => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx);
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
        const endpoints = [markers.start, markers.end, markers.endArc].filter(point => point != null);

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