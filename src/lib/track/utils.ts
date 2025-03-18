import { LeftHandedTrackPointPiece, RightHandedTrackPointPiece, TrackCurvedPiece, TrackPack, TrackPieceBase, TrackStraightPiece, TrackType } from ".";


export function ToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function typeFromPiece(trackPiece: TrackPieceBase): TrackType {
    if (trackPiece instanceof TrackStraightPiece) {
        return "straight";
    } else if (trackPiece instanceof TrackCurvedPiece) {
        return "curve";
    } else if (trackPiece instanceof LeftHandedTrackPointPiece) {
        return "lhpoint";
    } else if (trackPiece instanceof RightHandedTrackPointPiece) {
        return "rhpoint";
    } else {
        throw new Error(`Invalid track type ${trackPiece.code}`);
    }
}

export const CreateTrackPiece = (trackPack: TrackPack): TrackPieceBase => {
    let trackPiece: TrackPieceBase;
    switch (trackPack.type) {
        case "straight":
            trackPiece = new TrackStraightPiece(
                trackPack.code, 
                trackPack.position?.x ?? 0, 
                trackPack.position?.y ?? 0, 
                trackPack.rotation ?? 0, 
                trackPack.length!
            );
            break;
        case "curve":
            trackPiece = new TrackCurvedPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.startAngle ?? 0,
                trackPack.endAngle ?? 0,
                trackPack.radius ?? 0
            );
            break;
        case "lhpoint":
            trackPiece = new LeftHandedTrackPointPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.length ?? 0
            );
            break;
        case "rhpoint":
            trackPiece = new RightHandedTrackPointPiece(
                trackPack.code,
                trackPack.position?.x ?? 0,
                trackPack.position?.y ?? 0,
                trackPack.rotation ?? 0,
                trackPack.length ?? 0
            );
            break;
        default:
            throw new Error(`Invalid track type ${trackPack.type}`);
    }
    if (trackPack.id){
        trackPiece.id = trackPack.id;
    }
    return trackPiece;
}