// Poets in the classics library. Only poets who died before 1929 are included,
// so everything they wrote is in the public domain and can sit on the shelf.

export interface LibraryPoet {
  name: string;
  // How PoetryDB matches the poet (partial match on the author field)
  query: string;
}

export const libraryPoets: LibraryPoet[] = [
  { name: "Emily Dickinson", query: "Emily Dickinson" },
  { name: "William Shakespeare", query: "William Shakespeare" },
  { name: "John Keats", query: "John Keats" },
  { name: "Percy Bysshe Shelley", query: "Percy Bysshe Shelley" },
  { name: "Lord Byron", query: "Byron" },
  { name: "Edgar Allan Poe", query: "Edgar Allan Poe" },
  { name: "Walt Whitman", query: "Walt Whitman" },
  { name: "William Blake", query: "William Blake" },
  { name: "William Wordsworth", query: "William Wordsworth" },
  { name: "Robert Burns", query: "Robert Burns" },
  { name: "Christina Rossetti", query: "Christina Rossetti" },
  { name: "Elizabeth Barrett Browning", query: "Elizabeth Barrett Browning" },
  { name: "Robert Browning", query: "Robert Browning" },
  { name: "Alfred, Lord Tennyson", query: "Tennyson" },
  { name: "Samuel Taylor Coleridge", query: "Samuel Taylor Coleridge" },
  { name: "John Donne", query: "John Donne" },
  { name: "Andrew Marvell", query: "Andrew Marvell" },
  { name: "Robert Herrick", query: "Robert Herrick" },
  { name: "Gerard Manley Hopkins", query: "Gerard Manley Hopkins" },
  { name: "Paul Laurence Dunbar", query: "Paul Laurence Dunbar" },
  { name: "Henry Wadsworth Longfellow", query: "Henry Wadsworth Longfellow" },
  { name: "Ella Wheeler Wilcox", query: "Ella Wheeler Wilcox" },
  { name: "William Ernest Henley", query: "Henley" },
  { name: "Matthew Arnold", query: "Matthew Arnold" },
  { name: "Thomas Hardy", query: "Thomas Hardy" },
  { name: "Oscar Wilde", query: "Oscar Wilde" },
  { name: "Emily Brontë", query: "Emily Bronte" },
  { name: "Wilfred Owen", query: "Wilfred Owen" },
  { name: "Ralph Waldo Emerson", query: "Ralph Waldo Emerson" },
  { name: "John Milton", query: "John Milton" },
];

export const isLibraryPoet = (author: string): boolean => {
  const a = author.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return libraryPoets.some((p) => a.includes(p.query.toLowerCase()));
};

export interface StarterPick {
  title: string;
  poet: string; // must match a libraryPoets query
  why: string;
}

// A first handful worth reading, leaning toward love, loss and family
export const starterPicks: StarterPick[] = [
  { title: "Sonnet 18", poet: "William Shakespeare", why: "Love that outlives the summer" },
  { title: "Sonnet 116", poet: "William Shakespeare", why: "Love that doesn't bend" },
  { title: "Sonnet 29", poet: "William Shakespeare", why: "Down and out, then remembering her" },
  { title: "She Walks In Beauty", poet: "Byron", why: "Seeing her across the room" },
  { title: "When We Two Parted", poet: "Byron", why: "The quiet after it ends" },
  { title: "Annabel Lee", poet: "Edgar Allan Poe", why: "Love past the grave" },
  { title: "The Raven", poet: "Edgar Allan Poe", why: "Grief knocking at midnight" },
  { title: "Bright Star", poet: "John Keats", why: "Wanting to stay in one moment" },
  { title: "Ozymandias", poet: "Percy Bysshe Shelley", why: "Everything fades" },
  { title: "Love's Philosophy", poet: "Percy Bysshe Shelley", why: "Why not us?" },
  { title: "Hope", poet: "Emily Dickinson", why: "The thing with feathers" },
  { title: "Because I could not stop for Death", poet: "Emily Dickinson", why: "Death as a gentleman caller" },
  { title: "Remember", poet: "Christina Rossetti", why: "Letting someone go gently" },
  { title: "How Do I Love Thee", poet: "Elizabeth Barrett Browning", why: "Counting the ways" },
  { title: "A Red, Red Rose", poet: "Robert Burns", why: "Devotion, plain and simple" },
  { title: "Crossing the Bar", poet: "Tennyson", why: "Facing the end calmly" },
  { title: "Invictus", poet: "Henley", why: "Unconquerable, after the worst" },
  { title: "Solitude", poet: "Ella Wheeler Wilcox", why: "Laugh, and the world laughs with you" },
  { title: "We Wear the Mask", poet: "Paul Laurence Dunbar", why: "The face we show the world" },
  { title: "Sympathy", poet: "Paul Laurence Dunbar", why: "Why the caged bird sings" },
  { title: "A Poison Tree", poet: "William Blake", why: "Anger that grows when it's kept" },
  { title: "The Tyger", poet: "William Blake", why: "Fearful symmetry" },
  { title: "Dover Beach", poet: "Matthew Arnold", why: "Holding on to each other" },
  { title: "O Captain! My Captain!", poet: "Walt Whitman", why: "Losing the one who led you" },
  { title: "I Wandered Lonely As A Cloud", poet: "William Wordsworth", why: "A memory that comes back" },
  { title: "Death, be not proud", poet: "John Donne", why: "Staring death down" },
  { title: "To His Coy Mistress", poet: "Andrew Marvell", why: "Time's winged chariot" },
  { title: "No coward soul is mine", poet: "Emily Bronte", why: "Faith under pressure" },
];
