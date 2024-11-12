import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

interface SyncOptions {
  vault?: string;
  itemSuffix?: string;
  generateExample?: boolean;
}

function generateExampleContent(envContent: string): string {
  let isMultilineValue = false;
  let previousLineWasEmpty = false;

  return envContent
    .split("\n")
    .map((line) => {
      // コメント行はそのまま保持
      if (line.trim().startsWith("#")) {
        isMultilineValue = false;
        previousLineWasEmpty = false;
        return line;
      }

      // 空行の処理
      if (line.trim() === "") {
        isMultilineValue = false;
        if (previousLineWasEmpty) {
          return null; // 連続する空行は削除
        }
        previousLineWasEmpty = true;
        return line;
      }

      // キーと値を分離
      const [key, ...valueParts] = line.split("=");

      // マルチライン値の後続行は無視
      if (isMultilineValue) {
        return null;
      }

      previousLineWasEmpty = false;

      // マルチライン値の最初の行
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();

        // 値が引用符で囲まれている場合、マルチライン値と判断
        if (
          (value.startsWith('"') && !value.endsWith('"')) ||
          (value.startsWith("'") && !value.endsWith("'"))
        ) {
          isMultilineValue = true;
        }

        return `${key.trim()}=`;
      }

      return line;
    })
    .filter((line) => line !== null) // nullの行を削除
    .join("\n");
}

export async function syncEnv(
  mode: "push" | "pull",
  options: SyncOptions = {}
) {
  const vault = options.vault || "Private";
  const rootDir = path.basename(process.cwd());
  const itemSuffix = options.itemSuffix || "";
  const item = `[${rootDir}] .env${itemSuffix}`;

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
  const examplePath = path.resolve(process.cwd(), ".env.example");

  if (mode === "push") {
    const envContent = await fs.readFile(envPath, "utf-8");
    // Escape special characters
    const escapedContent = envContent
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    try {
      const editCommand = `op item edit "${item}" --vault "${vault}" env[text]="${escapedContent}"`;
      execSync(editCommand);
    } catch (error) {
      const createCommand = `op item create --category "Secure Note" --title "${item}" --vault "${vault}" env[text]="${escapedContent}"`;
      execSync(createCommand);
    }
    console.info("✅ Successfully saved .env file to 1Password");

    // Generate .env.example if option is set
    if (options.generateExample) {
      const exampleContent = generateExampleContent(envContent);
      await fs.writeFile(examplePath, exampleContent);
      console.info("✅ Successfully generated .env.example file");
    }
  } else if (mode === "pull") {
    // Get and save .env from 1Password
    const command = `op item get "${item}" --vault "${vault}" --field env`;
    const escapedContent = execSync(command)
      .toString()
      .trim()
      // Remove outer quotes
      .replace(/^"([\s\S]*)"$/, "$1");

    // Restore escaped characters (order matters)
    const envContent = escapedContent
      .replace(/\\\\/g, "\\") // 1. Restore backslashes
      .replace(/\\n/g, "\n") // 2. Restore newlines
      // 3. Fix double quotes in multiline values
      .replace(/""([^"]*(?:\n[^"]*)*)""(?=(?:[^"]*""[^"]*"")*[^"]*$)/g, '"$1"')
      .replace(/\\"/g, '"'); // 4. Restore remaining escaped quotes

    await fs.writeFile(envPath, envContent);
    console.info("✅ Successfully pulled .env file from 1Password");

    // Generate .env.example if option is set
    if (options.generateExample) {
      const exampleContent = generateExampleContent(envContent);
      await fs.writeFile(examplePath, exampleContent);
      console.info("✅ Successfully generated .env.example file");
    }
  }
}
