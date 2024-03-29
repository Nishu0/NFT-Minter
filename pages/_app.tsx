import React, { useMemo } from "react";
import "./globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { ThemeProvider } from "next-themes"
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ThemeProvider attribute="class">
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Layout>
          <Component {...pageProps} />
          </Layout>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
    </ThemeProvider>
  );
}