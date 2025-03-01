"use client";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const MintPage = () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const { publicKey } = useWallet();

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
            };
          })
        );
        //set token
        setTokens(await userTokens);
      };
    
  const [tokens, setTokens] = useState([
    {
      id: 1,
      name: "Awesome Token",
      symbol: "AWE",
      balance: "1,000,000",
      image: "/api/placeholder/64/64",
    },
    {
      id: 2,
      name: "Super Coin",
      symbol: "SCOIN",
      balance: "500,000",
      image: "/api/placeholder/64/64",
    },
  ]);

  const [selectedToken, setSelectedToken] = useState<any>("");

  const [mintForm, setMintForm] = useState({
    recipientAddress: "",
    amount: "",
  });

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setMintForm({
      ...mintForm,
      [name]: value,
    });
  };

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Mint token logic will go here
    console.log("Mint request:", { token: selectedToken, ...mintForm });
  };
  return (
    <div>
      <motion.div
        className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Mint Tokens to Wallets</h2>

        {!selectedToken ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-600 rounded-xl">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Select a Token</h3>
            <p className="text-gray-400">
              Choose a token from the list to start minting
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <span className="text-gray-400">
                    Balance: {selectedToken.balance}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedToken(null)}
                className="ml-auto text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                name="recipientAddress"
                value={mintForm.recipientAddress}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 0x1234..."
                required
              />
              <p className="mt-1 text-sm text-gray-400">
                Enter the wallet address that will receive the tokens
              </p>
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
                    onClick={() =>
                      setMintForm({
                        ...mintForm,
                        amount: selectedToken.balance.replace(/,/g, ""),
                      })
                    }
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
                <span>0.002 ETH</span>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                  <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                </svg>
                Mint Tokens
              </button>
            </div>

            <div className="text-center text-sm text-gray-400 mt-4">
              By proceeding, you confirm that these tokens comply with all
              applicable regulations and laws.
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default MintPage;
