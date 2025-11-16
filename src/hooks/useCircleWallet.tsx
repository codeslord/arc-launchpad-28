import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  toPasskeyTransport, 
  toWebAuthnCredential, 
  WebAuthnMode
} from '@circle-fin/modular-wallets-core';

export function useCircleWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

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
      // Get client key from edge function
      const keyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-client-key`);
      const { clientKey } = await keyResponse.json();
      
      if (!clientKey) {
        throw new Error('Failed to get client key');
      }

      const clientUrl = 'https://modular-wallets.circle.com';
      
      // Create passkey transport and credential
      const passkeyTransport = toPasskeyTransport(clientUrl, clientKey);
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode: WebAuthnMode.Register,
        username: `archunt-user-${Date.now()}`
      });

      // For demo purposes, generate a deterministic address from the credential ID
      const credentialId = credential.id;
      const addressHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(credentialId)
      );
      const addressBytes = new Uint8Array(addressHash).slice(0, 20);
      const walletAddress = '0x' + Array.from(addressBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setAddress(walletAddress);
      
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
