import { LeftHandedTrackPointPiece, RightHandedTrackPointPiece, TrackCurvedPiece, TrackPack, TrackPieceBase, TrackStraightPiece } from ".";


export function ToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}



export const CreateTrackPiece = (trackPack: TrackPack): TrackPieceBase => {
    switch (trackPack.type) {
        case "straight":
            return new TrackStraightPiece(
                trackPack.code, 
                trackPack.position?.x ?? 0, 
                trackPack.position?.y ?? 0, 
                trackPack.rotation ?? 0, 
                trackPack.length!
            );
        case "curve":
            return new TrackCurvedPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.startAngle ?? 0,
                trackPack.endAngle ?? 0,
                trackPack.radius ?? 0
            );
        case "lhpoint":
            return new LeftHandedTrackPointPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.length ?? 0
            );
        case "rhpoint":
            return new RightHandedTrackPointPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.length ?? 0
            );
        default:
            throw new Error("Invalid track type");
    }
}