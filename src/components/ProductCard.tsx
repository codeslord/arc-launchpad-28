import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  payoutStatus?: string;
  onVote?: (productId: string) => void;
  canVote?: boolean;
}

export const ProductCard = ({ 
  id,
  name, 
  tagline, 
  description, 
  upvotes, 
  comments, 
  reward,
  category,
  maker,
  imageUrl,
  rank,
  payoutStatus,
  onVote,
  canVote = false
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [hasUpvoted, setHasUpvoted] = useState(false);
  
  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasUpvoted && onVote && canVote) {
      onVote(id);
      setHasUpvoted(true);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };
  
  return (
    <Card 
      className="group relative overflow-hidden glass hover:shadow-glass-hover hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6 flex gap-6">
        {/* Upvote Section */}
        <div className="flex flex-col items-center gap-2 min-w-[60px]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpvote}
            disabled={hasUpvoted || !canVote}
            className={cn(
              "h-12 w-12 rounded-xl border-2 transition-all shadow-sm",
              hasUpvoted 
                ? "bg-gradient-to-br from-orange to-orange-light border-orange text-white shadow-orange" 
                : "glass hover:border-orange hover:shadow-glass-hover"
            )}
          >
            <ArrowUp className={cn("w-5 h-5", hasUpvoted && "fill-current")} />
          </Button>
          <span className="text-lg font-bold text-navy">{upvotes}</span>
          <span className="text-xs font-semibold text-navy/60">votes</span>
        </div>
        
        {/* Product Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {rank && (
                  <Badge variant="outline" className="bg-orange/10 border-orange text-orange font-bold">
                    #{rank}
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-navy group-hover:text-orange transition-colors">
                  {name}
                </h3>
                {payoutStatus && payoutStatus !== 'none' && (
                  <Badge variant={payoutStatus === 'paid' ? 'default' : 'secondary'}>
                    {payoutStatus === 'paid' ? '💰 Paid' : payoutStatus === 'pending' ? '⏳ Pending' : '❌ Failed'}
                  </Badge>
                )}
              </div>
              <p className="text-navy/70 font-medium mb-3">{tagline}</p>
              <p className="text-sm text-navy/60 line-clamp-2">{description}</p>
            </div>
            
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={name}
                className="w-20 h-20 rounded-xl object-cover shadow-glass"
              />
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex items-center gap-4 pt-3 border-t border-glass-border">
            <Badge variant="secondary" className="glass border-glass-border text-navy/80 font-semibold">
              {category}
            </Badge>
            <span className="text-sm font-medium text-navy/60">by {maker}</span>
            
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 text-navy/60">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">{comments}</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange/10 to-orange-light/10 rounded-lg border border-orange/20">
                <span className="text-sm font-bold text-orange">${reward.toFixed(1)} USDC</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-navy/60 hover:text-orange"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/product/${id}`, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
