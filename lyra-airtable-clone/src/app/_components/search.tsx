import { Input } from "~/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Search({ value, onChange }: Props) {
  return (
    <Input
      type="search"
      placeholder="Search"
      className="h-8 w-[200px] max-w-xs"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
