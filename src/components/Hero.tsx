import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export const Hero = ({ onLaunchClick }: { onLaunchClick: () => void }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange/10 via-transparent to-navy/5" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-navy/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full shadow-glass animate-float">
            <Zap className="w-4 h-4 text-orange" />
            <span className="text-sm font-semibold text-navy/80">Built on Arc Layer-1 Blockchain</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
              Discover
            </span>
            <span className="text-navy/40 mx-3">→</span>
            <span className="text-navy">Upvote</span>
            <span className="text-navy/40 mx-3">→</span>
            <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
              Earn
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-navy/60 max-w-2xl mx-auto font-medium">
            Launch the next big product and get real rewards. Every 10 upvotes converts to 1 USDC.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange to-orange-light hover:shadow-orange text-white border-0 font-bold px-8 py-6 text-lg transition-all hover:scale-105"
              onClick={onLaunchClick}
            >
              Launch Your Product
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="glass border-glass-border hover:shadow-glass-hover font-bold px-8 py-6 text-lg text-navy"
            >
              Connect Wallet
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12">
            <div className="glass p-6 rounded-2xl shadow-glass space-y-2 hover:shadow-glass-hover transition-all">
              <div className="text-4xl font-bold text-orange">$12.5K</div>
              <div className="text-sm font-semibold text-navy/60">Total Rewards Paid</div>
            </div>
            <div className="glass p-6 rounded-2xl shadow-glass space-y-2 hover:shadow-glass-hover transition-all">
              <div className="text-4xl font-bold text-orange">1,247</div>
              <div className="text-sm font-semibold text-navy/60">Products Launched</div>
            </div>
            <div className="glass p-6 rounded-2xl shadow-glass space-y-2 hover:shadow-glass-hover transition-all">
              <div className="text-4xl font-bold text-navy">24.5K</div>
              <div className="text-sm font-semibold text-navy/60">Active Voters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
