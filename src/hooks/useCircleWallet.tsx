import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

export function useCircleWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | ethers.Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Load saved wallet from localStorage on mount
  useEffect(() => {
    const savedPrivateKey = localStorage.getItem('wallet_private_key');
    if (savedPrivateKey) {
      try {
        const restoredWallet = new ethers.Wallet(savedPrivateKey);
        setWallet(restoredWallet);
        setAddress(restoredWallet.address);
      } catch (error) {
        console.error('Failed to restore wallet:', error);
        localStorage.removeItem('wallet_private_key');
      }
    }
  }, []);

  const signMessage = async (action: string): Promise<{ signature: string; message: string; timestamp: number } | null> => {
    if (!wallet || !address) return null;
    
    const timestamp = Date.now();
    const message = `ArcHunt Action\nWallet: ${address.toLowerCase()}\nTimestamp: ${timestamp}\nAction: ${action}`;
    
    try {
      const signature = await wallet.signMessage(message);
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
      // Generate a new wallet
      const newWallet = ethers.Wallet.createRandom();
      const walletAddress = newWallet.address;

      setWallet(newWallet);
      setAddress(walletAddress);
      localStorage.setItem('wallet_private_key', newWallet.privateKey);
      
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
    setWallet(null);
    setAddress(null);
    localStorage.removeItem('wallet_private_key');
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
