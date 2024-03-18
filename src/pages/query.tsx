"use client";
import Head from "next/head";
import Nav from "../components/Navbar";
import styles from "./index.module.css";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GraphiQL } from "graphiql";
import { definition } from "../__generated__/definition.js";
import { ComposeClient } from "@composedb/client";
import { useComposeDB } from "../fragments";
import "graphiql/graphiql.min.css";

const Home: NextPage = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { address, isDisconnected } = useAccount();
  const { compose } = useComposeDB();

  const verifiableCredentialQuery = 
`
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

const verifiableCredentialQuery1 = 
`
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

const verifiableCredentialQuery2 = 
`
mutation CreateAuditReview {
  setAuditReview(input: {
    content: {
      issuanceDate: "2021-10-01T00:00:00Z"
      auditId: "<fill in>"
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

const verifiableCredentialQuery3 = 
`
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
      {query: verifiableCredentialQuery},
      {query: verifiableCredentialQuery1},
      {query: verifiableCredentialQuery2},
      {query: verifiableCredentialQuery3}
    ]
  }

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
    }
  }, [address]);

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
