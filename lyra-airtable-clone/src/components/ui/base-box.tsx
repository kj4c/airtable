"use client";

type BaseBoxProps = {
  name: string;
};

export function BaseBox({ name }: BaseBoxProps) {
  return (
    <div className="mt-2 flex w-[280px] cursor-pointer items-center gap-2 rounded-lg border-2 border-gray-200 bg-white p-2 transition-shadow duration-200 hover:drop-shadow-lg">
      <div
        className="gray m-2 flex items-center justify-center rounded-lg bg-gray-500 p-4"
        aria-hidden="true"
      >
        <span className="text-lg text-white">Un</span>
      </div>
      <div className="flex flex-col">
        <p className="text-base font-medium">{name}</p>
        <p className="text-sm">Base</p>
      </div>
    </div>
  );
}
