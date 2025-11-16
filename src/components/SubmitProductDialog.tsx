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
    websiteUrl: "",
    youtubeUrl: "",
    imageUrl: "",
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
          websiteUrl: formData.websiteUrl,
          youtubeUrl: formData.youtubeUrl,
          imageUrl: formData.imageUrl,
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
        websiteUrl: "",
        youtubeUrl: "",
        imageUrl: "",
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
      <DialogContent className="sm:max-w-[600px] glass-strong border-glass-border shadow-glass">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange to-orange-light rounded-lg shadow-orange">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-2xl text-navy">Launch Your Product</DialogTitle>
          </div>
          <DialogDescription className="text-navy/60 font-medium">
            Share your product with the community and start earning USDC rewards from upvotes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-navy font-semibold">Product Name *</Label>
            <Input
              id="title"
              placeholder="My Awesome Product"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="glass border-glass-border focus:border-orange"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-navy font-semibold">Tagline *</Label>
            <Input
              id="tagline"
              placeholder="One-line description that captures the essence"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              required
              className="glass border-glass-border focus:border-orange"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-navy font-semibold">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell the community more about your product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="glass border-glass-border resize-none focus:border-orange"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="makerAddress" className="text-navy font-semibold">Payout Wallet Address *</Label>
            <Input
              id="makerAddress"
              placeholder="0x..."
              value={formData.makerAddress || (walletAddress || '')}
              onChange={(e) => setFormData({ ...formData, makerAddress: e.target.value })}
              required
              className="glass border-glass-border focus:border-orange"
            />
            <p className="text-xs text-navy/60 font-medium">Arc testnet address where you'll receive USDC payouts</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-navy font-semibold">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger className="glass border-glass-border focus:border-orange">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-glass-border">
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

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-navy font-semibold">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourproduct.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="glass border-glass-border focus:border-orange"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeUrl" className="text-navy font-semibold">YouTube Video URL</Label>
            <Input
              id="youtubeUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="glass border-glass-border focus:border-orange"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-navy font-semibold">Product Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="glass border-glass-border focus:border-orange"
            />
            <p className="text-xs text-navy/60 font-medium">Direct link to your product screenshot or logo</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 glass border-glass-border hover:shadow-glass-hover text-navy"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange to-orange-light hover:shadow-orange text-white border-0 font-bold"
            >
              {isSubmitting ? 'Submitting...' : 'Launch Product 🚀'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
