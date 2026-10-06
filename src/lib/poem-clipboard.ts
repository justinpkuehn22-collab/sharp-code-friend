import type { Poem } from "@/data/poems";

const separator = "\n\n* * *\n\n";

export const poemToText = (poem: Pick<Poem, "title" | "content">): string =>
  `${poem.title.trim()}\n\n${poem.content.trim()}\n\n— JK`;

export const poemsToText = (poems: Poem[]): string =>
  poems
    .filter((p) => p.content.trim() !== "")
    .map(poemToText)
    .join(separator);

// Turns pasted text back into poems (title on the first line, the rest is the poem)
export const textToPoems = (text: string): Array<Pick<Poem, "title" | "content">> =>
  text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\*\s*\*\s*\*\s*\n/)
    .map((block) => block.trim().replace(/\n*—\s*JK\s*$/, "").trim())
    .filter((block) => block !== "")
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      return { title: first.trim() || "Untitled", content: rest.join("\n").trim() };
    });

export const copyText = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};
