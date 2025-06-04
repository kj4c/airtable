import { SortAsc } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export default function SortDialog() {
    return (
        <Popover>
            <PopoverTrigger className="cursor-pointer" asChild>
                <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
                    <SortAsc className="h-4 w-4" />
                    <span>Sort</span>
                </button>
            </PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
        </Popover>
    )    
}