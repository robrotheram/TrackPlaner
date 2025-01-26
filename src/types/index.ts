import { TrackPieceBase } from "@/lib/Track";

export type Tool = "MEASURE" | "ERASER" | "MOVE" | "ROTATE" | "PANNING"

export interface CanvasState {
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
    isPanning: boolean;
    isToolActive: boolean;

    lastX: number;
    lastY: number;
    tool: Tool

    pinchDistance: number;
    pinchAngle: number;

    tracks: TrackPieceBase[]
    selectedPiece?: number
}

export interface Theme {
    name: string;
    background: string;
    gridColor: string;
    gridOpacity: number;
    icon:{
        color: string
        fill: string
    }
}