
import { CanvasContext, Measurement, ToolHandler } from '@/types';
import { Eraser} from 'lucide-react';
import { isPointNearLine } from '../Canvas/measure';

export const EraserHandler:ToolHandler = {
    icon: ({ size, color, fill }) => <Eraser size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, {state, setState, getRealCoordinates}: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);


        const measurementsIndex = state.measurements.findIndex((line: Measurement) => isPointNearLine(coords, line, 20 / state.scale));
        if (measurementsIndex !== -1){
            setState(prev => ({
                ...prev,
                measurements: prev.measurements.filter((_: any, index: number) => measurementsIndex !== index)
            }));
        }
        const selectTrack = state.tracks.findIndex((piece: any) =>
            piece.isSelectable(coords.x, coords.y, 20 / state.scale)
        );

        if (selectTrack !== -1) {
            setState(prev => ({
                ...prev,
                tracks: prev.tracks.filter((_: any, index: number) => selectTrack !== index)
            }));
        }
    }
}