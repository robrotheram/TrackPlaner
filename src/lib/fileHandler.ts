import { CanvasState, Measurement } from "@/types";
import { TrackPack } from "./track";
import { CreateTrackPiece } from "./track/utils";



function serializeToFilename(inputString: string, replacementChar = "_") {
    const invalidChars = /[<>:"/\\|?*']/g;
    const spacePattern = /\s+/g;
    let sanitized = inputString.replace(invalidChars, replacementChar);
    sanitized = sanitized.replace(spacePattern, replacementChar);
    sanitized = sanitized.replace(new RegExp(`[${replacementChar}.]+$`), "");
    sanitized = sanitized.replace(new RegExp(`^[${replacementChar}]+`), "");
    return sanitized;
}


type SerializedLayout = {
    name: string,
    tracks: TrackPack[]
    measurements: Measurement[]
    scale?: number   
    offsetX?: number 
    offsetY?: number 
}


export const serializedState = (state: CanvasState): SerializedLayout => {
    return {
        name: state.layoutName,
        tracks: state.tracks.map(track => track.serialise()),
        measurements: state.measurements,
        scale: state.scale,
        offsetX: state.offsetX, 
        offsetY: state.offsetY  
    }
}

export const toCanvasState = (serialized: SerializedLayout, state:CanvasState): CanvasState => {
    return {
        ...state,
        layoutName: serialized.name,
        tracks: serialized.tracks.map(track => CreateTrackPiece(track)),
        measurements: serialized.measurements,
        scale: serialized.scale ?? 1,
        offsetX: serialized.offsetX ?? 0,
        offsetY: serialized.offsetY ?? 0,
    }
}   

export const saveState = async (state: CanvasState) => {
    const blob = new Blob([JSON.stringify(serializedState(state))], { type: 'application/octet-stream' });
    const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `${serializeToFilename(state.layoutName)}.layout`,
        types: [
            {
                description: 'Binary Files',
                accept: { 'application/octet-stream': ['.layout'] },
            },
        ],
    });
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
}


export const loadState = (setState: React.Dispatch<React.SetStateAction<CanvasState>>, str: string) => {
        setState(prev => toCanvasState(JSON.parse(str), prev));  
}