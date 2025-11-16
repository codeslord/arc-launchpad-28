import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubmitProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess?: () => void;
  walletAddress?: string | null;
}

export const SubmitProductDialog = ({ open, onOpenChange, onSubmitSuccess, walletAddress }: SubmitProductDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    category: "",
    makerAddress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.makerAddress || !walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to submit a product.",
        variant: "destructive",
      });
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.makerAddress)) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please provide a valid wallet address (0x followed by 40 hex characters).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get signature from wallet
      const signatureData = await (window as any).walletSignMessage?.('submit-product');
      if (!signatureData) {
        throw new Error('Failed to sign transaction. Please ensure your wallet is connected.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          tagline: formData.tagline,
          description: formData.description,
          makerAddress: formData.makerAddress,
          category: formData.category || 'General',
          signature: signatureData.signature,
          message: signatureData.message,
          timestamp: signatureData.timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to submit product';
        throw new Error(errorMsg);
      }

      toast({
        title: "Product Submitted! 🚀",
        description: "Your product is now live and ready to receive upvotes.",
      });
      
      onOpenChange(false);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      setFormData({
        title: "",
        tagline: "",
        description: "",
        category: "",
        makerAddress: "",
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not submit product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald/10 rounded-lg">
              <Rocket className="w-5 h-5 text-emerald" />
            </div>
            <DialogTitle className="text-2xl">Launch Your Product</DialogTitle>
          </div>
          <DialogDescription>
            Share your product with the community and start earning USDC rewards from upvotes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Product Name *</Label>
            <Input
              id="title"
              placeholder="My Awesome Product"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline *</Label>
            <Input
              id="tagline"
              placeholder="One-line description that captures the essence"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              required
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell the community more about your product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="makerAddress">Payout Wallet Address *</Label>
            <Input
              id="makerAddress"
              placeholder="0x..."
              value={formData.makerAddress || (walletAddress || '')}
              onChange={(e) => setFormData({ ...formData, makerAddress: e.target.value })}
              required
              className="bg-secondary/50 border-border"
            />
            <p className="text-xs text-muted-foreground">Arc testnet address where you'll receive USDC payouts</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="web3">Web3</SelectItem>
                <SelectItem value="ai">AI Tools</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="developer">Developer Tools</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald to-emerald-glow hover:opacity-90 text-background"
            >
              {isSubmitting ? 'Submitting...' : 'Launch Product 🚀'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
