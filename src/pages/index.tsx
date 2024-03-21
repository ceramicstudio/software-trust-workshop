import Head from "next/head";
import Nav from "../components/Navbar";
import styles from "./index.module.css";
import Credential from "../components/VC712";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useStore from "../../zustand/store";
import TextareaAutosize from "react-textarea-autosize";
import { useWalletClient } from "wagmi";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { definition } from "../__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";

const Home: NextPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { address, isDisconnected } = useAccount();
  const { endpoint, setEndpoint, compose, setCompose, client } = useStore();
  const { data: walletClient, isError, isLoading } = useWalletClient();

  useEffect(() => {
    if (address) {
      setLoggedIn(true);
      if (walletClient && loggedIn) {
        setCompose(walletClient, compose, client);
      }
    }
  }, [address, walletClient]);

  return (
    <>
      <Nav />
      <Head>
        <title>Save Verifiable Credentials to Ceramic</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loggedIn ? (
        <main className={styles.main}>
          <p className="text-2xl font-bold text-white">ComposeDB Endpoint</p>
          <p className="text-1xl text-white">
            If your local node is running, try replacing with
            `http://localhost:7007`
          </p>
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base mb-4"
            placeholder="Scope (e.g. 'Software Development') - REQUIRED"
            value={endpoint}
            onChange={(e: any) => {
              setEndpoint(e.target.value);
            }}
            onBlur={() => {
              if (walletClient) {
                const client = new CeramicClient(endpoint);
                const composeDB = new ComposeClient({
                  ceramic: client,
                  definition: definition as RuntimeCompositeDefinition,
                });
                setCompose(walletClient, composeDB, client);
              }
            }}
          />
          <Credential />
          {/* {endpoint !== "http://localhost:7007" && <Credential />} */}
        </main>
      ) : (
        <main className={styles.main}></main>
      )}
    </>
  );
};

export default Home;
