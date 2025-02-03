import { CanvasContext, ToolHandler } from "@/types";
import { Ruler } from "lucide-react";


export const MeasurementHandler:ToolHandler = {
    icon: ({ size, color, fill }) => <Ruler size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, {state, setState, getRealCoordinates}: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const measurements = [...state.measurements];
        if (!state.isToolActive) {
            measurements.push({ start: coords, end: coords, distance: 0 })
        }
        setState(prev => ({
            ...prev,
            isToolActive: !state.isToolActive,
            measurements,
            lastX: coords.x,
            lastY: coords.y
        }));
    },
    onMouseMove: (e: React.MouseEvent, {state, setState, getRealCoordinates}: CanvasContext) => {
        if (state.isToolActive) {
            const { x, y } = getRealCoordinates(e.clientX, e.clientY);
            const dx = x - state.lastX;
            const dy = y - state.lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const measurements = [...state.measurements];
            measurements[measurements.length - 1] = {
                    start: { x: state.lastX, y: state.lastY },
                    end: { x, y },
                    distance,
                };
            setState(prev => ({
                ...prev,
                measurements
            }));
        }
    }
}