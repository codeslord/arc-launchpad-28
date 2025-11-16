import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";

interface LeaderboardProduct {
  rank: number;
  name: string;
  upvotes: number;
  reward: number;
  category: string;
}

const topProducts: LeaderboardProduct[] = [
  { rank: 1, name: "DeFi Dashboard Pro", upvotes: 542, reward: 54.2, category: "Finance" },
  { rank: 2, name: "NFT Marketplace Hub", upvotes: 487, reward: 48.7, category: "Web3" },
  { rank: 3, name: "AI Content Studio", upvotes: 423, reward: 42.3, category: "AI Tools" },
  { rank: 4, name: "Crypto Portfolio Tracker", upvotes: 398, reward: 39.8, category: "Finance" },
  { rank: 5, name: "DAO Governance Tool", upvotes: 356, reward: 35.6, category: "Web3" },
];

export const Leaderboard = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 glass rounded-xl shadow-glass">
            <Trophy className="w-6 h-6 text-orange" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-navy">Top Products Today</h2>
            <p className="text-navy/60 font-medium">Highest earning launches in the last 24 hours</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {topProducts.map((product) => (
            <Card 
              key={product.rank}
              className={`p-6 glass hover:shadow-glass-hover transition-all ${
                product.rank === 1 
                  ? "ring-2 ring-orange/20" 
                  : ""
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`text-4xl font-bold ${
                  product.rank === 1 
                    ? "text-orange" 
                    : product.rank === 2 
                    ? "text-orange-light" 
                    : "text-navy/50"
                }`}>
                  #{product.rank}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-navy">{product.name}</h3>
                    <Badge variant="secondary" className="glass border-glass-border text-navy/80 font-semibold">
                      {product.category}
                    </Badge>
                    {product.rank <= 3 && (
                      <Badge variant="outline" className="bg-orange/10 border-orange text-orange font-semibold">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-navy/60 font-medium">
                      <span className="font-bold text-navy">{product.upvotes}</span> upvotes
                    </span>
                    <span className="text-orange font-bold">
                      ${product.reward} USDC earned
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
