import { tokens } from "./tokens";
import { tokenKeyToCssVar, sidebarKeyToCssVar } from "./utils";
import fs from "fs";
import path from "path";

function generateRoot(): string {
  const lines: string[] = [":root {"];

  for (const [key, value] of Object.entries(tokens.colors)) {
    lines.push(`  --${tokenKeyToCssVar(key)}: ${value};`);
  }

  for (const [key, value] of Object.entries(tokens.sidebar)) {
    lines.push(`  --${sidebarKeyToCssVar(key)}: ${value};`);
  }

  lines.push(`  --radius: ${tokens.radius};`);
  lines.push("}");
  return lines.join("\n");
}

const cssBlock = generateRoot();
const globalsPath = path.join(process.cwd(), "app", "globals.css");

const isCheck = process.argv.includes("--check");

if (isCheck) {
  const current = fs.readFileSync(globalsPath, "utf-8");
  if (!current.includes(cssBlock)) {
    console.error("❌ globals.css is out of sync with tokens.ts. Run: npm run tokens");
    process.exit(1);
  }
  console.log("✅ globals.css is in sync with tokens.ts");
} else {
  const current = fs.readFileSync(globalsPath, "utf-8");
  const updated = current.replace(/:root \{[\s\S]*?\}/, cssBlock);
  fs.writeFileSync(globalsPath, updated);
  console.log("✅ globals.css updated from tokens.ts");
}
