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
}

export const SubmitProductDialog = ({ open, onOpenChange }: SubmitProductDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    url: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Product Submitted! 🚀",
      description: "Your product is now live and ready to receive upvotes.",
    });
    onOpenChange(false);
    setFormData({
      name: "",
      tagline: "",
      description: "",
      url: "",
      category: "",
    });
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
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Product"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell the community more about your product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Product URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://yourproduct.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="bg-secondary/50 border-border"
            />
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
              className="flex-1 bg-gradient-to-r from-emerald to-emerald-glow hover:opacity-90 text-background"
            >
              Launch Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
