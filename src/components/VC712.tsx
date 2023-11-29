import React, { useState } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import { useComposeDB } from "../fragments";
import * as u8a from "uint8arrays";
import { ethers } from "ethers";
import TextareaAutosize from "react-textarea-autosize";
import { Web3KeyManagementSystem } from "@veramo/kms-web3";
import { TrustType } from "types";
import { set } from "zod";

const Credential = () => {
  const [cred, setCred] = useState<string>(
    JSON.stringify({ "Generate Credentials Below": "👇" }, null, 2)
  );
  const [recipient, setRecipient] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [scope, setScope] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [currReason, setCurrReason] = useState<string>("");
  const [reason, setReason] = useState<string[]>([]);
  const [reasons, setReasons] = useState<number>(0);
  const [trust, setTrust] = useState<TrustType[]>([]);

  const { compose } = useComposeDB();

  const createCredential = async () => {
    if (!recipient) {
      alert("Please enter a recipient address");
      return;
    }
    if (!trust.length) {
      alert("Please enter at least one trustworthiness value");
      return;
    }
    const id = await window.localStorage.getItem("did");
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );

    const payload = {
      proofFormat: "EthereumEip712Signature2021",
      credential: {
        issuer: id,
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://beta.api.schemas.serto.id/v1/public/account-trust-credential/2.0/ld-context.json",
        ],
        type: ["VerifiableCredential", "AccountTrustCredential"],
        credentialSchema: {
          id: "https://beta.api.schemas.serto.id/v1/public/vetted-reviewer/1.0/json-schema.json",
          type: "JsonSchemaValidator2018",
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:pkh:eip155:1:${recipient}`,
          trustworthiness: [...trust],
        },
      },
    };
    const sesh = new Web3KeyManagementSystem({
      web3: provider,
    });
    const keys = await sesh.listKeys();
    console.log(keys);
    //@ts-ignore
    const keyRef = { kid: keys[0].kid };
    const data = u8a.fromString(JSON.stringify(payload));

    console.log(data);
    //@ts-ignore
    const item = await sesh.sign({
      keyRef,
      algorithm: "eth_signMessage",
      data,
    });

    const VC = {
      issuer: id,
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://beta.api.schemas.serto.id/v1/public/account-trust-credential/2.0/ld-context.json",
      ],
      type: ["VerifiableCredential", "AccountTrustCredential"],
      credentialSchema: {
        id: "https://beta.api.schemas.serto.id/v1/public/vetted-reviewer/1.0/json-schema.json",
        type: "JsonSchemaValidator2018",
      },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `did:pkh:eip155:1:${recipient}`,
        trustworthiness: [...trust],
      },
      proof: {
        type: "EthereumEip712Signature2021",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: id,
        proofValue: item,

        eip712: {
          domain: {
            chainId: 1,
            name: "VerifiableCredential",
            version: "2",
          },
          primaryType: "VerifiableCredential",
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
            ],
            CredentialSchema: [
              {
                name: "id",
                type: "string",
              },
              {
                name: "type",
                type: "string",
              },
            ],
            // Trustworthiness: [
            //   {
            //     name: "type",
            //     type: "string",
            //   },
            //   {
            //     name: "scope",
            //     type: "string",
            //   },
            //   {
            //     name: "level",
            //     type: "string",
            //   },
            //   {
            //     name: "reason",
            //     type: "string[]",
            //   },
            // ],
            CredentialSubject: [
              {
                name: "id",
                type: "string",
              },
              {
                name: "trustworthiness",
                // type: "Trustworthiness[]",
                type: "object[]",
              },
            ],
            Proof: [
              {
                name: "created",
                type: "string",
              },
              {
                name: "proofPurpose",
                type: "string",
              },
              {
                name: "type",
                type: "string",
              },
              {
                name: "verificationMethod",
                type: "string",
              },
            ],
            VerifiableCredential: [
              {
                name: "@context",
                type: "string[]",
              },
              {
                name: "credentialSchema",
                type: "CredentialSchema",
              },
              {
                name: "credentialSubject",
                type: "CredentialSubject",
              },
              {
                name: "issuanceDate",
                type: "string",
              },
              {
                name: "issuer",
                type: "string",
              },
              {
                name: "proof",
                type: "Proof",
              },
              {
                name: "type",
                type: "string[]",
              },
            ],
          },
        },
      },
    };

    console.log(VC);

    const query: any = await compose.executeQuery(`
      mutation {
        createAccountTrustCredential712(input: {
          content: {
              context: ${JSON.stringify(VC["@context"]).replace(/"([^"]+)":/g, "$1:")}
              issuer: {
                  id: "${VC.issuer}"
                }
              type: ${JSON.stringify(VC.type).replace(/"([^"]+)":/g, "$1:")}
              credentialSchema: ${JSON.stringify(
                VC.credentialSchema
              ).replace(/"([^"]+)":/g, "$1:")}
              issuanceDate: "${VC.issuanceDate}"
              trusted: true
              recipient: "${id}"
              credentialSubject: ${JSON.stringify(
                VC.credentialSubject
              ).replace(/"([^"]+)":/g, "$1:")}
                proof: {
                  proofPurpose: "${VC.proof.proofPurpose}"
                  type: "${VC.proof.type}"
                  created: "${VC.proof.created}"
                  verificationMethod: "${VC.proof.verificationMethod}"
                  proofValue: "${VC.proof.proofValue}"
                  eip712: {
                    domain: ${JSON.stringify(
                      VC.proof.eip712.domain
                    ).replace(/"([^"]+)":/g, "$1:")}
                    types: ${JSON.stringify(VC.proof.eip712.types).replace(
                      /"([^"]+)":/g,
                      "$1:"
                    )}
                    primaryType: "${VC.proof.eip712.primaryType}"
                  }
                }
            }
          
        }) 
        {
          document {
            id
            issuer {
              id
            }
            recipient {
              id
            }
            issuanceDate
            type
            context
            trusted
            credentialSubject{
              id {
                id
              }
            }
            proof{
              type
              proofPurpose
              verificationMethod
              proofValue
              created
              eip712{
                domain{
                  name
                  version
                  chainId
                }
                types {
                  EIP712Domain {
                    name
                    type
                  }
                  CredentialSchema {
                    name
                    type
                  }
                  CredentialSubject {
                    name
                    type
                  }
                  Proof {
                    name
                    type
                  }
                  VerifiableCredential {
                    name
                    type
                  }
                }
                primaryType
              }
            }
          }
        }
      }
    `);
    console.log(query);
    setCred(JSON.stringify(query, null, 2));
    setTrust([]);
    setRecipient("");
  };

  const createTrust = () => {
    if (!type || !scope || !level) {
      alert("Please fill out all required fields");
      return;
    }
    setTrust([
      ...trust,
      {
        type,
        scope,
        level,
        reason,
      },
    ]);
    setType("");
    setScope("");
    setLevel("");
    setReason([]);
    setReasons(0);
    setCurrReason("");
  };

  const verifyCredential = async () => {
    const credential = await fetch("/api/query-jws");
    const toJsonCredential = await credential.json();
    const bodyToSend =
      toJsonCredential.data.verifiableCredentialJWTIndex.edges[0].node;
    const final = { ...bodyToSend, "@context": bodyToSend.context };
    delete final.context;
    console.log(final);
    setCred(JSON.stringify(final));
    const response = await fetch("http://localhost:8080/verify-jws", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        final,
      }),
    });
    const toJson = await response.json();
    setCred(JSON.stringify(toJson, null, 2));
  };

  return (
    <div className="max-w-xxl max-h-xxl mx-auto w-5/6 min-h-500">
       <CopyBlock
        style={{ width: "100%", height: "100%" }}
        text={cred ?? ""}
        language={"json"}
        showLineNumbers={false}
        theme={dracula}
        wrapLines={true}
        codeBlock
      /> 

      <div className="flex flex-col items-left justify-center w-full mt-5">
      <p className="text-white mt-5">1. Enter Recipient Eth Address: </p>
        <TextareaAutosize
          className="resize-none w-3/4 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          placeholder="Recipient Eth address here"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <p className="text-white mt-5">2. Add Trustworthiness Values: </p>
        <p className="text-white"><small>a. Click "Add Reason" to add optional reason entries</small></p>
        <p className="text-white"><small>b. Click "Add Trustworthiness" to create a Trustworthiness entry</small></p>
        <p className="text-white"><small>c. Click "Issue Credential" when you have added 1 or more Trustworthiness entries</small></p>
        <div className=" w-full h-full flex flex-col">
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Type (e.g. 'Quality') - REQUIRED"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Scope (e.g. 'Software Development') - REQUIRED"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Level (e.g. 'Moderate') - REQUIRED"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          {reasons > 0 && (
            <div className="flex flex-col items-left justify-center w-full mt-5">
              {reasons >= 1 &&
                Array.from(Array(reasons).keys()).map((i) => {
                  return (
                    <TextareaAutosize
                      className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder={`Reason ${i}`}
                      value={reason[i]}
                      onChange={(e) => {
                        const temp = [...reason];
                        temp[i] = e.target.value;
                        setReason(temp);
                      }}
                    />
                  );
                })}
            </div>
          )}
          <button
            onClick={() => {
              setReasons(reasons + 1);
              setCurrReason("");
            }}
            className="h-10 mt-2 outline outline-2 hover:bg-blue-800 rounded-md text-white w-1/6 mr-3"
          >
            Add Reason
          </button>
        </div>
        <button
          onClick={() => {
            {
              createTrust();
            }
          }}
          className="h-10 mt-5 outline outline-2 hover:bg-blue-800 rounded-md text-white w-1/4 mr-3"
        >
          Add Trustworthiness
        </button>
        {trust.length &&
          trust.map((i) => {
            return (
              <div className="flex flex-col items-left justify-center space-y-1 border-2 border-indigo-500/100 m-2 p-3">
                <p className="text-white">Type: {i.type}</p>
                <p className="text-white">Scope: {i.scope}</p>
                <p className="text-white">Level: {i.level}</p>
                {i.reason?.length &&
                  i.reason.map((r) => {
                    return <p className="text-white">Reason: {r}</p>;
                  })}
              </div>
            );
          })}
      </div>
      <button
        onClick={() => {
          {
            createCredential();
          }
        }}
        className="h-10 mt-5 outline outline-2 hover:bg-blue-800 rounded-md text-white w-1/4 mr-3"
      >
        Issue Credential
      </button>
    </div>
  );
};

export default Credential;
