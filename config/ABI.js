export const ABI = [
  {
    type: "function",
    name: "mintPublic",
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "qty",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    selector: "0x9f93f779",
  },
  {
    type: "function",
    name: "mintPublic",
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "param2",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "param3",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
    selector: "0x9b4f3af5",
  },
  {
    type: "function",
    name: "mintAllowlist",
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "qty",
        type: "uint256",
      },
      {
        internalType: "bytes32[]",
        name: "proof",
        type: "bytes32[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct SetupConfig",
        components: [
          { name: "maxSupply", type: "uint256", internalType: "uint256" },
          { name: "walletLimit", type: "uint256", internalType: "uint256" },
          { name: "baseURI", type: "string", internalType: "string" },
          { name: "contractURI", type: "string", internalType: "string" },
          {
            name: "publicStage",
            type: "tuple",
            internalType: "struct PublicStage",
            components: [
              { name: "startTime", type: "uint256", internalType: "uint256" },
              { name: "endTime", type: "uint256", internalType: "uint256" },
              { name: "price", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "allowlistStage",
            type: "tuple",
            internalType: "struct AllowlistStage",
            components: [
              { name: "startTime", type: "uint256", internalType: "uint256" },
              { name: "endTime", type: "uint256", internalType: "uint256" },
              { name: "price", type: "uint256", internalType: "uint256" },
              { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
            ],
          },
          { name: "payoutRecipient", type: "address", internalType: "address" },
          {
            name: "royaltyRecipient",
            type: "address",
            internalType: "address",
          },
          { name: "royaltyBps", type: "uint96", internalType: "uint96" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct SetupConfig",
        components: [
          { name: "tokenId", type: "uint256", internalType: "uint256" },
          { name: "maxSupply", type: "uint256", internalType: "uint256" },
          { name: "walletLimit", type: "uint256", internalType: "uint256" },
          { name: "baseURI", type: "string", internalType: "string" },
          { name: "contractURI", type: "string", internalType: "string" },
          {
            name: "publicStage",
            type: "tuple",
            internalType: "struct PublicStage",
            components: [
              { name: "startTime", type: "uint256", internalType: "uint256" },
              { name: "endTime", type: "uint256", internalType: "uint256" },
              { name: "price", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "allowlistStage",
            type: "tuple",
            internalType: "struct AllowlistStage",
            components: [
              { name: "startTime", type: "uint256", internalType: "uint256" },
              { name: "endTime", type: "uint256", internalType: "uint256" },
              { name: "price", type: "uint256", internalType: "uint256" },
              { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
            ],
          },
          { name: "payoutRecipient", type: "address", internalType: "address" },
          {
            name: "royaltyRecipient",
            type: "address",
            internalType: "address",
          },
          { name: "royaltyBps", type: "uint96", internalType: "uint96" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
];

export default ABI;
