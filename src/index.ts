import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

interface SyncOptions {
  vault?: string;
  itemSuffix?: string;
}

export async function syncEnv(
  mode: "push" | "pull",
  options: SyncOptions = {}
) {
  const vault = options.vault || "Private";
  const rootDir = path.basename(process.cwd());
  const itemSuffix = options.itemSuffix || "";
  const item = `[${rootDir}]${itemSuffix} .env`;

  // Check if signed in to 1Password
  try {
    execSync("op whoami", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ Not signed in to 1Password.");
    console.info("💡 Please run `eval $(op signin)` to sign in.");
    process.exit(1);
  }

  // Path to .env file
  const envPath = path.resolve(process.cwd(), ".env");

  if (mode === "push") {
    const envContent = await fs.readFile(envPath, "utf-8");

    try {
      const editCommand = `op item edit "${item}" --vault "${vault}" env[text]="${envContent.replace(
        /"/g,
        '\\"'
      )}"`;
      execSync(editCommand);
    } catch (error) {
      const createCommand = `op item create --category "Secure Note" --title "${item}" --vault "${vault}" env[text]="${envContent.replace(
        /"/g,
        '\\"'
      )}"`;
      execSync(createCommand);
    }
    console.info("✅ Successfully saved .env file to 1Password");
  } else if (mode === "pull") {
    // Get and save .env from 1Password
    const command = `op item get "${item}" --vault "${vault}" --field env`;
    const envContent = execSync(command).toString();
    await fs.writeFile(envPath, envContent);
    console.info("✅ Successfully pulled .env file from 1Password");
  }
}
