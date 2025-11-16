import { Button } from "@/components/ui/button";
import { Wallet, Menu } from "lucide-react";
import logo from "@/assets/archunt-logo.png";

interface HeaderProps {
  walletAddress?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export const Header = ({ walletAddress, onConnect, onDisconnect, isConnecting }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-strong shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ArcHunt" className="h-10 w-auto" />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#products" className="text-sm font-semibold text-navy/70 hover:text-orange transition-colors">
              Products
            </a>
            <a href="#leaderboard" className="text-sm font-semibold text-navy/70 hover:text-orange transition-colors">
              Leaderboard
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-navy/70 hover:text-orange transition-colors">
              How It Works
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {walletAddress ? (
            <Button variant="outline" onClick={onDisconnect} className="hidden sm:flex glass border-glass-border hover:shadow-glass-hover">
              <Wallet className="w-4 h-4 mr-2" />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Button>
          ) : (
            <Button 
              onClick={onConnect} 
              disabled={isConnecting}
              className="hidden sm:flex bg-gradient-to-r from-orange to-orange-light text-white border-0 hover:shadow-orange transition-all"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-navy">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
