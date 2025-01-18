import { TrackPieceBase } from '@/lib/Track';
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

interface State {
    tracks: TrackPieceBase[];
    history: TrackPieceBase[][];
    future: TrackPieceBase[][];
    selectedPiece: number | null; // Add selectedPiece to state
    scale: number; // Add scale to state
}

type Action =
    | { type: 'SET_TRACKS'; tracks: TrackPieceBase[] }
    | { type: 'ADD_TRACK'; tracks: TrackPieceBase }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'DELETE_TRACK' }
    | { type: 'SELECT_TRACK'; index: number | null } // Add SELECT_TRACK action
    | { type: 'SET_SCALE'; scale: number }; // Add SET_SCALE action

const initialState: State = {
    tracks: [],
    history: [],
    future: [],
    selectedPiece: null, // Initialize selectedPiece
    scale: 1, // Initialize scale
};

export const ModlerContext = createContext<{
    state: State;
    setTracks: (tracks: TrackPieceBase[]) => void;
    addTrack: (track: TrackPieceBase) => void;
    undo: () => void;
    redo: () => void;
    deleteTrack: () => void;
    selectTrack: (index: number | null) => void; // Add selectTrack function
    setScale: (scale: number) => void; // Add setScale function
}>({
    state: initialState,
    setTracks: () => {},
    addTrack: () => {},
    undo: () => {},
    redo: () => {},
    deleteTrack: () => {},
    selectTrack: () => {}, // Initialize selectTrack
    setScale: () => {}, // Initialize setScale
});

const modlerReducer = (state: State, action: Action): State => {
    console.log(action);
    switch (action.type) {
        case 'SET_TRACKS':
            return {
                ...state,
                tracks: action.tracks.map(track => track.clone()),
                history: [...state.history, state.tracks.map(track => track.clone())],
                future: [],
            };
        case 'UNDO': {
            if (state.history.length === 0) return state;
            const previousTracks = state.history[state.history.length - 1];
            const newHistory = state.history.slice(0, -1);
            return {
                ...state,
                tracks: previousTracks.map(track => track.clone()),
                history: newHistory,
                future: [state.tracks.map(track => track.clone()), ...state.future],
            };
        }
        case 'REDO': {
            if (state.future.length === 0) return state;
            const nextTracks = state.future[0];
            const newFuture = state.future.slice(1);
            return {
                ...state,
                tracks: nextTracks.map(track => track.clone()),
                history: [...state.history, state.tracks.map(track => track.clone())],
                future: newFuture,
            };
        }
        case 'ADD_TRACK':  {
            return {
                ...state,
                tracks: [...state.tracks, action.tracks],
                history: [...state.history, state.tracks.map(track => track.clone())],
                future: [],
            };
        }
        case 'DELETE_TRACK': {
            if (state.selectedPiece === null) return state;
            const newTracks = state.tracks.filter((_, index) => index !== state.selectedPiece);
            return {
                ...state,
                tracks: newTracks,
                history: [...state.history, state.tracks.map(track => track.clone())],
                future: [],
                selectedPiece: null, // Ensure no track is selected after deletion
            };
        }
        case 'SELECT_TRACK':
            return {
                ...state,
                selectedPiece: action.index,
            };
        case 'SET_SCALE':
            return {
                ...state,
                scale: action.scale,
            };
        default:
            return state;
    }
};

export const ModlerProvider = ({ children, initialTracks = [] }: { children: ReactNode; initialTracks?: TrackPieceBase[] }) => {
    const initialStateWithTracks = {
        ...initialState,
        tracks: initialTracks,
    };

    const [state, dispatch] = useReducer(modlerReducer, initialStateWithTracks);

    const setTracks = (tracks: TrackPieceBase[]) => {
        dispatch({ type: 'SET_TRACKS', tracks });
    };

    const addTrack = (tracks: TrackPieceBase) => {
        dispatch({ type: 'ADD_TRACK', tracks });
    };

    const undo = () => {
        dispatch({ type: 'UNDO' });
    };

    const redo = () => {
        dispatch({ type: 'REDO' });
    };

    const deleteTrack = () => {
        dispatch({ type: 'DELETE_TRACK' });
    };

    const selectTrack = (index: number | null) => {
        dispatch({ type: 'SELECT_TRACK', index });
    };

    const setScale = (scale: number) => {
        dispatch({ type: 'SET_SCALE', scale });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && state.selectedPiece !== null) {
            deleteTrack();
        }
        if (event.ctrlKey && event.key === 'z') {
            undo();
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'z') {
            undo();
        }
        if (event.ctrlKey && event.key === 'y') {
            redo();
        }

        if (event.key === 'Delete' && state.selectedPiece !== null) {
            deleteTrack();
        }   
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [state.selectedPiece]);

    const contextValue = React.useMemo(() => ({ state, setTracks, undo, redo, addTrack, deleteTrack, selectTrack, setScale }), [state]);

    return (
        <ModlerContext.Provider value={contextValue}>
            {children}
        </ModlerContext.Provider>
    );
};

export const useModlerContext = () => useContext(ModlerContext);