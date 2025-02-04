import { findNearestEndpoint } from "@/lib/Canvas/measure";
import { TrackCurvedPiece } from "@/lib/Track";
import { CanvasContext, Endpoint } from "@/types";

export const MoveHandler = {
            onMouseDown: (e: React.MouseEvent, {state, setState, getRealCoordinates}: CanvasContext) => {
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
            onMouseMove: (e: React.MouseEvent, {state, setState, getRealCoordinates}: CanvasContext) => {
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
                }
                //  else {
                //     const selectTrack = state.tracks.findIndex((piece: any) =>
                //         piece.isSelectable(x, y, 20 / state.scale)
                //     );
                //     // setCanGrab(selectTrack !== -1);
                // }
            },
            onMouseUp: (_: React.MouseEvent, {setState}: CanvasContext) => {
                setState(prev => ({
                    ...prev,
                    isDragging: false,
                    selectedPiece: undefined
                }));
            }
        }