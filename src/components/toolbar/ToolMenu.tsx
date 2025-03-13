import { DraftingCompass, Eraser, MousePointerClick, Move, PencilRuler, RotateCw, Ruler, Stamp } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useMemo } from "react";
import { toolHandlers } from "@/lib/tools";
import { useModlerContext } from "@/context/ModlerContext";


export const ToolMenu = () => {
     const { state, setTool } = useModlerContext();

    const CurrentToolIcon = useMemo(() => {
        const toolObj = toolHandlers[state.tool];
        return toolObj ? toolObj.icon : null;
    }, [state.tool]);

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {CurrentToolIcon ? <Button variant="outline" className='p-6 text-md'><CurrentToolIcon size={24} /><span className='hidden sm:block capitalize'>{state.tool.toLowerCase()}</span></Button> :
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
}