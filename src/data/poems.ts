export interface Poem {
  id: string;
  title: string;
  lines: string[];
  color: "pink" | "green";
}

export const poems: Poem[] = [
  {
    id: "morning-light",
    title: "Morning light",
    color: "pink",
    lines: [
      "The sun peels back the eyelids of the sky,",
      "spilling gold across the kitchen tile.",
      "I hold my coffee like a prayer—",
      "warm, familiar, full of waiting.",
      "",
      "Outside, the sparrows argue over crumbs.",
      "I envy how they fight for small things",
      "without apology.",
    ],
  },
  {
    id: "roots",
    title: "Roots",
    color: "green",
    lines: [
      "My grandmother kept a garden",
      "that outlived her by three summers.",
      "The tomatoes didn't know she was gone.",
      "",
      "I pulled weeds in her honour,",
      "dirt beneath my nails like heirlooms,",
      "and thought about how love",
      "is sometimes just showing up",
      "with a watering can.",
    ],
  },
  {
    id: "the-apartment",
    title: "The apartment",
    color: "pink",
    lines: [
      "We painted the walls eggshell white",
      "and called it a fresh start.",
      "But the cracks still showed through",
      "by February.",
      "",
      "You left your mug on the counter—",
      "I haven't moved it.",
      "Some things are too heavy",
      "for how light they are.",
    ],
  },
  {
    id: "tides",
    title: "Tides",
    color: "green",
    lines: [
      "The ocean doesn't ask permission",
      "to take things back.",
      "It just reaches,",
      "and the shore lets go.",
      "",
      "I am learning",
      "to be the shore.",
    ],
  },
  {
    id: "unfinished-letter",
    title: "Unfinished letter",
    color: "pink",
    lines: [
      "Dear you,",
      "",
      "I started this six times.",
      "Each version kinder than the last,",
      "each one a little less true.",
      "",
      "What I mean to say is:",
      "I miss who I was",
      "when you were still looking.",
    ],
  },
  {
    id: "wildflowers",
    title: "Wildflowers",
    color: "green",
    lines: [
      "They grow in the cracks of things—",
      "sidewalks, fences, the space",
      "between what happened",
      "and what we hoped for.",
      "",
      "Nobody plants them.",
      "That's the whole point.",
    ],
  },
];
