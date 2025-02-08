import { Tool, ToolHandler } from "@/types";
import { MoveHandler } from "./move";
import { RotateHandler } from "./rotate";
import { PanningHandler } from "./panning";
import { EraserHandler } from "./eraser";
import { MeasurementHandler } from "./measure";
import { DuplicateHandler } from "./duplicate";
import { AddHandler } from "./add";

export const toolHandlers: Record<Tool, ToolHandler> = {
    MOVE: MoveHandler,
    ROTATE: RotateHandler,
    ERASER: EraserHandler,
    MEASURE: MeasurementHandler,
    PANNING: PanningHandler,
    DUPLICATE: DuplicateHandler,
    ADD: AddHandler
}