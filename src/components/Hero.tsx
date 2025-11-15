import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export const Hero = ({ onLaunchClick }: { onLaunchClick: () => void }) => {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald/10 via-transparent to-electric/10" />
      
      <div className="container mx-auto px-4 py-20 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border backdrop-blur-sm">
            <Zap className="w-4 h-4 text-emerald" />
            <span className="text-sm text-muted-foreground">Built on Arc Layer-1 Blockchain</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald to-emerald-glow bg-clip-text text-transparent">
              Discover
            </span>
            {" → "}
            <span className="text-foreground">Upvote</span>
            {" → "}
            <span className="bg-gradient-to-r from-electric to-accent bg-clip-text text-transparent">
              Earn
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Launch the next big product and get real rewards. Every 10 upvotes converts to 1 USDC.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald to-emerald-glow hover:opacity-90 text-background font-semibold shadow-lg hover:shadow-emerald/50 transition-all"
              onClick={onLaunchClick}
            >
              Launch Your Product
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-border hover:bg-secondary/50 backdrop-blur-sm"
            >
              Connect Wallet
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald">$12.5K</div>
              <div className="text-sm text-muted-foreground">Total Rewards Paid</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-electric">1,247</div>
              <div className="text-sm text-muted-foreground">Products Launched</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">24.5K</div>
              <div className="text-sm text-muted-foreground">Active Voters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
