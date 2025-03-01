"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import * as token from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  uploadMetadataToCloudinary,
  uploadToCloudinary,
} from "./handleImageUpload";
import { toast } from "react-toastify";

const TokenMintForm = () => {
  const [txnSignature, setTxnSignature] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { publicKey, wallet, sendTransaction } = useWallet();

  //connection to solana blockchain
  const connection = new Connection(clusterApiUrl("devnet"));

  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    totalSupply: "",
    image: "",
    description: "",
    decimal: "",
  });

  const [imagePreview, setImagePreview] = useState<any>("");

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createTokenMint = useCallback(
    async (e: any) => {
      e.preventDefault();
      if (!publicKey) return;

      try {
        setIsLoading(true);
        // generate a new wallet keypair
        const mintKeyPair = Keypair.generate();

        // checks balance for rent exempt for the token
        const lamports = await token.getMinimumBalanceForRentExemptMint(
          connection
        );

        // Get token account size
        const space = token.MINT_SIZE;

        // get associated token address for the token account minting
        const tokenATA = await token.getAssociatedTokenAddress(
          mintKeyPair.publicKey,
          publicKey
        );

        // uplaod image and metadata to cloudinary
        const imageUrl = await uploadToCloudinary(formData.image);
        const metadata = {
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          image: imageUrl,
          description: formData.description,
        };
        const metadataUri = await uploadMetadataToCloudinary(metadata);

        const tokenMetadata = {
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        };

        // Get metadata PDA for the mint
        const [metadataPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            mintKeyPair.publicKey.toBuffer(),
          ],
          PROGRAM_ID
        );

        //initialize the txn object
        const transaction = new Transaction();

        // Create token metadata
        const createMetadataInstruction =
          createCreateMetadataAccountV3Instruction(
            {
              metadata: metadataPDA,
              mint: mintKeyPair.publicKey,
              mintAuthority: publicKey,
              payer: publicKey,
              updateAuthority: publicKey,
            },
            {
              createMetadataAccountArgsV3: {
                data: tokenMetadata,
                isMutable: false,
                collectionDetails: null,
              },
            }
          );

        // create mint account, token account and initialize minting
        transaction.add(
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mintKeyPair.publicKey,
            space,
            lamports,
            programId: token.TOKEN_PROGRAM_ID,
          }),
          token.createInitializeMintInstruction(
            mintKeyPair.publicKey,
            +formData.decimal,
            publicKey,
            null,
            token.TOKEN_PROGRAM_ID
          ),
          token.createAssociatedTokenAccountInstruction(
            publicKey,
            tokenATA,
            publicKey,
            mintKeyPair.publicKey
          ),
          token.createMintToInstruction(
            mintKeyPair.publicKey,
            tokenATA,
            publicKey,
            +formData.totalSupply * Math.pow(10, +formData.decimal)
          ),
          createMetadataInstruction
        );
        console.log("formData:", formData);

        console.log("txn:", transaction);

        // send transaction
        const signature = await sendTransaction(transaction, connection, {
          signers: [mintKeyPair],
        });

        console.log("hello world2");

        setIsLoading(false);
        setTxnSignature(signature);
        setMintAddress(mintKeyPair.publicKey.toBase58());
        formData.tokenName = "";
        formData.tokenSymbol = "";
        formData.totalSupply = "";
        formData.image = "";
        formData.description = "";
        formData.decimal = "";
        setImagePreview("");
        toast.success("token mint succssful");
      } catch (error) {
        setIsLoading(false);
        console.log("error:", error);
        toast.error("An error occured while minting token");
      }
    },
    [publicKey, connection, sendTransaction]
  );

  return (
    <div>
      <motion.div
        className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Token Details</h2>
          <form onSubmit={createTokenMint} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Token Name</label>
                <input
                  type="text"
                  name="tokenName"
                  value={formData.tokenName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. MyAwesomeToken"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Token Symbol</label>
                <input
                  type="text"
                  name="tokenSymbol"
                  value={formData.tokenSymbol}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. MAT"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Total Supply</label>
                <div className="relative">
                  <input
                    type="number"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 1000000"
                    required
                  />
                  <div className="absolute right-4 top-3 text-gray-400">
                    tokens
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Token Decimal
                </label>
                <input
                  type="number"
                  name="decimal"
                  value={formData.decimal}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. 6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your token's purpose"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Token Image</label>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer">
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <div className="space-y-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-400">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <div className="h-24 w-24 rounded-lg overflow-hidden border border-purple-500/30">
                    <img
                      src={imagePreview}
                      alt="Token Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              {txnSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`}
                  className="text-blue-700 my-6 mx-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="flex items-center justify-center">
                    View Transaction:
                    {"  " + txnSignature.slice(0, 25) + "..."}{" "}
                    <FaExternalLinkAlt />
                  </p>
                </a>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium cursor-pointer py-3 px-4 rounded-lg transition duration-300 transform  focus:outline-none  focus:ring-purple-500 shadow-lg"
              >
                {isLoading ? "Creating..." : "Create Token"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenMintForm;
