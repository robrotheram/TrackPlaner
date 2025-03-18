import { CanvasContext, ToolHandler } from "@/types";
import { Ruler } from "lucide-react";
import { Measurement } from "../measurements/measure";


export const MeasurementHandler: ToolHandler = {
    icon: ({ size, color, fill }) => <Ruler size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, { layout, state, setState, setLayout, getRealCoordinates }: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const measurements = [...layout.measurements];
        if (!state.isToolActive) {
            measurements.push(new Measurement(coords));
        }
        setState(prev => ({
            ...prev,
            isToolActive: !state.isToolActive,
            lastX: coords.x,
            lastY: coords.y
        }));
        setLayout({
            type: "ON_MEASUREMENT_CHANGE",
            measurements
        })

    },
    onMouseMove: (e: React.MouseEvent, { layout, state, setLayout, getRealCoordinates }: CanvasContext) => {
        if (state.isToolActive) {
            const { x, y } = getRealCoordinates(e.clientX, e.clientY);
            const measurements = [...layout.measurements];
            measurements[measurements.length - 1].setEnd({x, y});
            setLayout({
                type: "ON_MEASUREMENT_CHANGE",
                measurements
            })
        }
    },
    onMouseUp: (_, { layout, state, setLayout, setState }: CanvasContext) => {    
        if (state.isToolActive) {
            setState(prev => ({
                ...prev,
                isToolActive: false
            }));
            setLayout({
                type: "UPDATE_MEASUREMENTS",
                measurements: layout.measurements
            })  
        }
           
    }
}