import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, SystemProgram, clusterApiUrl, Transaction } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import mintNFT from './api/mint';
import Image from 'next/image';

const payWallet = process.env.NEXT_PUBLIC_PAY_WALLET;

const Home = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [status, setStatus] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mintCost = 0.1;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sendSol = async () => {
    setStatus('');
    setIsLoading(true);

    if (!publicKey) {
      setStatus('Public key is unavailable. Please try reconnecting your wallet.');
      setIsLoading(false);
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      let balance;
      try {
        balance = await connection.getBalance(publicKey);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setStatus('Failed to fetch wallet balance. Please try again.');
        setIsLoading(false);
        return;
      }

      if (balance < mintCost * 10 ** 9) {
        setStatus('Insufficient funds in your wallet.');
        setIsLoading(false);
        return;
      }

      let transaction;
      try {
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(payWallet!),
            lamports: mintCost * 10 ** 9,
          })
        );
      } catch (error) {
        console.error('Error creating transaction:', error);
        setStatus('Failed to prepare the transaction. Please try again.');
        setIsLoading(false);
        return;
      }

      let signature;
      try {
        signature = await sendTransaction(transaction, connection);
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.message.includes('User rejected the request')) {
            console.warn('Transaction rejected by the user:', error);
            setStatus('Transaction was rejected. Please try again if you change your mind.');
          } else {
            console.error('Error sending transaction:', error);
            setStatus('Failed to send the transaction. Please try again.');
          }
        } else {
          console.error('Unexpected error:', error);
          setStatus('An unexpected error occurred. Please try again.');
        }
        return;
      }

      try {
        await connection.confirmTransaction(signature, 'confirmed');
      } catch (error) {
        console.error('Error confirming transaction:', error);
        setStatus('Failed to confirm the transaction. Please check your wallet.');
        setIsLoading(false);
        return;
      }

      try {
        await mintNFT(
          publicKey.toString(),
          "Nico Iamaleava: TENN vs OSU",
          "https://bafybeib6b6wryimgcpxqzus7pf6fqnl6y2k4ms63crkqtpgjauidgyp5sa.ipfs.w3s.link/nft.json"
        );
        setStatus('NFT minted and sent successfully!');
      } catch (error) {
        console.error('Error minting NFT:', error);
        setStatus('Transaction completed, but minting NFT failed. Please contact support.');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Unexpected error during sendSol:', error);
      setStatus('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="header">
        <div>
        <img src="/TeamToa.png" alt="Team Toa" height={50} />
        </div>
        <div>{isClient && <WalletMultiButton />}</div>
      </div>
      <div className="body">
        <div className="imageContainer">
        <img
            src="https://bafybeidaf7dmvdeubrqvr2ttzlgceo52t7iixbkyafx33h4arn6r7e4upq.ipfs.w3s.link/highlightThumbnail.jpg"
            alt="Team Toa"
            className="image"
          />
        </div>
        <div>
          <div className="mintContainer">
            <div className="main">Nico Iamaleava: TENN vs OSU</div>
            <div>0.1 Sol</div>
            <div>~ $19.00</div>
            {isLoading ?
              <button disabled className="button">
                Loading
              </button>
              :
              <button onClick={connected ? sendSol : undefined} disabled={!connected} className={connected ? 'button' : 'buttonDisabled'}>
                {connected ? 'Mint NFT' : 'Connect Wallet'}
              </button>
            }
          </div>
          {status && <div className="status">{status}</div>}
        </div>
      </div>
    </div>
  );
};

export default Home;
