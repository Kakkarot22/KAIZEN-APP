<USER_REQUEST>
/* Kanji, organized by look-alike group — the kanji you confuse are studied side by side.
   Stories are memory aids built from the parts, not strict etymology.

   Group: G('one-line difference tip', [kanji entries], 'extra look-alike characters used only as wrong options')
   Kanji: [kanji, JLPT level, meaning, parts, story, [word, reading, word meaning]]
   Question IDs are keyed by the kanji itself, so groups can be reordered safely.

   Kanji without a look-alike live in js/kanji/n5.js, n4.js, n3.js in a plain format, one per line:
   kanji | meaning | on readings | kun readings | parts | memory story | word:reading:meaning;word:reading:meaning
   (readings separated by ・, okurigana after a dot as in た.べる, - when there is none). */

import {BANK} from './questions.js';
import N5 from './kanji/n5.js';
import N4 from './kanji/n4.js';
import N3 from './kanji/n3.js';

export const KANJI_GROUPS = [];
export const PLAIN_KANJI = [];
// kanji without a look-alike group, in level order
export const KANJI_SETS = [];
// plain kanji in practice sets of 10 per level
export const KANJI = {};
const G = (tip, items, alts='') => KANJI_GROUPS.push({
    tip,
    items: items.map( ([k,lv,mean,parts,story,word]) => ({
        k,
        lv,
        mean,
        parts,
        story,
        word
    })),
    alts: [...alts]
});

G('All four start from 木 (tree). Add a person and it\'s 休; a person beside 本 is 体; a line at the roots makes 本.', [['休', 5, 'rest', '亻 person + 木 tree', 'A person leaning on a tree, resting.', ['休み', 'やすみ', 'break, holiday']], ['体', 4, 'body', '亻 person + 本 origin', 'A person\'s origin is their body.', ['体', 'からだ', 'body']], ['本', 5, 'book, origin', '木 tree + a line at the roots', 'The line marks the root: the origin. Books are made from trees.', ['本', 'ほん', 'book']], ['木', 5, 'tree', 'a trunk with branches and roots', 'A picture of a tree.', ['木', 'き', 'tree']]]);
G('All four have 寺 on the right. Look at the left: 彳 going (wait), 扌 hand (hold), 牛 cow (special), 日 sun (time).', [['待', 4, 'wait', '彳 going + 寺 temple', 'You go to the temple and wait in line.', ['待つ', 'まつ', 'wait']], ['持', 4, 'hold', '扌 hand + 寺 temple', 'Your hand holds the temple offering.', ['持つ', 'もつ', 'hold, have']], ['特', 4, 'special', '牛 cow + 寺 temple', 'A cow at the temple is something special.', ['特別', 'とくべつ', 'special']], ['時', 5, 'time', '日 sun + 寺 temple', 'The sun over the temple tells the time.', ['時間', 'じかん', 'time']]]);
G('入 leans in from the right (the long stroke is on the right); 人 has the long stroke on the left; 八 has two separate strokes.', [['入', 5, 'enter', 'two strokes, the right one longer', 'A tent opening you walk into.', ['入る', 'はいる', 'enter']], ['人', 5, 'person', 'two strokes, the left one longer', 'A person walking.', ['人', 'ひと', 'person']], ['八', 5, 'eight', 'two separate strokes', 'Two strokes that don\'t touch, opening wide.', ['八つ', 'やっつ', 'eight (things)']]], '大');
G('右 and 左 share the hand ナ: 右 has 口 (mouth: the hand you eat with), 左 has 工 (tool). 石 has a cliff 厂 instead of a hand.', [['右', 5, 'right', 'ナ hand + 口 mouth', 'The hand that brings food to your mouth: right.', ['右', 'みぎ', 'right']], ['左', 5, 'left', 'ナ hand + 工 tool', 'The hand that holds the tool: left.', ['左', 'ひだり', 'left']], ['石', 4, 'stone', '厂 cliff + 口 a rock', 'A rock under a cliff.', ['石', 'いし', 'stone']]], '古');
G('All have 目 (eye) shapes. 見 has legs (see); 買 has a net 罒 on top of shell-money 貝 (buy); 員 has a mouth 口 on top (member).', [['見', 5, 'see', '目 eye + 儿 legs', 'An eye on legs, walking around to see.', ['見る', 'みる', 'see']], ['買', 4, 'buy', '罒 net + 貝 shell money', 'You catch goods in a net and pay with shells.', ['買う', 'かう', 'buy']], ['員', 4, 'member', '口 mouth + 貝 shell money', 'A mouth that gets paid: a staff member.', ['会社員', 'かいしゃいん', 'office worker']]], '貝');
G('Both start with 立 + 木. 親 ends with 見 (see); 新 ends with 斤 (axe).', [['親', 4, 'parent', '立 stand + 木 tree + 見 see', 'A parent stands on a tree to watch over their child.', ['親切', 'しんせつ', 'kind']], ['新', 5, 'new', '立 stand + 木 tree + 斤 axe', 'Cut a standing tree with an axe: fresh, new wood.', ['新しい', 'あたらしい', 'new']]], '視観');
G('All five sit inside 門 (gate). What\'s inside decides: 日 sun, 耳 ear, 口 mouth, 开 hands lifting the bar, 才 a bar blocking.', [['間', 5, 'interval, between', '門 gate + 日 sun', 'Sunlight through the gap of a gate: the space between.', ['間', 'あいだ', 'between']], ['聞', 5, 'hear, listen', '門 gate + 耳 ear', 'An ear pressed to the gate, listening.', ['聞く', 'きく', 'hear, listen']], ['問', 4, 'question', '門 gate + 口 mouth', 'A mouth at the gate asking questions.', ['質問', 'しつもん', 'question']], ['開', 4, 'open', '門 gate + 开 two hands lifting the bar', 'Two hands lift the bar: the gate opens.', ['開ける', 'あける', 'open (something)']], ['閉', 3, 'close', '門 gate + 才 a bar across it', 'A bar across the gate: closed.', ['閉める', 'しめる', 'close (something)']]]);
G('Both have 子 (child) at the bottom. 字 has a roof 宀 (a child at home learning letters); 学 has a crown of strokes on top.', [['字', 4, 'character, letter', '宀 roof + 子 child', 'A child under the roof learning letters.', ['漢字', 'かんじ', 'kanji']], ['学', 5, 'study, learn', '⺍ + 冖 cover + 子 child', 'A child under a school roof, studying.', ['学校', 'がっこう', 'school']]], '子宇');
G('東 is 木 with 日 inside (sun behind a tree); 車 is a cart seen from above, with no 木 legs; 果 has 田 on top of 木.', [['東', 5, 'east', '木 tree + 日 sun', 'The sun rising behind a tree: east.', ['東', 'ひがし', 'east']], ['車', 5, 'car, vehicle', 'a cart with an axle, seen from above', 'A two-wheeled cart.', ['電車', 'でんしゃ', 'train']], ['果', 3, 'fruit, result', '田 field + 木 tree', 'What grows at the top of a tree: fruit.', ['果物', 'くだもの', 'fruit']]], '束');
G('午 does not poke through the top; 牛 does (the cow\'s horn). 物 has 牛 on the left.', [['午', 5, 'noon', 'like 牛 but no horn sticking up', 'Noon: the sun at its highest, nothing sticking out.', ['午後', 'ごご', 'afternoon']], ['牛', 4, 'cow', 'the top stroke pokes through: a horn', 'A cow with one horn sticking up.', ['牛肉', 'ぎゅうにく', 'beef']], ['物', 4, 'thing', '牛 cow + 勿', 'A cow was the most valuable thing you could own.', ['買い物', 'かいもの', 'shopping']]], '干');
G('天 has a line ABOVE 大 (the sky over a person); 夫 has a line THROUGH the top (a hairpin: an adult man).', [['天', 5, 'heaven, sky', '一 + 大 big person', 'The line above a person\'s head: the sky.', ['天気', 'てんき', 'weather']], ['夫', 3, 'husband', '大 person + a hairpin through the head', 'A grown man wearing a hairpin: a husband.', ['夫', 'おっと', 'husband']]], '大失');
G('Where is the dot? 犬 top right (the dog\'s ear); 大 no dot; 太 at the bottom.', [['犬', 4, 'dog', '大 + a dot at the top right', 'A big animal with an ear: a dog.', ['犬', 'いぬ', 'dog']], ['大', 5, 'big', 'a person with arms stretched out', 'A person spreading their arms: big.', ['大きい', 'おおきい', 'big']], ['太', 4, 'thick, fat', '大 + a dot at the bottom', 'Big, plus a little extra at the bottom: fat.', ['太い', 'ふとい', 'thick, fat']]], '丈');
G('All have 主 (master) on the right. 住 adds a person (where a person lives); 注 adds water 氵 (pour, pay attention).', [['主', 4, 'master, main', 'a lamp with a flame on top', 'The flame in the lamp: the main thing.', ['主人', 'しゅじん', 'husband, master']], ['住', 4, 'live, reside', '亻 person + 主 master', 'A person is master of the place they live.', ['住む', 'すむ', 'live']], ['注', 4, 'pour, attention', '氵 water + 主 master', 'Pour water carefully: pay attention.', ['注意', 'ちゅうい', 'caution, warning']]], '柱');
G('Look at the two horizontal lines. 未: the top line is SHORTER (the branch hasn\'t grown yet). 末: the top line is LONGER (the end of the branch).', [['未', 3, 'not yet', 'a tree with a short top branch', 'The top branch hasn\'t grown yet: not yet.', ['未来', 'みらい', 'future']], ['末', 3, 'end', 'a tree with a long top branch', 'The longest line at the tip of the tree: the end.', ['週末', 'しゅうまつ', 'weekend']]], '朱本');
G('方 has a dot on top; 万 doesn\'t.', [['万', 5, 'ten thousand', 'no dot on top', 'A big number with nothing on top.', ['一万', 'いちまん', 'ten thousand']], ['方', 4, 'direction, way', 'a dot on top', 'A person pointing a direction, with the head as a dot.', ['夕方', 'ゆうがた', 'evening']]], '力刀');
G('力 has a hook going up and out (a flexed arm); 九 curls its last stroke to the right.', [['力', 4, 'power', 'a flexed arm', 'A muscle flexing: power.', ['力', 'ちから', 'power, strength']], ['九', 5, 'nine', 'a stroke that curls to the right', 'Nine: one short of ten, bending around.', ['九つ', 'ここのつ', 'nine (things)']]], '刀丸');
G('Count the parts. 目 is an eye (three lines inside); 自 adds a dot on top (pointing at your nose: self); 白 is a shorter box with a dot (white); 百 is 一 + 白 (a hundred).', [['目', 5, 'eye', 'an eye turned upright', 'A picture of an eye.', ['目', 'め', 'eye']], ['自', 4, 'self', 'a dot + 目', 'In Japan you point at your nose to say "me".', ['自分', 'じぶん', 'oneself']], ['白', 5, 'white', 'a dot + 日', 'A ray of light from the sun: white.', ['白い', 'しろい', 'white']], ['百', 5, 'hundred', '一 one + 白 white', 'One "white" (pure, round) number: a hundred.', ['百', 'ひゃく', 'hundred']]]);
G('All have 言 (words) on the left. 話 + 舌 tongue (talk); 語 + 吾 (language); 読 + 売 sell (a seller reading out loud). 売 alone means sell.', [['話', 5, 'talk', '言 words + 舌 tongue', 'Words from your tongue: talking.', ['電話', 'でんわ', 'telephone']], ['語', 5, 'language, word', '言 words + 吾 I', 'The words I use: my language.', ['日本語', 'にほんご', 'Japanese language']], ['読', 5, 'read', '言 words + 売 sell', 'A street seller reading words out loud.', ['読む', 'よむ', 'read']], ['売', 4, 'sell', '士 + 冖 + 儿', 'A merchant on legs, carrying goods to sell.', ['売る', 'うる', 'sell']]], '説');
G('All have 雨 (rain) on top. Underneath: ヨ a hand sweeping (snow), 云 swirling (cloud), 申 lightning (electricity).', [['雪', 4, 'snow', '雨 rain + ヨ a hand', 'Rain you can sweep with your hand: snow.', ['雪', 'ゆき', 'snow']], ['雲', 3, 'cloud', '雨 rain + 云 swirl', 'Swirling rain in the sky: a cloud.', ['雲', 'くも', 'cloud']], ['電', 5, 'electricity', '雨 rain + 申 lightning', 'Lightning in the rain: electricity.', ['電気', 'でんき', 'electricity, light']]], '雷');
G('All have 心 (heart) at the bottom. On top: 刍 a running figure (hurry), 音 sound (meaning), 田 field (think).', [['急', 4, 'hurry, sudden', '刍 + ヨ hand + 心 heart', 'Your heart races when you hurry.', ['急ぐ', 'いそぐ', 'hurry']], ['意', 4, 'meaning, mind', '音 sound + 心 heart', 'The sound of your heart: what you mean.', ['意見', 'いけん', 'opinion']], ['思', 4, 'think', '田 field + 心 heart', 'A field in your heart where thoughts grow.', ['思う', 'おもう', 'think']]], '息');
G('Both have 金 (metal) on the left. 銀 + 艮 (silver: the "good" metal); 鉄 + 失 (iron: you lose shine to rust).', [['銀', 4, 'silver', '金 metal + 艮', 'The second-best metal: silver.', ['銀行', 'ぎんこう', 'bank']], ['鉄', 3, 'iron', '金 metal + 失 lose', 'The metal that loses its shine: iron.', ['地下鉄', 'ちかてつ', 'subway']]], '鈴銅');
G('All have 食 (food) on the left. 飯 + 反 (a meal); 飲 + 欠 open mouth (drink); 館 + 官 official (a public building).', [['飯', 4, 'meal, cooked rice', '食 food + 反', 'Food you turn over in the pot: cooked rice.', ['ご飯', 'ごはん', 'meal, rice']], ['飲', 5, 'drink', '食 food + 欠 open mouth', 'An open mouth taking in food: drinking.', ['飲む', 'のむ', 'drink']], ['館', 4, 'building, hall', '食 food + 官 official', 'Where officials were fed and housed: a hall.', ['図書館', 'としょかん', 'library']]], '飼');
G('遠 and 園 share 袁. 遠 walks on 辶 (movement: far away); 園 is inside a fence 囗 (a garden). 近 is 辶 + 斤 (near).', [['遠', 4, 'far', '辶 walk + 袁 long robe', 'Walking a long way in a long robe: far.', ['遠い', 'とおい', 'far']], ['園', 4, 'garden, park', '囗 fence + 袁', 'Something enclosed by a fence: a garden.', ['公園', 'こうえん', 'park']], ['近', 4, 'near', '辶 walk + 斤 axe', 'Walk just an axe\'s length: near.', ['近い', 'ちかい', 'near']]], '違');
G('Both have 女 (woman). 姉 + 市 market (the older sister goes to the market); 妹 + 未 not yet (the younger sister hasn\'t grown up).', [['姉', 4, 'older sister', '女 woman + 市 market', 'The older sister is old enough to go to the market.', ['姉', 'あね', 'my older sister']], ['妹', 4, 'younger sister', '女 woman + 未 not yet', 'The younger sister is not yet grown.', ['妹', 'いもうと', 'my younger sister']]], '姓娘');
G('All contain 青 (blue). 晴 adds 日 sun (clear sky); 静 adds 争 (quiet after a fight).', [['青', 5, 'blue', '生 growing + 月', 'Young growing plants: fresh blue-green.', ['青い', 'あおい', 'blue']], ['晴', 4, 'clear weather', '日 sun + 青 blue', 'Sun and blue sky: clear weather.', ['晴れ', 'はれ', 'sunny weather']], ['静', 4, 'quiet', '青 blue + 争 conflict', 'When the conflict is over, everything is calm and quiet.', ['静か', 'しずか', 'quiet']]], '清');
G('洗 is 先 with water 氵 added.', [['先', 5, 'ahead, previous', '⺧ + 儿 legs', 'Feet stepping ahead of others.', ['先生', 'せんせい', 'teacher']], ['洗', 4, 'wash', '氵 water + 先 ahead', 'Water before anything else: wash first.', ['洗う', 'あらう', 'wash']]], '光流');
G('All have the broom shape 帚 on the right. 帰 has 刂-like strokes (going home); 婦 has 女 woman; 掃 has 扌 hand (sweeping).', [['帰', 4, 'return home', '刂 + 帚 broom', 'Going home, where the broom is.', ['帰る', 'かえる', 'return home']], ['婦', 3, 'woman, wife', '女 woman + 帚 broom', 'A woman with a broom (an old picture of a housewife).', ['主婦', 'しゅふ', 'housewife']], ['掃', 3, 'sweep', '扌 hand + 帚 broom', 'A hand holding a broom: sweeping.', ['掃除', 'そうじ', 'cleaning']]], '師');
G('Both have 癶 (two feet) on top. 発 has 弓 bow-like strokes (set off); 登 has 豆 (climbing up the steps).', [['発', 4, 'depart, emit', '癶 feet + 开-like base', 'Feet pushing off: departure.', ['出発', 'しゅっぱつ', 'departure']], ['登', 3, 'climb', '癶 feet + 豆 a stand', 'Feet stepping up onto a stand: climb.', ['登る', 'のぼる', 'climb']]], '祭癸');
G('Both have 斗 (a measuring cup) on the right. 料 + 米 rice (measuring ingredients); 科 + 禾 grain (sorting into sections).', [['料', 4, 'materials, fee', '米 rice + 斗 measure', 'Measuring rice: ingredients, and what they cost.', ['料理', 'りょうり', 'cooking']], ['科', 4, 'section, subject', '禾 grain + 斗 measure', 'Measuring grain into categories: a subject.', ['科学', 'かがく', 'science']]], '秒斗');
G('荷 is 何 with grass 艹 on top.', [['何', 5, 'what', '亻 person + 可', 'A person asking "what can I do?"', ['何', 'なに', 'what']], ['荷', 3, 'load, luggage', '艹 grass + 何', 'A person carrying a bundle of grass on their back.', ['荷物', 'にもつ', 'luggage']]], '河可');
G('薬 is 楽 with grass 艹 on top.', [['楽', 4, 'fun, comfortable', 'a drum on a wooden stand', 'Music from a drum: fun and comfort.', ['楽しい', 'たのしい', 'fun']], ['薬', 4, 'medicine', '艹 grass + 楽 comfortable', 'Herbs that make you comfortable again: medicine.', ['薬', 'くすり', 'medicine']]], '業率');
G('All have 艹 (grass) on top. Underneath: 人 + 木 (tea), 采 a picking hand (vegetables), 化 change (flower).', [['茶', 4, 'tea', '艹 grass + 人 + 木', 'A person between grass and tree: tea leaves.', ['お茶', 'おちゃ', 'tea']], ['菜', 3, 'vegetable', '艹 grass + 采 picking', 'Plants you pick by hand: vegetables.', ['野菜', 'やさい', 'vegetable']], ['花', 4, 'flower', '艹 grass + 化 change', 'A plant that changes into a flower.', ['花', 'はな', 'flower']]], '苦');
G('Both have 竹 (bamboo) on top. 答 + 合 fit together (an answer fits the question); 笑 + 夭 (bamboo bending like a laughing face).', [['答', 4, 'answer', '竹 bamboo + 合 fit', 'Bamboo slips that fit together: question and answer.', ['答え', 'こたえ', 'answer']], ['笑', 3, 'laugh', '竹 bamboo + 夭', 'Bamboo leaves bending like a laughing face.', ['笑う', 'わらう', 'laugh']]], '筆箱');
G('草 is 早 with grass 艹 on top.', [['早', 4, 'early', '日 sun + 十', 'The sun just above the horizon: early.', ['早い', 'はやい', 'early']], ['草', 3, 'grass', '艹 grass + 早', 'Grass that comes up early.', ['草', 'くさ', 'grass']]], '旱卓');
G('Both have 台 on the right. 始 + 女 (a woman: life begins); 治 + 氵 water (calming water: cure, govern).', [['始', 4, 'begin', '女 woman + 台', 'Life begins with a woman.', ['始める', 'はじめる', 'begin']], ['治', 3, 'cure, govern', '氵 water + 台', 'Controlling the river: governing, healing.', ['治る', 'なおる', 'get better (illness)']]], '台冶');
G('Both have 糸 (thread) on the left. 終 + 冬 winter (the end of the year); 給 + 合 (supplying what fits).', [['終', 4, 'end', '糸 thread + 冬 winter', 'The end of the thread, the end of the year: end.', ['終わる', 'おわる', 'end']], ['給', 3, 'supply, pay', '糸 thread + 合 fit', 'Thread supplied to fit the need: pay.', ['給料', 'きゅうりょう', 'salary']]], '絵組');
G('横 is 黄 with 木 (tree) on the left.', [['黄', 3, 'yellow', '廿 + 由 + 八', 'A burning arrow\'s yellow light.', ['黄色', 'きいろ', 'yellow']], ['横', 3, 'side, horizontal', '木 tree + 黄', 'A wooden bar laid sideways.', ['横', 'よこ', 'side']]], '演寅');
G('Both have 亻 (person). 使 + 吏 an official (using people); 便 + 更 (making things easier: convenient, mail).', [['使', 4, 'use', '亻 person + 吏 official', 'An official uses people to get work done.', ['使う', 'つかう', 'use']], ['便', 4, 'convenient, mail', '亻 person + 更 renew', 'A person who makes things easier: convenience.', ['不便', 'ふべん', 'inconvenient']]], '吏更');
G('All have 僉 on the right. 験 + 馬 horse (testing a horse: exam); 険 + 阝 hill (a steep hill: danger); 検 + 木 wood (inspecting timber).', [['験', 4, 'test', '馬 horse + 僉', 'Testing a horse before buying it: an exam.', ['試験', 'しけん', 'exam']], ['険', 3, 'steep, dangerous', '阝 hill + 僉', 'A steep hill: danger.', ['危険', 'きけん', 'danger']], ['検', 3, 'inspect', '木 wood + 僉', 'Inspecting wood for cracks.', ['点検', 'てんけん', 'inspection, check-up']]], '剣');
G('All have 責. 責 alone has 貝 money (a debt: responsibility); 績 + 糸 thread (spinning results); 積 + 禾 grain (piling up).', [['責', 3, 'responsibility, blame', '龶 thorns + 貝 money', 'A debt that pricks you: responsibility.', ['責任', 'せきにん', 'responsibility']], ['績', 3, 'achievement', '糸 thread + 責', 'Thread spun day after day: your results.', ['成績', 'せいせき', 'grades, results']], ['積', 3, 'pile up', '禾 grain + 責', 'Grain piled up.', ['積もる', 'つもる', 'pile up (snow)']]], '債');
G('Both end in 戠. 職 + 耳 ear (listening to your boss: a job); 識 + 言 words (knowledge).', [['職', 3, 'job, employment', '耳 ear + 戠', 'An ear listening to instructions: a job.', ['職業', 'しょくぎょう', 'occupation']], ['識', 3, 'know, knowledge', '言 words + 戠', 'Words you have taken in: knowledge.', ['知識', 'ちしき', 'knowledge']]], '織繊');
G('Both contain 免. 晩 + 日 sun (evening); 勉 + 力 power (making an effort).', [['晩', 4, 'evening', '日 sun + 免 escape', 'The sun escapes: evening.', ['今晩', 'こんばん', 'tonight']], ['勉', 4, 'effort', '免 + 力 power', 'Using all your power: effort, study.', ['勉強', 'べんきょう', 'study']]], '免挽');
G('Both contain 央 (center) and read えい. 映 + 日 sun (light: projecting images); 英 + 艹 grass (a brilliant flower: English, from 英国).', [['映', 4, 'reflect, project', '日 sun + 央 center', 'Light at the center of the screen: a movie.', ['映画', 'えいが', 'movie']], ['英', 4, 'brilliant, English', '艹 grass + 央 center', 'The finest flower in the middle: brilliant.', ['英語', 'えいご', 'English']]], '央味');
G('Both have 方 + a flag 𠂉. 族 has 矢 an arrow (a clan under one flag); 旅 has people (travelers under a flag).', [['族', 4, 'family, tribe', '方 + 𠂉 flag + 矢 arrow', 'Fighters with arrows under one flag: a clan.', ['家族', 'かぞく', 'family']], ['旅', 4, 'travel', '方 + 𠂉 flag + people', 'People following a flag: a tour.', ['旅行', 'りょこう', 'travel']]], '施旋');
G('健 is 建 with a person 亻 added.', [['建', 4, 'build', '廴 stretch + 聿 brush', 'Drawing the plan, then building it.', ['建物', 'たてもの', 'building']], ['健', 3, 'healthy', '亻 person + 建 build', 'A person who is well built: healthy.', ['健全', 'けんぜん', 'healthy, sound']]], '律鍵');
G('Both walk on 辶. 週 + 周 around (a week goes round); 過 + 咼 (going past).', [['週', 4, 'week', '辶 walk + 周 around', 'Walking all the way around: a week.', ['毎週', 'まいしゅう', 'every week']], ['過', 3, 'pass, exceed', '辶 walk + 咼', 'Walking past: too much, passing time.', ['過ぎる', 'すぎる', 'pass, exceed']]], '遇周');
G('今 has a roof 𠆢 + one line and フ; 会 has 𠆢 + 云 (people meeting under a roof); 冷 has ice 冫 + 令.', [['今', 5, 'now', '𠆢 roof + フ', 'Under the roof, right now.', ['今', 'いま', 'now']], ['会', 5, 'meet', '𠆢 roof + 云', 'People gathering under one roof.', ['会う', 'あう', 'meet']], ['冷', 3, 'cold', '冫 ice + 令 order', 'Ice: cold to the touch.', ['冷たい', 'つめたい', 'cold (to the touch)']]], '令');

/* ── plain kanji ── */
[[5, N5], [4, N4], [3, N3]].forEach( ([lv,text]) => text.trim().split('\n').filter(l => l.trim()).forEach(line => {
    const [k,mean,on,kun,parts,story,words] = line.split('|').map(s => s.trim());
    const ws = words.split(';').map(w => {
        const [a,b,...c] = w.split(':');
        return [a.trim(), b.trim(), c.join(':').trim()];
    }
    );
    PLAIN_KANJI.push({
        k,
        lv,
        mean,
        on,
        kun,
        parts,
        story,
        words: ws,
        word: ws[0],
        plain: true
    });
}
));
[5, 4, 3].forEach(lv => {
    const list = PLAIN_KANJI.filter(it => it.lv === lv);
    for (let i = 0; i < list.length; i += 10)
        KANJI_SETS.push({
            id: `ks${lv}-${i / 10}`,
            lv,
            items: list.slice(i, i + 10)
        });
}
);

/* ── level rule: a level-L question shows only kanji from L or easier (N5 = 5 is easiest) ── */
const KANJI_LV = new Map([...PLAIN_KANJI.map(it => [it.k, it.lv]), ...KANJI_GROUPS.flatMap(g => g.items.map(it => [it.k, it.lv]))]);
const HAN = /[\u3400-\u4dbf\u4e00-\u9fff]/g;
/** True when every kanji in `text` is taught at level `lv` or an easier one. Kanji outside N5–N3 are never allowed. */
export const kanjiOK = (text, lv) => [...String(text).matchAll(HAN)].every( ([c]) => (KANJI_LV.get(c) || 0) >= lv);

/* ── build questions ── */
const VOICE = {
    か: 'が',
    き: 'ぎ',
    く: 'ぐ',
    け: 'げ',
    こ: 'ご',
    さ: 'ざ',
    し: 'じ',
    す: 'ず',
    せ: 'ぜ',
    そ: 'ぞ',
    た: 'だ',
    ち: 'ぢ',
    て: 'で',
    と: 'ど',
    は: 'ば',
    ひ: 'び',
    ふ: 'ぶ',
    へ: 'べ',
    ほ: 'ぼ'
};
const UNVOICE = Object.fromEntries(Object.entries(VOICE).map( ([a,b]) => [b, a]));
/** Plausible misreadings of a reading: vowel length, voicing, small っ. Each with its trap tag. */
function variants(r) {
    const out = [];
    const lu = r.search(/[おこそとのほもよろごぞどぼぽょゅうくすつぬふむゆるぐずぶ]う/);
    if (lu >= 0)
        out.push([r.slice(0, lu + 1) + r.slice(lu + 2), 'long']);
    else {
        const o = r.search(/[こそとのほもよろごぞどぼょ]/);
        if (o >= 0)
            out.push([r.slice(0, o + 1) + 'う' + r.slice(o + 1), 'long']);
    }
    for (let i = 0; i < r.length; i++) {
        const c = r[i];
        if ((VOICE[c] || UNVOICE[c]) && !'ちつぢづ'.includes(c)) {
            out.push([r.slice(0, i) + (VOICE[c] || UNVOICE[c]) + r.slice(i + 1), 'voice']);
            break;
        }
    }
    if (r.includes('っ'))
        out.push([r.replace('っ', ''), 'soku']);
    else {
        // a small っ is only possible right before a k / s / t / p sound
        for (let i = 1; i < r.length; i++)
            if ('かきくけこさしすせそたちつてとぱぴぷぺぽ'.includes(r[i]) && !'っんー'.includes(r[i - 1])) {
                out.push([r.slice(0, i) + 'っ' + r.slice(i), 'soku']);
                break;
            }
    }
    return out;
}
/** Reading question for [word, reading, meaning]: look-alike readings ('shape'), mishearings, then other readings ('read'). */
function readingQ([word,reading,wmean], shapeReadings, fillReadings) {
    const opts = []
      , tags = [];
    shapeReadings.forEach(r => {
        if (r !== reading && !opts.includes(r)) {
            opts.push(r);
            tags.push('shape');
        }
    }
    );
    variants(reading).forEach( ([v,t]) => {
        if (v !== reading && !opts.includes(v)) {
            opts.push(v);
            tags.push(t);
        }
    }
    );
    if (opts.length < 3)
        fillReadings().forEach(r => {
            if (opts.length < 3 && r !== reading && !opts.includes(r)) {
                opts.push(r);
                tags.push('read');
            }
        }
        );
    if (opts.length < 3)
        return null;
    const pick = [...opts.keys()].sort( (a, b) => (tags[a] === 'shape') - (tags[b] === 'shape') || 0).slice(0, 3);
    return {
        t: 'kr',
        q: `<u>${word}</u>`,
        o: [reading, ...pick.map(i => opts[i])],
        e: `${word} = ${reading} (${wmean}).`,
        d: pick.map(i => tags[i])
    };
}
/* Plain kanji have no hand-picked look-alikes, so wrong options are kanji that share a part (from the parts text),
   then neighbours of the same level. */
const CJK = /[\u2E80-\u2FDF\u3400-\u9FFF\uF900-\uFAFF]/g;
const ALL = [...KANJI_GROUPS.flatMap(g => g.items), ...PLAIN_KANJI];
const partsOf = it => new Set([...(it.parts.match(CJK) || [])].filter(c => c !== it.k));
const PARTS = new Map(ALL.map(it => [it.k, partsOf(it)]))
  , POS = new Map(ALL.map( (it, i) => [it.k, i]));
/** Kanji sharing parts with it. By default only ones at its level or easier; any = true also takes harder ones
    (orthography wrong options, which the real test draws from look-alikes above the level too). */
function lookAlikes(it, n=3, any=false) {
    const mine = PARTS.get(it.k);
    const scored = ALL.filter(x => x.k !== it.k && (any || x.lv >= it.lv)).map(x => {
        const theirs = PARTS.get(x.k);
        let sc = [...mine].filter(c => theirs.has(c)).length + (mine.has(x.k) || theirs.has(it.k) ? 1 : 0);
        return {
            x,
            sc,
            near: Math.abs(x.lv - it.lv) * 1000 + Math.abs(POS.get(x.k) - POS.get(it.k))
        };
    }
    ).sort( (a, b) => b.sc - a.sc || a.near - b.near);
    return scored.slice(0, n).map(s => s.x);
}
KANJI_GROUPS.forEach( (g, gi) => {
    g.id = 'kg' + gi;
    const chars = g.items.map(x => x.k)
      , pool = [...chars, ...g.alts.filter(a => !chars.includes(a))];
    g.items.forEach(it => {
        // the group's own look-alikes first; if harder kanji had to be dropped, top up with same-level kanji sharing a part
        const own = pool.filter(c => c !== it.k && kanjiOK(c, it.lv));
        const [word,reading,wmean] = it.word
          , others = [...own, ...lookAlikes(it, 6).map(x => x.k).filter(c => !own.includes(c))].slice(0, Math.max(3, own.length));
        const wordOK = kanjiOK(word, it.lv);
        // orthography wrong options may use harder look-alikes, as the real 表記 does: the whole group first, then shared parts
        const all = pool.filter(c => c !== it.k)
          , spell = [...all, ...lookAlikes(it, 6, true).map(x => x.k).filter(c => !all.includes(c))].slice(0, 3);
        const diff = g.tip;
        it.group = g.id;
        it.qids = [];
        const push = q => {
            BANK.push({
                lv: it.lv,
                s: 'kanji',
                kj: it.k,
                ...q
            });
            it.qids.push(q.id);
        }
        ;
        // 1) look-alike orthography: same word with a look-alike kanji swapped in
        if (wordOK && spell.length >= 3)
            push({
                id: `kj-${it.k}-ko`,
                t: 'ko',
                q: `<u>${reading}</u>（${wmean}）`,
                o: [word, ...spell.map(c => word.replace(it.k, c))],
                e: `${reading} = ${word}. ${it.k}: ${it.parts}. ${diff}`,
                d: ['shape', 'shape', 'shape']
            });
        // 2) reading: readings of look-alike words + typical mishearings
        const q = readingQ(it.word, g.items.filter(x => x !== it).map(x => x.word[1]), () => KANJI_GROUPS.slice(gi + 1).concat(KANJI_GROUPS.slice(0, gi)).flatMap(ng => ng.items.map(x => x.word[1])));
        if (q && wordOK)
            push({
                id: `kj-${it.k}-kr`,
                ...q
            });
        // 3) meaning → which kanji
        if (others.length >= 3)
            push({
                id: `kj-${it.k}-km`,
                t: 'km',
                q: `Which kanji means <b>${it.mean}</b>?`,
                o: [it.k, ...others.slice(0, 3)],
                e: `${it.k} = ${it.mean}: ${it.parts}. ${it.story} ${diff}`,
                d: ['shape', 'shape', 'shape']
            });
        // 4) typing the reading
        if (wordOK) {
            BANK.push({
                id: `kj-${it.k}-ty`,
                lv: it.lv,
                s: 'typing',
                t: 'ty',
                kj: it.k,
                q: `<u>${word}</u>（${wmean}）`,
                ans: [reading],
                e: `${word} = ${reading}. ${it.k}: ${it.parts}.`
            });
            it.qids.push(`kj-${it.k}-ty`);
        }
        KANJI[it.k] = it;
    }
    );
}
);

PLAIN_KANJI.forEach( (it, pi) => {
    it.qids = [];
    const push = q => {
        BANK.push({
            lv: it.lv,
            s: 'kanji',
            kj: it.k,
            ...q
        });
        it.qids.push(q.id);
    }
    ;
    const alike = lookAlikes(it)
      , others = alike.map(x => x.k);
    // example word for the spelling and typing questions: the first one whose kanji are all at this level or easier
    const shown = kanjiOK(it.word[0], it.lv) ? it.word : it.words.find(w => kanjiOK(w[0], it.lv));
    const [word,reading,wmean] = shown || it.word;
    const how = `${it.k} (${it.mean}): ${it.parts}. Wrong options share a part with it: ${others.join(' ')}.`;
    const spell = lookAlikes(it, 3, true).map(x => x.k);
    // harder look-alikes allowed here, as in the real 表記
    if (shown)
        push({
            id: `kj-${it.k}-ko`,
            t: 'ko',
            q: `<u>${reading}</u>（${wmean}）`,
            o: [word, ...spell.map(c => word.split(it.k).join(c))],
            e: `${reading} = ${word}. ${it.k} (${it.mean}): ${it.parts}. Wrong options share a part with it: ${spell.join(' ')}.`,
            d: ['shape', 'shape', 'shape']
        });
    const near = () => PLAIN_KANJI.slice(pi + 1).concat(PLAIN_KANJI.slice(0, pi)).flatMap(x => x.words.map(w => w[1]));
    // the kanji's other readings swapped into the word (男性 → なんせい): the "wrong reading of a known kanji" trap
    const own = [...new Set([...it.on.split('・').map(r => r.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))), ...it.kun.split('・').map(r => r.split('.')[0])])].filter(r => r && r !== '-');
    it.words.forEach( (w, wi) => {
        if (!kanjiOK(w[0], it.lv))
            return;
        // keep wi so IDs of the other words don't move
        const hit = own.filter(r => w[1].includes(r)).sort( (a, b) => b.length - a.length)[0];
        const swaps = hit ? own.filter(r => r !== hit).map(r => w[1].replace(hit, r)).filter(r => r !== w[1]).slice(0, 2) : [];
        const q0 = readingQ(w, [], near);
        const q = q0 && swaps.length ? ( () => {
            const keep = q0.o.slice(1).map( (o, i) => [o, q0.d[i]]).filter( ([o]) => !swaps.includes(o)).slice(0, 3 - swaps.length);
            return {
                ...q0,
                o: [w[1], ...swaps, ...keep.map(x => x[0])],
                d: [...swaps.map( () => 'read'), ...keep.map(x => x[1])]
            };
        }
        )() : q0;
        if (q)
            push({
                id: `kj-${it.k}-kr${wi ? wi + 1 : ''}`,
                ...q,
                e: `${q.e} ${it.k}: on ${it.on}, kun ${it.kun}.`
            });
    }
    );
    push({
        id: `kj-${it.k}-km`,
        t: 'km',
        q: `Which kanji means <b>${it.mean}</b>?`,
        o: [it.k, ...others],
        e: `${it.k} = ${it.mean}: ${it.parts}. ${it.story}`,
        d: ['shape', 'shape', 'shape']
    });
    if (shown) {
        BANK.push({
            id: `kj-${it.k}-ty`,
            lv: it.lv,
            s: 'typing',
            t: 'ty',
            kj: it.k,
            q: `<u>${word}</u>（${wmean}）`,
            ans: [reading],
            e: `${word} = ${reading}. ${it.k}: ${it.parts}.`
        });
        it.qids.push(`kj-${it.k}-ty`);
    }
    KANJI[it.k] = it;
}
);


whats hits tho

becasue i can see two categories of kanjis
like look alike and non look alike
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-19T12:26:29+09:00.

The user's current state is as follows:
Active Document: c:\Users\raghu\Desktop\japanese\kanji_n5.json (LANGUAGE_UNSPECIFIED)
Cursor is on line: 17
</ADDITIONAL_METADATA>
