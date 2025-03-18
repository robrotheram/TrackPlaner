import { Point } from "@/types";
import { Measurement } from "./measure";



export type SerialiseMeasurments = {
        id: string; 
        start: Point;
        end: Point;
        distance: number;
}

export function CreateMeasurement(measurement: SerialiseMeasurments): Measurement {
    const newMeasurement = new Measurement(measurement.start);
    newMeasurement.id = measurement.id;
    newMeasurement.end = measurement.end;
    newMeasurement.distance = measurement.distance;
    return newMeasurement;
}


export const calculateDistance = (p1: Point, p2: Point) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

export const arePointsClose = (p1: Point, p2: Point, threshold: number): boolean => {
    return calculateDistance(p1, p2) <= threshold;
};

export const isPointNearLine = (point: Point, line: Measurement, threshold = 5) => {
    const { start, end } = line;

    // Calculate distance from the point to the line segment
    const A = point.x - start.x;
    const B = point.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let closest: Point;
    if (param < 0) {
        closest = start;
    } else if (param > 1) {
        closest = end;
    } else {
        closest = { x: start.x + param * C, y: start.y + param * D };
    }

    return calculateDistance(point, closest) <= threshold;
};
