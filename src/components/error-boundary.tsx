import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

interface ErrorComponentProps {
  error: Error;
  reset?: () => void;
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  const handleReset = () => {
    if (reset) {
      reset();
    } else {
      router.invalidate();
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {process.env.NODE_ENV === "development" && error.stack && (
          <pre className="mt-4 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
            {error.stack}
          </pre>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleReset} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorComponent({ error }: { error: Error }) {
  return <ErrorComponent error={error} />;
}
