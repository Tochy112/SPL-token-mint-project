"use client";

import { motion } from 'framer-motion';
import React from 'react'
import Image from 'next/image'

const HeroSection = () => {
  return (
    <div>
         <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Create Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              Token
            </span>{" "}
            in Seconds
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            One click to create, deploy, and manage your custom tokens on the
            blockchain.
          </motion.p>
          <motion.p
            className="text-xl text-gray-300 mt-6 flex justify-center items-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p>Powered By Solana</p>
            <Image src="/solana-image.png" alt="Powered By Solana" width={100} height={100} />
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection