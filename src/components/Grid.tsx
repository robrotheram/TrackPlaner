import React, { useEffect, useState } from 'react';
import { TrackPieceBase } from '../lib/Track';
import { useModlerContext } from '../context/ModlerContext';
import { Button } from './ui/button';
import { RotateCcwSquare, RotateCcwSquareIcon, RotateCwSquare } from 'lucide-react';

const Grid: React.FC<{ canvasRef: React.RefObject<HTMLCanvasElement> }> = ({ canvasRef }) => {
    const { state, setTracks: save, selectTrack, setScale } = useModlerContext();
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState<boolean>(false);
    const [trackPieces, setTrackPieces] = useState<TrackPieceBase[]>(state.tracks);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);

    const gridSize = 100;
    const scale = state.scale;

    useEffect(() => {
        setTrackPieces(state.tracks.map(track => track.clone()));
    }, [state.tracks]);

    const getRealCoordinates = (x: number, y: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const realX = (x - rect!.x - offset.x) / scale;
        const realY = (y - rect!.y - offset.y) / scale;
        return { x: realX, y: realY };
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            const context = canvas.getContext('2d');
            if (context) {
                context.scale(dpr, dpr);
            }
        }

        const context = canvas?.getContext('2d');
        if (canvas && context) {
            const draw = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.save();
                context.fillStyle = 'white'; // Set background to white
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                context.restore();
                context.save();
                context.translate(offset.x, offset.y);
                context.scale(scale, scale);
                // Draw grid
                context.strokeStyle = '#e0e0e0';
                context.lineWidth = 1;
                const startX = -offset.x / scale;
                const startY = -offset.y / scale;
                const endX = startX + canvas.width / scale;
                const endY = startY + canvas.height / scale;

                for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
                    context.beginPath();
                    context.moveTo(x, startY);
                    context.lineTo(x, endY);
                    context.stroke();
                }

                for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
                    context.beginPath();
                    context.moveTo(startX, y);
                    context.lineTo(endX, y);
                    context.stroke();
                }

                context.restore();

                // Draw scale indicator
                context.save();
                context.fillStyle = 'black';
                context.font = '12px Arial';
                context.fillText(`Scale: ${(1 / scale * 10).toFixed(0)} cm`, 10, 20);
                context.restore();

                context.save();
                const realMousePos = getRealCoordinates(mousePos.x, mousePos.y);
                context.fillStyle = 'black';
                context.font = '12px Arial';
                context.fillText(`Mouse: x:${realMousePos.x} y:${realMousePos.y}`, 100, 20);
                context.restore();

                // Draw track pieces
                context.save();
                context.translate(offset.x, offset.y);
                context.scale(scale, scale);
                
                trackPieces.forEach((piece, index) => piece.draw(context, index === state.selectedPiece));
                context.restore();
                
            };

            draw();
        }
    }, [scale, offset, trackPieces, state.selectedPiece, mousePos, rotation]);

    const selectTrackPiece = (x: number, y: number) => {
        selectTrack(null);
        const { x: transformedX, y: transformedY } = getRealCoordinates(x, y);
        for (let i = 0; i < trackPieces.length; i++) {
            if (trackPieces[i].isSelectable(transformedX, transformedY, 20 / scale)) {
                selectTrack(i);
                setDragging(true);
                return;
            }
        }
    };

    const handleWheel = (event: React.WheelEvent) => {
        const scaleAmount = -event.deltaY * 0.001;
        const newScale = Math.min(Math.max(state.scale + scaleAmount, 0.1), 10);

        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / state.scale);
            const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / state.scale);

            setOffset({ x: newOffsetX, y: newOffsetY });
        }

        setScale(newScale); // Update scale in context state
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        if (event.button === 1) {
            setIsPanning(true);
            setPan({ x: event.clientX - offset.x, y: event.clientY - offset.y });
            return;
        }
        if (event.button === 2 && state.selectedPiece !== null) {
            const updatedPieces = [...trackPieces];
            const rotationAmount = event.shiftKey ? -22.5 : 22.5;
            updatedPieces[state.selectedPiece].setRotation(updatedPieces[state.selectedPiece].rotation + rotationAmount);
            setTrackPieces(updatedPieces);
            save(updatedPieces);
            return;
        }
        selectTrackPiece(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        setMousePos({ x: event.clientX, y: event.clientY });
        const { x, y } = getRealCoordinates(event.clientX, event.clientY);
        if (dragging && state.selectedPiece !== null) {
            const updatedPieces = [...trackPieces];
            updatedPieces[state.selectedPiece].setLocation(x, y);
            setTrackPieces(updatedPieces);
        } else if (isPanning) {
            setOffset({ x: event.clientX - pan.x, y: event.clientY - pan.y });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        if (dragging) {
            save(trackPieces);
        }
        setDragging(false);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
                style={{ display: 'block', width: '100%', height: '100%', cursor: isPanning ? 'pointer' : 'grab' }}
            />
           
        </>
    );
};

export default Grid;