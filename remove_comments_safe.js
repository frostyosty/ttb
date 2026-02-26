// ./remove_comments_safe.js 


import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import generate from "@babel/generator";

const ROOT_DIR = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build"]);

function normalizeBlankLines(code) {

  return code.replace(/\n\s*\n+/g, "\n\n");
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");

  let ast;
  try {
    ast = parser.parse(original, {
      sourceType: "unambiguous",
      plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "dynamicImport",
      "optionalChaining",
      "nullishCoalescingOperator"],

      tokens: true
    });
  } catch {
    console.warn(`Skipping (parse error): ${filePath}`);
    return;
  }

  ast.comments = [];

  let output = generate.default(
    ast,
    {
      comments: false,
      retainLines: true
    },
    original
  ).code;

  output = normalizeBlankLines(output);

  if (output !== original) {
    fs.writeFileSync(filePath, output, "utf8");
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
    } else if (
    entry.isFile() && (
    entry.name.endsWith(".js") || entry.name.endsWith(".jsx")))
    {
      processFile(path.join(dir, entry.name));
    }
  }
}

walk(ROOT_DIR);
console.log("Done. Comments removed and blank lines normalized.");