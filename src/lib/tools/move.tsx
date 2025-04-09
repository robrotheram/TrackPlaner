import { TrackPieceBase } from "@/lib/track";
import { CanvasContext, Endpoint, ToolHandler } from "@/types";
import { typeFromPiece } from "../track/utils";
import { findNearestEndpoint } from "../canvas/grid";
import { PencilRuler } from "lucide-react";

export const MoveHandler : ToolHandler = {
            icon: ({ size, color, fill }) => <PencilRuler size={size} color={color} fill={fill} />,
            onMouseDown: (e: React.MouseEvent, {state, layout, dragOffset, setState,setLayout, getRealCoordinates}: CanvasContext) => {
                const coords = getRealCoordinates(e.clientX, e.clientY);

                const selectTrack = layout.tracks.filter((piece: any) => piece.isSelectable(coords.x, coords.y, 20 / state.scale))[0];

                if (selectTrack) {
                    dragOffset.current = {
                        x: coords.x - selectTrack.x,
                        y: coords.y - selectTrack.y,
                      };    

                      setLayout({
                        type: "SELECT_TRACK",
                        selectedPieceId: selectTrack.id
                    })
                };
                
                setState(prev => ({
                    ...prev,
                    isDragging: true,
                    lastX: coords.x,
                    lastY: coords.y
                }));

               
            },
            onMouseMove: (e: React.MouseEvent, {layout, state, setLayout, getRealCoordinates}: CanvasContext) => {
                const { x, y } = getRealCoordinates(e.clientX, e.clientY);
                if (state.isDragging && layout.selectedPiece !== undefined) {
                    const selectedTrack:TrackPieceBase = layout.tracks.filter((piece: any) => piece.id === layout.selectedPiece)[0];    
                    const updatedPieces = [...layout.tracks];

                    // First update the position normally
                    selectedTrack.setLocation(x, y);

                    // Get the current piece's endpoints
                    const markers = selectedTrack.getMarkerPoints();
                    const endpoints = [
                        { point: markers.start, isStart: true },
                        { point: markers.end, isStart: false }
                    ];
                    if ((typeFromPiece(selectedTrack) === "lhpoint")||(typeFromPiece(selectedTrack) === "rhpoint")){
                        endpoints.push({point: markers.endArc!, isStart:false})
                    }
                    console.log("endpoints", endpoints, typeFromPiece(selectedTrack))

                    // Find the nearest endpoint among all endpoints
                    let nearestEndpoint: Endpoint = {};
                    let minDistance = Infinity;

                    endpoints.forEach(({ point }) => {
                        const { point: nearestPoint, track: nearestTrack } = findNearestEndpoint(
                            selectedTrack,
                            layout.tracks,
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
                        if (["curve", "lhpoint", "rhpoint"].includes(typeFromPiece(selectedTrack))) {
                            selectedTrack.setLocation(nearestPoint.x, nearestPoint.y);                            
                        }else{
                            selectedTrack.setLocation(
                                selectedTrack.x + dx,
                                selectedTrack.y + dy
                            );
                        }
                    }
                    setLayout({
                        type:"ON_MOVE",
                        tracks: updatedPieces
                    })
                }
            },
            onMouseUp: (_: React.MouseEvent, {layout, state, setLayout, setState}: CanvasContext) => {
                setState(prev => ({
                    ...prev,
                    isDragging: false,
                }));
                if (state.isDragging && layout.selectedPiece)  {
                    setLayout({
                        type:"UPDATE_TRACK",
                        tracks: layout.tracks
                    })
                } 
                
            }
        }