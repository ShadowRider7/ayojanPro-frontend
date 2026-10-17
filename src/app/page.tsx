import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Foundation ready
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          AyojanPro
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Event-service booking that connects clients with verified
          professionals — photography, videography, decoration, makeup, sound
          and more.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button>Get started</Button>
        <Button variant="outline">Browse professionals</Button>
      </div>
    </main>
  );
}
