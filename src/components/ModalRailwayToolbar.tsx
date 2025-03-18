import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ZoomOut, Save, FileInput, RotateCcw, Camera, RailSymbol, LayoutDashboard, RotateCw, ZoomInIcon, LayoutGrid, Undo, Redo } from 'lucide-react'
import { useModlerContext } from '@/context/ModlerContext'
import { Canvas } from './BaseGrid'
import { themes } from '@/lib/themes'
import { loadState, saveState } from '@/lib/fileHandler'
import { ToolMenu } from './toolbar/ToolMenu'
import { ThemeSelector } from './toolbar/ThemeSelector'
import { BillOfMaterials } from './toolbar/BillOfMaterials'
import { AddTrackButton } from './toolbar/AddTrack'
import { useHistoryState } from '@/context/HistoryContect'


export function ModelRailwayToolbar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { state, setState, setRotation, setScale } = useModlerContext();
    const { layout, setLayout, undo, redo } = useHistoryState();
    const [name, setName] = useState(layout.name)

    useEffect(() => {
        setName(layout.name)
    }, [layout.name])

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
            await saveState(layout)
        } catch (error) {
            console.error("Error during save:", error);
        }
    }

    const handleNewLayout = () => {
        setState(prev => ({ ...prev, offsetX: 0, offsetY: 0, scale: 1, rotation: 0 }));
        setLayout({
            type: "SET_STATE",
            state: {
                layout: {
                    name: "New Layout",
                    tracks: [],
                    measurements: []
                },
                undoStack: [],
                redoStack: []
            }
        })
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
                    handleNewLayout();
                    loadState(setLayout, result)
                } catch (error) {
                    console.error('Error parsing the loaded file:', error);
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">
                <nav className="bg-card text-card-foreground p-2 shadow-lg">
                    <div className="flex flex-col gap-3 p-2 lg:flex-row items-center justify-between">
                        <div className="flex w-full items-center space-x-2">
                            <div className="flex space-x-2 w-full">
                                <div className="logo sm:flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hidden">
                                    <RailSymbol />
                                </div>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => { setLayout({ type: "SET_LAYOUT_NAME", name }) }}
                                    className="text-lg p-6  w-full" />
                            </div>
                            <div className="flex items-center space-x-2 ">
                                <Button variant="outline" className='p-6 text-md' onClick={undo}>
                                    <Undo />
                                </Button>
                                <Button variant="outline" className='p-6 text-md' onClick={redo}>
                                    <Redo />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full justify-between lg:justify-end">
                            {state.tool === "ADD" && <AddTrackButton />}
                            <ToolMenu />
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
                            <BillOfMaterials />
                            <ThemeSelector setThemeIndex={setThemeIndex} />
                            <input ref={fileInputRef} type="file" onChange={(e) => handleLoad(e)} accept=".layout" style={{ display: "none" }}></input>
                        </div>
                    </div>
                </nav>
                <div className="flex flex-grow px-4 pb-4 w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-between text-muted-foreground">
                        <div className="absolute top-40 lg:top-24 right-8 space-x-2">
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


