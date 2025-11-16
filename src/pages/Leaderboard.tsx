import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, ArrowLeft } from "lucide-react";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  tagline?: string;
  maker_address: string;
  vote_count: number;
  payout_status: string;
  category?: string;
}

const Leaderboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, connect, disconnect, isConnected, isConnecting } = useCircleWallet();
  const { toast } = useToast();

  const loadProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/products`);
      const data = await response.json();
      const sorted = (data.products || []).sort((a: Product, b: Product) => b.vote_count - a.vote_count);
      setProducts(sorted.slice(0, 10)); // Top 10
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

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletAddress={address} 
        onConnect={connect} 
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-6 text-navy hover:text-orange">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-orange" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
                Top Products Leaderboard
              </h1>
            </div>
            <p className="text-navy/70 text-lg">
              The most upvoted products and their makers
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products yet. Be the first to launch!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

                return (
                  <Card 
                    key={product.id}
                    className={`glass hover:shadow-glass-hover transition-all duration-300 ${
                      isTopThree ? 'border-2 border-orange/40' : ''
                    }`}
                  >
                    <div className="p-6 flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl font-bold ${
                          isTopThree 
                            ? 'text-orange text-5xl' 
                            : 'text-navy/60'
                        }`}>
                          {medalEmoji || `#${rank}`}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-xl font-bold text-navy hover:text-orange transition-colors cursor-pointer">
                              {product.title}
                            </h3>
                          </Link>
                          {product.category && (
                            <Badge variant="secondary" className="glass border-glass-border text-navy/80">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        {product.tagline && (
                          <p className="text-navy/70 mb-2">{product.tagline}</p>
                        )}
                        <p className="text-sm text-navy/60">
                          by {product.maker_address.slice(0, 6)}...{product.maker_address.slice(-4)}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange/20 to-orange-light/20 rounded-lg border border-orange/30">
                            <TrendingUp className="w-5 h-5 text-orange" />
                            <span className="text-2xl font-bold text-navy">{product.vote_count}</span>
                          </div>
                          <span className="text-xs text-navy/60 mt-1 block">upvotes</span>
                        </div>

                        <div className="text-center">
                          <div className="px-4 py-2 bg-gradient-to-r from-emerald/20 to-emerald-light/20 rounded-lg border border-emerald/30">
                            <span className="text-2xl font-bold text-emerald">
                              ${(product.vote_count / 10).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-navy/60 mt-1 block">USDC earned</span>
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
