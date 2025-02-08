import { useState, useRef, ChangeEvent, useMemo } from 'react'
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
import { ShoppingCart, ZoomOut, Save, FileInput, Ruler, Eraser, RotateCcw, Camera, RailSymbol, LucideTrainTrack, LayoutDashboard, Settings, RotateCw, Move, MousePointerClick, DraftingCompass, ZoomInIcon, Sun, Moon, LayoutGrid, PencilRuler, Stamp } from 'lucide-react'
import { useModlerContext } from '@/context/ModlerContext'
import { HornbyTrackPack } from '@/lib/trackPacks/hornby'
import { Canvas } from './BaseGrid'
import { themes } from '@/lib/themes'
import { TrackPack, TrackPieceBase } from '@/lib/track'
import { loadState, saveState } from '@/lib/fileHandler'
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { Switch } from './ui/switch'
import { useTheme } from '@/context/ThemeContext'
import { toolHandlers } from '@/lib/tools'


export function ModelRailwayToolbar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { state, setState, setTool, setRotation, setScale } = useModlerContext();


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

    const handleSave = async () => {
        try {
            await saveState(state)
        } catch (error) {
            console.error("Error during save:", error);
        }
    }

    const handleNewLayout = () => {
        setState(prev => ({ ...prev, layoutName: "New Layout", tracks: [], offsetX: 0, offsetY: 0, scale: 1, measurements: [] }))
    }

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleLoad = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                try {
                    loadState(setState, result)
                } catch (error) {
                    console.error('Error parsing the loaded file:', error);
                }
            }
        };

        reader.readAsText(file);
    };
    const CurrentToolIcon = useMemo(() => {
        const tool = toolHandlers[state.tool];
        return tool ? tool.icon : null;
    }, [state.tool]);
    
    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">
                <nav className="bg-card text-card-foreground p-2 shadow-lg">
                    <div className="flex flex-col gap-3 p-2 lg:flex-row items-center justify-between">
                        <div className="flex w-full items-center space-x-2">
                            <div className="logo flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <RailSymbol />
                            </div>
                            <Input
                                value={state.layoutName}
                                onChange={(e) => setState(prev => ({ ...prev, layoutName: e.target.value }))}
                                className="text-lg p-6 h-8 w-full" />
                        </div>
                        <div className="flex items-center space-x-2 w-full justify-between lg:justify-end">
                            {state.tool === "ADD" &&<AddTrackButton />}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {CurrentToolIcon? <Button variant="outline" className='p-6 text-md'><CurrentToolIcon size={24}/><span className='hidden sm:block capitalize'>{state.tool.toLowerCase()}</span></Button>:
                                    <Button variant="outline" className='p-6 text-md'><DraftingCompass /><span className='hidden sm:block'>Tools</span></Button>
                                    }
                                    
                                </DropdownMenuTrigger>


                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => { setTool("ADD") }}>
                                        <MousePointerClick className="h-4 w-4 mr-2" />
                                        Add
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool("MOVE") }}>
                                        <PencilRuler className="h-4 w-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool("DUPLICATE") }}>
                                        <Stamp className="h-4 w-4 mr-2" />
                                        Clone
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool("ROTATE") }}>
                                        <RotateCw className="h-4 w-4 mr-2" />
                                        Rotate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setTool("PANNING") }}>
                                        <Move className="h-4 w-4 mr-2" />
                                        Pan Canvas
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
                                    <Button variant="outline" className='p-6 text-md'><LayoutDashboard /><span className='hidden sm:block'>Layout</span> </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={handleNewLayout}>
                                        <LayoutGrid className="h-4 w-4 mr-2" />
                                        New Layout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Layout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleLoadClick}>
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
                            <input ref={fileInputRef} type="file" onChange={(e) => handleLoad(e)} accept=".layout" style={{ display: "none" }}></input>
                        </div>
                    </div>
                </nav>
                <div className="flex flex-grow px-4 pb-4 w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-between text-muted-foreground">
                        <div className="absolute top-40 md:top-24 right-8 space-x-2">
                            <Button size="icon" className="rounded-full" title="Zoom In" onClick={() => setScale(0.1)}>
                                <ZoomInIcon />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Zoom Out" onClick={() => setScale(-0.1)}>
                                <ZoomOut />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Rotate Canvas Clockwise" onClick={() => setRotation(Math.PI / 12)}>
                                <RotateCw />
                            </Button>
                            <Button size="icon" className="rounded-full" title="Rotate Canvas Counterclockwise" onClick={() => setRotation(-Math.PI / 12)}>
                                <RotateCcw />
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

    const { state, setState } = useModlerContext();

    const handleSelect = (track: TrackPack) => {
        setState(prev => ({ ...prev, addTrackPiece: track }));
    }

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {state.addTrackPiece ? <Button variant="outline" className='p-6 text-md'><LucideTrainTrack />{state.addTrackPiece.code}</Button> :
                <Button variant="outline" className='p-6 text-md'><LucideTrainTrack /> <span className='hidden sm:block'>Select Track</span></Button>
            }
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            {HornbyTrackPack.map((track) =>
                <DropdownMenuItem key={track.code} className='flex items-center' onClick={() => handleSelect(track)}>
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
            <Button variant="outline" className='p-6 text-md'>
                <ShoppingCart className="h-4 w-4" /><span className='hidden sm:block'>Bill of Materials</span>
            </Button>
        </SheetTrigger>
        <SheetContent className='w-full md:w-[400px]'>
            <SheetHeader>
                <SheetTitle>Bill of Materials</SheetTitle>
            </SheetHeader>
            <div className="py-4">
                <table className="min-w-full ">
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
    const { theme, setTheme } = useTheme()

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" className='p-6 text-md'><Settings /> </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem asChild>
                <div className='flex items-center space-x-2'>
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                    <Switch
                        checked={theme === "light"}
                        onCheckedChange={(e) => {
                            setTheme(e ? "light" : "dark")
                        }} />
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {themes.map((theme, index) =>
                <DropdownMenuItem key={index} className='flex items-center' onClick={() => setThemeIndex(index)}>
                    {theme.name}
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
}