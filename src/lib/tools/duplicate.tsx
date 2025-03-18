import { CanvasContext, ToolHandler } from "@/types";
import { Stamp } from "lucide-react";

export const DuplicateHandler: ToolHandler = {
    icon: ({ size, color }) => <Stamp size={size} color={color} />,
    onMouseDown: (e: React.MouseEvent, { layout, state, setLayout, getRealCoordinates }: CanvasContext) => {
        const coords = getRealCoordinates(e.clientX, e.clientY);
        const selectTrack = layout.tracks.findIndex((piece: any) =>
            piece.isSelectable(coords.x, coords.y, 20 / state.scale)
        );
       
        const newTrack = layout.tracks[selectTrack].clone(); 
        newTrack.y += 67;   
        setLayout({
            type:"ADD_TRACK",
            track: newTrack
        })
    },
}