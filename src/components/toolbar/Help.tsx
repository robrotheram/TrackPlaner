import type React from "react"
import { Ruler, Eraser, Move, RotateCw, Mouse, Copy, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpProps {
  isOpen: boolean
  onClose: () => void
  onNeverShowAgain: () => void
}

const Help: React.FC<HelpProps> = ({ isOpen, onClose, onNeverShowAgain }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to TrackPlanner</DialogTitle>
          <DialogDescription>
            TrackPlanner is a powerful model railway track planning tool. Design your dream layout with ease using our
            intuitive interface and keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">Here are some helpful shortcuts to get you started:</p>
          <div className="grid grid-cols-[25px_1fr_auto] items-center gap-4">
            <Ruler className="h-4 w-4" />
            <span className="font-semibold">measure:</span>
            <span>M</span>
            <Eraser className="h-4 w-4" />
            <span className="font-semibold">eraser:</span>
            <span>E</span>
            <Move className="h-4 w-4" />
            <span className="font-semibold">move:</span>
            <span>V</span>
            <RotateCw className="h-4 w-4" />
            <span className="font-semibold">rotate:</span>
            <span className="text-sm">
              R (select tool)
              <br />
              Left click: clockwise
              <br />
              Right click: anti-clockwise
            </span>
            <Mouse className="h-4 w-4" />
            <span className="font-semibold">panning:</span>
            <span>Middle mouse button</span>
            <Copy className="h-4 w-4" />
            <span className="font-semibold">duplicate:</span>
            <span>D</span>
            <PlusSquare className="h-4 w-4" />
            <span className="font-semibold">add elements:</span>
            <span>N</span>
          </div>
        </div>
        <div className="flex justify-between">
          <Button onClick={onNeverShowAgain}>Don't show again</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Help

