// Word lists the critique uses to read a poem's craft. Rough by design: they catch
// the common cases, and the critique quotes the lines it found them in.

export type Sense = "sight" | "sound" | "touch" | "smell" | "taste";

const list = (s: string) => s.trim().split(/\s+/);

// Concrete, sensory words, grouped by the sense they reach
export const sensoryWords: Record<Sense, Set<string>> = {
  sight: new Set(
    list(`light lights glow glowed glowing shine shining shadow shadows dark darkness bright gleam glint flicker flickering flame flames
      red green blue black white grey gray gold golden silver pale amber crimson scarlet color colour colors colours neon spark sparks
      moon moonlight sun sunlight sunrise sunset dawn dusk stars star sky skies cloud clouds smoke mirror mirrors glass window windows
      eyes eye face faces smile smiled tears tear blood veil dress lamp candle candles lightning rainbow fog mist haze
      glance glanced gaze stare stared watch watched flash flashed blinding dim sparkle shimmer surge current circuit electricity`),
  ),
  sound: new Set(
    list(`whisper whispered whispers sigh sighs sighed scream screamed cry cried echo echoes echoed silence silent quiet loud song songs
      sing sang singing hum humming ring rang ringing knock knocked crack cracked thunder roar roared laugh laughter laughed voice voices
      music beat rhythm hiss buzz crash shattered shatter clink click creak footsteps static radio guitar piano bell bells sound sounds
      speak spoke heard hear deafening`),
  ),
  touch: new Set(
    list(`cold warm warmth hot heat burn burned burning ice icy frozen freezing rough smooth soft hard sharp skin hand hands fingers finger
      touch touched hold held grasp grip lips kiss kissed bruise bruised wound wounds scar scars ache ached sweat rain wet dry wind breeze
      bed pillow sheets weight heavy stone stones iron steel glue punch punches embrace hug trembled tremble shiver shivered breath breathe`),
  ),
  smell: new Set(list(`smell smelled scent perfume smoke smoky iron rot rotten musk cologne flowers rose roses pine salt incense ash ashes sweat`)),
  taste: new Set(list(`taste tasted sweet bitter sour salt salty honey wine whiskey gin drink drinks drank glass coffee bread sugar blood tongue mouth`)),
};

// Concrete things a reader can picture (beyond the senses above)
export const concreteNouns = new Set(
  list(`room door doors floor wall walls ceiling house home bar street streets road car cars train bus phone phones letter letters
    bottle bottles cup table chair kitchen window bed cage bars key keys lock map dog dogs cat bird birds wolf clover tree trees leaf leaves
    flower flowers rose roses river ocean sea wave waves shore sand beach mountain mountains hill field fields city town bridge bridges
    church hospital cord cords hospital bed ring rings dress veil photo photograph clock watch coat jacket shoes boots hat book books page
    pen ink paper candle fire ash ashes smoke storm rain snow wind ice stone stones glass mirror knife gun blade chain chains heart hands
    eyes face mouth lips skin bones blood tears ghost grave casket cross crown throne mask garden seed seeds roots wings feather feathers
    nest web spider moon sun star stars sky night morning midnight dawn dusk winter summer autumn spring desert dust
    wire wires circuit switch spark sparks bottle bottles drinks glasses cigarette ashtray jukebox stool neon sign alley porch couch
    pillow blanket sheets mattress stairs hallway closet attic basement yard fence gate wall photo frame lighter match matches
    animal beast wolf lion cage bars clover leash collar shot shots veil`),
);

// Big, abstract words that are "made of air" unless something concrete carries them
export const abstractWords = new Set(
  list(`love hate pain sorrow sadness despair hope fear anger rage joy happiness misery grief loneliness emotion emotions feeling feelings
    soul fate destiny forever eternity reality truth lies lie deceit betrayal trust forgiveness regret desire passion beauty perfection
    life death existence purpose meaning freedom heaven hell evil good sin sins faith peace chaos agony suffering heartbreak heartache
    dismay resignation desperation negligence complacency fulfillment perpetuity continuity happiness sadness memory memories past future
    time affection devotion longing yearning`),
);

// Phrases worn smooth by overuse. Spotting them is half the work; rewriting them is the craft.
export const cliches: string[] = [
  "broken heart", "heart of stone", "tears fall", "tears fell", "tears streaming", "time and time again", "deep down", "end of the day",
  "meant to be", "last breath", "heart skipped a beat", "skipped a beat", "in the blink of an eye", "only time will tell", "time heals",
  "love is blind", "cold as ice", "dark as night", "light at the end of the tunnel", "head over heels", "made for each other",
  "my everything", "world fell apart", "fell apart", "shattered into pieces", "a million pieces", "pieces of my heart", "picked up the pieces",
  "lost in your eyes", "drowning in", "walls came down", "let it go", "move on", "the one that got away", "love of my life",
  "sweet nothings", "storm inside", "inner demons", "my demons", "darkest hour", "darkest nights", "darkest of nights", "fire in my soul",
  "piece of my heart", "stand the test of time", "stood the test of time", "against all odds", "once in a lifetime", "on cloud nine",
  "butterflies in my stomach", "head in the clouds", "cross my heart", "with all my heart", "from the bottom of my heart",
  "never be the same", "never the same", "nothing lasts forever", "all good things", "lit up the room", "you complete me",
  "a perfect world", "in a perfect world", "if only", "deafening silence", "silence is deafening", "my silence has been deafening",
  "time stood still", "frozen in time", "the calm before the storm", "a match made in heaven", "the apple of my eye",
  "count the days", "counting the days", "night after night", "day after day", "all i ever wanted", "with open arms",
];

// Words that pad a line without adding meaning
export const fillerWords = new Set(list(`very really just so truly totally simply actually literally basically quite rather somewhat`));

// Telling instead of showing: naming a feeling outright
export const tellingPatterns: RegExp[] = [
  /\bi (feel|felt|am|was|'m) (so )?(sad|happy|lonely|alone|angry|hurt|broken|lost|empty|numb|scared|afraid|depressed|heartbroken)\b/i,
  /\bit (hurts|hurt)\b/i,
  /\bmade me (feel|sad|happy|cry)\b/i,
];

// Images that carry meaning across poetry: when one returns in a poem, it starts to work as a symbol
export const archetypalSymbols: Record<string, string> = {
  mirror: "self-image", shadow: "the hidden self", shadows: "the hidden self", night: "despair or mystery", dark: "the unknown",
  darkness: "the unknown", light: "hope or truth", fire: "passion or destruction", flame: "passion", storm: "turmoil",
  rain: "grief or renewal", sea: "the vast or unknowable", ocean: "the vast or unknowable", river: "time passing", road: "life's path",
  door: "a threshold", key: "access or answers", keys: "access", lock: "what's withheld", cage: "confinement", bars: "confinement",
  wolf: "the wild self", monster: "the feared self", glass: "fragility or escape", bottle: "escape", clover: "luck", rose: "love",
  roses: "love", heart: "love", crown: "power", mask: "a false self", ghost: "the past", grave: "loss", winter: "loss or dormancy",
  spring: "rebirth", dawn: "new beginnings", home: "belonging", bridge: "connection", bridges: "connection", veil: "marriage or concealment",
  dress: "marriage", ring: "commitment", star: "guidance or longing", stars: "longing", moon: "longing", wings: "freedom", chain: "bondage",
  chains: "bondage", ash: "what remains", ashes: "what remains", blood: "family or violence", electricity: "attraction", current: "attraction",
};

export const stopWords = new Set(
  list(`a an and are as at be been but by can could did do does for from had has have he her his how i i'd i'll i'm i've if in into is it
    it's its just like me my no not now of on once one or our out she so some than that the their them then there they this to too up us
    was we were what when where which while who why will with would you you're your yet all am any being cause each even ever got let
    made more much must never only own same should since such these those through under very what's me myself himself herself`),
);
