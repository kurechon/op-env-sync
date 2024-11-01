#!/usr/bin/env node
import { Command } from "commander";
import { syncEnv } from "../index";

const program = new Command();

program
  .name("op-env-sync")
  .description("1Passwordと.envファイルを同期するCLIツール")
  .version("0.1.0");

program
  .command("push")
  .description("ローカルの.envファイルを1Passwordに保存します")
  .option("-v, --vault <vault>", "1Passwordのボールト名", "Private")
  .option("-p, --prefix <prefix>", "アイテム名のプレフィックス", "")
  .action(async (options) => {
    try {
      await syncEnv("push", {
        vault: options.vault,
        itemPrefix: options.prefix,
      });
    } catch (error) {
      console.error("❌ エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("pull")
  .description("1Passwordから.envファイルを取得します")
  .option("-v, --vault <vault>", "1Passwordのボールト名", "Private")
  .option("-p, --prefix <prefix>", "アイテム名のプレフィックス", "")
  .action(async (options) => {
    try {
      await syncEnv("pull", {
        vault: options.vault,
        itemPrefix: options.prefix,
      });
    } catch (error) {
      console.error("❌ エラーが発生しました:", error);
      process.exit(1);
    }
  });

program.parse();
