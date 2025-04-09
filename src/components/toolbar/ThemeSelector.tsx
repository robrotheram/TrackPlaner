import { Fullscreen, Minimize, Moon, Settings, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { themes } from "@/lib/themes"
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu"

type ThemeSelectorProps = {
    setThemeIndex: (themeIndex: number) => void
}


const FullscreenMenu = () => {
    if (document.fullscreenElement) {
        return <DropdownMenuItem onClick={() => { document.exitFullscreen(); }}>
            <Minimize className="h-4 w-4 mr-2" />
            Exit Full Screen
        </DropdownMenuItem>
    }
    return <DropdownMenuItem onClick={() => { document.documentElement.requestFullscreen(); }}>
        <Fullscreen className="h-4 w-4 mr-2" />
        Full Screen
    </DropdownMenuItem>
}


export const ThemeSelector = ({ setThemeIndex }: ThemeSelectorProps) => {
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
            <FullscreenMenu />
            <DropdownMenuSeparator />

                <DropdownMenuLabel>Themes</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themes.map((theme, index) =>
                    <DropdownMenuItem key={theme.name} className='flex items-center' onClick={() => setThemeIndex(index)}>
                        {theme.name}
                    </DropdownMenuItem>
                )}
        </DropdownMenuContent>
    </DropdownMenu>
}