## Getting Started
This directory contains a simple frontend interface, the Ceramic server configurations, and Ceramic client operations required to create, save, and query AccountTrustCredentials to ComposeDB.

1. Install your dependencies:

Install your dependencies:

```bash
npm install
```

2. Generate your admin seed, admin did, and ComposeDB configuration file:

Next, we will need to generate an admin seed and ComposeDB configuration our application will use. This example repository contains a script found at /client/scripts/commands/mjs that generates one for you (preset to run "inmemory" which is ideal for testing).

To generate your necessary credentials, run the following in your terminal:

```bash
npm run generate
```

3. Finally, run your application in a new terminal (first ensure you are running node v16 in your terminal):

```bash
nvm use 16
npm run dev
```

If you explore your composedb.config.json and admin_seed.txt files, you will now see a defined JSON ComposeDB server configuration and Ceramic admin seed, respectively.

## Observe Your Schema Definitions

The schemas outlined above are located [here](./composites/00-verifiableCredential.graphql).

While there are a variety of different ways to compile data models into a composite and deploy on a local node, this repository outlines one opinionated way, found in /scripts/composites.mjs. When you launch the application, this script compiles the models into a composite definition that will then be deployed on your local node, and write those definitions to the files located in /src/__generated__, which will later be used by the ComposeDB client library to read and write data.

Deploying your models onto your node each time you run the application is only relevant for local testing. Once using a production node, your models will already be deployed on your Ceramic node, and you will simply need the canonical runtime definition to cast onto your node.

## Interacting with the UI
If you have been following along up until this point, you should be able to access the UI in your browser on port 3000. Go ahead and connect your wallet using the Web3Modal:

<div style={{textAlign: 'center'}}>

![vc playground](/static/vc-playground.png)

</div>

The code for this section can be found in the [VC712 component](./src/components/VC712.tsx).

You can follow the directions on the screen to:

1. Input a recipient address
2. Create as many "Trustworthiness" entries for a given address as you'd like (with or without the optional `reason` array field)
3. When ready, issue your credential

You can observe how our ComposeDB client is available on the `compose` object after calling the `useComposeDB` method (imported from [this fragment](./src/fragments/index.tsx)) - this authentication method checks and authenticates our browser wallet by creating an authenticated DID session based on our parent DID:pkh. This fragment also imports our runtime definition and casts it on our ComposeDB client (line 24), thus making our schema definitions available to query and write. 

If you check your localStorage, you should also now see a `DID` key-value pair that resulted from this SIWE + Ceramic authentication flow.

Finally, back in the [VC712 component](./src/components/VC712.tsx), observe how we execute a mutation query using the `AccountTrustCredential712` type

### Query Page

If you visit http://localhost:3000/query, you can interact with an in-browser GraphIQL instance. Observe how we're first querying based on the `VerifiableCredential` broad interface, but have the ability to query based on the super granular `AccountTrustCredential712` type. This shows how our queries can support multiple entrypoints.

You can conversely query in the opposite direction (granular --> broad). 

## Learn More

To learn more about Ceramic please visit the following links

- [Ceramic Documentation](https://developers.ceramic.network/learn/welcome/) - Learn more about the Ceramic Ecosystem.
- [ComposeDB](https://composedb.js.org/) - Details on how to use and develop with ComposeDB!
- [AI Chatbot on ComposeDB](https://learnweb3.io/lessons/build-an-ai-chatbot-on-compose-db-and-the-ceramic-network) - Build an AI-powered Chatbot and save message history to ComposeDB
- [ComposeDB API Sandbox](https://developers.ceramic.network/sandbox) - Test GraphQL queries against a live dataset directly from your browser
- [Ceramic Blog](https://blog.ceramic.network/) - Browse technical tutorials and more on our blog
- [Ceramic Discord](https://discord.com/invite/ceramic) - Join the Ceramic Discord
- [Follow Ceramic on Twitter](https://twitter.com/ceramicnetwork) - Follow us on Twitter for latest announcements!