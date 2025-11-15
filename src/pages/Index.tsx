import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { Leaderboard } from "@/components/Leaderboard";
import { SubmitProductDialog } from "@/components/SubmitProductDialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const products = [
  {
    id: "1",
    name: "DeFi Dashboard Pro",
    tagline: "Professional-grade DeFi portfolio management",
    description: "Track, analyze, and optimize your DeFi investments across 50+ protocols with real-time analytics and automated yield strategies.",
    upvotes: 542,
    comments: 87,
    reward: 54.2,
    category: "Finance",
    maker: "Sarah Chen",
    rank: 1,
  },
  {
    id: "2",
    name: "NFT Marketplace Hub",
    tagline: "Cross-chain NFT discovery and trading",
    description: "Discover, buy, and sell NFTs across multiple blockchains with zero fees for the first month. AI-powered recommendations included.",
    upvotes: 487,
    comments: 62,
    reward: 48.7,
    category: "Web3",
    maker: "Alex Kumar",
    rank: 2,
  },
  {
    id: "3",
    name: "AI Content Studio",
    tagline: "Generate marketing content with AI",
    description: "Create blog posts, social media content, and ad copy in seconds using cutting-edge AI models. Supports 30+ languages.",
    upvotes: 423,
    comments: 91,
    reward: 42.3,
    category: "AI Tools",
    maker: "Maria Rodriguez",
    rank: 3,
  },
  {
    id: "4",
    name: "Smart Contract Auditor",
    tagline: "Automated security analysis for smart contracts",
    description: "Scan your smart contracts for vulnerabilities using AI and industry-standard security patterns. Get detailed reports in minutes.",
    upvotes: 356,
    comments: 54,
    reward: 35.6,
    category: "Developer Tools",
    maker: "David Park",
  },
  {
    id: "5",
    name: "Crypto Tax Calculator",
    tagline: "Simplified tax reporting for crypto traders",
    description: "Automatically calculate your crypto taxes across all exchanges and wallets. Export reports for major tax software.",
    upvotes: 298,
    comments: 43,
    reward: 29.8,
    category: "Finance",
    maker: "Emma Thompson",
  },
];

const Index = () => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
              Sorted by upvotes · Refreshes daily at midnight PST
            </span>
          </div>
          
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
      
      <div id="leaderboard">
        <Leaderboard />
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
      
      <SubmitProductDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
    </div>
  );
};

export default Index;
