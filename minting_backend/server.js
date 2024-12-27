import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { create, createCollection, fetchCollection } from "@metaplex-foundation/mpl-core";
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: ['POST'], 
    allowedHeaders: ['Content-Type'], 
};

app.use(cors(corsOptions)); 
app.use(cookieParser());
app.use(express.json()); 
app.use(bodyParser.json()); 

app.post('/mint', (req, res) => {
    const { buyersPublicKey, nftName, nftUri } = req.body;

    const collectionPublicKey = process.env.COLLECTION_ADDRESS

    async function createNFT() {
        const connection = new Connection(clusterApiUrl("devnet"));

        const user = await getKeypairFromFile("./my-wallet.json");

        const umi = createUmi(connection.rpcEndpoint);

        const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
        umi.use(keypairIdentity(umiUser));

        const collection = await fetchCollection(umi, collectionPublicKey);

        const assetAddress = generateSigner(umi);

        const recipientPublicKey = publicKey(buyersPublicKey);

        const transaction2 = create(umi, {
            asset: assetAddress,
            collection: collection,
            owner: recipientPublicKey,  
            name: nftName,
            uri: nftUri,
        });

        await transaction2.sendAndConfirm(umi);
        res.send(`Asset Address: ${assetAddress.publicKey}`);
        console.log("NFT just purchased!")
    }

    createNFT();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
