
import { CanvasContext, ToolHandler } from '@/types';
import { Eraser} from 'lucide-react';
import { isPointNearLine, Measurement } from '../measurements';

export const EraserHandler:ToolHandler = {
    icon: ({ size, color, fill }) => <Eraser size={size} color={color} fill={fill} />,
    onMouseDown: (e: React.MouseEvent, {layout, state, setLayout, getRealCoordinates}: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);

        layout.measurements.forEach((line: Measurement) => {
            if (isPointNearLine(coords, line, 20 / state.scale)) {
                setLayout({
                    type: "REMOVE_MEASUREMENT",
                    measurementId: line.id
                });
            }
        });
        layout.tracks.forEach((track: any) => {
            if (track.isSelectable(coords.x, coords.y, 20 / state.scale)) {
                setLayout({
                    type: "REMOVE_TRACK",
                    selectedPieceId: track.id
                });
            }  
        });
    }
}