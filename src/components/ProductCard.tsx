import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, MessageSquare, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  tagline: string;
  description: string;
  upvotes: number;
  comments: number;
  reward: number;
  category: string;
  maker: string;
  imageUrl?: string;
  rank?: number;
}

export const ProductCard = ({ 
  name, 
  tagline, 
  description, 
  upvotes: initialUpvotes, 
  comments, 
  reward: initialReward,
  category,
  maker,
  imageUrl,
  rank
}: ProductCardProps) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [reward, setReward] = useState(initialReward);
  
  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setReward(prev => prev + 0.1);
      setHasUpvoted(true);
    }
  };
  
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border hover:border-emerald/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald/10">
      <div className="p-6 flex gap-6">
        {/* Upvote Section */}
        <div className="flex flex-col items-center gap-2 min-w-[60px]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={cn(
              "h-12 w-12 rounded-lg border-2 transition-all",
              hasUpvoted 
                ? "bg-emerald border-emerald text-background" 
                : "hover:bg-emerald/10 hover:border-emerald"
            )}
          >
            <ArrowUp className={cn("w-5 h-5", hasUpvoted && "fill-current")} />
          </Button>
          <span className="text-lg font-semibold text-foreground">{upvotes}</span>
          <span className="text-xs text-muted-foreground">votes</span>
        </div>
        
        {/* Product Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {rank && (
                  <Badge variant="outline" className="bg-emerald/10 border-emerald text-emerald font-bold">
                    #{rank}
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald transition-colors">
                  {name}
                </h3>
              </div>
              <p className="text-muted-foreground mb-3">{tagline}</p>
              <p className="text-sm text-muted-foreground/80 line-clamp-2">{description}</p>
            </div>
            
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={name}
                className="w-20 h-20 rounded-lg object-cover border border-border"
              />
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 pt-3 border-t border-border/50">
            <Badge variant="secondary" className="bg-secondary/50">
              {category}
            </Badge>
            <span className="text-sm text-muted-foreground">by {maker}</span>
            
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{comments}</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald/10 rounded-md border border-emerald/20">
                <span className="text-sm font-semibold text-emerald">${reward.toFixed(1)} USDC</span>
              </div>
              
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
