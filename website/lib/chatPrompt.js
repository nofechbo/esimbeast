import fs from "fs";
import path from "path";
import { SITE_NAME, SITE_EMAIL, SITE_URL } from "@/config";

const personaPath = path.join(process.cwd(), "lib", "chatPersona.md");
const faqPath = path.join(process.cwd(), "lib", "chatFAQ.md");

const rulesPath = path.join(process.cwd(), "lib", "chatRules.md");

const persona = fs.readFileSync(personaPath, "utf-8");
const faq = fs.readFileSync(faqPath, "utf-8");
const rules = fs.readFileSync(rulesPath, "utf-8");

const template = `${persona}\n\n${faq}\n\n${rules}`;

export const SYSTEM_PROMPT = template
  .replace(/\{\{SITE_NAME\}\}/g, SITE_NAME)
  .replace(/\{\{SITE_EMAIL\}\}/g, SITE_EMAIL)
  .replace(/\{\{SITE_URL\}\}/g, SITE_URL);
