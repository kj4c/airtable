import { Input } from "~/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Search({ value, onChange }: Props) {
  return (
    <input
      type="search"
      placeholder="Find in view"
      className="h-8 px-2 py-5 font-[500] w-[300px] max-w-xs rounded-none outline-none hover:outline-none focus:outline-none"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
