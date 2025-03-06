import { get, post } from "../core/http.js";

const API_BASE_URL = "https://api-mainnet.magiceden.io";

export const quoteMintData = async (
  nftContract,
  wallet,
  chain = "monad-testnet",
  nftAmount = 1,
  tokenId = 0
) => {
  const payload = {
    chain,
    collectionId: nftContract,
    kind: "public",
    nftAmount,
    protocol: "ERC1155",
    tokenId,
    wallet: { address: wallet, chain },
    address: wallet,
  };

  return post(`${API_BASE_URL}/v4/self_serve/nft/mint_token`, payload);
};

export const getAvailableMints = async (
  chain = "monad-testnet",
  period = "1h",
  limit = 200
) => {
  const url = `${API_BASE_URL}/v3/rtp/${chain}/collections/trending-mints/v1?period=${period}&type=any&limit=${limit}&useNonFlaggedFloorAsk=true`;
  return get(url);
};

export default {
  quoteMintData,
  getAvailableMints,
};
