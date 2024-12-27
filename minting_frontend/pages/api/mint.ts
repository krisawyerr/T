import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:8800/mint";

export default async function mintNFT(publicKey: string, nftName: string, nftUri: string) {
  try {
    const response = await axios.post(API_URL, {
      buyersPublicKey: publicKey,
      nftName: nftName,
      nftUri: nftUri
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
