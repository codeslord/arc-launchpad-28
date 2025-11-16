import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Calendar, Clock, Sparkles, Award, Flame, Zap, ArrowLeft } from "lucide-react";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  tagline?: string;
  maker_address: string;
  vote_count: number;
  payout_status: string;
  category?: string;
  created_at: string;
}

const timeFilterConfig = {
  'day': { label: 'Today', icon: Clock, color: 'text-orange' },
  'week': { label: 'This Week', icon: Calendar, color: 'text-orange-light' },
  'month': { label: 'This Month', icon: TrendingUp, color: 'text-emerald' },
  'year': { label: 'This Year', icon: Sparkles, color: 'text-navy' },
  'all': { label: 'All Time', icon: Trophy, color: 'text-orange' }
} as const;

const Leaderboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const { address, connect, disconnect, isConnected, isConnecting } = useCircleWallet();
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Could not load leaderboard. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeFilter) {
        case 'day':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(p => new Date(p.created_at) >= cutoffDate);
    }

    // Sort by votes and return top 10
    return filtered.sort((a, b) => b.vote_count - a.vote_count).slice(0, 10);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange/5">
      <Header 
        walletAddress={address}
        onConnect={connect}
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <Link to="/">
            <Button variant="ghost" className="glass hover:shadow-glass-hover font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Hero Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-4 glass rounded-2xl shadow-glass">
                <Trophy className="w-12 h-12 text-orange" />
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange via-orange-light to-navy bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-navy/70 font-medium max-w-2xl mx-auto">
              Discover the top performing products ranked by community votes and rewards earned
            </p>
          </div>

          {/* Time Filter */}
          <div className="glass p-6 rounded-2xl shadow-glass">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-orange" />
              <h3 className="text-lg font-bold text-navy">Time Period</h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(timeFilterConfig) as Array<keyof typeof timeFilterConfig>).map((filter) => {
                const config = timeFilterConfig[filter];
                const Icon = config.icon;
                return (
                  <Button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    variant={timeFilter === filter ? "default" : "outline"}
                    className={cn(
                      "gap-2 font-semibold transition-all",
                      timeFilter === filter
                        ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-orange border-0'
                        : 'glass hover:shadow-glass-hover hover:border-orange/30'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 glass p-6 rounded-2xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange"></div>
                <span className="text-navy/60 font-medium">Loading leaderboard...</span>
              </div>
            </div>
          ) : getFilteredProducts().length === 0 ? (
            <Card className="glass p-12 text-center">
              <Sparkles className="w-16 h-16 text-navy/30 mx-auto mb-4" />
              <p className="text-xl text-navy/60 font-medium">No products found for this time period.</p>
              <p className="text-sm text-navy/40 mt-2">Try selecting a different time range</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {getFilteredProducts().map((product, index) => {
                const rank = index + 1;
                const estimatedEarned = (product.vote_count * 0.1).toFixed(2);
                
                return (
                  <Card 
                    key={product.id}
                    className={cn(
                      "group p-6 glass hover:shadow-glass-hover transition-all duration-300 overflow-hidden relative",
                      rank === 1 && "ring-2 ring-orange/40 shadow-orange",
                      rank === 2 && "ring-2 ring-orange-light/30",
                      rank === 3 && "ring-2 ring-emerald/20"
                    )}
                  >
                    {/* Rank Badge */}
                    {rank <= 3 && (
                      <div className="absolute top-0 right-0">
                        <div className={cn(
                          "px-6 py-2 rounded-bl-2xl font-bold text-sm",
                          rank === 1 && "bg-gradient-to-br from-orange to-orange-light text-white shadow-orange",
                          rank === 2 && "bg-gradient-to-br from-orange-light to-orange text-white",
                          rank === 3 && "bg-gradient-to-br from-emerald to-emerald/80 text-white"
                        )}>
                          {rank === 1 && '👑 Champion'}
                          {rank === 2 && '🥈 Runner-up'}
                          {rank === 3 && '🥉 Third Place'}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6">
                      {/* Rank Number */}
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "text-5xl font-bold transition-colors",
                          rank === 1 && "text-orange",
                          rank === 2 && "text-orange-light",
                          rank === 3 && "text-emerald",
                          rank > 3 && "text-navy/40 group-hover:text-navy/60"
                        )}>
                          #{rank}
                        </div>
                        {rank <= 3 && (
                          <Badge variant="outline" className={cn(
                            "font-bold border-2",
                            rank === 1 && "bg-orange/10 border-orange text-orange",
                            rank === 2 && "bg-orange-light/10 border-orange-light text-orange-light",
                            rank === 3 && "bg-emerald/10 border-emerald text-emerald"
                          )}>
                            {rank === 1 && <Flame className="w-3 h-3 mr-1" />}
                            {rank === 2 && <Zap className="w-3 h-3 mr-1" />}
                            {rank === 3 && <Award className="w-3 h-3 mr-1" />}
                            Hot
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-2xl font-bold text-navy group-hover:text-orange transition-colors mb-2">
                              {product.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="glass border-glass-border font-semibold">
                                <span className="text-navy/60">Maker:</span>
                                <span className="text-navy ml-1">{product.maker_address.slice(0, 6)}...{product.maker_address.slice(-4)}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 glass px-3 py-1 rounded-lg border border-glass-border">
                              <TrendingUp className="w-4 h-4 text-navy" />
                              <span className="font-bold text-navy">{product.vote_count}</span>
                              <span className="text-navy/60 font-medium">upvotes</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange/10 to-orange-light/10 px-3 py-1 rounded-lg border border-orange/20">
                              <Trophy className="w-4 h-4 text-orange" />
                              <span className="text-orange font-bold">${estimatedEarned} USDC</span>
                              <span className="text-orange/70 font-medium text-xs">estimated</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
