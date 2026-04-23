import {
  initiateDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");

// Read existing .env to get API key and entity secret
const envContent = fs.readFileSync(envPath, "utf-8");
const envLines = envContent.split("\n");
const getEnv = (key) => {
  const line = envLines.find(l => l.startsWith(`${key}=`));
  return line ? line.split("=")[1].trim() : null;
};

const API_KEY = getEnv("CIRCLE_API_KEY");
const ENTITY_SECRET = getEnv("CIRCLE_ENTITY_SECRET");

// Use existing wallet set ID from your previous run
const WALLET_SET_ID = "9c96d6d5-7aac-56ff-bbf7-b5ecd30fc06c";

if (!API_KEY || !ENTITY_SECRET) {
  console.error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env");
  process.exit(1);
}

const client = initiateDeveloperControlledWalletsClient({
  apiKey: API_KEY,
  entitySecret: ENTITY_SECRET,
});

const AGENTS = [
  { name: "CodeAgent", envPrefix: "CODE_AGENT" },
  { name: "DataAgent", envPrefix: "DATA_AGENT" },
  { name: "WriterAgent", envPrefix: "WRITER_AGENT" },
  { name: "Treasury", envPrefix: "TREASURY" },
];

console.log("Creating 4 agent wallets on Arc Testnet...\n");

for (const agent of AGENTS) {
  try {
    const response = await client.createWallets({
      walletSetId: WALLET_SET_ID,
      blockchains: ["ARC-TESTNET"],
      count: 1,
      accountType: "EOA",
      metadata: [{ name: agent.name, refId: agent.name.toLowerCase() }],
    });

    const wallet = response.data?.wallets?.[0];
    if (!wallet) {
      console.error(`Failed to create wallet for ${agent.name}`);
      continue;
    }

    console.log(`✅ ${agent.name}`);
    console.log(`   ID:      ${wallet.id}`);
    console.log(`   Address: ${wallet.address}`);
    console.log();

    // Append to .env
    fs.appendFileSync(
      envPath,
      `${agent.envPrefix}_WALLET_ID=${wallet.id}\n${agent.envPrefix}_ADDRESS=${wallet.address}\n`
    );
  } catch (err) {
    console.error(`Error creating ${agent.name}:`, err.message);
  }
}

console.log("Done! Wallet IDs and addresses saved to .env");
console.log("\nNEXT: Fund each address at https://faucet.circle.com");
