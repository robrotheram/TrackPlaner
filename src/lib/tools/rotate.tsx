import { CanvasContext, ToolHandler } from "@/types";
import { Rotate3D } from "lucide-react";

export const RotateHandler: ToolHandler = {
    icon: ({ size, color }) => <Rotate3D size={size} color={color} />,
    onMouseDown: (e: React.MouseEvent, { state, setState, getRealCoordinates }: CanvasContext) => {
        const updatedPieces = [...state.tracks];
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const selectTrack = state.tracks.findIndex((piece: any) =>
            piece.isSelectable(coords.x, coords.y, 20 / state.scale)
        );
        console.log(selectTrack)
        const rotationAmount = e.button === 2 ? -22.5 : 22.5;
        if (selectTrack !== -1) {
            updatedPieces[selectTrack].setRotation(rotationAmount);
            setState(prev => ({
                ...prev,
                tracks: updatedPieces,
                selectedPiece: selectTrack !== -1 ? selectTrack : undefined,
            }));
        }
    },
}