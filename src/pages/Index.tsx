import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
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

const Index = () => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, connect, disconnect, isConnected, isConnecting, signMessage } = useCircleWallet();
  const { toast } = useToast();

  // Expose signMessage to window for use in other components
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
      // Get signature from wallet
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

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletAddress={address} 
        onConnect={connect} 
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />
      <Hero onLaunchClick={() => setSubmitDialogOpen(true)} />
      
      <div className="container mx-auto px-4 py-12" id="products">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-foreground">Today's Launches</h2>
              <Badge variant="outline" className="bg-emerald/10 border-emerald text-emerald">
                <TrendingUp className="w-3 h-3 mr-1" />
                {products.length} Active
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              Sorted by upvotes · 10 votes = 1 USDC payout
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products yet. Be the first to launch!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
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
      
      <div className="container mx-auto px-4 py-16 border-t border-glass-border" id="leaderboard">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Top Products</h2>
          <p className="text-muted-foreground mb-6">Check out the highest-rated products</p>
          <Link to="/leaderboard">
            <Button className="bg-gradient-to-r from-orange to-orange-light hover:shadow-glass text-white">
              View Full Leaderboard
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 border-t border-border" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12">
            Launch products, earn real rewards powered by Arc blockchain
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald to-emerald-glow rounded-lg flex items-center justify-center text-background font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold">Submit Your Product</h3>
              <p className="text-muted-foreground">
                Share your product with the community. Add details, images, and what makes it special.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-electric to-accent rounded-lg flex items-center justify-center text-background font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Community Upvotes</h3>
              <p className="text-muted-foreground">
                Community discovers and upvotes products they love. Every 10 upvotes = 1 USDC reward.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald to-electric rounded-lg flex items-center justify-center text-background font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold">Earn USDC Rewards</h3>
              <p className="text-muted-foreground">
                Rewards automatically transfer to your wallet on Arc network. Fast, transparent, secure.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald to-electric rounded" />
              <span className="font-semibold">Arc Hunt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Arc Layer-1 Blockchain · Built for the future of product discovery
            </p>
          </div>
        </div>
      </footer>
      
      <SubmitProductDialog 
        open={submitDialogOpen} 
        onOpenChange={setSubmitDialogOpen}
        onSubmitSuccess={loadProducts}
        walletAddress={address}
      />
    </div>
  );
};

export default Index;
