// Fail when a tracked Markdown file or llms.txt links to a missing relative path.
const { execFileSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const { dirname, join } = require("node:path");
const files = execFileSync("git", ["ls-files", "*.md", "llms.txt"], { encoding: "utf8" }).split("\n").filter(Boolean);
const broken = [];
for (const file of files) {
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (path && !existsSync(join(dirname(file), path))) broken.push(`${file}: ${target}`);
  }
}
console.log(`checked ${files.length} files`);
if (broken.length) { console.error("broken relative links:\n" + broken.join("\n")); process.exit(1); }
