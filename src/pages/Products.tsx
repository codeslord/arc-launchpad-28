import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Flame, Calendar, Sparkles, Rocket, Award, Zap } from "lucide-react";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  maker_address: string;
  vote_count: number;
  payout_status: string;
  category?: string;
  created_at: string;
}

const Products = () => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('votes');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const { address, connect, disconnect, isConnected, isConnecting, signMessage } = useCircleWallet();
  const { toast } = useToast();

  useEffect(() => {
    (window as any).walletSignMessage = signMessage;
    return () => {
      delete (window as any).walletSignMessage;
    };
  }, [signMessage]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Could not load products. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

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

    if (sortBy === 'votes') {
      filtered.sort((a, b) => b.vote_count - a.vote_count);
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleVote = async (productId: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const signatureData = await signMessage('vote');
      if (!signatureData) {
        toast({
          title: "Signature Required",
          description: "Please sign the message to verify your wallet ownership.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          voterAddress: address,
          signature: signatureData.signature,
          message: signatureData.message,
          timestamp: signatureData.timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Vote Failed",
          description: data.error || "Could not record your vote.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vote Recorded!",
        description: `Total votes: ${data.votes}. ${data.payoutStatus === 'paid' ? '🎉 Payout triggered!' : ''}`,
      });

      loadProducts();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletAddress={address} 
        onConnect={connect} 
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-orange" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Discover Products</h1>
                <p className="text-muted-foreground text-sm">Vote for products you love and earn rewards</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-50 border-emerald-500 text-emerald-700 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              {filteredProducts.length} Products
            </Badge>
          </div>

          {/* Filter Section */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sort By */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-orange" />
                  <span className="text-sm font-semibold text-foreground">Sort by</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'votes' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('votes')}
                    className={sortBy === 'votes' 
                      ? 'bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-lg' 
                      : 'glass border-glass-border hover:border-orange'}
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Most Voted
                  </Button>
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                    className={sortBy === 'recent' 
                      ? 'bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-lg' 
                      : 'glass border-glass-border hover:border-orange'}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Most Recent
                  </Button>
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-orange" />
                  <span className="text-sm font-semibold text-foreground">Time Period</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'day', label: 'Day' },
                    { value: 'week', label: 'Week' },
                    { value: 'month', label: 'Month' },
                    { value: 'year', label: 'Year' },
                    { value: 'all', label: 'All Time' },
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={timeFilter === filter.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeFilter(filter.value as typeof timeFilter)}
                      className={timeFilter === filter.value 
                        ? 'bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-lg' 
                        : 'glass border-glass-border hover:border-orange'}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="glass-strong rounded-xl p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange flex-shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Earn rewards!</span> Every 10 votes = 1 USDC automatically sent to product makers
              </p>
            </div>
          </div>
          
          {/* Products List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange mb-4"></div>
              <p className="text-muted-foreground">Loading amazing products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or check back later!</p>
              <Button onClick={() => setTimeFilter('all')} variant="outline">
                Show All Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.title}
                  tagline={product.tagline || ''}
                  description={product.description || ''}
                  upvotes={product.vote_count}
                  comments={0}
                  reward={product.vote_count / 10}
                  category={product.category || 'General'}
                  maker={product.maker_address}
                  rank={index + 1}
                  payoutStatus={product.payout_status}
                  onVote={handleVote}
                  canVote={isConnected}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <SubmitProductDialog 
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSuccess={loadProducts}
        walletAddress={address}
      />
    </div>
  );
};

export default Products;
