---
title: MetaMask Permissionless Snaps - March 22 '24 Workshop
author: Mark Krasner | <mzk@3box.io>
discussions-to: <https://github.com/dayksx/CAIPs/blob/main/CAIPs/caip-261.md> 
status: Draft
created: 2024-03-20
updated: 2024-03-20
---

## Summary
This workshop has been planned to cover a few important topics relevant for the MetaMask and Karma3 Labs teams to get started building most efficiently and rapidly against their spec. In doing so, we have taken the [caip-261](https://github.com/dayksx/CAIPs/blob/main/CAIPs/caip-261.md) spec document into account.

The major themes we will cover are:

1. Guided Ceramic node setup (using Ceramic-One, i.e. our Rust implementation)
2. ComposeDB data modeling directly relevant to fulfill the spec
3. Data interactions (querying, mutations, filtering)

### Node Setup
You can find our external Rust-Ceramic instructions [here](https://threebox.notion.site/Ceramic-Recon-instructions-EXTERNAL-c2b93b2648d64cf0af0f4d2489d20399).

Assuming we will all be operating on macs:

1. Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

2. Select node v20:

```bash
nvm install v20
nvm use v20
```

3. Install js-ceramic (with nighly builds):

```bash
npm install --location=global @ceramicnetwork/cli@nightly
```

4. Download Rust-Ceramic from binary distribution:

```bash
curl -LO https://github.com/ceramicnetwork/rust-ceramic/releases/download/v0.13.0/ceramic-one_aarch64-apple-darwin.tar.gz
tar zxvf ceramic-one_aarch64-apple-darwin.tar.gz
```

5. Open Finder, double click the `ceramic-one.pkg` file to start the install

6. After installation, copy the binary:

```bash
sudo cp /Applications/ceramic-one /usr/local/bin/
```

7. Start rust-ceramic (must be started first as js-ceramic needs the endpoint on startup):

```bash
ceramic-one daemon
```

8. Start js-ceramic with `CERAMIC_RECON_MODE` enabled and pointing to the rust-ceramic instance:

```bash
CERAMIC_RECON_MODE="true" ceramic daemon --ipfs-api http://localhost:5001
```

We now have our Ceramic node running on port 7007. In the following steps, we will deploy our composite onto our node.

## Configure Your Admin DID
In a new terminal in the same root directory as this repository, we can configure an admin DID our node will use in order to deploy our composites. Let's set an environment variable in order to do so:

```bash
nvm use 16
composedb did:generate-private-key
```

Use the result as an input into the next command:

```bash
composedb did:from-private-key "your key"
```

On your machine, go into the following directory off your root: `.ceramic`. In your daemon.config.json file, add the did you just added into the `admin-dids` array.

Back in the root directory of this repository you should now be able to deploy the existing composite we previously created previously by running:

```bash
composedb composite:deploy ./src/__generated__/definition.json --did-private-key "your key"
```

Finally, you can run a command (like the one below) to manually direct your new node to peer with another node running Rust-Ceramic that is also indexing the same models (this will likely require a manual reboot of that node):

```bash
curl -X POST "http://localhost:5001/api/v0/swarm/connect?arg=/ip4/207.246.126.105/tcp/4001/p2p/12D3KooWSNHeQAArDYenHMYsn13x9EkVyQ4jfLhZn6Z7WQ9YS9bq"
```

### Models Walk-Through

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
