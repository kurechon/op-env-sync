import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

interface SyncOptions {
  vault?: string;
  itemPrefix?: string;
}

export async function syncEnv(
  mode: "push" | "pull",
  options: SyncOptions = {}
) {
  const vault = options.vault || "Private";
  const rootDir = path.basename(process.cwd());
  const itemPrefix = options.itemPrefix || "";
  const item = `${itemPrefix}[${rootDir}] .env`;

  // 1Passwordにサインインしているか確認
  try {
    execSync("op whoami", { stdio: "ignore" });
  } catch (error) {
    console.error("❌ 1Passwordにサインインしていません。");
    console.info("💡 `op signin` を実行してサインインしてください。");
    process.exit(1);
  }

  // .envファイルのパス
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
    console.info("✅ .envファイルを1Passwordに保存しました");
  } else if (mode === "pull") {
    // 1Passwordから.envを取得して保存
    const command = `op item get "${item}" --vault "${vault}" --field env`;
    const envContent = execSync(command).toString();
    await fs.writeFile(envPath, envContent);
    console.info("✅ 1Passwordから.envファイルを取得しました");
  }
}
