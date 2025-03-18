import { Measurement } from "@/lib/measurements/measure";
import { TrackPieceBase } from "@/lib/track";
import { fromSerialisedTrackLayout, SerialisedTrackLayout } from "@/lib/utils";
import { TrackLayout } from "@/types";
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useState } from "react";

const storageKey = "modlerState";

interface State {
    layout: SerialisedTrackLayout;
    undoStack: SerialisedTrackLayout[];
    redoStack: SerialisedTrackLayout[];
}

const initialLayout: SerialisedTrackLayout = {
    name: "My Railway Layout",
    tracks: [],
    measurements: [],
}

const initialState: State = {
    layout: initialLayout,
    undoStack: [initialLayout],
    redoStack: [],
};
export type Action =
    | { type: "SET_LAYOUT"; layout: TrackLayout }
    | { type: "SET_LAYOUT_NAME"; name: string }
    | { type: "SET_STATE"; state: State }
    | { type: "ON_MOVE"; tracks: TrackPieceBase[] }
    | { type: "UPDATE_TRACK"; tracks: TrackPieceBase[]; selectedPieceId?: string }
    | { type: "ADD_TRACK"; track: TrackPieceBase }
    | { type: "REMOVE_TRACK"; selectedPieceId?: string }
    | { type: "SELECT_TRACK"; selectedPieceId?: string }
    | { type: "UPDATE_MEASUREMENTS"; measurements: Measurement[] }
    | { type: "ON_MEASUREMENT_CHANGE"; measurements: Measurement[] }
    | { type: "REMOVE_MEASUREMENT"; measurementId: string };

type UpdateAction = {
    name?: string;
    tracks?: TrackPieceBase[];
    measurements?: Measurement[];
    selectedPieceId?: string;
};

function reducer(state: State, action: Action): State {

    const updateState = (action: UpdateAction): State => {
        const layout = {
            name: action.name ?? state.layout.name,
            tracks: action.tracks?.map(track => track.serialise()) ?? state.layout.tracks,
            measurements: action.measurements?.map(m => m.serialise()) ?? state.layout.measurements,
            selectedPieceId: action.selectedPieceId
        }
        const oldState: State = loadFromStorage();
        const newState = {
            layout,
            undoStack: [...state.undoStack, oldState.layout],  // Clone and push the current layout into undo
            redoStack: [],
        };
        localStorage.setItem(storageKey, JSON.stringify(newState));
        return newState;
    };

    const setState = (s: State) => {
        localStorage.setItem(storageKey, JSON.stringify(s));
        return s
    }


    switch (action.type) {
        case "SET_LAYOUT":
            return updateState(action.layout);
        case "SET_STATE":
            return setState(action.state);
        case "ON_MOVE":
            return {
                ...state,
                layout: {
                    ...state.layout,
                    tracks: action.tracks.map(track => track.serialise())
                }
            }
        case "UPDATE_TRACK":
            return updateState({ tracks: action.tracks, selectedPieceId: action.selectedPieceId });
        case "ADD_TRACK": {
            const tracks = fromSerialisedTrackLayout(state.layout).tracks;
            tracks.push(action.track);
            return updateState({ tracks: tracks });
        }
        case "REMOVE_TRACK": {
            const tracks = fromSerialisedTrackLayout(state.layout).tracks;
            return updateState({ tracks: tracks.filter((piece) => piece.id !== action.selectedPieceId) });
        }
        case "SELECT_TRACK":
            return {
                ...state,
                layout: {
                    ...state.layout,
                    selectedPieceId: action.selectedPieceId
                }
            }
        case "UPDATE_MEASUREMENTS":
            return updateState({ measurements: action.measurements });
        case "ON_MEASUREMENT_CHANGE":
            return {
                ...state,
                layout: {
                    ...state.layout,
                    measurements: action.measurements.map(m => m.serialise())
                }
            }
        case "REMOVE_MEASUREMENT": {
            const measurements = fromSerialisedTrackLayout(state.layout).measurements;
            return updateState({ measurements: measurements.filter((line) => line.id !== action.measurementId) });
        }
        case "SET_LAYOUT_NAME":
            return {
                ...state,
                layout: {
                    ...state.layout,
                    name: action.name
                }
            }
        default:
            return state;
    }
}

export const StateHistoryContext = createContext<{
    layout: TrackLayout;
    undo: () => void;
    redo: () => void;
    setLayout: (action: Action) => void;
}>({
    layout: fromSerialisedTrackLayout(initialLayout),
    undo: () => { },
    redo: () => { },
    setLayout: () => { },
});

const loadFromStorage = (): State => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        return JSON.parse(saved)
    }
    return initialState;
}

export const StateHistoryContextProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, loadFromStorage());
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
            if (event.shiftKey) {
                redo()
              } else {
                undo();
              }
          }
          if ((event.ctrlKey || event.metaKey) && event.key === "y") {
            redo();
          }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
        };
      }, []);
    
    const undo = () => {
        const oldState = loadFromStorage();
        if (oldState.undoStack.length === 0) {
            return;
        }
        const newState: State = {
            layout: oldState.undoStack[oldState.undoStack.length - 1],
            undoStack: oldState.undoStack.slice(0, oldState.undoStack.length - 1),
            redoStack: [...oldState.redoStack, oldState.layout]
        }
        localStorage.setItem(storageKey, JSON.stringify(newState));
        dispatch({ type: "SET_STATE", state: newState });
    }

    const redo = () => {
        const oldState = loadFromStorage();
        if (oldState.redoStack.length === 0) {
            return;
        }
        const newState: State = {
            layout: oldState.redoStack[oldState.redoStack.length - 1],
            undoStack: [...oldState.undoStack, oldState.layout],
            redoStack: oldState.redoStack.slice(0, oldState.redoStack.length - 1)
        }
        localStorage.setItem(storageKey, JSON.stringify(newState));
        dispatch({ type: "SET_STATE", state: newState });
    }

    const setLayout = (action: Action) => {
        dispatch(action);
        setActionHistory([...actionHistory, action]);
        console.log(action.type, action, state.layout.measurements);
    }

    const contextValue = useMemo(() => ({ layout: fromSerialisedTrackLayout(state.layout), setLayout, undo, redo }), [state]);
    return (
        <StateHistoryContext.Provider value={contextValue}>
            {children}
        </StateHistoryContext.Provider>
    );
};

export const useHistoryState = () => useContext(StateHistoryContext);