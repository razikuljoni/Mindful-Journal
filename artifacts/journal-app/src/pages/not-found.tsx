import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-serif font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-medium text-foreground mb-4">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        This path doesn't exist in your journal. Let's get you back to a familiar place.
      </p>
      <Button asChild size="lg" className="rounded-xl px-8">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
