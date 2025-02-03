import { CanvasContext, ToolHandler } from "@/types";
import { Move } from "lucide-react";

export const PanningHandler:ToolHandler = {
    icon: ({ size, color, fill }) => <Move size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, {setState}: CanvasContext) => {
        setState(prev => ({
            ...prev,
            isPanning: true,
            lastX: e.clientX,
            lastY: e.clientY
        }));
    },
    onMouseMove: (e: React.MouseEvent, {state, setState}: CanvasContext) => {
        if (!state.isPanning) return
        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;

        // Apply rotation transformation to the delta
        const rotation = state.rotation; // Rotation in radians
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // // Transform the deltas into the rotated coordinate space
        const rotatedDx = dx * cos + dy * sin;
        const rotatedDy = -dx * sin + dy * cos;

        // Update the state with the rotated deltas
        setState((prev) => ({
            ...prev,
            offsetX: prev.offsetX + rotatedDx,
            offsetY: prev.offsetY + rotatedDy,
            lastX: e.clientX,
            lastY: e.clientY,
        }));
    },
    onMouseUp: (_: React.MouseEvent, {setState}: CanvasContext) => {
        setState(prev => ({
            ...prev,
            isPanning: false,
        }));
    }
}