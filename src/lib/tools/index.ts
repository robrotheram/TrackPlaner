import { Tool, ToolHandler } from "@/types";
import { MoveHandler } from "./move";
import { RotateHandler } from "./rotate";
import { PanningHandler } from "./panning";
import { EraserHandler } from "./eraser";
import { MeasurementHandler } from "./measure";

export const toolHandlers: Record<Tool, ToolHandler> = {
    MOVE: MoveHandler,
    ROTATE: RotateHandler,
    ERASER: EraserHandler,
    MEASURE: MeasurementHandler,
    PANNING: PanningHandler,
}