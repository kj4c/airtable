"use client";

type BaseBoxProps = {
  name: string;
};

export function BaseBox({ name } : BaseBoxProps) {
    return (
        <div className="flex mt-2 w-[280px] cursor-pointer bg-white rounded-lg border-2 border-gray-200 p-2 gap-2 items-center hover:drop-shadow-lg transition-shadow duration-200">
            <div className="flex justify-center m-2 bg-gray-500 p-4 items-center rounded-lg gray" aria-hidden="true">
                <span className="text-lg text-white">Un</span>
            </div>
            <div className="flex flex-col ">
                <p className="text-base font-medium">{name}</p>
                <p className="text-sm">Base</p>
            </div>
        </div>
    );
}
