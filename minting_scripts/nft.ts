import { create, createCollection, fetchCollection } from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const collectionPublicKey = "BnTQ4FuUGn7tuuyjVKAH2YC18qEpbSGcWFTnWJo6cqe8"

async function createNFT() {
  const connection = new Connection(clusterApiUrl("devnet"));

  const user = await getKeypairFromFile("./my-wallet.json");

  const umi = createUmi(connection.rpcEndpoint);

  const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(umiUser));

  const collection = await fetchCollection(umi, collectionPublicKey);

  const assetAddress = generateSigner(umi);

  // Specify the recipient's public key here
  // const recipientPublicKey = "CBKDm2htKcB2o5dYRFs42E9UywQpho8b9MUmE6E5Z5kd";
  const recipientPublicKey = publicKey("CBKDm2htKcB2o5dYRFs42E9UywQpho8b9MUmE6E5Z5kd");

  const transaction2 = create(umi, {
    asset: assetAddress,
    collection: collection,
    owner: recipientPublicKey,  // Use the recipient's public key as the owner
    name: "Nico Iamaleava: TENN vs OSU",
    uri: "https://bafybeib6b6wryimgcpxqzus7pf6fqnl6y2k4ms63crkqtpgjauidgyp5sa.ipfs.w3s.link/nft.json",
  });

  await transaction2.sendAndConfirm(umi);
  console.log(`Asset Address: ${assetAddress.publicKey}`);
}

createNFT();
