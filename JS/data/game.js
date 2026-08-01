export const games = [
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    publisher: "Moonton",
    initials: "ML",
    description:
      "Choose a diamond package and enter your Mobile Legends account details.",
    accountFields: [
      {
        name: "userId",
        label: "User ID",
        placeholder: "Example: 12345678",
      },
      {
        name: "serverId",
        label: "Server ID",
        placeholder: "Example: 1234",
      },
    ],
    products: [
      {
        id: "ml-86",
        name: "86 Diamonds",
        price: 25000,
      },
      {
        id: "ml-172",
        name: "172 Diamonds",
        price: 48000,
      },
      {
        id: "ml-257",
        name: "257 Diamonds",
        price: 70000,
      },
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    initials: "VL",
    description:
      "Select a Valorant Points package for your Riot Games account.",
    accountFields: [
      {
        name: "riotId",
        label: "Riot ID",
        placeholder: "Example: PlayerName",
      },
      {
        name: "tagline",
        label: "Tagline",
        placeholder: "Example: SEA",
      },
    ],
    products: [
      {
        id: "val-420",
        name: "420 VP",
        price: 50000,
      },
      {
        id: "val-700",
        name: "700 VP",
        price: 80000,
      },
      {
        id: "val-1375",
        name: "1375 VP",
        price: 150000,
      },
    ],
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    publisher: "HoYoverse",
    initials: "GI",
    description:
      "Purchase Genesis Crystals for your Genshin Impact account.",
    accountFields: [
      {
        name: "uid",
        label: "UID",
        placeholder: "Example: 800123456",
      },
      {
        name: "server",
        label: "Server",
        placeholder: "Example: Asia",
      },
    ],
    products: [
      {
        id: "gi-60",
        name: "60 Genesis Crystals",
        price: 16000,
      },
      {
        id: "gi-330",
        name: "300 + 30 Genesis Crystals",
        price: 79000,
      },
      {
        id: "gi-1090",
        name: "980 + 110 Genesis Crystals",
        price: 239000,
      },
    ],
  },
];

export function findGameById(gameId) {
  return games.find((game) => game.id === gameId);
}