import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Undo2, Redo2, ShoppingCart, ZoomIn, ZoomOut, Save, FileInput, Ruler, Eraser, RotateCcw, PaintBucket, Camera, RailSymbol, Trash2, LucideTrainTrack, LayoutDashboard } from 'lucide-react'
import { TrackPieceBase } from '@/lib/Track'
import { useModlerContext } from '@/context/ModlerContext'
import Grid from './Grid'
import { CreateTrackPiece, HornbyTrackPack } from '@/lib/trackPacks/hornby'


export function ModelRailwayToolbar() {
    const [layoutName, setLayoutName] = useState("My Railway Layout")
    const { state, undo, redo, deleteTrack, setScale } = useModlerContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const takeScreenshot = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'screenshot.png';
            link.click();
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">
                <nav className="bg-card text-card-foreground p-2 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className=" flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <RailSymbol className="size-8 p-1" />
                            </div>
                            <div className="grid flex-1 text-left text-lg leading-tight">
                                <span className="truncate font-semibold">
                                    Track Planner
                                </span>
                            </div>

                            <Input
                                value={layoutName}
                                onChange={(e) => setLayoutName(e.target.value)}
                                className="font-semibold text-lg w-96"
                            />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={undo} >
                                        <Undo2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Undo</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={redo} >
                                        <Redo2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Redo</TooltipContent>
                            </Tooltip>

                            {state.selectedPiece &&
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={deleteTrack} >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Track</TooltipContent>
                                </Tooltip>
                            }
                        </div>

                        <div className="flex items-center space-x-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setScale(state.scale + 0.1)}>
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom In</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setScale(state.scale - 0.1)}>
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom Out</TooltipContent>
                            </Tooltip>

                            <AddTrackButton />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><Ruler /> Tools</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem disabled>
                                        <Ruler className="h-4 w-4 mr-2" />
                                        Measure
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <Eraser className="h-4 w-4 mr-2" />
                                        Erase
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Rotate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <PaintBucket className="h-4 w-4 mr-2" />
                                        Paint
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>



                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><LayoutDashboard /> Layout</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem disabled>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Layout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <FileInput className="h-4 w-4 mr-2" />
                                        Load Layout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={takeScreenshot}>
                                        <Camera className="h-4 w-4 mr-2" />
                                        Screenshot
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ShoppingListSheet />

                        </div>
                    </div>
                </nav>
                <div className="flex-grow p-4">
                    {/* Main content area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center text-muted-foreground">
                        <Grid canvasRef={canvasRef} />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}


const AddTrackButton = () => {

    const { addTrack } = useModlerContext();

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline"><LucideTrainTrack /> Add Track</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {HornbyTrackPack.map((track) =>
                <DropdownMenuItem key={track.code} className='flex items-center' onClick={() => addTrack(CreateTrackPiece(track, 100, 100))}>
                    <img src={track.image} alt={track.name} className='h-24' />
                    <span>{track.code}</span>
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
}


const ShoppingListSheet = () => {
    const { state } = useModlerContext();

    const trackSummary = state.tracks.reduce((acc: { [key: string]: number }, track: TrackPieceBase) => {
        acc[track.code] = (acc[track.code] || 0) + 1;
        return acc;
    }, {});

    const exportToCSV = () => {
        // Step 1: Define CSV header and rows
        const headers = ["Track Code", "Amount"];
        const rows = Object.entries(trackSummary).map(([code, count]) => [code, count]);

        // Step 2: Convert to CSV format
        const csvContent =
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        // Step 3: Create a Blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Step 4: Create a link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "shoppinglist.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shopping List
            </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Shopping List</SheetTitle>
            </SheetHeader>
            <div className="py-4">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Track</th>
                            <th className="py-2">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.entries(trackSummary).map(([code, count]) => (
                                <tr key={code}>
                                    <td className="border px-4 py-2">{code}</td>
                                    <td className="border px-4 py-2">{count}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <Button onClick={exportToCSV} className='w-full'><Save /> Export as CSV</Button>
        </SheetContent>
    </Sheet>



}