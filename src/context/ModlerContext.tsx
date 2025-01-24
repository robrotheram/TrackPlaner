import { TrackPieceBase } from '@/lib/Track';
import { Point } from '@/lib/Track/base';
import { CanvasState, Tool } from '@/types';
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';



const initialState: CanvasState = {
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    isPanning: false,
    lastX: 0,
    lastY: 0,
    pinchDistance: 0,
    pinchAngle: 0,
    tracks: [],
}

export const ModlerContext = createContext<{
    state: CanvasState;
    setScale: (scale: number) => void; // Add setScale function
    setRotation: (scale: number) => void; // Add setScale function
    setPan:(delta:Point) => void
    setTool:(tool:Tool) => void
    addTrack:(track:TrackPieceBase) => void
    setState: React.Dispatch<React.SetStateAction<CanvasState>>;
}>({
    state: initialState,
    setScale: () => { }, // Initialize setScale
    setRotation: () => { }, // Initialize setScale
    setPan: () => { }, // Initialize setScale
    setState: ()=> { }, // Initialize setScale
    setTool: ()=> { }, // Initialize setScale
    addTrack: ()=> { }, // Initialize setScale
});


export const ModlerProvider = ({ children, initialTracks = [] }: { children: ReactNode; initialTracks?: TrackPieceBase[] }) => {
    const [state, setState] = useState<CanvasState>({...initialState, tracks:initialTracks});
    
    const setScale = (scale: number) => {
        setState(prev => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale + scale, 0.1), 2)
        }));
    };
    const setRotation = (rotation: number) => {
        setState(prev => ({
            ...prev,
            rotation : prev.rotation + rotation
        }));
    };
    const setPan = (delta:Point) => {
        setState(prev => ({
            ...prev,
            offsetX: prev.offsetX + delta.x,
            offsetY: prev.offsetY + delta.y
        }));
    }

    const setTool = (tool:Tool) => {
        setState(prev => ({
            ...prev,
            tool
        }));
    }

    const addTrack = (track: TrackPieceBase) => {
        setState(prev => ({
            ...prev,
            tracks:[...prev.tracks, track]
        }));
    }


    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setTool(null)
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const contextValue = React.useMemo(() => ({ state, setRotation, setScale, setPan, setState, setTool, addTrack }), [state]);

    return (
        <ModlerContext.Provider value={contextValue}>
            {children}
        </ModlerContext.Provider>
    );
};

export const useModlerContext = () => useContext(ModlerContext);