import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useModlerContext } from '@/context/ModlerContext';
import { DrawGrid, getPinchAngle, getPinchDistance } from '@/lib/canvas/grid';
import { CanvasContext, Point, Theme } from '@/types';
import { toolHandlers } from '@/lib/tools';
import { useHistoryState } from '@/context/HistoryContect';

interface CanvasProps {
    theme: Theme;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const Canvas: React.FC<CanvasProps> = ({ theme, canvasRef }) => {
    const {state, setState, setTool } = useModlerContext();
    const {layout, setLayout} = useHistoryState();

    const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 }as Point);


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
        ctx.scale(dpr, dpr);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(state.rotation);
        ctx.scale(state.scale, state.scale);
        ctx.translate(-canvas.width / 2 + state.offsetX, -canvas.height / 2 + state.offsetY);

        DrawGrid(canvas, ctx, theme, state);
        layout.measurements.forEach((m) => m.draw(ctx));
        layout.tracks.forEach((piece) => piece.draw(ctx, piece.id === layout.selectedPiece));
        ctx.restore();

    }, [theme, state, layout, canvasRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const currentTool = e.button === 1 ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        if (e.button === 1) setTool('PANNING')
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            setLayout,
            dragOffset: dragOffsetRef,
            state,
            layout
        };
        currentTool?.onMouseDown?.(e, context);
        setCursorPosition({ x: e.clientX, y: e.clientY });
    }, [state, getRealCoordinates, setState]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const currentTool = state.isPanning ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            setLayout,
            dragOffset: dragOffsetRef,
            state,
            layout
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
            setLayout,
            dragOffset: dragOffsetRef,
            state,
            layout
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
                scale: Math.min(Math.max(state.scale + delta, 0.01), 8)

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

        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const clientX = touch.clientX - rect.left;
            const clientY = touch.clientY - rect.top;

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

        if (e.touches.length === 1 && state.isDragging) {
            const touch = e.touches[0];
            const clientX = touch.clientX - rect.left;
            const clientY = touch.clientY - rect.top;

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
        } else if (e.touches.length === 2) {
            const newPinchDistance = getPinchDistance(e.touches);
            const newPinchAngle = getPinchAngle(e.touches);

            const scaleDelta = (newPinchDistance / state.pinchDistance - 1) * 0.5 + 1; // Reduce zoom speed
            const rotationDelta = newPinchAngle - state.pinchAngle;

            setState(prev => ({
                ...prev,
                scale: Math.min(Math.max(prev.scale * scaleDelta, 0.1), 8),
                rotation: prev.rotation + rotationDelta,
                pinchDistance: newPinchDistance,
                pinchAngle: newPinchAngle
            }));
        }
    }, [state, setState, canvasRef]);

    const handleTouchEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, [setState]);

    const CurrentToolIcon = useMemo(() => {
        if (state.tool === "MOVE") {return null}
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
       
        if (layout.selectedPiece) {
            return "grabbing"
        }

        if (state.tool === "MOVE") {
            return "pointer"
        }else if (toolHandlers[state.tool].icon) {
            return "none"
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
                    touchAction: 'none'
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
                    <CurrentToolIcon size={20} color={theme.icon.color} fill={theme.icon.fill} />
                </div>
            )}
        </>
    );
};