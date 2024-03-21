"use client";
import Head from "next/head";
import Nav from "../components/Navbar";
import styles from "./index.module.css";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GraphiQL } from "graphiql";
import { useWalletClient } from "wagmi";
import { ComposeClient } from "@composedb/client";
import useStore from "../../zustand/store";
import TextareaAutosize from "react-textarea-autosize";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { definition } from "../__generated__/definition.js";
import { RuntimeCompositeDefinition } from "@composedb/types";
import "graphiql/graphiql.min.css";

const Home: NextPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { address, isDisconnected } = useAccount();
  const { endpoint, setEndpoint, compose, setCompose, client } = useStore();
  const { data: walletClient, isError, isLoading } = useWalletClient();

  const verifiableCredentialQuery = `
mutation CreateAccountTrustSignal {
  setAccountTrustSignal(input: {
    content: {
      recipient: "did:pkh:eip155:1:0xc362c16a0dcbea78fb03a8f97f56deea905617bb"
      issuanceDate: "2021-10-01T00:00:00Z"
      trustWorthiness: [
        {
          scope: "Honesty"
          level: 0.5
          reason: ["Alumnus"]
        }
      ]
    }
  })
  {
    document {
      id
      issuer{
        id
      }
      recipient {
        id
      }
      issuanceDate
      trustWorthiness {
        level
        scope
        reason
      }
    }
  }
}
`;

  const verifiableCredentialQuery1 = `
mutation CreateSecurityAudit {
  setSecurityAudit(input: {
    content: {
      subjectId: "snap://CLwZocaUEbDErtQAsybaudZDJq65a8AwlEFgkGUpmAQ="
      issuanceDate: "2021-10-01T00:00:00Z"
      securityStatus: true
      securityFindings: [
        {
          criticality: 0.5
          type: "Data leak"
          description: "API can communicate data to a centralized server"
          lang: "en"
        }
      ]
    }
  })
  {
    document {
      id
      issuer{
        id
      }
      subjectId
      issuanceDate
      securityStatus
      securityFindings {
        criticality
        type
        description
        lang
      }
    }
  }
}
`;

  const verifiableCredentialQuery2 = `
mutation CreateAuditReview {
  setAuditReview(input: {
    content: {
      issuanceDate: "2021-10-01T00:00:00Z"
      auditId: "k2t6wzhkhabz35kkf19ur2cbedu9xil4lhx76hs7zjxvypc4d19mh65skv5w5i"
      endorsedStatus: true
      reason: ["Scam", "Phishing"]
    }
  })
  {
    document {
      id
      issuer{
        id
      }
      audit{
        id
        subjectId
        issuanceDate
        securityStatus
        securityFindings {
          criticality
          type
          description
          lang
        }
      }
      issuanceDate
      endorsedStatus
      reason
    }
  }
}
`;

  const verifiableCredentialQuery3 = `
mutation CreatePeerTrustScore {
  createPeerTrustScore(input: {
    content: {
      recipient: "did:pkh:eip155:1:0xc362c16a0dcbea78fb03a8f97f56deea905617bb"
      issuanceDate: "2021-10-01T00:00:00Z"
      trustScore: {
        confidence: 0.5
        value: 0.5
      }
      trustScoreType: "IssuerTrustWeightedAverage"
    }
  })
  {
    document {
      id
      issuer{
        id
      }
      issuanceDate
      trustScore {
        confidence
        value
      }
      trustScoreType
    }
  }
}
`;

  const Queries = {
    values: [
      { query: verifiableCredentialQuery },
      { query: verifiableCredentialQuery1 },
      { query: verifiableCredentialQuery2 },
      { query: verifiableCredentialQuery3 },
    ],
  };

  const fetcher = async (graphQLParams: Record<string, any>) => {
    const composeClient = compose as ComposeClient;

    const data = await composeClient.executeQuery(`${graphQLParams.query}`);
    console.log(data);

    if (data && data.data && !data.data.__schema) {
      return data.data;
    }
  };

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
      {!isDisconnected ? (
        <main className={styles.main}>
          {loggedIn && (
            <div style={{ height: "60rem", width: "90%", margin: "auto" }}>
              <p className="text-2xl font-bold text-white">
                ComposeDB Endpoint
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
               {/* @ts-ignore */}
               <GraphiQL fetcher={fetcher} storage={null} defaultTabs={Queries.values}/>
            </div>
          )}
        </main>
      ) : (
        <main className={styles.main}></main>
      )}
    </>
  );
};

export default Home;
