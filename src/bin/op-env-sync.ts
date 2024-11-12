#!/usr/bin/env node
import { Command } from "commander";
import { syncEnv } from "../index";

const program = new Command();

program
  .name("op-env-sync")
  .description("CLI tool to sync .env files with 1Password")
  .version("0.1.0");

program
  .command("push")
  .description("Save local .env file to 1Password")
  .option("-v, --vault <vault>", "1Password vault name", "Private")
  .option("-s, --suffix <suffix>", "Item name suffix", "")
  .option("-e, --example", "Generate .env.example file with keys only")
  .action(async (options) => {
    try {
      await syncEnv("push", {
        vault: options.vault,
        itemSuffix: options.suffix,
        generateExample: options.example,
      });
    } catch (error) {
      console.error("❌ An error occurred:", error);
      process.exit(1);
    }
  });

program
  .command("pull")
  .description("Get .env file from 1Password")
  .option("-v, --vault <vault>", "1Password vault name", "Private")
  .option("-s, --suffix <suffix>", "Item name suffix", "")
  .option("-e, --example", "Generate .env.example file with keys only")
  .action(async (options) => {
    try {
      await syncEnv("pull", {
        vault: options.vault,
        itemSuffix: options.suffix,
        generateExample: options.example,
      });
    } catch (error) {
      console.error("❌ An error occurred:", error);
      process.exit(1);
    }
  });

program.parse();
