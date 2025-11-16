import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers, Eip1193Provider } from 'ethers';

// Type assertion for window.ethereum
declare global {
  interface Window {
    ethereum?: Eip1193Provider & { isMetaMask?: boolean };
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const signMessage = async (action: string): Promise<{ signature: string; message: string; timestamp: number } | null> => {
    if (!address) return null;
    
    const timestamp = Date.now();
    const message = `ArcHunt Action\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}\nAction: ${action}`;
    
    try {
      // Request signature from browser wallet (MetaMask, etc.)
      if (!window.ethereum) {
        toast({
          title: "No Wallet Found",
          description: "Please install MetaMask or another Ethereum wallet to sign messages.",
          variant: "destructive",
        });
        return null;
      }

      // Request signature from wallet provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      
      return { signature, message, timestamp };
    } catch (error) {
      console.error('Signature error:', error);
      toast({
        title: "Signature Failed",
        description: "Failed to sign message with wallet. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      // Request wallet connection from browser extension
      if (!window.ethereum) {
        toast({
          title: "No Wallet Found",
          description: "Please install MetaMask or another Ethereum wallet.",
          variant: "destructive",
        });
        return;
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0].toLowerCase();
        setAddress(walletAddress);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
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