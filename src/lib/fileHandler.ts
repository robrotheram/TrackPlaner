import { CanvasState, Measurement } from "@/types";
import { TrackPack } from "./Track";
import { CreateTrackPiece } from "./Track/utils";



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
}

export const saveState = async (state: CanvasState) => {
    const data: SerializedLayout = {
        name: state.layoutName,
        tracks: state.tracks.map(track => track.serialise()),
        measurements: state.measurements
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });
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
    const loadedData: SerializedLayout = JSON.parse(str);
    setState(prev => ({
        ...prev,
        tracks: loadedData.tracks.map(track => CreateTrackPiece(track)),
        measurements: loadedData.measurements,
        layoutName: loadedData.name
    }));
}