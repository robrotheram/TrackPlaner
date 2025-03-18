import { Action } from "@/context/HistoryContect";
import { Measurement } from "@/lib/measurements/measure";
import { TrackPack, TrackPieceBase } from "@/lib/track";

export type Point = { x: number; y: number };

export type Arc = { origin: Point; radius: number; startAngle: number; endAngle: number };



export type Tool = "MEASURE" | "ERASER" | "MOVE" | "ROTATE" | "PANNING" | "DUPLICATE" | "ADD";

type ToolIcon = (props: { size: number; color?: string, fill?: string }) => JSX.Element;

export type ToolHandler = {
    icon?: ToolIcon;
    onMouseDown?: (e: React.MouseEvent, context: CanvasContext) => void;
    onMouseMove?: (e: React.MouseEvent, context: CanvasContext) => void;
    onMouseUp?: (e: React.MouseEvent, context: CanvasContext) => void;
};

export type CanvasContext = {
    getRealCoordinates: (x: number, y: number) => Point;
    setState: React.Dispatch<React.SetStateAction<CanvasState>>;
    setLayout: (action: Action) => void;
    state: CanvasState;
    layout: TrackLayout
    dragOffset: React.MutableRefObject<Point>
};

// Add to existing interfaces
export interface TouchState {
    pinchDistance: number;
    pinchAngle: number;
}



export interface CanvasState {
    scale: number
    rotation: number
    offsetX: number
    offsetY: number
    isDragging: boolean
    isPanning: boolean
    isToolActive: boolean

    lastX: number
    lastY: number

    tool: Tool
    addTrackPiece?: TrackPack

    pinchDistance: number
    pinchAngle: number    
}

export interface TrackLayout {
    name: string
    tracks: TrackPieceBase[]
    measurements: Measurement[]
    selectedPiece?: string
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

export type Endpoint = {
    nearestPoint?: Point
    nearestTrack?: TrackPieceBase
    point?: Point
}