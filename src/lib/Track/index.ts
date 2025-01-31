import { Point } from "./base";

export { TrackPieceBase } from "./base"
export { TrackStraightPiece } from "./straight"
export { TrackCurvedPiece } from "./curve"
export { LeftHandedTrackPointPiece, RightHandedTrackPointPiece } from "./point"


export type TrackType = "straight" | "curve" | "lhpoint" | "rhpoint"
export type TrackPack = {
    code: string;
    type: TrackType;
    length?: number;

    radius?: number;
    startAngle?: number;
    endAngle?: number;

    image?: string;
    name?: string;

    position?: Point;
    rotation?: number;
};
