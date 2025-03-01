"use client";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import TokenMintForm from "@/components/TokenMintForm";
import React from "react";

const page = () => {
  return (
    <>
      <HeroSection />
      <TokenMintForm />
      <FeaturesSection />
      <Footer />
    </>
  );
};

export default page;
