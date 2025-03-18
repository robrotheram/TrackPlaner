import { CanvasContext, ToolHandler } from "@/types";
import { Rotate3D } from "lucide-react";

export const RotateHandler: ToolHandler = {
    icon: ({ size, color }) => <Rotate3D size={size} color={color} />,
    onMouseDown: (e: React.MouseEvent, { layout, state, setLayout, getRealCoordinates }: CanvasContext) => {
        const updatedPieces = [...layout.tracks];
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const selectTrack = updatedPieces.filter((piece: any) => piece.isSelectable(coords.x, coords.y, 20 / state.scale))[0];

        const rotationAmount = e.button === 2 ? -22.5 : 22.5;
        if (selectTrack) {
            selectTrack.setRotation(rotationAmount);
            setLayout({
                type: "UPDATE_TRACK",
                tracks: updatedPieces
            })
        }
    },
}