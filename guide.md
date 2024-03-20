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

### Next Steps



