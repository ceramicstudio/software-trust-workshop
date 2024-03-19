import { CeramicClient } from "@ceramicnetwork/http-client"
import { ComposeClient } from "@composedb/client";
import { definition } from "../src/__generated__/definition.js";
/**
 * Configure ceramic Client & create context.
 */
const ceramic = new CeramicClient("https://ceramic-demo.hirenodes.io");

const composeClient = new ComposeClient({
  ceramic: "https://ceramic-demo.hirenodes.io",
  // @ts-ignore
  definition: definition,
});

const CeramicContext = {ceramic: ceramic, composeClient: composeClient};

export default CeramicContext;