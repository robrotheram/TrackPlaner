import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useModlerContext } from '@/context/ModlerContext';
import { CanvasContext, DrawGrid, getPinchAngle, getPinchDistance, ToolHandler } from '@/lib/Canvas/grid';
import { drawMeasurements, findNearestEndpoint, isPointNearLine, Measurement } from '@/lib/Canvas/measure';
import { Point, TrackPieceBase } from '@/lib/Track/base';
import { Theme, Tool } from '@/types';
import { Eraser, Ruler, Move, Rotate3D } from 'lucide-react';
import { TrackCurvedPiece } from '@/lib/Track';



interface CanvasProps {
    theme: Theme;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}
type Endpoint = {
    nearestPoint?:Point
    nearestTrack?:TrackPieceBase
    point?:Point
}
export const Canvas: React.FC<CanvasProps> = ({ theme, canvasRef }) => {
    const { state, setState, setTool } = useModlerContext();
    const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [canGrab, setCanGrab] = useState(false);

    const toolHandlers: Record<Tool, ToolHandler> = {
        MOVE: {
            onMouseDown: (e) => {
                const coords = getRealCoordinates(e.clientX, e.clientY);
                const selectTrack = state.tracks.findIndex((piece: any) =>
                    piece.isSelectable(coords.x, coords.y, 20 / state.scale)
                );

                setState(prev => ({
                    ...prev,
                    isDragging: true,
                    selectedPiece: selectTrack !== -1 ? selectTrack : undefined,
                    lastX: coords.x,
                    lastY: coords.y
                }));
            },
            onMouseMove: (e) => {
                const { x, y } = getRealCoordinates(e.clientX, e.clientY);
                if (state.isDragging && state.selectedPiece !== undefined) {
                    const selectedTrack = state.tracks[state.selectedPiece];
                    const updatedPieces = [...state.tracks];
            
                    // First update the position normally
                    selectedTrack.setLocation(x, y);
            
                    // Get the current piece's endpoints
                    const markers = selectedTrack.getMarkerPoints();
                    const endpoints = [
                        { point: markers.start, isStart: true },
                        { point: markers.end, isStart: false }
                    ];
            
                    // Find the nearest endpoint among all endpoints
                    let nearestEndpoint: Endpoint = {};
                    let minDistance = Infinity;
            
                    endpoints.forEach(({ point }) => {
                        const { point: nearestPoint, track: nearestTrack } = findNearestEndpoint(
                            selectedTrack,
                            state.tracks,
                            point,
                            20 / state.scale
                        );
            
                        if (nearestPoint && nearestTrack) {
                            const distance = Math.hypot(nearestPoint.x - point.x, nearestPoint.y - point.y);
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestEndpoint = { nearestPoint, nearestTrack, point };
                            }
                        }
                    });
            
                    // Snap to the nearest endpoint if it exists
                    if (nearestEndpoint.nearestPoint && nearestEndpoint.point) {
                        const { nearestPoint, point } = nearestEndpoint;
                        const dx = nearestPoint.x - point.x;
                        const dy = nearestPoint.y - point.y;
            
                        // Adjust the position to align the endpoints
                        
                        if (selectedTrack instanceof TrackCurvedPiece) {
                            // Special handling for curved tracks
                            selectedTrack.setLocation(nearestPoint.x, nearestPoint.y);
                        } else {
                            selectedTrack.setLocation(
                                selectedTrack.x + dx,
                                selectedTrack.y + dy
                            );
                        }
                    }
            
                    updatedPieces[state.selectedPiece] = selectedTrack;
                    setState(prev => ({
                        ...prev,
                        tracks: updatedPieces,
                    }));
                } else {
                    const selectTrack = state.tracks.findIndex((piece: any) =>
                        piece.isSelectable(x, y, 20 / state.scale)
                    );
                    setCanGrab(selectTrack !== -1);
                }
            },
            onMouseUp: () => {
                setState(prev => ({
                    ...prev,
                    isDragging: false,
                    selectedPiece: undefined
                }));
            }
        },
        ROTATE: {
            icon: ({ size, color }) => <Rotate3D size={size} color={color} />,
            onMouseDown: (e) => {
                const updatedPieces = [...state.tracks];
                const coords = getRealCoordinates(e.clientX, e.clientY);
                const selectTrack = state.tracks.findIndex((piece: any) =>
                    piece.isSelectable(coords.x, coords.y, 20 / state.scale)
                );
                console.log(selectTrack)
                const rotationAmount = e.button === 2 ? -22.5 : 22.5;
                if (selectTrack !== -1) {
                    updatedPieces[selectTrack].setRotation(rotationAmount);
                    setState(prev => ({
                        ...prev,
                        tracks: updatedPieces,
                        selectedPiece: selectTrack !== -1 ? selectTrack : undefined,
                    }));
                }
            },
        },
        MEASURE: {
            icon: ({ size, color, fill }) => <Ruler size={size} color={color} fill={fill} />,
            onMouseDown: (e) => {
                const coords = getRealCoordinates(e.clientX, e.clientY);
                if (!state.isToolActive) {
                    setMeasurements((prev) => [
                        ...prev,
                        { start: coords, end: coords, distance: "0" },
                    ]);
                }
                setState(prev => ({
                    ...prev,
                    isToolActive: !state.isToolActive,
                    lastX: coords.x,
                    lastY: coords.y
                }));
            },
            onMouseMove: (e) => {
                if (state.isToolActive) {
                    const { x, y } = getRealCoordinates(e.clientX, e.clientY);
                    const dx = x - state.lastX;
                    const dy = y - state.lastY;
                    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(2);

                    setMeasurements((prev) => {
                        const updatedMeasurements = [...prev];
                        updatedMeasurements[updatedMeasurements.length - 1] = {
                            start: { x: state.lastX, y: state.lastY },
                            end: { x, y },
                            distance,
                        };
                        return updatedMeasurements;
                    });
                }
            }
        },
        ERASER: {
            icon: ({ size, color, fill }) => <Eraser size={size} color={color} fill={fill} />,
            onMouseDown: (e) => {
                const coords = getRealCoordinates(e.clientX, e.clientY);

                const updatedMeasurements = measurements.filter(
                    (line: Measurement) => !isPointNearLine(coords, line, 20 / state.scale)
                );
                setMeasurements(updatedMeasurements);

                const selectTrack = state.tracks.findIndex((piece: any) =>
                    piece.isSelectable(coords.x, coords.y, 20 / state.scale)
                );

                if (selectTrack !== -1) {
                    setState(prev => ({
                        ...prev,
                        tracks: prev.tracks.filter((_: any, index: number) => selectTrack !== index)
                    }));
                }
            }
        },
        PANNING: {
            icon: ({ size, color, fill }) => <Move size={size} color={color} fill={fill} />,
            onMouseDown: (e) => {
                setState(prev => ({
                    ...prev,
                    isPanning: true,
                    lastX: e.clientX,
                    lastY: e.clientY
                }));
            },
            onMouseMove: (e) => {
                if (!state.isPanning) return
                const dx = e.clientX - state.lastX;
                const dy = e.clientY - state.lastY;

                // Apply rotation transformation to the delta
                const rotation = state.rotation; // Rotation in radians
                const cos = Math.cos(rotation);
                const sin = Math.sin(rotation);

                // // Transform the deltas into the rotated coordinate space
                const rotatedDx = dx * cos + dy * sin;
                const rotatedDy = -dx * sin + dy * cos;

                // Update the state with the rotated deltas
                setState((prev) => ({
                    ...prev,
                    offsetX: prev.offsetX + rotatedDx,
                    offsetY: prev.offsetY + rotatedDy,
                    lastX: e.clientX,
                    lastY: e.clientY,
                }));
            },
            onMouseUp: () => {
                setState(prev => ({
                    ...prev,
                    isPanning: false,
                }));
            }
        }
    };
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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(state.rotation);
        ctx.scale(state.scale, state.scale);
        ctx.translate(-canvas.width / 2 + state.offsetX, -canvas.height / 2 + state.offsetY);

        DrawGrid(canvas, ctx, theme, state);
        drawMeasurements(ctx, measurements);
        state.tracks.forEach((piece, index) => piece.draw(ctx, index === state.selectedPiece));

        ctx.restore();
    }, [theme, state, measurements, canvasRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const currentTool = e.button === 1 ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        if(e.button === 1) setTool('PANNING')
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state,
            setMeasurements,
            measurements
        };
        currentTool?.onMouseDown?.(e, context);
        setCursorPosition({ x: e.clientX, y: e.clientY });
    }, [state, getRealCoordinates, setState, setMeasurements]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const currentTool = state.isPanning ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state,
            setMeasurements,
            measurements
        };

        currentTool?.onMouseMove?.(e, context);
        setCursorPosition({ x: e.clientX, y: e.clientY });
    }, [state, getRealCoordinates, setState, setMeasurements]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        const currentTool = e.button === 1 ? toolHandlers["PANNING"] : toolHandlers[state.tool];
        if(e.button === 1) setTool('MOVE')
        const context: CanvasContext = {
            getRealCoordinates,
            setState,
            state,
            setMeasurements,
            measurements
        };

        currentTool?.onMouseUp?.(e, context);
        setCursorPosition(null);
    }, [state, getRealCoordinates, setState, setMeasurements]);


    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const delta = -e.deltaY * 0.001;
            setState(prev => ({
                ...prev,
                scale: Math.min(Math.max(state.scale + delta, 0.1), 2)

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
        return canGrab ? "grab" : "pointer"
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
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    background: theme.background,
                    cursor: getCursor(),
                    touchAction: 'none'  // Add this line
                }}
            />
            {/* <div className='absolute right-10'><pre>{JSON.stringify({...state, tracks:[]},null, 2)}</pre></div> */}
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