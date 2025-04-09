import { DraftingCompass} from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useMemo } from "react";
import { toolHandlers } from "@/lib/tools";
import { useModlerContext } from "@/context/ModlerContext";
import { Tool } from "@/types";


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
            {Object.entries(toolHandlers).map(([key, tool]) => 
                <DropdownMenuItem key={key} onClick={() => { setTool(key as Tool) }}>
                    {tool.icon!({ size: 16, color: "currentColor", fill: "none" })}
                    <span className='capitalize'>{key.toLowerCase()}</span>
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
}