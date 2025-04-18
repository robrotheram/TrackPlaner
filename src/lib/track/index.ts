import { Point } from "@/types"

export { TrackPieceBase } from "./base"
export { TrackStraightPiece } from "./straight"
export { TrackCurvedPiece } from "./curve"
export { LeftHandedTrackPointPiece, RightHandedTrackPointPiece } from "./point"


export type TrackType = "straight" | "curve" | "lhpoint" | "rhpoint"
export type TrackPack = {
    id?: string;
    code: string;
    type: TrackType;
    length?: number;

    radius?: number;
    startAngle?: number;
    endAngle?: number;

    name?: string;

    position?: Point;
    rotation?: number;
};
