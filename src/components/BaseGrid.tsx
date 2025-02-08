import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useModlerContext } from '@/context/ModlerContext';
import { DrawGrid, getPinchAngle, getPinchDistance } from '@/lib/canvas/grid';
import { drawMeasurements } from '@/lib/canvas/measure';
import { CanvasContext, Point, Theme } from '@/types';
import { toolHandlers } from '@/lib/tools';

interface CanvasProps {
    theme: Theme;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const Canvas: React.FC<CanvasProps> = ({ theme, canvasRef }) => {
    const { state, setState, setTool } = useModlerContext();
    const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

    const getRealCoordinates = useCallback((x: number, y: number) => {
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect();
        if (!rect || !canvas) {
            throw new Error("Canvas element is not available");
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const canvasX = x - rect.x;
        const canvasY = y - rect.y;

        const sin = Math.sin(state.rotation);
        const cos = Math.cos(state.rotation);

        const rotatedX = cos * (canvasX - centerX) + sin * (canvasY - centerY) + centerX;
        const rotatedY = -sin * (canvasX - centerX) + cos * (canvasY - centerY) + centerY;

        const scaledX = (rotatedX - centerX) / state.scale + centerX;
        const scaledY = (rotatedY - centerY) / state.scale + centerY;

        const realX = scaledX - state.offsetX;
        const realY = scaledY - state.offsetY;

        return { x: realX, y: realY };
    }, [state.rotation, state.scale, state.offsetX, state.offsetY]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        DrawGrid(canvas, ctx, theme, state);

        ctx.scale(dpr, dpr);

       
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(state.rotation);
        ctx.scale(state.scale, state.scale);
        ctx.translate(-canvas.width / 2 + state.offsetX, -canvas.height / 2 + state.offsetY);

        drawMeasurements(ctx, state.measurements);
        state.tracks.forEach((piece, index) => piece.draw(ctx, index === state.selectedPiece));
        ctx.restore();

        
        
    }, [theme, state, canvasRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const currentTool = e.button === 1 ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        if (e.button === 1) setTool('PANNING')
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state
        };
        currentTool?.onMouseDown?.(e, context);
        setCursorPosition({ x: e.clientX, y: e.clientY });
    }, [state, getRealCoordinates, setState]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const currentTool = state.isPanning ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state
        };

        currentTool?.onMouseMove?.(e, context);
        setCursorPosition({ x: e.clientX, y: e.clientY });
    }, [state, getRealCoordinates, setState]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        const currentTool = e.button === 1 ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        if (e.button === 1) setTool('MOVE')
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state
        };

        currentTool?.onMouseUp?.(e, context);
        setCursorPosition(null);
    }, [state, getRealCoordinates, setState]);


    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const delta = -e.deltaY * 0.001;
            setState(prev => ({
                ...prev,
                scale: Math.min(Math.max(state.scale + delta, 0.3), 2)

            }));
        } else if (e.shiftKey) {
            // Rotate
            const delta = -e.deltaY * 0.001;
            setState(prev => ({
                ...prev,
                rotation: prev.rotation + delta
            }));
        }
    };

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const touch = e.touches[0];
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        if (e.touches.length === 1) {
            setState(prev => ({
                ...prev,
                isDragging: true,
                lastX: clientX,
                lastY: clientY
            }));
        } else if (e.touches.length === 2) {
            setState(prev => ({
                ...prev,
                pinchDistance: getPinchDistance(e.touches),
                pinchAngle: getPinchAngle(e.touches)
            }));
        }
    }, [setState, canvasRef]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const touch = e.touches[0];
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        if (e.touches.length === 1 && state.isDragging) {
            const dx = clientX - state.lastX;
            const dy = clientY - state.lastY;

            const cos = Math.cos(-state.rotation);
            const sin = Math.sin(-state.rotation);
            const rotatedDx = dx * cos - dy * sin;
            const rotatedDy = dx * sin + dy * cos;

            setState(prev => ({
                ...prev,
                offsetX: prev.offsetX + rotatedDx,
                offsetY: prev.offsetY + rotatedDy,
                lastX: clientX,
                lastY: clientY
            }));
        }
        // ... rest of the pinch handling remains the same
    }, [state, setState, canvasRef]);

    const handleTouchEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, [setState]);

    const CurrentToolIcon = useMemo(() => {
        const tool = toolHandlers[state.tool];
        return tool ? tool.icon : null;
    }, [state.tool]);

    useEffect(() => {
        const preventZoom = (e: WheelEvent) => {
            if (e.ctrlKey) e.preventDefault();
        };
        document.addEventListener('wheel', preventZoom, { passive: false });
        return () => document.removeEventListener('wheel', preventZoom);
    }, []);


    const getCursor = () => {
        if (toolHandlers[state.tool].icon) {
            return "none"
        }
        if (state.selectedPiece && state.selectedPiece !== -1) {
            return "grabbing"
        }
    }
    return (
        <>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}

                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    width: '100%',
                    height: '100%',
                    background: theme.background,
                    cursor: getCursor(),
                    touchAction: 'none'  // Add this line
                }}
            />
            {cursorPosition && CurrentToolIcon && (
                <div
                    style={{
                        position: "absolute",
                        top: `${cursorPosition.y}px`,
                        left: `${cursorPosition.x}px`,
                        pointerEvents: "none",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                    }}
                >
                    <CurrentToolIcon size={24} color={theme.icon.color} fill={theme.icon.fill} />
                </div>
            )}
        </>
    );
};