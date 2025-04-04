import { LucideTrainTrack } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TrackPack, TrackType } from "@/lib/track";
import { HornbyTrackPack } from "@/lib/trackPacks/hornby";
import { useModlerContext } from "@/context/ModlerContext";


type TrackMenuProps = {
    tracks: TrackPack[],
    handleSelect: (track: TrackPack) => void
}
const CurvedMenu = ({ tracks, handleSelect }: TrackMenuProps) => {
    const cTracks: Map<number, TrackPack[]> = new Map();
    tracks.forEach((track) => {
        const type = track.radius!;
        if (cTracks.has(type)) {
            cTracks.get(type)?.push(track);
        } else {
            cTracks.set(type, [track]);
        }
    });

    const radiusToText = (radius: number) => {
        switch (radius) {
            case 371: return "1st radius";
            case 438: return "2nd radius";
            case 505: return "3rd radius";
            case 572: return "4th radius";
            default: return "Unknown";
        }
    }
    return <DropdownMenuGroup>
        <DropdownMenuLabel>Curves</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Array.from(cTracks).map(([type, trackList]) => (
            <DropdownMenuSub key={type}>
                <DropdownMenuSubTrigger>{radiusToText(type)}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {trackList.map((track) => <DropdownMenuItem key={track.code} onClick={() => handleSelect(track)}>{track.name}</DropdownMenuItem>)}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        ))}
    </DropdownMenuGroup>
}

const StraightMenu = ({ tracks, handleSelect }: TrackMenuProps) => {
    return <DropdownMenuGroup>
        <DropdownMenuLabel>Straights</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tracks.map((track) => <DropdownMenuItem key={track.code} onClick={() => handleSelect(track)}>{track.name}</DropdownMenuItem>)}
    </DropdownMenuGroup>
}


const PointsMenu = ({ tracks, handleSelect }: TrackMenuProps) => {
    return <DropdownMenuGroup>
        <DropdownMenuLabel>Points</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tracks.map((track) => <DropdownMenuItem key={track.code} onClick={() => handleSelect(track)}>{track.name}</DropdownMenuItem>)}
    </DropdownMenuGroup>
}


export const AddTrackButton = () => {
    const {state, setState} = useModlerContext(); 
    const tracks: Map<TrackType, TrackPack[]> = new Map();

    const handleSelect = (track: TrackPack) => {
        setState(prev => ({ ...prev, addTrackPiece: track }));
    }

    HornbyTrackPack.forEach((track) => {
        const type = track.type;
        if (tracks.has(type)) {
            tracks.get(type)?.push(track);
        } else {
            tracks.set(type, [track]);
        }
    });

    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            {state.addTrackPiece ? <Button variant="outline" className='p-6 text-md'><LucideTrainTrack />{state.addTrackPiece.code}</Button> :
                <Button variant="outline" className='p-6 text-md'><LucideTrainTrack /> <span className='hidden sm:block'>Select Track</span></Button>
            }
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
            <StraightMenu tracks={tracks.get("straight")!} handleSelect={handleSelect} />
            <DropdownMenuSeparator />
            <CurvedMenu tracks={tracks.get("curve")!} handleSelect={handleSelect} />
            <DropdownMenuSeparator />
            <PointsMenu tracks={[...tracks.get("lhpoint")!, ...tracks.get("rhpoint")!]} handleSelect={handleSelect} />
        </DropdownMenuContent>
    </DropdownMenu>
}
