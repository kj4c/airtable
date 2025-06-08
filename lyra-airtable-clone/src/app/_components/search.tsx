import { Input } from "~/components/ui/input";

export default function Search() {
    return (
        <Input
            type="search"
            placeholder="Search"
            className="w-[200px] max-w-xs"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
        />
    )
}