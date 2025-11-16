import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connect = async () => {
    setIsConnecting(true);
    try {
      // For hackathon demo: prompt for address
      // In production, integrate full Circle Modular Wallets SDK flow
      const testAddress = prompt('Enter your Arc wallet address (or paste a test address):');
      if (testAddress) {
        setAddress(testAddress);
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
  };
}