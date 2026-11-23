import type { Mood } from "@/data/poems";

export interface WritingPrompt {
  id: string;
  mood: Mood;
  prompt: string;
}

// Original prompts, grouped by the same moods poems can be tagged with
export const writingPrompts: WritingPrompt[] = [
  // Love
  { id: "love-small", mood: "love", prompt: "Write about the smallest thing someone did that told you they loved you." },
  { id: "love-kitchen", mood: "love", prompt: "Describe an ordinary Tuesday with the person you love, and make it feel like a holiday." },
  { id: "love-future", mood: "love", prompt: "Write a letter to the person you haven't met yet." },
  { id: "love-voice", mood: "love", prompt: "Write about the way someone says your name." },
  { id: "love-proof", mood: "love", prompt: "List the evidence, like a lawyer, that love is real." },

  // Heartbreak
  { id: "heart-object", mood: "heartbreak", prompt: "Write about one object they left behind and why you haven't moved it." },
  { id: "heart-song", mood: "heartbreak", prompt: "Write about a song you can't listen to anymore, without naming the song." },
  { id: "heart-version", mood: "heartbreak", prompt: "Write to the version of yourself from the night it ended." },
  { id: "heart-forgive", mood: "heartbreak", prompt: "Write the forgiveness you'll never send." },

  // Anger
  { id: "anger-fire", mood: "anger", prompt: "Write about what your anger is protecting." },
  { id: "anger-calm", mood: "anger", prompt: "Write the moment just before you lose your temper, in slow motion." },
  { id: "anger-fuel", mood: "anger", prompt: "Write about something that made you angry enough to change your life." },

  // Grief
  { id: "grief-dog", mood: "grief", prompt: "Write about a habit you still have because of someone who's gone." },
  { id: "grief-room", mood: "grief", prompt: "Describe a room after someone has left it for the last time." },
  { id: "grief-talk", mood: "grief", prompt: "Write the conversation you'd have if you got one more hour." },
  { id: "grief-anniv", mood: "grief", prompt: "Write about a date on the calendar that hits differently now." },

  // Hope
  { id: "hope-morning", mood: "hope", prompt: "Write about the first good morning after a long bad stretch." },
  { id: "hope-ten", mood: "hope", prompt: "Write to yourself ten years from now. What do you hope he's proud of?" },
  { id: "hope-desert", mood: "hope", prompt: "Write about something that grows in the desert anyway." },
  { id: "hope-win", mood: "hope", prompt: "Write about a small win nobody else noticed." },
  { id: "hope-light", mood: "hope", prompt: "Write about the light coming back, literally or not." },

  // Longing
  { id: "long-city", mood: "longing", prompt: "Write about a city you miss and what you'd do on your first night back." },
  { id: "long-almost", mood: "longing", prompt: "Write about something that almost happened." },
  { id: "long-text", mood: "longing", prompt: "Write the text you typed and deleted." },
  { id: "long-road", mood: "longing", prompt: "Write about a long drive at night and who you were thinking about." },

  // Reflection
  { id: "ref-mirror", mood: "reflection", prompt: "Write about who you were at 18, and one thing you'd tell him." },
  { id: "ref-lesson", mood: "reflection", prompt: "Write about a lesson you learned the hard way, then learned again." },
  { id: "ref-work", mood: "reflection", prompt: "Write about the grind: the calls, the hustle, what it's really for." },
  { id: "ref-scar", mood: "reflection", prompt: "Write the story behind a scar, seen or unseen." },
  { id: "ref-quiet", mood: "reflection", prompt: "Write about what you hear when everything goes quiet." },

  // Family
  { id: "fam-hands", mood: "family", prompt: "Write about your mother's or father's hands." },
  { id: "fam-table", mood: "family", prompt: "Describe the dinner table you grew up at, and who sat where." },
  { id: "fam-sister", mood: "family", prompt: "Write about a sibling who showed up when it mattered." },
  { id: "fam-name", mood: "family", prompt: "Write about what your last name means to you now." },
  { id: "fam-kids", mood: "family", prompt: "Write what you'd want your future kids to know about you." },
  { id: "fam-pet", mood: "family", prompt: "Write about a pet who was really family." },
];
