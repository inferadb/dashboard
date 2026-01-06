import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="default">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            onClick={() => window.history.back()}
          >
            <span className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
