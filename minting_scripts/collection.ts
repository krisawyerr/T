import { create, createCollection} from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";

async function createNFTCollection() {
  const connection = new Connection(clusterApiUrl("devnet"));

  const user = await getKeypairFromFile("./my-wallet.json");

  const umi = createUmi(connection.rpcEndpoint);

  const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(umiUser));

  const collectionAddress = generateSigner(umi);

  const transaction = createCollection(umi, {
    collection: collectionAddress,
    name: "Team Toa Highlights",
    uri: "https://bafybeiafmfuaysgrbu357cgk4bu74iam3nqjopeycfppvnmsr26xovkbau.ipfs.w3s.link/collection.json",
  });
  await transaction.sendAndConfirm(umi);
  console.log(`Collection Address: ${collectionAddress.publicKey}`);
}

createNFTCollection();