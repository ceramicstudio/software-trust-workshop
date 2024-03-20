import { create } from "zustand";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { definition } from "../src/__generated__/definition";
import { GetWalletClientResult } from "@wagmi/core";

type Store = {
  endpoint: string;
  client: CeramicClient;
  compose: ComposeClient;
  setEndpoint: (newEndpoint: string) => void;
  setCompose: (
    wallet: GetWalletClientResult,
    newCompose: ComposeClient,
    newCeramic: CeramicClient
  ) => void;
};

const StartAuth = async (
  walletClient: GetWalletClientResult,
  compose: ComposeClient,
  ceramic: CeramicClient,
) => {
  let isAuth = false;

  if (walletClient) {
    const accountId = await getAccountId(
      walletClient,
      walletClient.account.address
    );
    const authMethod = await EthereumWebAuth.getAuthMethod(
      walletClient,
      accountId
    );
    const session = await DIDSession.get(accountId, authMethod, {
      resources: compose.resources,
    });
    //@ts-ignore
    await ceramic.setDID(session.did);
    //@ts-ignore
    await compose.setDID(session.did);
    localStorage.setItem("did", session.did.parent);
    isAuth = true;
  }

  console.log("isAuth:", compose);
  return compose;
};

const useStore = create<Store>((set) => ({
  endpoint: "http://137.184.2.2:7007",
  setEndpoint: (newEndpoint) =>
    set((state) => ({
      endpoint: newEndpoint,
      client: new CeramicClient(newEndpoint),
      compose: new ComposeClient({
        ceramic: new CeramicClient(newEndpoint),
        definition: definition as RuntimeCompositeDefinition,
      }),
    })),
  setCompose: async (wallet, newCompose, newCeramic) => {
    const auth = await StartAuth(wallet, newCompose, newCeramic);
    set((state) => ({
      compose: auth,
    }));
  },
  client: new CeramicClient("http://137.184.2.2:7007"),
  compose: new ComposeClient({
    ceramic: new CeramicClient("http://137.184.2.2:7007"),
    definition: definition as RuntimeCompositeDefinition,
  }),
}));

export default useStore;
