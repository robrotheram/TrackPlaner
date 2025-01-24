import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingCart, ZoomIn, ZoomOut, Save, FileInput, Ruler, Eraser, RotateCcw, PaintBucket, Camera, RailSymbol, LucideTrainTrack, LayoutDashboard, Settings, RotateCw, Move3D, Move } from 'lucide-react'
import { useModlerContext } from '@/context/ModlerContext'
import { CreateTrackPiece, HornbyTrackPack } from '@/lib/trackPacks/hornby'
import { Canvas } from './BaseGrid'
import { themes } from '@/lib/Themes'
import { TrackPieceBase } from '@/lib/Track'


export function ModelRailwayToolbar() {
    const [layoutName, setLayoutName] = useState("My Railway Layout")
    const { setTool, setRotation, setScale } = useModlerContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [themeIndex, setThemeIndex] = useState(0);

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
                    <div className="flex flex-col gap-3  md:flex-row items-center justify-between">
                        <div className="flex w-full items-center space-x-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <RailSymbol className="size-8 p-1" />
                            </div>
                            <Input
                                value={layoutName}
                                onChange={(e) => setLayoutName(e.target.value)}
                                className="font-semibold text-lg w-full"
                            />
                        </div>


                        <div className="flex items-center space-x-2 w-full justify-evenly md:justify-end">
                            <AddTrackButton />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><Ruler /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => { setTool(null) }}>
                                        <Move className="h-4 w-4 mr-2" />
                                        Move
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool('MEASURE') }}>
                                        <Ruler className="h-4 w-4 mr-2" />
                                        Measure
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool('ERASER') }}>
                                        <Eraser className="h-4 w-4 mr-2" />
                                        Erase
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><LayoutDashboard className='h-8 w-8' /> </Button>
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
                            <ThemeSelector setThemeIndex={setThemeIndex} />

                        </div>
                    </div>
                </nav>
                <div className="flex flex-grow p-4 w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="absolute top-36 md:top-24 right-8 space-x-2">
                            <Button size="icon" className="rounded-full" title="Zoom In" onClick={() => setScale(0.1)}>
                                <ZoomIn />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Zoom Out" onClick={() => setScale(-0.1)}>
                                <ZoomOut className="h-8 w-8" />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Rotate Canvas Clockwise" onClick={() => setRotation(Math.PI / 12)}>
                                <RotateCw className="h-8 w-8" />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Rotate Canvas Counterclockwise" onClick={() => setRotation(-Math.PI / 12)}>
                                <RotateCcw className="h-8 w-8" />
                            </Button>
                        </div>
                        <Canvas theme={themes[themeIndex]} canvasRef={canvasRef} />
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
            <Button variant="outline"><LucideTrainTrack /> </Button>
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
                <ShoppingCart className="h-4 w-4" />
            </Button>
        </SheetTrigger>
        <SheetContent className='w-full md:w-[400px]'>
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

type ThemeSelectorProps = {
    setThemeIndex: (themeIndex: number) => void
}

const ThemeSelector = ({ setThemeIndex }: ThemeSelectorProps) => {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline"><Settings /> </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {themes.map((theme, index) =>
                <DropdownMenuItem key={index} className='flex items-center' onClick={() => setThemeIndex(index)}>
                    {theme.name}
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
}