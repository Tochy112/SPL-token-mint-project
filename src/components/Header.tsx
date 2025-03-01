"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="backdrop-blur-md bg-black/30 border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-2">
            <span className="text-white font-bold text-xl">SF</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            SPLForge
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-300 hover:text-white transition">
            Create
          </Link>
          <Link href="/mint" className="text-gray-300 hover:text-white transition">
            Mint
          </Link>
          <WalletMultiButton className="p-0" />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-md py-3 px-4 absolute top-14 left-0 w-full flex flex-col space-y-4 border-b border-purple-500/20">
          <Link href="/" className="text-gray-300 hover:text-white transition" onClick={() => setIsOpen(false)}>
            Create
          </Link>
          <Link href="/mint" className="text-gray-300 hover:text-white transition" onClick={() => setIsOpen(false)}>
            Mint
          </Link>
          <WalletMultiButton className="p-0" />
        </div>
      )}
    </nav>
  );
};

export default Header;
