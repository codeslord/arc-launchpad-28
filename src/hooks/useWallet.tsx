import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const signMessage = async (action: string): Promise<{ signature: string; message: string; timestamp: number } | null> => {
    if (!address) return null;
    
    const timestamp = Date.now();
    const message = `ArcHunt Action\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}\nAction: ${action}`;
    
    // In production, this would use the actual wallet SDK to sign
    // For now, we create a mock signature that can be verified server-side
    const signature = btoa(`${address}:${timestamp}:${action}`);
    
    return { signature, message, timestamp };
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      // Validate wallet address format
      const testAddress = prompt('Enter your Arc wallet address (format: 0x + 40 hex characters):');
      if (testAddress) {
        // Validate format
        if (!/^0x[a-fA-F0-9]{40}$/.test(testAddress)) {
          toast({
            title: "Invalid Address",
            description: "Please enter a valid wallet address (0x followed by 40 hex characters)",
            variant: "destructive",
          });
          return;
        }
        
        setAddress(testAddress.toLowerCase());
        toast({
          title: "Wallet Connected",
          description: `Connected to ${testAddress.slice(0, 6)}...${testAddress.slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return {
    address,
    isConnecting,
    connect,
    disconnect,
    isConnected: !!address,
    signMessage,
  };
}