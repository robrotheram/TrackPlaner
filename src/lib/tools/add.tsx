import { CanvasContext, ToolHandler } from "@/types";
import { TrainTrack } from "lucide-react";
import { CreateTrackPiece } from "../track/utils";

export const AddHandler: ToolHandler = {
    icon: ({ size, color }) => <TrainTrack size={size} color={color} />,
    onMouseDown: (e: React.MouseEvent, { state, setState, getRealCoordinates }: CanvasContext) => {
        if (!state.addTrackPiece) {
            return;
        }
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const newTrack = CreateTrackPiece(state.addTrackPiece);
        newTrack.setLocation(coords.x, coords.y);
        setState(prev => ({
            ...prev,
            tracks: [...prev.tracks, newTrack],
        }));
    },
}