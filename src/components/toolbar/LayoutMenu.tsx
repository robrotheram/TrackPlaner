import { Camera, FileInput, LayoutDashboard, LayoutGrid, Save } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { ChangeEvent, useRef } from "react";
import { useModlerContext } from "@/context/ModlerContext";
import { useHistoryState } from "@/context/HistoryContect";
import { loadState, saveState } from '@/lib/fileHandler'

type LayoutMenuProps = {
    canvasRef: React.RefObject<HTMLCanvasElement>;
}
export const LayoutMenu = ({canvasRef}:LayoutMenuProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
        const { setState } = useModlerContext();
        const { layout, setLayout} = useHistoryState();



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

    return <DropdownMenu>
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
        <input ref={fileInputRef} type="file" onChange={(e) => handleLoad(e)} accept=".layout" style={{ display: "none" }}></input>
    </DropdownMenu>
}