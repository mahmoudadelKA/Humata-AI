import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center neon-glow-magenta">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 text-glow-magenta text-accent">
          404
        </h1>
        
        <h2 className="text-2xl font-bold mb-4 text-foreground tracking-wider">
          SIGNAL LOST
        </h2>
        
        <p className="text-muted-foreground mb-8">
          The neural pathway you&apos;re looking for doesn&apos;t exist in this system. 
          Return to the main hub to reconnect.
        </p>
        
        <Link href="/">
          <Button className="neon-glow-cyan" data-testid="button-go-home">
            <Home className="w-4 h-4 mr-2" />
            RETURN TO HUB
          </Button>
        </Link>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground/50 tracking-widest">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span>ERROR // PATH_NOT_FOUND</span>
        </div>
      </div>
    </div>
  );
}
