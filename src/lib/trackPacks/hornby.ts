import { TrackCurvedPiece, TrackPieceBase, TrackStraightPiece } from "@/lib/Track";

export type TrackPack = {
    name: string;
    code: string;
    type: "straight" | "curve";
    length?: number;
    radius?: number;
    angle?: number;
    image: string;
};

export const CreateTrackPiece = (trackPack: TrackPack, x?:number, y?:number):TrackPieceBase => {
    switch (trackPack.type) {
        case "straight":
            return new TrackStraightPiece(trackPack.code, x!, y!, 0, trackPack.length!);
        case "curve":
            return new TrackCurvedPiece(trackPack.code, x!, y!, 0, 0, trackPack.angle!, trackPack.radius!);   
        default:
            throw new Error("Invalid track type");
    }   
}


export const HornbyTrackPack:TrackPack[] = [
    {
        "name": "R600 Straight Track",
        "code": "R600",
        "type": "straight", 
        "length": 168,
        "image": "https://d63oxfkn1m8sf.cloudfront.net/3000x1876/1516/0042/7304/r600.jpg"
    },
    {
        "name": "R601 Double Straight Track",
        "code": "R601", 
        "type": "straight",
        "length": 335,
        "image": "https://d63oxfkn1m8sf.cloudfront.net/3000x1876/9616/0042/7307/r601.jpg"
    },
    {
        "name": "R607 Double Curve 2nd Radius", 
        "code": "R607", 
        "type": "curve",    
        "radius": 438,  
        "angle": 45,    
        "image": "https://d63oxfkn1m8sf.cloudfront.net/3000x1876/5616/0042/7328/r607.jpg"
    },
    {
        "name": "R609 Double Curve 3rd Radius", 
        "code": "R609", 
        "type": "curve",
        "radius": 505,
        "angle": 45,    
        "image": "https://d63oxfkn1m8sf.cloudfront.net/3000x1876/5616/0042/7334/r609.jpg"
    }

]