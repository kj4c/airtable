import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useDebounce } from "use-debounce";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Search({ value, onChange }: Props) {
    return (
        <Input
            type="search"
            placeholder="Search"
            className="w-[200px] h-8 max-w-xs"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    )
}