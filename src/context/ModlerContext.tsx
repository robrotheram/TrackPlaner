import { loadFromStorage } from '@/lib/utils';
import { Point, CanvasState, Tool } from '@/types';
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

export const initialState: CanvasState = {
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    isPanning: false,
    isToolActive: false,
    lastX: 0,
    lastY: 0,
    pinchDistance: 0,
    pinchAngle: 0,
    tool: 'MOVE'
}

export const ModlerContext = createContext<{
    state: CanvasState;
    setScale: (scale: number) => void; // Add setScale function
    setRotation: (scale: number) => void; // Add setScale function
    setPan: (delta: Point) => void
    setTool: (tool: Tool) => void
    setState: React.Dispatch<React.SetStateAction<CanvasState>>;
}>({
    state: initialState,
    setScale: () => { }, // Initialize setScale
    setRotation: () => { }, // Initialize setScale
    setPan: () => { }, // Initialize setScale
    setState: () => { }, // Initialize setScale
    setTool: () => { }, // Initialize setScale
});


export const ModlerProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<CanvasState>(loadFromStorage('canvasState', initialState));  

    useEffect(() => {
        localStorage.setItem('canvasState', JSON.stringify(state));
    }, [state]);

    const setScale = (scale: number) => {
        setState(prev => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale + scale, 0.1), 3)
        }));
    };
    const setRotation = (rotation: number) => {
        setState(prev => ({
            ...prev,
            rotation: prev.rotation + rotation
        }));
    };
    const setPan = (delta: Point) => {
        setState(prev => ({
            ...prev,
            offsetX: prev.offsetX + delta.x,
            offsetY: prev.offsetY + delta.y
        }));
    }

    const setTool = (tool: Tool) => {
        setState(prev => ({
            ...prev,
            tool,
        }));
    }


    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLBodyElement) {
            console.log("EVWEN", event)
            if (event.key === 'Escape') {
                setState(prev => ({
                    ...prev,
                    tool: 'MOVE',
                    isDragging: false,
                    isPanning: false,
                    isToolActive: false,
                    selectedPiece: -1,
                }));
            }
            if (event.key === 'e') {
                setState(prev => ({
                    ...prev,
                    tool: "ERASER"
                }));
            }
            if (event.key === 'm') {
                setState(prev => ({
                    ...prev,
                    tool: "MEASURE"
                }));
            }
            if (event.key === 'r') {
                setState(prev => ({
                    ...prev,
                    tool: "ROTATE"
                }));
            }
            if (event.key === 'd') {
                setState(prev => ({
                    ...prev,
                    tool: "DUPLICATE"
                }));
            }
            if (event.key === 'a') {
                setState(prev => ({
                    ...prev,
                    tool: "ADD"
                }));
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const contextValue = React.useMemo(() => ({ state, setRotation, setScale, setPan, setState, setTool }), [state]);

    return (
        <ModlerContext.Provider value={contextValue}>
            {children}
        </ModlerContext.Provider>
    );
};

export const useModlerContext = () => useContext(ModlerContext);