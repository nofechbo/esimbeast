import fs from "fs";
import path from "path";
import { SITE_NAME, SITE_EMAIL, SITE_URL } from "@/config";

const promptPath = path.join(process.cwd(), "lib", "chatPrompt.md");
const template = fs.readFileSync(promptPath, "utf-8");

export const SYSTEM_PROMPT = template
  .replace(/\{\{SITE_NAME\}\}/g, SITE_NAME)
  .replace(/\{\{SITE_EMAIL\}\}/g, SITE_EMAIL)
  .replace(/\{\{SITE_URL\}\}/g, SITE_URL);
