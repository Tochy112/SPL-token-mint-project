"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div>
      <nav className="backdrop-blur-md bg-black/30 border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">TF</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">TokenForge</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Create
            </Link>
            <Link href="/mint" className="text-gray-300 hover:text-white transition">
              Mint
            </Link>
            <WalletMultiButton className="p-0" />
            </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
