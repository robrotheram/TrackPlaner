import { CanvasState, Theme } from "@/types"

export const DrawGrid = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    theme: Theme,
    state: CanvasState
) => {
    const minorGridSize = 10;
    const majorGridSize = 100;
    ctx.save();

    let left = -(canvas.width - (state.lastX)) / state.scale
    let top = -(canvas.height +(state.lastY)) / state.scale
    let right = (canvas.width + (state.lastX)) / (state.scale < 1 ? state.scale : 1)
    let bottom = (canvas.height + (state.lastY)) / (state.scale < 1 ? state.scale : 1)
    
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