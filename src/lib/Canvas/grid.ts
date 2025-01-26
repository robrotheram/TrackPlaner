import { CanvasState, Theme } from "@/types"

export const DrawGrid = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    state: CanvasState
) => {
    const minorGridSize = 10; // Minor grid spacing
    const majorGridSize = 100; // Major grid spacing

    // Save the current transformation state
    ctx.save();

    // Apply canvas transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(state.scale, state.scale);
    ctx.translate(-state.offsetX, -state.offsetY);

    // Calculate visible area in world coordinates
    const visibleArea = {
        left: -canvas.width / 2 / state.scale + state.offsetX,
        right: canvas.width / 2 / state.scale + state.offsetX,
        top: -canvas.height / 2 / state.scale + state.offsetY,
        bottom: canvas.height / 2 / state.scale + state.offsetY,
    };

    // Add padding to ensure the grid appears infinite
    const padding = Math.max(canvas.width, canvas.height) / state.scale;
    const paddedArea = {
        left: visibleArea.left - padding,
        right: visibleArea.right + padding,
        top: visibleArea.top - padding,
        bottom: visibleArea.bottom + padding,
    };

    // Calculate the starting and ending grid positions (snap to grid)
    const startX = Math.floor(paddedArea.left / minorGridSize) * minorGridSize;
    const startY = Math.floor(paddedArea.top / minorGridSize) * minorGridSize;
    const endX = Math.ceil(paddedArea.right / minorGridSize) * minorGridSize;
    const endY = Math.ceil(paddedArea.bottom / minorGridSize) * minorGridSize;

    // Draw minor grid lines
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 0.5 / state.scale;
    ctx.globalAlpha = theme.gridOpacity * 0.5;

    for (let x = startX; x <= endX; x += minorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, paddedArea.top);
        ctx.lineTo(x, paddedArea.bottom);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += minorGridSize) {
        ctx.beginPath();
        ctx.moveTo(paddedArea.left, y);
        ctx.lineTo(paddedArea.right, y);
        ctx.stroke();
    }

    // Draw major grid lines
    ctx.lineWidth = 1 / state.scale;
    ctx.globalAlpha = theme.gridOpacity;

    for (let x = startX; x <= endX; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, paddedArea.top);
        ctx.lineTo(x, paddedArea.bottom);
        ctx.stroke();
    }

    for (let y = startY; y <= endY; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(paddedArea.left, y);
        ctx.lineTo(paddedArea.right, y);
        ctx.stroke();
    }

    // Restore the original transformation state
    ctx.restore();

    // Reset global alpha for other drawings
    ctx.globalAlpha = 1;
};