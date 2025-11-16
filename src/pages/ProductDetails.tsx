import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowLeft, ExternalLink, MessageSquare, Play, Image as ImageIcon, Share2 } from "lucide-react";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  walletAddress: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, connect, disconnect, isConnected, isConnecting, signMessage } = useCircleWallet();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Alice",
      content: "This product is amazing! The UI is so clean and intuitive.",
      timestamp: "2 hours ago",
      walletAddress: "0x1234...5678"
    },
    {
      id: "2",
      author: "Bob",
      content: "Great work! Looking forward to the next update.",
      timestamp: "5 hours ago",
      walletAddress: "0xabcd...ef12"
    },
    {
      id: "3",
      author: "Charlie",
      content: "The glassmorphic design is stunning! How did you implement it?",
      timestamp: "1 day ago",
      walletAddress: "0x9876...4321"
    }
  ]);
  const [activeMediaTab, setActiveMediaTab] = useState<"screenshots" | "video">("screenshots");

  // Demo screenshots and video
  const demoScreenshots = [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
  ];
  
  const demoVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  // Expose signMessage to window
  useEffect(() => {
    (window as any).walletSignMessage = signMessage;
    return () => {
      delete (window as any).walletSignMessage;
    };
  }, [signMessage]);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/products`);
      const data = await response.json();
      const foundProduct = data.products?.find((p: any) => p.id === id);
      
      if (foundProduct) {
        console.log('Loaded product:', foundProduct);
        setProduct(foundProduct);
      } else {
        toast({
          title: "Product Not Found",
          description: "Could not find the requested product.",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: "Error",
        description: "Could not load product details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to upvote this product.",
        variant: "destructive",
      });
      return;
    }

    if (hasUpvoted) {
      toast({
        title: "Already Voted",
        description: "You have already upvoted this product.",
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
          productId: id,
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

      console.log('Vote successful, response:', data);
      setHasUpvoted(true);
      toast({
        title: "Vote Recorded! 🎉",
        description: `Total votes: ${data.votes}. ${data.payoutStatus === 'paid' ? 'Payout triggered!' : ''}`,
      });

      // Reload to get fresh data
      await loadProduct();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Could not record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = () => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please write something before submitting.",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: address?.slice(0, 6) || "Anonymous",
      content: newComment,
      timestamp: "Just now",
      walletAddress: address || ""
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast({
      title: "Comment Added!",
      description: "Your comment has been posted.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Product link copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          walletAddress={address} 
          onConnect={connect} 
          onDisconnect={disconnect}
          isConnecting={isConnecting}
        />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-navy/60 font-medium">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletAddress={address} 
        onConnect={connect} 
        onDisconnect={disconnect}
        isConnecting={isConnecting}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-navy hover:text-orange"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Header */}
            <Card className="glass-strong p-8 shadow-glass">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-navy">{product.title}</h1>
                    {product.payout_status && product.payout_status !== 'none' && (
                      <Badge variant={product.payout_status === 'paid' ? 'default' : 'secondary'}>
                        {product.payout_status === 'paid' ? '💰 Paid' : product.payout_status === 'pending' ? '⏳ Pending' : '❌ Failed'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-navy/70 font-medium mb-4">{product.tagline || "No tagline provided"}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="glass border-glass-border text-navy/80 font-semibold">
                      {product.category || "General"}
                    </Badge>
                    <span className="text-sm font-medium text-navy/60">
                      by {product.maker_address?.slice(0, 6)}...{product.maker_address?.slice(-4)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="glass border-glass-border hover:shadow-glass-hover"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* External Link */}
              <Button
                className="w-full bg-gradient-to-r from-orange to-orange-light text-white border-0 hover:shadow-orange font-bold"
                asChild
              >
                <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Product Website
                </a>
              </Button>
            </Card>

            {/* Media Section */}
            <Card className="glass-strong p-6 shadow-glass">
              <div className="flex gap-3 mb-4">
                <Button
                  variant={activeMediaTab === "screenshots" ? "default" : "outline"}
                  onClick={() => setActiveMediaTab("screenshots")}
                  className={cn(
                    activeMediaTab === "screenshots" 
                      ? "bg-gradient-to-r from-orange to-orange-light text-white border-0" 
                      : "glass border-glass-border"
                  )}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Screenshots
                </Button>
                <Button
                  variant={activeMediaTab === "video" ? "default" : "outline"}
                  onClick={() => setActiveMediaTab("video")}
                  className={cn(
                    activeMediaTab === "video" 
                      ? "bg-gradient-to-r from-orange to-orange-light text-white border-0" 
                      : "glass border-glass-border"
                  )}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demo Video
                </Button>
              </div>

              {activeMediaTab === "screenshots" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {demoScreenshots.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-64 object-cover rounded-xl shadow-glass hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden shadow-glass">
                  <iframe
                    width="100%"
                    height="100%"
                    src={demoVideoUrl}
                    title="Product Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="glass-strong p-8 shadow-glass">
              <h2 className="text-2xl font-bold text-navy mb-4">About This Product</h2>
              <p className="text-navy/70 font-medium leading-relaxed">
                {product.description || "This innovative product leverages cutting-edge blockchain technology to deliver seamless user experiences. Built on the Arc Layer-1 blockchain, it provides fast, secure, and cost-effective transactions. The glassmorphic design ensures a modern and intuitive interface that users love. Join thousands of users who are already experiencing the future of Web3 applications."}
              </p>
            </Card>

            {/* Comments Section */}
            <Card className="glass-strong p-8 shadow-glass">
              <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Comments ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="mb-8">
                <Textarea
                  placeholder={isConnected ? "Share your thoughts..." : "Connect wallet to comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isConnected}
                  className="glass border-glass-border focus:border-orange mb-3"
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!isConnected || !newComment.trim()}
                  className="bg-gradient-to-r from-orange to-orange-light text-white border-0 hover:shadow-orange font-bold"
                >
                  Post Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="glass p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange to-orange-light flex items-center justify-center text-white font-bold text-sm">
                          {comment.author[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-navy text-sm">{comment.walletAddress.slice(0, 6)}...{comment.walletAddress.slice(-4)}</div>
                          <div className="text-xs text-navy/60">{comment.timestamp}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-navy/70 font-medium">{comment.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Upvote Card */}
            <Card className="glass-strong p-6 shadow-glass sticky top-24">
              <div className="text-center space-y-4">
                <Button
                  onClick={handleVote}
                  disabled={hasUpvoted || !isConnected}
                  size="lg"
                  className={cn(
                    "w-full h-16 text-lg font-bold transition-all",
                    hasUpvoted 
                      ? "bg-gradient-to-br from-orange to-orange-light text-white shadow-orange" 
                      : "glass border-2 border-orange text-orange hover:bg-orange/10 hover:shadow-glass-hover"
                  )}
                >
                  <ArrowUp className={cn("w-6 h-6 mr-2", hasUpvoted && "fill-current")} />
                  {hasUpvoted ? "Upvoted!" : "Upvote"}
                </Button>

                <div className="space-y-2">
                  <div className="text-4xl font-bold text-orange">{product.vote_count}</div>
                  <div className="text-sm font-semibold text-navy/60">Total Upvotes</div>
                </div>

                <div className="glass p-4 rounded-xl border border-orange/20">
                  <div className="text-2xl font-bold text-orange mb-1">
                    ${(product.vote_count * 0.1).toFixed(1)} USDC
                  </div>
                  <div className="text-xs font-semibold text-navy/60">
                    Rewards Earned
                  </div>
                </div>

                {!isConnected && (
                  <Button
                    onClick={connect}
                    disabled={isConnecting}
                    className="w-full bg-gradient-to-r from-orange to-orange-light text-white border-0 hover:shadow-orange font-bold"
                  >
                    Connect Wallet to Vote
                  </Button>
                )}

                <div className="pt-4 border-t border-glass-border text-xs text-navy/60 font-medium">
                  <p>Every 10 upvotes = 1 USDC paid to maker</p>
                  <p className="mt-1">Your vote helps creators earn rewards! 🚀</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
