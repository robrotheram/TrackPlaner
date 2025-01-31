import { Point, TrackPieceBase } from "./base";

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



export const CreateTrackPiece = (trackPack: TrackPack, x?: number, y?: number): TrackPieceBase => {
    switch (trackPack.type) {
        case "straight":
            return new TrackStraightPiece(trackPack.code, x!, y!, 0, trackPack.length!);
        case "curve":
            return new TrackCurvedPiece(trackPack.code, x!, y!, 0, trackPack.endAngle ?? 0, trackPack.endAngle!, trackPack.radius!);
        default:
            throw new Error("Invalid track type");
    }
}