export interface Poem {
  id: string;
  title: string;
  content: string;
}

const createBlankPoem = (id: string, title: string): Poem => ({
  id,
  title,
  content: "",
});

export const defaultPoems: Poem[] = [
  {
    id: "morning-light",
    title: "Morning light",
    content:
      "The sun peels back the eyelids of the sky,\nspilling gold across the kitchen tile.\nI hold my coffee like a prayer—\nwarm, familiar, full of waiting.\n\nOutside, the sparrows argue over crumbs.\nI envy how they fight for small things\nwithout apology.",
  },
  {
    id: "roots",
    title: "Roots",
    content:
      "My grandmother kept a garden\nthat outlived her by three summers.\nThe tomatoes didn't know she was gone.\n\nI pulled weeds in her honour,\ndirt beneath my nails like heirlooms,\nand thought about how love\nis sometimes just showing up\nwith a watering can.",
  },
  {
    id: "the-apartment",
    title: "The apartment",
    content:
      "We painted the walls eggshell white\nand called it a fresh start.\nBut the cracks still showed through\nby February.\n\nYou left your mug on the counter—\nI haven't moved it.\nSome things are too heavy\nfor how light they are.",
  },
  {
    id: "tides",
    title: "Tides",
    content:
      "The ocean doesn't ask permission\nto take things back.\nIt just reaches,\nand the shore lets go.\n\nI am learning\nto be the shore.",
  },
  {
    id: "unfinished-letter",
    title: "Unfinished letter",
    content:
      "Dear you,\n\nI started this six times.\nEach version kinder than the last,\neach one a little less true.\n\nWhat I mean to say is:\nI miss who I was\nwhen you were still looking.",
  },
  {
    id: "wildflowers",
    title: "Wildflowers",
    content:
      "They grow in the cracks of things—\nsidewalks, fences, the space\nbetween what happened\nand what we hoped for.\n\nNobody plants them.\nThat's the whole point.",
  },
  createBlankPoem("poem-7", "Untitled"),
  createBlankPoem("poem-8", "Untitled"),
  createBlankPoem("poem-9", "Untitled"),
  createBlankPoem("poem-10", "Untitled"),
  createBlankPoem("poem-11", "Untitled"),
  createBlankPoem("poem-12", "Untitled"),
  createBlankPoem("poem-13", "Untitled"),
  createBlankPoem("poem-14", "Untitled"),
];
