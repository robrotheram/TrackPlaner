import { CanvasContext, ToolHandler } from "@/types";
import { Stamp } from "lucide-react";

export const DuplicateHandler: ToolHandler = {
    icon: ({ size, color }) => <Stamp size={size} color={color} />,
    onMouseDown: (e: React.MouseEvent, { state, setState, getRealCoordinates }: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const selectTrack = state.tracks.findIndex((piece: any) =>
            piece.isSelectable(coords.x, coords.y, 20 / state.scale)
        );
       
        const newTrack = state.tracks[selectTrack].clone(); 
        newTrack.y += 67;   
        setState(prev => ({
            ...prev,
            tracks: [...prev.tracks, newTrack],
            selectedPiece: -1
        }));
    },
}