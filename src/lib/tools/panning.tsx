import { CanvasContext, ToolHandler } from "@/types";
import { Move } from "lucide-react";

export const PanningHandler: ToolHandler = {
    icon: ({ size, color, fill }) => <Move size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, { setState }: CanvasContext) => {
        setState(prev => ({
            ...prev,
            isPanning: true,
            lastX: e.clientX,
            lastY: e.clientY
        }));
    },
    onMouseMove: (e: React.MouseEvent, { state, setState }: CanvasContext) => {
        if (!state.isPanning) return
        const dx = (e.clientX - state.lastX) / state.scale;
        const dy = (e.clientY - state.lastY) / state.scale;

        // Apply rotation transformation to the delta
        const rotation = state.rotation; // Rotation in radians
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        const rotatedDx = dx * cos + dy * sin;
        const rotatedDy = -dx * sin + dy * cos;

        setState((prev) => ({
            ...prev,
            offsetX:  Math.max(-1800, Math.min(1800, state.offsetX + rotatedDx)),
            offsetY: Math.max(-900, Math.min(3000, state.offsetY + rotatedDy)),
            lastX: e.clientX,
            lastY: e.clientY,
        }));
    },
    onMouseUp: (_: React.MouseEvent, { setState }: CanvasContext) => {
        setState(prev => ({
            ...prev,
            isPanning: false,
        }));
    }
}