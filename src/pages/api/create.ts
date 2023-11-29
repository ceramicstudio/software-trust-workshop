import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { NextApiRequest, NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { definition } from "../../src/__generated__/definition.js";

const dummySeed = '95c9d023ef5220279bb2251b528db67284fd32b0112636a5456e1d59ceefbb7e'

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { VC } = req.body;
  //instantiate a ceramic client instance
  const ceramic = new CeramicClient('http://localhost:7007');

  //instantiate a composeDB client instance
  const composeClient = new ComposeClient({
    ceramic: 'http://localhost:7007',
    definition: definition as RuntimeCompositeDefinition,
  });

  //authenticate key DID in order to create a write transaction
  const authenticateDID = async(seed: string) => {
    const key = fromString(seed, "base16");
    const provider = new Ed25519Provider(key);
    const staticDid = new DID({
      resolver: KeyResolver.getResolver(),
      provider
    });
    await staticDid.authenticate();
    ceramic.did = staticDid;
    return staticDid;
  }

  try {
    if (dummySeed) {
      const did = await authenticateDID(dummySeed);
      composeClient.setDID(did);

      const query: any = await composeClient.executeQuery(`
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
              recipient: "${VC.recipient}"
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
    console.log(query)
      if (query.data) {
        return res.json(query);
      } else {
        return res.json({
          error: "There was an error processing your write request",
        });
      }
    }
  } catch (err) {
    res.json({
      err,
    });
  }
}
