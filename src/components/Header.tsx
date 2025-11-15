import { Button } from "@/components/ui/button";
import { Wallet, Menu } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald to-electric rounded-lg" />
            <span className="text-xl font-bold text-foreground">Arc Hunt</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <a href="#leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex border-border hover:bg-secondary/50">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
