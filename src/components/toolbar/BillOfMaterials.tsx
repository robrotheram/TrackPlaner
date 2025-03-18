import { TrackPieceBase } from "@/lib/track";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "../ui/button";
import { Save, ShoppingCart } from "lucide-react";
import { useHistoryState } from "@/context/HistoryContect";

export const BillOfMaterials = () => {
    const {layout} = useHistoryState();

    const trackSummary = layout.tracks.reduce((acc: { [key: string]: number }, track: TrackPieceBase) => {
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
