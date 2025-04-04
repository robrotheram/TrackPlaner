import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TrackPack } from "./track";
import { CreateMeasurement, SerialiseMeasurments } from "./measurements";
import { CreateTrackPiece } from "./track/utils";
import { TrackLayout } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SerialisedTrackLayout {
  name: string;
  tracks: TrackPack[];
  measurements: SerialiseMeasurments[];
  selectedPieceId?: string;
}

export const fromSerialisedTrackLayout = (layout: SerialisedTrackLayout): TrackLayout => {
  return {
      name: layout.name,
      tracks: layout.tracks.map((track) => CreateTrackPiece(track)),
      measurements: layout.measurements.map((measurement) => CreateMeasurement(measurement)),
      selectedPiece: layout.selectedPieceId
  }
}

export const toSerialisedTrackLayout = (layout: TrackLayout): SerialisedTrackLayout => {
  return {
      name: layout.name,
      tracks: layout.tracks.map((track) => track.serialise()),
      measurements: layout.measurements.map((measurement) => measurement.serialise())
  }
}

export const loadFromStorage = <T>(storageKey:string, initialState:T):T => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        return JSON.parse(saved)
    }
    return initialState;
}