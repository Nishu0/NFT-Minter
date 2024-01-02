"use client"
import PageHeading from "../components/PageHeading";
import React, { use, useState } from "react";
import Image from "next/image";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import {
  Metaplex,
  keypairIdentity,
  irysStorage,
  toMetaplexFileFromBrowser,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Home() {
  const wallet = useWallet();
  const [file, setFile] = useState(null);
  const [nftName, setNFTName] = useState<string>("");
  const [nftDescription, setNFTDescription] = useState<string>("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const walletUrl = "http://localhost:3000/api/wallet";

  const mintNFT = async () => {
    if (!file || !wallet.connected || !wallet.publicKey) {
      toast.error("Pls connect wallet and select a file.");
      return;
    }

    const postWalletAddress = async () => {
      const response = await axios.post(walletUrl, {
        walletAddress: wallet.publicKey ? wallet.publicKey.toBase58() : null,
      });
      console.log(response);
    };
    postWalletAddress();

    console.log("Wallet Address: ", wallet.publicKey.toBase58());

    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(
          irysStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
          })
        );

      const metaplexFile = await toMetaplexFileFromBrowser(file);
      const uploadResponse = await metaplex.storage().upload(metaplexFile);
      console.log("Upload Response:", uploadResponse);

      const { uri } = await metaplex.nfts().uploadMetadata({
        nftName,
        nftDescription,
        file,
        attributes: [
          { trait_type: "Color", value: "Blue" },
          { trait_type: "Size", value: "Large" },
        ],
      });

      const { nft } = await metaplex.nfts().create(
        {
          uri,
          name: nftName,
          sellerFeeBasisPoints: 500,
        },
        {
          commitment: "finalized",
          confirmOptions: {
            commitment: "finalized",
            skipPreflight: false,
            maxRetries: 3,
          },
        }
      );

      console.log("NFT Minted:", nft);
      toast.success("NFT Minted Successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.success("NFT Minted Successfully!");
    }
  };
  return (
    <div className="block max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <main className="flex flex-col gap-8 ">
      <PageHeading>Mint NFT based on Solana</PageHeading>

      <div className="basis-1/4 ">
        <div className="flex flex-col-reverse justify-center items-center my-6 gap-10">
          <button
            onClick={mintNFT}
            disabled={!wallet.connected}
            type="button"
            className="w-full inline-flex text-center justify-center items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md cursor-pointer hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mint NFT
          </button>
          <label
            htmlFor="file-upload"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Upload Image
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNFTName(e.target.value)}
        />
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="text"
          placeholder="NFT Description"
          value={nftDescription}
          onChange={(e) => setNFTDescription(e.target.value)}
        />
        </div>

        {file && (
          <div className="flex flex-col gap-10 justify-center">
            <p className="text-sm text-white my-10">
              {wallet.publicKey && (
                <p>Nft Minting from Wallet Address: {wallet.publicKey.toBase58()}</p>
              )}
            </p>
            <img src={URL.createObjectURL(file)} />
            <p className="text-sm text-white">
              {file.name} ({file.size} bytes)
            </p>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-center" />
    </main>
    </div>
  );
}