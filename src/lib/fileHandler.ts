import { TrackLayout } from "@/types";
import { CreateTrackPiece } from "./track/utils";
import { CreateMeasurement } from "./measurements";
import { Action } from "@/context/HistoryContect";
import { SerialisedTrackLayout, toSerialisedTrackLayout } from "./utils";




function serializeToFilename(inputString: string, replacementChar = "_") {
    const invalidChars = /[<>:"/\\|?*']/g;
    const spacePattern = /\s+/g;
    let sanitized = inputString.replace(invalidChars, replacementChar);
    sanitized = sanitized.replace(spacePattern, replacementChar);
    sanitized = sanitized.replace(new RegExp(`[${replacementChar}.]+$`), "");
    sanitized = sanitized.replace(new RegExp(`^[${replacementChar}]+`), "");
    return sanitized;
}



export const toCanvasState = (serialized: SerialisedTrackLayout): TrackLayout => {
    return {
        name: serialized.name,
        tracks: serialized.tracks.map(track => CreateTrackPiece(track)),
        measurements: serialized.measurements.map(measurement => CreateMeasurement(measurement)),
    }
}   

export const saveState = async (layout:TrackLayout) => {
    const blob = new Blob([JSON.stringify(toSerialisedTrackLayout(layout))], { type: 'application/octet-stream' });
    const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `${serializeToFilename(layout.name)}.layout`,
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


export const loadState = (setLayout: (action:Action)=>void, str: string) => {
    const layout = toCanvasState(JSON.parse(str));
    setLayout({
        type: "SET_LAYOUT",
        layout
    });
}