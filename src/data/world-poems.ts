// Poems from around the world, each shown in its own language and in English.
// Originals were checked against Wikisource and Ganjoor (the Persian poetry archive).
// Every original is long out of copyright. Where a translation from before 1929 exists
// and was checked (Tagore's own, Pound's), it is credited; the rest were translated
// for the poetry room, line by line, staying close to the original.

export type WorldRegion = "East Asia" | "South Asia" | "Middle East" | "Europe" | "The Americas" | "Ancient world";

export interface WorldPoem {
  id: string;
  title: string; // English title
  originalTitle: string;
  poet: string;
  poetOriginal: string;
  dates: string; // the poet's life, or the poem's era
  place: string;
  region: WorldRegion;
  language: string;
  lang: string; // BCP-47, for fonts and screen readers
  rtl?: boolean;
  original: string;
  romanization?: string; // for scripts that aren't Latin
  translation: string;
  translator: string;
  note: string; // a little history
  source: string; // where the original text was checked
}

const ours = "Translated for the poetry room";

export const worldPoems: WorldPoem[] = [
  // East Asia
  {
    id: "li-bai-quiet-night",
    title: "Quiet Night Thought",
    originalTitle: "靜夜思",
    poet: "Li Bai",
    poetOriginal: "李白",
    dates: "701–762",
    place: "Tang dynasty China",
    region: "East Asia",
    language: "Chinese",
    lang: "zh-Hant",
    original: `牀前明月光，
疑是地上霜。
舉頭望明月，
低頭思故鄉。`,
    romanization: `Chuáng qián míng yuè guāng,
yí shì dì shàng shuāng.
Jǔ tóu wàng míng yuè,
dī tóu sī gù xiāng.`,
    translation: `Before my bed, the bright moonlight.
I take it for frost upon the ground.
I lift my head and gaze at the bright moon,
I lower my head and think of home.`,
    translator: ours,
    note: "Probably the most memorised poem in China; children learn it before they can read. The oldest editions say “mountain moon” where the famous version says “bright moon”.",
    source: "Wikisource (Three Hundred Tang Poems)",
  },
  {
    id: "li-bai-river-merchant",
    title: "The River-Merchant's Wife: A Letter",
    originalTitle: "長干行",
    poet: "Li Bai",
    poetOriginal: "李白",
    dates: "701–762",
    place: "Tang dynasty China",
    region: "East Asia",
    language: "Chinese",
    lang: "zh-Hant",
    original: `妾髮初覆額，折花門前劇。
郎騎竹馬來，遶牀弄青梅。
同居長干里，兩小無嫌猜。
十四爲君婦，羞顏未嘗開。
低頭向暗壁，千喚不一回。
十五始展眉，願同塵與灰。
常存抱柱信，豈上望夫臺。
十六君遠行，瞿塘灩澦堆。
五月不可觸，猿聲天上哀。
門前遲行跡，一一生綠苔。
苔深不能掃，落葉秋風早。
八月胡蝶來，雙飛西園草。
感此傷妾心，坐愁紅顏老。
早晚下三巴，預將書報家。
相迎不道遠，直至長風沙。`,
    translation: `While my hair was still cut straight across my forehead
I played about the front gate, pulling flowers.
You came by on bamboo stilts, playing horse;
You walked about my seat, playing with blue plums.
And we went on living in the village of Chokan:
Two small people, without dislike or suspicion.

At fourteen I married My Lord you.
I never laughed, being bashful.
Lowering my head, I looked at the wall.
Called to, a thousand times, I never looked back.

At fifteen I stopped scowling,
I desired my dust to be mingled with yours
Forever and forever and forever.
Why should I climb the lookout?

At sixteen you departed,
You went into far Ku-to-en, by the river of swirling eddies,
And you have been gone five months.
The monkeys make sorrowful noise overhead.
You dragged your feet when you went out.
By the gate now, the moss is grown, the different mosses,
Too deep to clear them away!
The leaves fall early this autumn, in wind.
The paired butterflies are already yellow with August
Over the grass in the West garden —
They hurt me.
I grow older.
If you are coming down through the narrows of the river,
Please let me know beforehand,
And I will come out to meet you
As far as Cho-fo-Sa.`,
    translator: "Ezra Pound, Cathay (1915)",
    note: "Pound knew no Chinese. He worked from a scholar's notes that gave the place names in their Japanese readings, which is why Changgan became “Chokan”. His version helped launch modern poetry in English.",
    source: "Wikisource (original and Pound's Cathay)",
  },
  {
    id: "du-fu-spring-view",
    title: "Spring View",
    originalTitle: "春望",
    poet: "Du Fu",
    poetOriginal: "杜甫",
    dates: "712–770",
    place: "Tang dynasty China",
    region: "East Asia",
    language: "Chinese",
    lang: "zh-Hant",
    original: `國破山河在，
城春草木深。
感時花濺淚，
恨別鳥驚心。
烽火連三月，
家書抵萬金。
白頭搔更短，
渾欲不勝簪。`,
    romanization: `Guó pò shān hé zài,
chéng chūn cǎo mù shēn.
Gǎn shí huā jiàn lèi,
hèn bié niǎo jīng xīn.
Fēng huǒ lián sān yuè,
jiā shū dǐ wàn jīn.
Bái tóu sāo gèng duǎn,
hún yù bú shèng zān.`,
    translation: `The nation is broken; the hills and rivers remain.
Spring in the city: the grass and trees grow deep.
Grieving the times, the flowers draw my tears;
hating to be apart, the birds startle my heart.
The beacon fires have burned for three months;
a letter from home is worth ten thousand in gold.
I scratch my white head and the hair grows thinner,
soon too thin to hold a hatpin.`,
    translator: ours,
    note: "Written in 757 in the captured capital, Chang'an, during the An Lushan Rebellion, while Du Fu was cut off from his family.",
    source: "Wikisource (Three Hundred Tang Poems)",
  },
  {
    id: "wang-wei-deer-park",
    title: "Deer Park",
    originalTitle: "鹿柴",
    poet: "Wang Wei",
    poetOriginal: "王維",
    dates: "699–759",
    place: "Tang dynasty China",
    region: "East Asia",
    language: "Chinese",
    lang: "zh-Hant",
    original: `空山不見人，
但聞人語響。
返景入深林，
復照青苔上。`,
    romanization: `Kōng shān bú jiàn rén,
dàn wén rén yǔ xiǎng.
Fǎn jǐng rù shēn lín,
fù zhào qīng tái shàng.`,
    translation: `Empty mountain, no one to be seen,
only the echo of someone's voice.
Late light comes back into the deep wood
and shines again on the green moss.`,
    translator: ours,
    note: "Wang Wei was a painter as well as a poet, and a Buddhist. Twenty characters, and translators have argued over them for a century.",
    source: "Wikisource (Wangchuan Collection)",
  },
  {
    id: "meng-haoran-spring-dawn",
    title: "Spring Dawn",
    originalTitle: "春曉",
    poet: "Meng Haoran",
    poetOriginal: "孟浩然",
    dates: "689–740",
    place: "Tang dynasty China",
    region: "East Asia",
    language: "Chinese",
    lang: "zh-Hant",
    original: `春眠不覺曉，
處處聞啼鳥。
夜來風雨聲，
花落知多少。`,
    romanization: `Chūn mián bù jué xiǎo,
chù chù wén tí niǎo.
Yè lái fēng yǔ shēng,
huā luò zhī duō shǎo.`,
    translation: `Spring sleep, and I missed the dawn;
everywhere I hear the birds.
All night, the sound of wind and rain.
How many blossoms fell?`,
    translator: ours,
    note: "A poet who mostly stayed out of government life, and wrote about waking up late without guilt.",
    source: "Wikisource",
  },
  {
    id: "basho-old-pond",
    title: "The Old Pond",
    originalTitle: "古池や",
    poet: "Matsuo Bashō",
    poetOriginal: "松尾芭蕉",
    dates: "1644–1694",
    place: "Edo-period Japan",
    region: "East Asia",
    language: "Japanese",
    lang: "ja",
    original: `古池や
蛙飛びこむ
水の音`,
    romanization: `Furu ike ya
kawazu tobikomu
mizu no oto`,
    translation: `The old pond:
a frog jumps in,
the sound of water.`,
    translator: ours,
    note: "From 1686. Frogs in Japanese poetry were famous for their croaking; Bashō's surprise was to give us the splash instead.",
    source: "Standard text",
  },
  {
    id: "basho-stillness",
    title: "Stillness",
    originalTitle: "閑さや",
    poet: "Matsuo Bashō",
    poetOriginal: "松尾芭蕉",
    dates: "1644–1694",
    place: "Edo-period Japan",
    region: "East Asia",
    language: "Japanese",
    lang: "ja",
    original: `閑さや
岩にしみ入る
蝉の声`,
    romanization: `Shizukasa ya
iwa ni shimiiru
semi no koe`,
    translation: `Such stillness:
the cicada's cry
soaks into the rocks.`,
    translator: ours,
    note: "Written in 1689 at Yamadera, a temple on a mountain of rock, during the walk he wrote up as The Narrow Road to the Deep North.",
    source: "Standard text",
  },
  {
    id: "buson-mustard-flowers",
    title: "Mustard Flowers",
    originalTitle: "菜の花や",
    poet: "Yosa Buson",
    poetOriginal: "与謝蕪村",
    dates: "1716–1784",
    place: "Edo-period Japan",
    region: "East Asia",
    language: "Japanese",
    lang: "ja",
    original: `菜の花や
月は東に
日は西に`,
    romanization: `Na no hana ya
tsuki wa higashi ni
hi wa nishi ni`,
    translation: `Mustard flowers:
the moon in the east,
the sun in the west.`,
    translator: ours,
    note: "Buson was a painter first, and you can feel it: a whole field of yellow held between two lights.",
    source: "Standard text",
  },
  {
    id: "issa-skinny-frog",
    title: "Skinny Frog",
    originalTitle: "痩蛙",
    poet: "Kobayashi Issa",
    poetOriginal: "小林一茶",
    dates: "1763–1828",
    place: "Edo-period Japan",
    region: "East Asia",
    language: "Japanese",
    lang: "ja",
    original: `痩蛙
まけるな一茶
是に有`,
    romanization: `Yasegaeru
makeru na Issa
kore ni ari`,
    translation: `Skinny frog,
don't give up!
Issa is right here.`,
    translator: ours,
    note: "Written in 1816 while watching frogs fight over a mate. Issa lost all his children young; his poems take the side of small, struggling creatures.",
    source: "Standard text",
  },
  {
    id: "komachi-color-of-flowers",
    title: "The Color of the Flowers",
    originalTitle: "花の色は",
    poet: "Ono no Komachi",
    poetOriginal: "小野小町",
    dates: "c. 825–900",
    place: "Heian-period Japan",
    region: "East Asia",
    language: "Japanese",
    lang: "ja",
    original: `花の色は
うつりにけりな
いたづらに
わが身世にふる
ながめせしまに`,
    romanization: `Hana no iro wa
utsurinikeri na
itazura ni
waga mi yo ni furu
nagame seshi ma ni`,
    translation: `The color of the flowers
has faded, all for nothing,
while I watched the long rains fall
and my life went by,
lost in thought.`,
    translator: ours,
    note: "Two words do double duty: furu is both “to fall” (rain) and “to grow old”, and nagame is both “long rain” and “gazing”. Komachi was famous for her beauty, so the flowers are her too.",
    source: "Hyakunin Isshu, poem 9",
  },
  {
    id: "hwang-jini-blue-stream",
    title: "Blue Stream in the Green Hills",
    originalTitle: "청산리 벽계수야",
    poet: "Hwang Jini",
    poetOriginal: "황진이",
    dates: "c. 1506–1560",
    place: "Joseon Korea",
    region: "East Asia",
    language: "Korean",
    lang: "ko",
    original: `청산리 벽계수야 수이 감을 자랑 마라
일도창해하면 다시 오기 어려우니
명월이 만공산하니 쉬어 간들 어떠리`,
    romanization: `Cheongsan-ri byeokgyesu-ya, sui gameul jarang mara
ildo changhae-hamyeon dasi ogi eoryeouni
myeongwol-i man-gongsan-hani swieo gandeul eotteori`,
    translation: `Blue stream in the green hills, don't boast of how fast you run:
once you reach the wide sea, it is hard to come back.
The bright moon fills the empty hills. Why not rest a while, then go?`,
    translator: ours,
    note: "A sijo, Korea's three-line form. A double meaning runs through it: Byeokgyesu (“blue stream”) was the name of a nobleman who passed her by, and Myeongwol (“bright moon”) was Hwang Jini's own pen name.",
    source: "Standard text",
  },

  // South Asia
  {
    id: "tagore-where-the-mind",
    title: "Where the Mind Is Without Fear",
    originalTitle: "চিত্ত যেথা ভয়শূন্য",
    poet: "Rabindranath Tagore",
    poetOriginal: "রবীন্দ্রনাথ ঠাকুর",
    dates: "1861–1941",
    place: "Bengal, India",
    region: "South Asia",
    language: "Bengali",
    lang: "bn",
    original: `চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির,
জ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর
আপন প্রাঙ্গণতলে দিবসশর্বরী
বসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি,
যেথা বাক্য হৃদয়ের উৎসমুখ হতে
উচ্ছ্বসিয়া উঠে, যেথা নির্বারিত স্রোতে
দেশে দেশে দিশে দিশে কর্মধারা ধায়
অজস্র সহস্রবিধ চরিতার্থতায়—
যেথা তুচ্ছ আচারের মরুবালুরাশি
বিচারের স্রোতঃপথ ফেলে নাই গ্রাসি,
পৌরুষেরে করে নি শতধা; নিত্য যেথা
তুমি সর্ব কর্ম চিন্তা আনন্দের নেতা—
নিজ হস্তে নির্দয় আঘাত করি, পিতঃ,
ভারতেরে সেই স্বর্গে করো জাগরিত।`,
    translation: `Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments by narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way into the dreary desert sand of dead habit;
Where the mind is led forward by thee into ever-widening thought and action—
Into that heaven of freedom, my Father, let my country awake.`,
    translator: "Rabindranath Tagore, Gitanjali (1912)",
    note: "Tagore translated this himself, loosely, from a Bengali sonnet of 1901. A year after the English Gitanjali came out he became the first non-European to win the Nobel Prize in Literature.",
    source: "Wikisource (Naivedya, poem 72; Gitanjali, 35)",
  },
  {
    id: "kabir-looking-for-the-wicked",
    title: "Looking for the Wicked",
    originalTitle: "बुरा जो देखन मैं चला",
    poet: "Kabir",
    poetOriginal: "कबीर",
    dates: "15th century",
    place: "Varanasi, India",
    region: "South Asia",
    language: "Hindi",
    lang: "hi",
    original: `बुरा जो देखन मैं चला, बुरा न मिलिया कोय।
जो दिल खोजा आपना, मुझसा बुरा न कोय॥`,
    romanization: `Burā jo dekhan maiṃ calā, burā na miliyā koy;
jo dil khojā āpnā, mujh-sā burā na koy.`,
    translation: `I went out looking for the wicked, and found no one wicked.
When I searched my own heart, there was no one worse than me.`,
    translator: ours,
    note: "A doha, a rhyming couplet. Kabir was a weaver who mocked both Hindu and Muslim religious show; his couplets were passed down by singers long before anyone wrote them down.",
    source: "Standard text",
  },
  {
    id: "ghalib-thousands-of-desires",
    title: "Thousands of Desires",
    originalTitle: "ہزاروں خواہشیں ایسی",
    poet: "Mirza Ghalib",
    poetOriginal: "مرزا غالب",
    dates: "1797–1869",
    place: "Delhi, Mughal India",
    region: "South Asia",
    language: "Urdu",
    lang: "ur",
    rtl: true,
    original: `ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے

ڈرے کیوں میرا قاتل کیا رہے گا اس کی گردن پر
وہ خوں جو چشم تر سے عمر بھر یوں دم بدم نکلے

نکلنا خلد سے آدم کا سنتے آئے ہیں لیکن
بہت بے آبرو ہو کر ترے کوچے سے ہم نکلے`,
    romanization: `Hazāroṅ ḳhvāhisheṅ aisī ki har ḳhvāhish pe dam nikle
bahut nikle mire armān lekin phir bhī kam nikle

Ḍare kyūṅ merā qātil kyā rahegā us kī gardan par
vo ḳhūṅ jo chashm-e-tar se umr bhar yūṅ dam-ba-dam nikle

Nikalnā ḳhuld se Ādam kā sunte aaye haiṅ lekin
bahut be-ābrū ho kar tire kūche se ham nikle`,
    translation: `Thousands of desires, each one worth dying for.
Many of my longings came true, and still too few.

Why should my killer be afraid? What will stain her neck:
the blood that ran from my wet eyes all my life, drop by drop?

We have always heard how Adam was thrown out of paradise,
but I left your street in far greater disgrace.`,
    translator: ours,
    note: "The first three couplets of a ghazal. In a ghazal every couplet stands alone and ends on the same word, here nikle, “came out”. The “killer” is the beloved, as so often in Urdu and Persian love poetry.",
    source: "Wikisource (Urdu)",
  },

  // Middle East
  {
    id: "rumi-song-of-the-reed",
    title: "The Song of the Reed",
    originalTitle: "نی‌نامه",
    poet: "Rumi",
    poetOriginal: "مولانا جلال‌الدین محمد بلخی",
    dates: "1207–1273",
    place: "Konya, Anatolia",
    region: "Middle East",
    language: "Persian",
    lang: "fa",
    rtl: true,
    original: `بشنو این نی چون شکایت می‌کند
از جدایی‌ها حکایت می‌کند

کز نِیِستان تا مرا بُبْریده‌اند
در نَفیرم مرد و زن نالیده‌اند

سینه خواهم شَرحه‌شَرحه از فراق
تا بگویم شرحِ دردِ اشتیاق

هر کسی کو دور ماند از اصلِ خویش
باز جوید روزگارِ وصلِ خویش`,
    romanization: `Beshnow in ney chon shekāyat mikonad
az jodāyi-hā hekāyat mikonad

Kaz neyestān tā marā bebrideand
dar nafiram mard o zan nālideand

Sine khāham sharhe-sharhe az farāq
tā beguyam sharh-e dard-e eshtiyāq

Har kasi ku dur mānad az asl-e khish
bāz juyad ruzgār-e vasl-e khish`,
    translation: `Listen to this reed, how it complains,
telling a story of separations:

“Ever since they cut me from the reed bed,
men and women have wept at my cry.

I want a heart torn to shreds by parting,
so I can tell it the pain of longing.

Whoever is kept far from their source
looks for the day they will be joined again.”`,
    translator: ours,
    note: "The opening of the Masnavi, a poem of some 25,000 couplets. The reed flute cut from its riverbank is the soul cut off from God, and its music is its longing to go home.",
    source: "Ganjoor (Masnavi, Book 1)",
  },
  {
    id: "hafez-ghazal-1",
    title: "Pass the Cup",
    originalTitle: "اَلا یا اَیُّهَا السّاقی",
    poet: "Hafez",
    poetOriginal: "حافظ",
    dates: "c. 1315–1390",
    place: "Shiraz, Persia",
    region: "Middle East",
    language: "Persian",
    lang: "fa",
    rtl: true,
    original: `اَلا یا اَیُّهَا السّاقی اَدِرْ کَأسَاً و ناوِلْها
که عشق آسان نمود اوّل ولی افتاد مشکل‌ها

به بویِ نافه‌ای کآخِر صبا زان طُرّه بُگشاید
ز تابِ جَعدِ مشکینش چه خون افتاد در دل‌ها`,
    romanization: `Alā yā ayyuhā s-sāqī, adir ka'san wa-nāwilhā
ke eshq āsān nemud avval vali oftād moshkel-hā

Be bu-ye nāfe-i k-ākhar sabā zān torre bogshāyad
ze tāb-e ja'd-e meshkinash che khun oftād dar del-hā`,
    translation: `Come, cupbearer, pass the cup around and hand it to me,
for love looked easy at first, and then the troubles came.

Waiting for the scent of musk the morning wind would shake from that curl,
how much blood has fallen in hearts from the twist of those dark locks.`,
    translator: ours,
    note: "The first ghazal in Hafez's collection, and its first half-line is in Arabic, not Persian. Iranians still open his book at random to ask it for advice.",
    source: "Ganjoor (Ghazal 1)",
  },
  {
    id: "khayyam-quatrain-1",
    title: "Before They Make Jugs of Our Clay",
    originalTitle: "برخیز بُتا",
    poet: "Omar Khayyam",
    poetOriginal: "عمر خیام",
    dates: "1048–1131",
    place: "Nishapur, Persia",
    region: "Middle East",
    language: "Persian",
    lang: "fa",
    rtl: true,
    original: `برخیز بُتا، بیا ز بهر دل ما
حل کن به جمال خویشتن مشکل ما
یک کوزه شراب تا به هم نوش کنیم
زآن پیش که کوزه‌ها کنند از گِل ما`,
    romanization: `Barkhiz botā, biyā ze bahr-e del-e mā
hal kon be jamāl-e khishtan moshkel-e mā
yek kuze sharāb tā be ham nush konim
zān pish ke kuze-hā konand az gel-e mā`,
    translation: `Get up, my beauty, come, for my heart's sake,
and let your loveliness solve what troubles me.
Bring a jug of wine so we can drink it together
before they make jugs out of our clay.`,
    translator: ours,
    note: "Khayyam was famous in his own time as a mathematician and astronomer who reformed the calendar. The West met his quatrains through Edward FitzGerald's very free Rubaiyat of 1859.",
    source: "Ganjoor (Quatrain 1)",
  },
  {
    id: "saadi-children-of-adam",
    title: "The Children of Adam",
    originalTitle: "بنی آدم",
    poet: "Saadi",
    poetOriginal: "سعدی",
    dates: "c. 1210–1291",
    place: "Shiraz, Persia",
    region: "Middle East",
    language: "Persian",
    lang: "fa",
    rtl: true,
    original: `بنی آدم اعضایِ یکدیگرند
که در آفرینش ز یک گوهرند
چو عضوی به درد آورد روزگار
دگر عضوها را نماند قرار
تو کز محنتِ دیگران بی‌غمی
نشاید که نامت نهند آدمی`,
    romanization: `Bani Ādam a'zā-ye yekdigarand
ke dar āfarinesh ze yek gowharand
cho ozvi be dard āvarad ruzgār
degar ozv-hā rā namānad qarār
to k-az mehnat-e digarān bi-ghami
nashāyad ke nāmat nahand ādami`,
    translation: `The children of Adam are limbs of one body,
made in creation from a single essence.
When time brings pain to one limb,
the other limbs cannot rest.
You who feel nothing for the suffering of others
do not deserve to be called human.`,
    translator: ours,
    note: "From the Golestan (1258), a book of stories in prose and verse. These lines are often quoted at the United Nations.",
    source: "Ganjoor (Golestan, Chapter 1, Story 10)",
  },
  {
    id: "mutanabbi-the-horses-know-me",
    title: "The Horses and the Night Know Me",
    originalTitle: "الخيل والليل والبيداء تعرفني",
    poet: "Al-Mutanabbi",
    poetOriginal: "المتنبي",
    dates: "915–965",
    place: "Aleppo, Syria",
    region: "Middle East",
    language: "Arabic",
    lang: "ar",
    rtl: true,
    original: `أَنا الَّذي نَظَرَ الأَعمى إِلى أَدَبي
وَأَسمَعَت كَلِماتي مَن بِهِ صَمَمُ

أَنامُ مِلءَ جُفوني عَن شَوارِدِها
وَيَسهَرُ الخَلقُ جَرّاها وَيَختَصِمُ

الخَيلُ وَاللَيلُ وَالبَيداءُ تَعرِفُني
وَالسَيفُ وَالرُمحُ وَالقِرطاسُ وَالقَلَمُ`,
    romanization: `Ana lladhī naẓara l-aʿmā ilā adabī
wa-asmaʿat kalimātī man bihi ṣamamu

Anāmu milʾa jufūnī ʿan shawāridihā
wa-yasharu l-khalqu jarrāhā wa-yakhtaṣimu

Al-khaylu wa-l-laylu wa-l-baydāʾu taʿrifunī
wa-s-sayfu wa-r-rumḥu wa-l-qirṭāsu wa-l-qalamu`,
    translation: `I am the one whose writing even the blind can see,
whose words reach even those who cannot hear.

I sleep soundly while my wild lines run loose,
and everyone else stays up arguing over them.

The horses and the night and the desert know me,
and the sword and the spear, the paper and the pen.`,
    translator: ours,
    note: "Three couplets from a poem of about 948 to his patron, the prince Sayf al-Dawla. The story goes that when bandits attacked him years later, his servant quoted the last line back at him, so he turned to fight and was killed.",
    source: "Wikisource (Arabic) and the standard text",
  },
  {
    id: "halevi-my-heart-is-in-the-east",
    title: "My Heart Is in the East",
    originalTitle: "לבי במזרח",
    poet: "Yehuda Halevi",
    poetOriginal: "יהודה הלוי",
    dates: "c. 1075–1141",
    place: "al-Andalus (Spain)",
    region: "Middle East",
    language: "Hebrew",
    lang: "he",
    rtl: true,
    original: `לִבִּי בְמִזְרָח וְאָנֹכִי בְּסוֹף מַעֲרָב
אֵיךְ אֶטְעֲמָה אֵת אֲשֶׁר אֹכַל וְאֵיךְ יֶעֱרָב
אֵיכָה אֲשַׁלֵּם נְדָרַי וָאֱסָרַי, בְּעוֹד
צִיּוֹן בְּחֶבֶל אֱדוֹם וַאֲנִי בְּכֶבֶל עֲרָב
יֵקַל בְּעֵינַי עֲזֹב כָּל טוּב סְפָרַד, כְּמוֹ
יֵקַר בְּעֵינַי רְאוֹת עַפְרוֹת דְּבִיר נֶחֱרָב.`,
    romanization: `Libi ve-mizraḥ ve-anokhi be-sof ma'arav
eikh etamah et asher okhal ve-eikh ye'erav
eikhah ashalem nedarai ve-esarai, be-od
Tziyon be-ḥevel Edom va-ani be-khevel Arav
yekal be-einai azov kol tuv Sefarad, kemo
yekar be-einai re'ot afrot dvir neḥerav`,
    translation: `My heart is in the East, and I am at the far edge of the West.
How can I taste what I eat? How could it be sweet?
How can I keep my vows and promises while
Zion is held by Edom, and I am held by the Arabs?
It would be easy to leave all the good things of Spain,
as precious as it would be to see the dust of the ruined sanctuary.`,
    translator: ours,
    note: "Halevi was a doctor and poet in Muslim and Christian Spain. Late in life he did leave for Jerusalem; legend says he was killed at its gates, but letters show he died in Egypt in 1141.",
    source: "Wikisource (Hebrew)",
  },

  // Europe
  {
    id: "dante-dark-wood",
    title: "The Dark Wood",
    originalTitle: "Inferno, Canto I",
    poet: "Dante Alighieri",
    poetOriginal: "Dante Alighieri",
    dates: "1265–1321",
    place: "Florence, Italy",
    region: "Europe",
    language: "Italian",
    lang: "it",
    original: `Nel mezzo del cammin di nostra vita
mi ritrovai per una selva oscura,
ché la diritta via era smarrita.`,
    translation: `Midway along the road of our life
I found myself in a dark wood,
for the straight way was lost.`,
    translator: ours,
    note: "The first three lines of the Divine Comedy, written in exile around 1308–1320. Dante was 35 in the year the poem is set, 1300: halfway through a life of seventy.",
    source: "Standard text",
  },
  {
    id: "leopardi-infinite",
    title: "The Infinite",
    originalTitle: "L'infinito",
    poet: "Giacomo Leopardi",
    poetOriginal: "Giacomo Leopardi",
    dates: "1798–1837",
    place: "Recanati, Italy",
    region: "Europe",
    language: "Italian",
    lang: "it",
    original: `Sempre caro mi fu quest'ermo colle,
E questa siepe, che da tanta parte
Dell'ultimo orizzonte il guardo esclude.
Ma sedendo e mirando, interminati
Spazi di là da quella, e sovrumani
Silenzi, e profondissima quiete
Io nel pensier mi fingo; ove per poco
Il cor non si spaura. E come il vento
Odo stormir tra queste piante, io quello
Infinito silenzio a questa voce
Vo comparando: e mi sovvien l'eterno,
E le morte stagioni, e la presente
E viva, e il suon di lei. Così tra questa
Immensità s'annega il pensier mio:
E il naufragar m'è dolce in questo mare.`,
    translation: `This lonely hill was always dear to me,
and this hedge, which shuts out the view
of so much of the farthest horizon.
But sitting here and gazing, I imagine
endless spaces past it, and silences
beyond anything human, and the deepest quiet,
until my heart is almost
afraid. And as I hear the wind
rustle through these plants, I go on comparing
that infinite silence to this voice:
and I remember eternity,
and the dead seasons, and the present one,
alive, and the sound of it. So in this
immensity my thought drowns,
and shipwreck is sweet to me in this sea.`,
    translator: ours,
    note: "Written in 1819 when Leopardi was 21, sick and stuck in his small hometown. The hedge that blocks his view is what sets his imagination free.",
    source: "Wikisource (Italian)",
  },
  {
    id: "camoes-love-is-a-fire",
    title: "Love Is a Fire",
    originalTitle: "Amor é fogo que arde sem se ver",
    poet: "Luís de Camões",
    poetOriginal: "Luís Vaz de Camões",
    dates: "c. 1524–1580",
    place: "Lisbon, Portugal",
    region: "Europe",
    language: "Portuguese",
    lang: "pt",
    original: `Amor é um fogo que arde sem se ver;
É ferida que dói e não se sente;
É um contentamento descontente;
É dor que desatina sem doer;

É um não querer mais que bem querer;
É solitário andar por entre a gente;
É um não contentar-se de contente;
É cuidar que se ganha em se perder;

É um estar-se preso por vontade;
É servir a quem vence o vencedor;
É um ter com quem nos mata lealdade.

Mas como causar pode o seu favor
Nos mortais corações conformidade,
Sendo a si tão contrário o mesmo Amor?`,
    translation: `Love is a fire that burns unseen;
a wound that aches and isn't felt;
a discontented contentment;
a pain that drives you mad without hurting;

it is wanting nothing more than to love well;
a lonely walk among the crowd;
never being content with being content;
believing you win by losing yourself;

it is choosing to be a prisoner;
the victor serving the one he defeated;
keeping faith with the one who kills us.

So how can its favor ever bring
peace to mortal hearts,
when Love is so at war with itself?`,
    translator: ours,
    note: "A sonnet built entirely of contradictions. Camões lost an eye fighting in North Africa and, the story goes, swam to shore from a shipwreck holding his epic poem above the waves.",
    source: "Wikisource (1843 edition, spelling modernised)",
  },
  {
    id: "becquer-rima-xxi",
    title: "What Is Poetry?",
    originalTitle: "Rima XXI",
    poet: "Gustavo Adolfo Bécquer",
    poetOriginal: "Gustavo Adolfo Bécquer",
    dates: "1836–1870",
    place: "Seville, Spain",
    region: "Europe",
    language: "Spanish",
    lang: "es",
    original: `¿Qué es poesía?, dices mientras clavas
en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
Poesía... eres tú.`,
    translation: `“What is poetry?” you ask, as you fix
your blue eyes on mine.
What is poetry? And you're asking me?
Poetry... is you.`,
    translator: ours,
    note: "From the Rimas, published the year after Bécquer died young of tuberculosis. Spanish schoolchildren learn this one by heart.",
    source: "Wikisource (Obras de Bécquer)",
  },
  {
    id: "dario-lo-fatal",
    title: "What Is Fated",
    originalTitle: "Lo fatal",
    poet: "Rubén Darío",
    poetOriginal: "Rubén Darío",
    dates: "1867–1916",
    place: "Nicaragua",
    region: "The Americas",
    language: "Spanish",
    lang: "es",
    original: `Dichoso el árbol, que es apenas sensitivo,
y más la piedra dura porque esa ya no siente,
pues no hay dolor más grande que el dolor de ser vivo,
ni mayor pesadumbre que la vida consciente.

Ser y no saber nada, y ser sin rumbo cierto,
y el temor de haber sido y un futuro terror...
Y el espanto seguro de estar mañana muerto,
y sufrir por la vida y por la sombra y por

lo que no conocemos y apenas sospechamos,
y la carne que tienta con sus frescos racimos,
y la tumba que aguarda con sus fúnebres ramos,

¡y no saber a dónde vamos,
ni de dónde venimos!...`,
    translation: `Happy the tree, which can barely feel,
and happier the hard stone, which feels nothing at all,
for there is no pain greater than the pain of being alive,
no heavier sorrow than a conscious life.

To be, and to know nothing, and to be without a sure direction,
and the fear of having been, and a terror still to come...
and the certain dread of being dead tomorrow,
and to suffer for life and for the shadow and for

what we do not know and barely suspect,
and the flesh that tempts us with its cool grapes,
and the tomb that waits with its funeral wreaths,

and not to know where we are going,
or where we came from!...`,
    translator: ours,
    note: "Darío, from Nicaragua, reinvented poetry in Spanish on both sides of the Atlantic. Published in 1905.",
    source: "Wikisource (Spanish)",
  },
  {
    id: "verlaine-it-weeps",
    title: "It Weeps in My Heart",
    originalTitle: "Il pleure dans mon cœur",
    poet: "Paul Verlaine",
    poetOriginal: "Paul Verlaine",
    dates: "1844–1896",
    place: "France",
    region: "Europe",
    language: "French",
    lang: "fr",
    original: `Il pleure dans mon cœur
Comme il pleut sur la ville,
Quelle est cette langueur
Qui pénètre mon cœur ?

Ô bruit doux de la pluie
Par terre et sur les toits !
Pour un cœur qui s'ennuie
Ô le chant de la pluie !

Il pleure sans raison
Dans ce cœur qui s'écœure.
Quoi ! nulle trahison ?
Ce deuil est sans raison.

C'est bien la pire peine
De ne savoir pourquoi,
Sans amour et sans haine,
Mon cœur a tant de peine !`,
    translation: `It weeps in my heart
the way it rains on the town.
What is this ache
that soaks into my heart?

O soft sound of the rain
on the ground and on the roofs!
For a heart that is weary,
O the song of the rain!

It weeps for no reason
in this heart sick of itself.
What! No betrayal?
This grief has no reason.

It is surely the worst pain
not to know why,
with no love and no hate,
my heart has so much pain.`,
    translator: ours,
    note: "From Romances sans paroles (1874), written during his wild affair with the young Rimbaud. Verlaine invented the verb “il pleure” to match “il pleut”, it rains.",
    source: "Wikisource (Romances sans paroles, 1891)",
  },
  {
    id: "apollinaire-mirabeau",
    title: "The Mirabeau Bridge",
    originalTitle: "Le Pont Mirabeau",
    poet: "Guillaume Apollinaire",
    poetOriginal: "Guillaume Apollinaire",
    dates: "1880–1918",
    place: "Paris, France",
    region: "Europe",
    language: "French",
    lang: "fr",
    original: `Sous le pont Mirabeau coule la Seine
Et nos amours
Faut-il qu'il m'en souvienne
La joie venait toujours après la peine

Vienne la nuit sonne l'heure
Les jours s'en vont je demeure

Les mains dans les mains restons face à face
Tandis que sous
Le pont de nos bras passe
Des éternels regards l'onde si lasse

Vienne la nuit sonne l'heure
Les jours s'en vont je demeure

L'amour s'en va comme cette eau courante
L'amour s'en va
Comme la vie est lente
Et comme l'Espérance est violente

Vienne la nuit sonne l'heure
Les jours s'en vont je demeure

Passent les jours et passent les semaines
Ni temps passé
Ni les amours reviennent
Sous le pont Mirabeau coule la Seine

Vienne la nuit sonne l'heure
Les jours s'en vont je demeure`,
    translation: `Under the Mirabeau Bridge the Seine flows
and our loves
must I remember them
joy always came after pain

Let night come, let the hour ring
the days go by, I stay

Hands in hands let us stay face to face
while under
the bridge of our arms
the waves of endless looks flow by so tired

Let night come, let the hour ring
the days go by, I stay

Love goes away like this running water
love goes away
how slow life is
and how violent Hope is

Let night come, let the hour ring
the days go by, I stay

The days pass and the weeks pass
neither time gone by
nor loves come back
Under the Mirabeau Bridge the Seine flows

Let night come, let the hour ring
the days go by, I stay`,
    translator: ours,
    note: "Written in 1912 after his breakup with the painter Marie Laurencin, and printed without any punctuation at all. Apollinaire died in the 1918 flu epidemic, two days before the Armistice.",
    source: "Wikisource (Alcools, 1913)",
  },
  {
    id: "goethe-wanderers-night-song",
    title: "Wanderer's Night Song",
    originalTitle: "Ein Gleiches (Wandrers Nachtlied II)",
    poet: "Johann Wolfgang von Goethe",
    poetOriginal: "Johann Wolfgang von Goethe",
    dates: "1749–1832",
    place: "Thuringia, Germany",
    region: "Europe",
    language: "German",
    lang: "de",
    original: `Ueber allen Gipfeln
Ist Ruh',
In allen Wipfeln
Spürest du
Kaum einen Hauch;
Die Vögelein schweigen im Walde.
Warte nur, balde
Ruhest du auch.`,
    translation: `Over all the hilltops
is rest.
In all the treetops
you feel
hardly a breath.
The little birds are silent in the woods.
Only wait: soon
you too will rest.`,
    translator: ours,
    note: "Goethe pencilled it on the wall of a hunting hut on the Kickelhahn hill in 1780. Fifty years later, a few months before he died, he went back, read it, and wept.",
    source: "Wikisource (German)",
  },
  {
    id: "rilke-panther",
    title: "The Panther",
    originalTitle: "Der Panther",
    poet: "Rainer Maria Rilke",
    poetOriginal: "Rainer Maria Rilke",
    dates: "1875–1926",
    place: "Paris (written), Prague (born)",
    region: "Europe",
    language: "German",
    lang: "de",
    original: `Sein Blick ist vom Vorübergehn der Stäbe
so müd geworden, daß er nichts mehr hält.
Ihm ist, als ob es tausend Stäbe gäbe
und hinter tausend Stäben keine Welt.

Der weiche Gang geschmeidig starker Schritte,
der sich im allerkleinsten Kreise dreht,
ist wie ein Tanz von Kraft um eine Mitte,
in der betäubt ein großer Wille steht.

Nur manchmal schiebt der Vorhang der Pupille
sich lautlos auf –. Dann geht ein Bild hinein,
geht durch der Glieder angespannte Stille –
und hört im Herzen auf zu sein.`,
    translation: `His gaze, from the bars going past,
has grown so tired that it holds nothing anymore.
It seems to him there are a thousand bars,
and behind the thousand bars, no world.

The soft walk of supple, powerful strides,
turning in the smallest of circles,
is like a dance of strength around a center
where a great will stands, stunned.

Only sometimes the curtain of the pupil
lifts, without a sound. Then an image enters,
runs through the tense stillness of the limbs,
and in the heart stops being.`,
    translator: ours,
    note: "Written around 1902 at the Paris zoo, when the sculptor Rodin told Rilke to go and really look at something. It's often called the first of his “thing-poems”.",
    source: "Wikisource (Neue Gedichte, 1907)",
  },
  {
    id: "pushkin-i-loved-you",
    title: "I Loved You",
    originalTitle: "Я вас любил",
    poet: "Alexander Pushkin",
    poetOriginal: "Александр Пушкин",
    dates: "1799–1837",
    place: "Russia",
    region: "Europe",
    language: "Russian",
    lang: "ru",
    original: `Я вас любил: любовь ещё, быть может,
В душе моей угасла не совсем;
Но пусть она вас больше не тревожит;
Я не хочу печалить вас ничем.
Я вас любил безмолвно, безнадежно,
То робостью, то ревностью томим;
Я вас любил так искренно, так нежно,
Как дай вам Бог любимой быть другим.`,
    romanization: `Ya vas lyubil: lyubov' eshchyo, byt' mozhet,
V dushe moyey ugasla ne sovsem;
No pust' ona vas bol'she ne trevozhit;
Ya ne khochu pechalit' vas nichem.
Ya vas lyubil bezmolvno, beznadezhno,
To robost'yu, to revnost'yu tomim;
Ya vas lyubil tak iskrenno, tak nezhno,
Kak dai vam Bog lyubimoi byt' drugim.`,
    translation: `I loved you; and perhaps that love
has not quite gone out in my soul;
but don't let it trouble you any longer;
I don't want to sadden you in any way.
I loved you silently, without hope,
worn down now by shyness, now by jealousy;
I loved you so truly, so tenderly,
as God grant you'll be loved by someone else.`,
    translator: ours,
    note: "Written in 1829. Pushkin, the founder of modern Russian literature, died at 37 after a duel over his wife's honour.",
    source: "Wikisource (Russian)",
  },
  {
    id: "lermontov-sail",
    title: "The Sail",
    originalTitle: "Парус",
    poet: "Mikhail Lermontov",
    poetOriginal: "Михаил Лермонтов",
    dates: "1814–1841",
    place: "Russia",
    region: "Europe",
    language: "Russian",
    lang: "ru",
    original: `Белеет парус одинокой
В тумане моря голубом!..
Что ищет он в стране далекой?
Что кинул он в краю родном?..

Играют волны — ветер свищет,
И мачта гнется и скрыпит...
Увы! он счастия не ищет,
И не от счастия бежит!

Под ним струя светлей лазури,
Над ним луч солнца золотой...
А он, мятежный, просит бури,
Как будто в бурях есть покой!`,
    translation: `A lonely sail shows white
in the blue mist of the sea!..
What is it looking for in a far country?
What did it leave behind at home?..

The waves play, the wind whistles,
the mast bends and creaks...
Alas! It isn't looking for happiness,
and it isn't running from happiness!

Below it, a current brighter than the azure,
above it, a golden ray of sun...
But it, the rebel, asks for a storm,
as if there were peace in storms!`,
    translator: ours,
    note: "Written in 1832 when Lermontov was 17. Like Pushkin, he died in a duel, at 26.",
    source: "Wikisource (Russian, from the autograph)",
  },

  // Ancient world
  {
    id: "sappho-midnight",
    title: "The Moon Has Set",
    originalTitle: "Δέδυκε μὲν ἀ σελάννα",
    poet: "Sappho (attributed)",
    poetOriginal: "Σαπφώ",
    dates: "c. 630–570 BCE",
    place: "Lesbos, Greece",
    region: "Ancient world",
    language: "Ancient Greek",
    lang: "grc",
    original: `Δέδυκε μὲν ἀ σελάννα
καὶ Πληΐαδες· μέσαι δὲ
νύκτες, πάρα δ' ἔρχετ' ὤρα·
ἔγω δὲ μόνα κατεύδω.`,
    romanization: `Dedyke men a selanna
kai Plēiades; mesai de
nyktes, para d' erchet' ōra;
egō de mona kateudō.`,
    translation: `The moon has set,
and the Pleiades. It is the middle
of the night; the hour goes by;
and I sleep alone.`,
    translator: ours,
    note: "Ancient writers called Sappho the tenth Muse, but only scraps of her nine books survive. Scholars still argue over whether these four lines are hers.",
    source: "Standard text",
  },
  {
    id: "catullus-85",
    title: "I Hate and I Love",
    originalTitle: "Carmen LXXXV",
    poet: "Catullus",
    poetOriginal: "Gaius Valerius Catullus",
    dates: "c. 84–54 BCE",
    place: "Rome",
    region: "Ancient world",
    language: "Latin",
    lang: "la",
    original: `Odi et amo. Quare id faciam fortasse requiris.
Nescio, sed fieri sentio et excrucior.`,
    translation: `I hate and I love. Why do I do it, maybe you ask.
I don't know. But I feel it happen, and I am in agony.`,
    translator: ours,
    note: "Two lines about his lover “Lesbia”, probably a married Roman noblewoman. The last word, excrucior, comes from crux: “I am crucified”.",
    source: "Wikisource (Latin)",
  },
  {
    id: "horace-carpe-diem",
    title: "Seize the Day",
    originalTitle: "Carmina I.11",
    poet: "Horace",
    poetOriginal: "Quintus Horatius Flaccus",
    dates: "65–8 BCE",
    place: "Rome",
    region: "Ancient world",
    language: "Latin",
    lang: "la",
    original: `Tu ne quaesieris, scire nefas, quem mihi, quem tibi
Finem di dederint, Leuconoe, nec Babylonios
Temptaris numeros. Ut melius quidquid erit pati,
Seu pluris hiemes seu tribuit Iuppiter ultimam,
Quae nunc oppositis debilitat pumicibus mare
Tyrrhenum: sapias, vina liques, et spatio brevi
Spem longam reseces. Dum loquimur, fugerit invida
Aetas: carpe diem, quam minimum credula postero.`,
    translation: `Don't ask (we aren't allowed to know) what end the gods have given me, or you,
Leuconoe, and don't play with the Babylonian star charts.
How much better to take whatever comes,
whether Jupiter gives us more winters or this is the last,
the one now wearing the Tyrrhenian sea against the rocks.
Be wise, strain the wine, and since our time is short,
cut back long hopes. Even while we talk, jealous time
has slipped away: seize the day, and trust tomorrow as little as you can.`,
    translator: ours,
    note: "Where “carpe diem” comes from. Carpe literally means “pluck”, like fruit: pick the day while it's ripe.",
    source: "Wikisource (Latin)",
  },
];

export const worldRegions: WorldRegion[] = ["East Asia", "South Asia", "Middle East", "Europe", "The Americas", "Ancient world"];

// Saved poems sit on the shelf as favorites under this title and poet
export const worldShelfTitle = (p: WorldPoem) => p.title;
export const worldShelfAuthor = (p: WorldPoem) => p.poet;
// Shelf text: the English, so search and the reader work as usual. The original is
// shown alongside it when the book is opened.
export const worldShelfText = (p: WorldPoem) => p.translation;
