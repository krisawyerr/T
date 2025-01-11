import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default async function mintNFT(publicKey: string, nftName: string, nftUri: string) {
  try {
    const response = await axios.post(`${apiUrl}/mint`, {
      buyersPublicKey: publicKey,
      nftName: nftName,
      nftUri: nftUri
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
