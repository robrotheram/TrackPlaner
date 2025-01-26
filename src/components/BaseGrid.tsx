import { useModlerContext } from '@/context/ModlerContext';
import { DrawGrid } from '@/lib/Canvas/grid';
import { drawMeasurements, isPointNearLine, Measurement } from '@/lib/Canvas/measure';
import { Point } from '@/lib/Track/base';
import { Theme } from '@/types';
import { stat } from 'fs';
import { Eraser, Ruler } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { json } from 'stream/consumers';



interface CanvasProps {
    theme: Theme;
    canvasRef: React.RefObject<HTMLCanvasElement>
}

export const Canvas: React.FC<CanvasProps> = ({ theme, canvasRef }) => {
    const { state, setState } = useModlerContext();


    const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas) {
            const dpr = 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            const context = canvas.getContext('2d');
            if (context) {
                context.scale(dpr, dpr);
            }
        }

        const draw = () => {
            if (!ctx || !canvas) return;

            // Clear canvas


            // Save context state
            ctx.save();
            // Apply transformations
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(state.rotation);
            ctx.scale(state.scale, state.scale);
            ctx.translate(-canvas.width / 2 + state.offsetX, -canvas.height / 2 + state.offsetY);


            DrawGrid(canvas, ctx, theme, state)
            drawMeasurements(ctx, measurements)
            state.tracks.forEach((piece, index) => piece.draw(ctx, index === state.selectedPiece));
            ctx.restore();


        };
        draw()
    }, [theme, state, measurements]);

    // Prevent default zoom behavior on the entire page
    useEffect(() => {
        const preventZoom = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };

        document.addEventListener('wheel', preventZoom, { passive: false });
        return () => document.removeEventListener('wheel', preventZoom);
    }, []);



    const getRealCoordinates = (x: number, y: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const canvas = canvasRef.current;
        if (!rect || !canvas) {
            throw new Error("Canvas element is not available");
        }
    
        // Map the mouse coordinates to canvas coordinates
        const canvasX = x - rect.x;
        const canvasY = y - rect.y;
    
        // Step 1: Adjust for rotation
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
    
        const sin = Math.sin(state.rotation); // Reverse the rotation
        const cos = Math.cos(state.rotation);
    
        const rotatedX = cos * (canvasX - centerX) + sin * (canvasY - centerY) + centerX;
        const rotatedY = -sin * (canvasX - centerX) + cos * (canvasY - centerY) + centerY;
    
        // Step 2: Adjust for scaling
        const scaledX = (rotatedX - centerX) / state.scale + centerX;
        const scaledY = (rotatedY - centerY) / state.scale + centerY;
    
        // Step 3: Adjust for translation
        const realX = scaledX - state.offsetX;
        const realY = scaledY - state.offsetY;
    
        return { x: realX, y: realY };
    };
    

    const selectTrackPiece = (x: number, y: number) => {
        const { x: transformedX, y: transformedY } = getRealCoordinates(x, y);
        for (let i = 0; i < state.tracks.length; i++) {
            if (state.tracks[i].isSelectable(transformedX, transformedY, 20 / state.scale)) {
                return i;
            }
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault();
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            // const rect = canvas.getBoundingClientRect();
            // const x = e.clientX - rect.left;
            // const y = e.clientY - rect.top;
            const coords = getRealCoordinates(e.clientX, e.clientY)

            if (state.tool === 'MEASURE') {
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
                }))

            } else if (state.tool === "ERASER") {
                const clickedPoint = coords;
                const updatedMeasurements = measurements.filter(
                    (line) => !isPointNearLine(clickedPoint, line, 20 / state.scale)
                );
                setMeasurements(updatedMeasurements);

                const selectTrack = selectTrackPiece(e.clientX, e.clientY)
                if (selectTrack !== undefined){
                    setState(prev => ({
                        ...prev,
                        tracks:prev.tracks.filter((_, index) => selectTrack !== index)
                    }))
                }
            } else {
                setState(prev => ({
                    ...prev,
                    isDragging: true,
                    selectedPiece: selectTrackPiece(e.clientX, e.clientY),
                    lastX: coords.x,
                    lastY: coords.y
                }))
            }
        }

        if (e.button === 1) {
            setState(prev => ({
                ...prev,
                isPanning: true,
                lastX: e.clientX,
                lastY: e.clientY
            }));
        }

        if (e.button === 2 && state.selectedPiece !== null) {
            const updatedPieces = [...state.tracks];
            const rotationAmount = e.shiftKey ? -22.5 : 22.5;
            updatedPieces[state.selectedPiece!].setRotation(updatedPieces[state.selectedPiece!].rotation + rotationAmount);
            setState(prev => ({
                ...prev,
                tracks: updatedPieces,
                isDragging: true
            }));
            return;
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setCursorPosition({
            x: e.clientX,
            y: e.clientY
        });

        if (state.isDragging && state.selectedPiece !== undefined) {
            const { x, y } = getRealCoordinates(e.clientX, e.clientY);
            const updatedPieces = [...state.tracks];
            updatedPieces[state.selectedPiece!].setLocation(x, y);
            setState(prev => ({
                ...prev,
                tracks: updatedPieces,
            }));
            return
        }

        if (state.tool === "MEASURE" && state.isToolActive) {
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
            return
        }

        if (!state.isPanning) return;


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
    };

    const handleMouseUp = () => {
        if (!state.isToolActive) {
            setState(prev => ({
                ...prev,
                isPanning: false,
                isDragging: false,
                // isToolActive: false,
            }));
        }
        setCursorPosition(null);
    };


    const getPinchDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    const getPinchAngle = (touches: React.TouchList) => {
        const dx = touches[1].clientX - touches[0].clientX;
        const dy = touches[1].clientY - touches[0].clientY;
        return Math.atan2(dy, dx);
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1) {
            setState(prev => ({
                ...prev,
                isDragging: true,
                lastX: e.touches[0].clientX,
                lastY: e.touches[0].clientY
            }));
        } else if (e.touches.length === 2) {
            setState(prev => ({
                ...prev,
                pinchDistance: getPinchDistance(e.touches),
                pinchAngle: getPinchAngle(e.touches)
            }));
        }
    };


    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault()

        if (state.isDragging && e.touches.length === 1) {
            // Calculate the change in position
            const dx = e.touches[0].clientX - state.lastX;
            const dy = e.touches[0].clientY - state.lastY;

            // Apply rotation transformation to the delta
            const cos = Math.cos(-state.rotation);
            const sin = Math.sin(-state.rotation);
            const rotatedDx = dx * cos - dy * sin;
            const rotatedDy = dx * sin + dy * cos;

            setState(prev => ({
                ...prev,
                offsetX: prev.offsetX + rotatedDx,
                offsetY: prev.offsetY + rotatedDy,
                lastX: e.touches[0].clientX,
                lastY: e.touches[0].clientY
            }));
        } else if (e.touches.length === 2) {
            const pinchDistance = getPinchDistance(e.touches);
            const pinchAngle = getPinchAngle(e.touches);
            const scale = Math.min(Math.max(state.scale * pinchDistance / state.pinchDistance, 0.1), 2)
            const angleDelta = pinchAngle - state.pinchAngle;
            const rotation = state.rotation + angleDelta;
            setState(prev => ({
                ...prev,
                scale,
                rotation,
                pinchDistance,
                pinchAngle
            }));
        }
    };

    const handleTouchEnd = () => {
        setState(prev => ({
            ...prev,
            isDragging: false
        }));
    };

    return (<>

        <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}

            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}

            onContextMenu={(e) => e.preventDefault()}
            style={{ display: 'block', width: '100%', height: '100%', background: theme.background, cursor: `${state.tool ? "none" : "pointer"}` }}
        >

        </canvas>
        <div className='absolute right-10 text-white'>
            <pre>
                {JSON.stringify({...state,tracks:[]}, null, 2)}
            </pre>
        </div>
        {cursorPosition && state.tool && (
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
                {state.tool === 'ERASER' && <Eraser size={24} color="black" />}
                {state.tool === 'MEASURE' && <Ruler size={24} color="black" />}
            </div>
        )}
    </>
    );
};