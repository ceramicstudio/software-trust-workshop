import React, { useState } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import TextareaAutosize from "react-textarea-autosize";
import { TrustType } from "types";
import useStore from "../../zustand/store";

const Credential = () => {
  const [cred, setCred] = useState<string>(
    JSON.stringify({ "Generate Credentials Below": "👇" }, null, 2)
  );
  const [recipient, setRecipient] = useState<string>("");
  const [scope, setScope] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [reason, setReason] = useState<string[]>([]);
  const [reasons, setReasons] = useState<number>(0);
  const [trust, setTrust] = useState<TrustType[]>([]);
  const {endpoint, setEndpoint, compose, setCompose} = useStore();

  const createCredential = async () => {
    if (!recipient) {
      alert("Please enter a recipient address");
      return;
    }
    if (!trust.length) {
      alert("Please enter at least one trustworthiness value");
      return;
    }
    const newTrust = trust.map((i) => {
      return {
        scope: i.scope,
        level: parseFloat(i.level),
        reason: i.reason,
      };
    });

    const query: any = await compose.executeQuery(`
      mutation {
        setAccountTrustSignal(input: {
          content: {
            recipient: "did:pkh:eip155:1:${recipient}"
            issuanceDate: "${new Date().toISOString()}"
            trustWorthiness: ${JSON.stringify(newTrust).replace(
              /"([^"]+)":/g,
              "$1:"
            )}
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
    `);
    console.log(query);
    setCred(JSON.stringify(query, null, 2));
    setTrust([]);
    setRecipient("");
  };

  const createTrust = () => {
    if (!scope || !level) {
      alert("Please fill out all required fields");
      return;
    }
    setTrust([
      ...trust,
      {
        scope,
        level,
        reason,
      },
    ]);
    setScope("");
    setLevel("");
    setReason([]);
    setReasons(0);
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
        <p className="text-white">
          <small>a. Click "Add Reason" to add optional reason entries</small>
        </p>
        <p className="text-white">
          <small>
            b. Click "Add Trustworthiness" to create a Trustworthiness entry
          </small>
        </p>
        <p className="text-white">
          <small>
            c. Click "Issue Credential" when you have added 1 or more
            Trustworthiness entries
          </small>
        </p>
        <div className=" w-full h-full flex flex-col">
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Scope (e.g. 'Honesty') - REQUIRED"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
          <TextareaAutosize
            className="resize-none w-1/2 h-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Level (e.g. 0.5) - REQUIRED"
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
                      placeholder={`Reason ${i} (e.g. 'Alumnus')`}
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
      {trust.length && (
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
      )}
    </div>
  );
};

export default Credential;
