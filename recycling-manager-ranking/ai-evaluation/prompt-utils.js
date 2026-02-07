import fs from "fs";

const prompts = fs.readFileSync("./prompts.md", "utf-8");

export function buildPrompt(templateName, candidate) {
  const section = prompts.split(`## ${templateName}`)[1].split("##")[0];

  return section
    .replace("{{name}}", candidate.name)
    .replace("{{experience}}", candidate.experience)
    .replace("{{skills}}", candidate.skills.join(", "));
}
