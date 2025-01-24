import { CanvasState, Theme } from "@/types"

export const DrawGrid = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, theme: Theme, state: CanvasState) => {
    const visibleArea = {
        left: (-canvas.width / 2 - state.offsetX) / state.scale,
        right: (canvas.width / 2 - state.offsetX) / state.scale,
        top: (-canvas.height / 2 - state.offsetY) / state.scale,
        bottom: (canvas.height / 2 - state.offsetY) / state.scale
    };

    // Add padding to ensure grid covers rotated view
    const padding = Math.max(canvas.width, canvas.height) / state.scale;
    const minorGridSize = 10;
    const majorGridSize = 100;

    // Calculate grid boundaries
    const startX = Math.floor((visibleArea.left - padding) / minorGridSize) * minorGridSize;
    const endX = Math.ceil((visibleArea.right + padding) / minorGridSize) * minorGridSize;
    const startY = Math.floor((visibleArea.top - padding) / minorGridSize) * minorGridSize;
    const endY = Math.ceil((visibleArea.bottom + padding) / minorGridSize) * minorGridSize;



    // Draw minor grid lines
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 0.5 / state.scale;
    ctx.globalAlpha = theme.gridOpacity * 0.5;

    for (let x = startX; x <= endX; x += minorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += minorGridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    // Draw major grid lines
    ctx.lineWidth = 1 / state.scale;
    ctx.globalAlpha = theme.gridOpacity;

    for (let x = startX; x <= endX; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    ctx.globalAlpha = 1



}