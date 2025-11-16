import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCircleWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Load saved wallet from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const signMessage = async (action: string): Promise<{ signature: string; message: string; timestamp: number } | null> => {
    if (!address) return null;
    
    const timestamp = Date.now();
    const message = `ArcHunt Action\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}\nAction: ${action}`;
    
    try {
      // For demo purposes, create a simple signature
      const signature = `0x${Buffer.from(message + address).toString('hex').substring(0, 130)}`;
      return { signature, message, timestamp };
    } catch (error) {
      console.error('Signature error:', error);
      toast({
        title: "Signature Failed",
        description: "Failed to sign message. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      // Generate a wallet address using browser's crypto API
      const randomBytes = new Uint8Array(20);
      crypto.getRandomValues(randomBytes);
      const walletAddress = '0x' + Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setAddress(walletAddress);
      localStorage.setItem('wallet_address', walletAddress);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem('wallet_address');
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
