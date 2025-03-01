"use client";

import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Link from "next/link";
import getTokenDecimals from "../getTokenDecimal";
import { toast } from "react-toastify";

const MintPage = () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const { publicKey, sendTransaction } = useWallet();

  const [tokens, setTokens] = useState<any[]>([]);
  const [isMinting, setIsMinting] = useState(false);

  const [selectedToken, setSelectedToken] = useState<any>("");

  const [mintForm, setMintForm] = useState({
    recipientAddress: "",
    amount: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setMintForm({
      ...mintForm,
      [name]: value,
    });
  };


  useEffect(() => {
    getSplTokens();

  }, [publicKey]);

  const getSplTokens = async () => {
    if (!publicKey) return;

    // get all tokens available in the wallet, passing the pubkey and the token ID
    const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    // map through the token account and return
    const userTokens = Promise.all(
      userTokenAccounts.value.map((accounts) => {
        const token = accounts.account.data.parsed.info;
        return {
          mint: token.mint,
          balance: token.tokenAmount.uiAmountString,
            // decimals: token.mint.decimals,
            symbol: token.mint.symbol,
            // name: token.mint.name,
            // id: token.mint.address,
            // image: token.mint.symbol.slice(0, 2).toUpperCase(),
        };
      })
    );
    //set token
    setTokens( await userTokens);
  };



  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
  };


// handle logic for minting tokens to wallets
  const handleSubmit = async(e: any, mintAddress: string) => {
    e.preventDefault();
    if (!publicKey) return;

    console.log("mintAddress", mintAddress);
    

    try {
      setIsMinting(true);
      // Get mint public key
      const mintPubKey = new PublicKey(
        mintAddress
      );

      const recieverWalletPubKey = new PublicKey(mintForm.recipientAddress);      

      // Get your associated token account
      const myTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        publicKey
      );

      const destinationTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        recieverWalletPubKey
      )

      // Check if your token account exists
      const myAccountInfo = await connection.getAccountInfo(myTokenAccount);
      const myDestinationTokenAccountInfo = await connection.getAccountInfo(destinationTokenAccount);

      // Create transaction
      const tx = new Transaction();

      // If your token account doesn't exist, create it
      if (!myAccountInfo) {
        console.log("Creating your token account first...");
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            myTokenAccount, // associated token account
            publicKey, // owner
            mintPubKey // mint
          )
        );
      }

      if (!myDestinationTokenAccountInfo) {
        console.log("Creating your token account first...");
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            destinationTokenAccount, // associated token account
            recieverWalletPubKey, // owner
            mintPubKey // mint
          )
        );
      }

      // Get token decimals
      const decimal = await getTokenDecimals(mintPubKey);
console.log("decimal", decimal);

      console.log("before Amount to mint:", mintForm.amount);

      // Amount to mint
      const amountToMint = Math.floor(+mintForm.amount * Math.pow(10, decimal));
      console.log("Amount to mint:", amountToMint);
      

      // Add mint instruction (mint tokens to your account)
      tx.add(
        createMintToInstruction(
          mintPubKey, // mint
          destinationTokenAccount, // destination
          publicKey, // authority (must be the mint authority)
          BigInt(amountToMint) // amount
        )
      );

      // Set fee payer
      tx.feePayer = publicKey;

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      // Send transaction
      const signature = await sendTransaction(tx, connection);

      // Confirm transaction
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      console.log("Mint request:", { token: selectedToken, ...mintForm });
      setIsMinting(false);
      toast.success("Token account created and tokens minted successfully!");
      mintForm.amount = "";
      mintForm.recipientAddress = "";
      return true;
    } catch (err: any) {
      setIsMinting(false);
      toast.error("Error creating token account and minting:", err);
      console.log("Error minting tokens:", err);
      return false;
    }
  };
  return (

    <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mint Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Tokens</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Distribute your tokens to any wallet with just a few clicks.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Selection */}
          <motion.div 
            className="lg:col-span-1 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Your Tokens</h2>
            <div className="space-y-3">
              {tokens && tokens.map((token) => (
                <div 
                  key={token.id}
                  onClick={() => handleTokenSelect(token)}
                  className={`p-4 rounded-xl cursor-pointer transition duration-200 flex items-center ${
                    selectedToken && selectedToken.id === token.id 
                      ? 'bg-purple-500/30 border border-purple-500/50' 
                      : 'bg-gray-700/30 border border-gray-600/50 hover:border-purple-500/30'
                  }`}
                >
                  <img 
                    src={token.image} 
                    alt={token.name} 
                    className="w-12 h-12 rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{token.name}</h3>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-gray-400">{token.symbol}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">Balance: {token.balance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <Link href="/">
                <button className="w-full bg-gray-700/50 hover:bg-gray-700/70 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Token
                </button>
              </Link>
            </div>
          </motion.div>
          
          {/* Mint Form */}
          <motion.div 
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-6">Mint Tokens</h2>
            
            {!selectedToken ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-600 rounded-xl">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Select a Token</h3>
                <p className="text-gray-400">Choose a token from the list to start minting</p>
              </div>
            ) : (
              <form onSubmit={(event) => handleSubmit(event, selectedToken.mint)} className="space-y-6">
                <div className="bg-gray-700/30 p-4 rounded-xl flex items-center mb-6">
                  <img 
                    src={selectedToken.image} 
                    alt={selectedToken.name} 
                    className="w-12 h-12 rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{selectedToken.name}</h3>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-gray-400">{selectedToken.symbol}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">Balance: {selectedToken.balance}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedToken(null)}
                    className="ml-auto text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={mintForm.recipientAddress}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 0x1234..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-400">Enter the wallet address that will receive the tokens</p>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={mintForm.amount}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Amount to mint"
                      required
                    />
                    <div className="absolute right-4 top-3 text-gray-400 flex items-center">
                      <span className="mr-2">{selectedToken.symbol}</span>
                      <button 
                        type="button" 
                        onClick={() => setMintForm({...mintForm, amount: selectedToken.balance.replace(/,/g, '')})}
                        className="text-xs bg-gray-600 hover:bg-gray-500 rounded px-2 py-1"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Gas Fee (estimated)</span>
                    <span>0.001 Sol</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span>Transaction confirmation time</span>
                    <span className="text-green-400">~30 seconds</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                      <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                    </svg>

                    {isMinting ? "Minting..." : "Mint Tokens"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
  );
};

export default MintPage;
