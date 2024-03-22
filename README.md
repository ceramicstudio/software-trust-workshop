# Software Trust System Workshop
This workshop has been planned to cover a few important topics relevant for the MetaMask and Karma3 Labs teams to get started building most efficiently and rapidly against their spec. In doing so, we have taken the [caip-261](https://github.com/dayksx/CAIPs/blob/main/CAIPs/caip-261.md) spec document into account.

The major themes we will cover are:

1. Guided Ceramic node setup (using Ceramic-One, i.e. our Rust implementation)
2. ComposeDB data modeling directly relevant to fulfill the spec
3. Data interactions (querying, mutations, filtering)

## Getting Started

We will be using this repository for part of our workshop, so let's first clone the codebase so we don't have to worry about it later (you will need npm installed):

```bash
git clone https://github.com/ceramicstudio/software-trust-workshop && cd software-trust-workshop && npm install
```

You can open this repository in your code editor of choice for the second half of this workshop. This implementation mimics the Kubo RPC API and relies on https://github.com/ceramicnetwork/js-ceramic for the remaining logic.

## Node Setup
This workshop will use our [rust-ceramic](https://github.com/ceramicnetwork/rust-ceramic) implementation

You can find our external Rust-Ceramic instructions [here](https://threebox.notion.site/Ceramic-Recon-instructions-EXTERNAL-c2b93b2648d64cf0af0f4d2489d20399).

Assuming we will all be operating on macs, open a new terminal and:

1. Install nvm (if not already installed)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

2. Select node v20:

```bash
nvm install v20
nvm use 20
```

3. Install js-ceramic (with nighly builds):

```bash
npm install --location=global @ceramicnetwork/cli@nightly
```

4. Download Rust-Ceramic from binary distribution:

#### MacOS

```bash
curl -LO https://github.com/ceramicnetwork/rust-ceramic/releases/download/v0.13.0/ceramic-one_aarch64-apple-darwin.tar.gz
tar zxvf ceramic-one_aarch64-apple-darwin.tar.gz
```

Open Finder, double click the `ceramic-one.pkg` file to start the install

 After installation, copy the binary:

```bash
sudo cp /Applications/ceramic-one /usr/local/bin/
```

#### Linux

```bash
curl -LO https://github.com/ceramicnetwork/rust-ceramic/releases/download/v0.13.0/ceramic-one_x86_64-unknown-linux-gnu.tar.gz
tar zxvf ceramic-one_x86_64-unknown-linux-gnu.tar.gz
dpkg -i ceramic-one.deb
```

5. Start rust-ceramic (must be started first as js-ceramic needs the endpoint on startup):

```bash
ceramic-one daemon
```

6. In a new terminal, start js-ceramic with `CERAMIC_RECON_MODE` enabled and pointing to the rust-ceramic instance:

```bash
nvm use 20
CERAMIC_RECON_MODE="true" ceramic daemon --ipfs-api http://localhost:5001
```

We now have our Ceramic node running on port 7007. In the following steps, we will deploy our composite onto our node.

**Troubleshooting** 

If you received error messages, please first ensure that you're running node v20 in the terminals you're running the above commands in. Next, if you've previously ran Ceramic locally, the legacy data from those sessions might also be causing issues. Go into `~/.ceramic` from your machine's root directory (if exists) and delete the `statestore` subdirectory and the `indexing.sqlite` file before trying the commands again.

### Configure Your Admin DID

Back in your code editor's terminal (or a terminal opened to the `software-trust-workshop` directory), configure an admin DID our node will use in order to deploy our composites:

```bash
nvm install v16
nvm use 16
npm install @composedb/cli
```

```bash
composedb did:generate-private-key
```

This will print out a unique and random private key. We need to get the public key associated with this private key.

Store the private in an environment variable.

```bash
read -s DID_PRIVATE_KEY #paste in the key from the previous command and hit enter
export DID_PRIVATE_KEY
```

Now generate the corresponding public key from the private key:

```bash
composedb did:from-private-key
```

On your machine, go into the following file off your machine's root: `~/.ceramic/daemon.config.json`. In your daemon.config.json file, add the did you just added into the `admin-dids` array. It should look something like this:

```json
{
  "anchor": {},
  "http-api": {
    "cors-allowed-origins": [
      ".*"
    ],
    "admin-dids": ["did:key:<your new public key>"]
  },
  "ipfs": {
    "mode": "bundled"
  },
  "logger": {
    "log-level": 2,
    "log-to-files": false
  },
  "network": {
    "name": "testnet-clay"
  },
  "node": {},
  "state-store": {
    "mode": "fs",
    "local-directory": "/Users/<you>/.ceramic/statestore"
  },
  "indexing": {
    "db": "sqlite:///Users/<you>/.ceramic/indexing.sqlite",
    "allow-queries-before-historical-sync": true,
    "models": []
  }
}
```

While you have your `~/.ceramic` directory open, delete your `statestore` subfolder, and your `indexing.sqlite` files.

Restart the js-ceramic process for the new config to take effect - go back to the original two terminals you began with, cancel the processes that are running, and re-run steps 7 and 8 above.

### Deploy the Models

Back in the root directory of this repository you should now be able to deploy the existing composite we previously created previously by running:

```bash
composedb composite:deploy ./src/__generated__/definition.json
```

Finally, you can run a command (like the one below) to manually direct your new node to peer with another node running Rust-Ceramic that is also indexing the same models:

```bash
curl -X POST "http://localhost:5001/api/v0/swarm/connect?arg=/ip4/137.184.2.2/tcp/4001/p2p/12D3KooWJqb7KjjcWSC92xcSHhdGUrnJ5FJiTHHdZEW7QaLWG5X3"
```

## Models Walk-Through

It was requested that we walk through the user-to-user trust signal data models during this workshop. To that end, here's a quick reminder of an example of the JSON schema mentioned in [capi-261](https://github.com/dayksx/CAIPs/blob/caips-split/CAIPs/caip-261.md):

```json
"@context": ["https://www.w3.org/2018/credentials/v1"],
"type": ["VerifiableCredential", "PeerTrustCredential"],
"issuanceDate": "2024-02-15T07:05:56.273Z",
"issuer": "did:pkh:eip155:1:0x44dc4E3309B80eF7aBf41C7D0a68F0337a88F044",
"credentialSubject":
{
  "id": "did:pkh:eip155:1:0xfA045B2F2A25ad0B7365010eaf9AC2Dd9905895c",
  "trustworthiness":
  [
    {
      "scope": "Honesty",
      "level": 0.5,
      "reason": ["Alumnus"]
    },
    {
      "scope": "Software development",
      "level": 1,
      "reason": ["Software engineer", "Ethereum core developer"]
    },
    {
      "scope": "Software security",
      "level": 0.5,
      "reason": ["White Hat", "Smart Contract Auditor"]
    }
  ]
},
"credentialSchema": [{
  "id": "ipfs://QmcwYEnLysTyepjjtJw19oTDwuiopbCDbEcCuprCBiL7gl",
  "type": "JsonSchema"
},
"proof": {}
```

The data model above is in JWT verifiable credential format. Here's how we are thinking about how this translates to ComposeDB:


```GraphQL
################## Account Trust Credentials
type AccountTrustSignal
  @createModel(accountRelation: SET, accountRelationFields: ["recipient"], description: "An account trust signal")
  @createIndex(fields: [{ path: "recipient" }])
  @createIndex(fields: [{ path: "issuanceDate" }]) {
  issuer: DID! @documentAccount
  recipient: DID! @accountReference
  issuanceDate: DateTime!
  trustWorthiness: [AccountTrustTypes!]! @list(maxLength: 1000)
  proof: String! @string(maxLength: 10000)
}

type AccountTrustTypes {
  scope: String! @string(maxLength: 1000)
  level: Float! 
  reason: [String] @string(maxLength: 1000) @list(maxLength: 100)
}
```

**Use of SET**

In ComposeDB, you can define relations between a schema model instance and the Ceramic account that controls that instance in 3 ways - SINGLE, LIST, AND SET. SINGLE requires there only ever be 1 model instance for that schema per account. LIST allows there to be an unlimited number of instances associated with that account. Conversely, SET allows developers to enforce a unique list of instances associated with an account based on a certain subfield (or set of subfields).

In the schema above, by indicating SET with the `accountRelationFields` array set to "recipient", we are ensuring that user A can only create 1 instance that points to user B.

For more information, read our [SET RFC](https://forum.ceramic.network/t/rfc-native-support-for-unique-list-relationships-between-stream-types-and-accounts/1406).

**Use of @createIndex**

The @createIndex directive instructs your ComposeDB node to build an index on the defined field, allowing developers to perform filters and ordering based on those indexes. Note that this does NOT work for embedded objects or enums.

**Issuer**

Any field definition marked as `DID! @documentAccount` will be automatically filled based on the authenticated account creating or updating a model instance (meaning it does not need to be manually inputted).

**Proof**

The plaintext fields in the `AccountTrustSignal` model provides all the information we need to read from directly. However, we've left in the "proof" field to accommodate any portable verified data object - for example, a stringified VC signed by the authenticated user.

## Running Queries in the Application UI

We've set up this repository so you can run some queries to an existing production node that's indexing the models found in `/composites`, as well as running queries to your local node running on localhost:7007 (which you'll be able to toggle manually).

From the root of this repository (`/software-trust-system`) start your application in developer mode:

```bash
npm run dev
```

You can now open your browser to http://localhost:3000/.

Under the "ComposeDB Endpoint" you will see that an external cloud node endpoint has already been provided to you. Go ahead and fill in the fields below. Once you've added at least 1 trustworthiness item, you should be able to issue a credential.

Go ahead and issue a credential with the default node endpoint given to you. 

Navigate to `http://localhost:3000/reads` where we can verify that it synced to our node. With your local node still running, replace the value under the "ComposeDB Endpoint" text with `http://localhost:7007`. Next, if you run the default query within the `GetAccountTrustSignals` tab, you should be able to see the document you just created within the set of returned documents.
