"use client";

import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";

// method to fetch token decimal
const getTokenDecimals = async (mint: PublicKey) => {
  const connection = new Connection("https://api.devnet.solana.com");
  const info = await connection.getParsedAccountInfo(mint);

  if (!info.value) {
    throw Error("Failed to fetch Decimal");
  }

  return (info.value.data as ParsedAccountData).parsed.info.decimals as number;
};

export default getTokenDecimals;
