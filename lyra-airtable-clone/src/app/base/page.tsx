import AppLayout from "~/components/ui/app-layout";
import { BaseBox } from "~/components/ui/base-box";
import { Button } from "~/components/ui/button";

export default function BasePage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <Button
        className="cursor-pointer px-6 py-3 text-l bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Create a Base
      </Button>
      {/* Load all the base matching this user*/}
      <div className="flex flex-wrap gap-4 mt-4">
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
        <BaseBox name="Untitled Base"/>
      </div>
    </AppLayout>
  );
}
