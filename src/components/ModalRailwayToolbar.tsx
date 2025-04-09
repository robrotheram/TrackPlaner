import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ZoomOut, RotateCcw, RailSymbol, RotateCw, ZoomInIcon, Undo, Redo } from 'lucide-react'
import { useModlerContext } from '@/context/ModlerContext'
import { Canvas } from './BaseGrid'
import { themes } from '@/lib/themes'
import { ToolMenu } from './toolbar/ToolMenu'
import { ThemeSelector } from './toolbar/ThemeSelector'
import { BillOfMaterials } from './toolbar/BillOfMaterials'
import { AddTrackButton } from './toolbar/AddTrack'
import { useHistoryState } from '@/context/HistoryContect'
import { LayoutMenu } from './toolbar/LayoutMenu'


export function ModelRailwayToolbar() {
 
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { state, setRotation, setScale } = useModlerContext();
    const { layout, setLayout, undo, redo } = useHistoryState();
    const [name, setName] = useState(layout.name)

    useEffect(() => {
        setName(layout.name)
    }, [layout.name])

    const [themeIndex, setThemeIndex] = useState(0);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">
                <nav className="bg-card text-card-foreground p-2 shadow-lg">
                    <div className="flex flex-col gap-3 p-2 lg:flex-row items-center justify-between">
                        <div className="flex w-full items-center space-x-2">
                            <div className="flex sm:space-x-2 w-full">
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
                           
                            
                            <ToolMenu />
                            {state.tool === "ADD" && <AddTrackButton />}
                            {state.tool !== "ADD" && <BillOfMaterials />}
                            <LayoutMenu canvasRef={canvasRef} />
                            <ThemeSelector setThemeIndex={setThemeIndex} />
                        </div>
                    </div>
                </nav>
                <div className="flex flex-grow px-4 py-2 w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg w-full h-full flex items-center justify-between text-muted-foreground">
                        <div className="absolute top-40 lg:top-[7rem] right-8 space-x-2">
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


