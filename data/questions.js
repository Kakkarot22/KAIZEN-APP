/* Road to N3 — original practice questions in JLPT format (N5–N3).
   These are NOT official JLPT items.

   Multiple-choice entry: [question, [correct, wrong1, wrong2, wrong3], explanation, "trap1 trap2 trap3", [note1, note2, note3]?, "tested word"?]
     - option [0] is always the correct one; the app shuffles the order.
     - the trap string tags WHY each wrong option is tempting (see TRAPS in diagnose.js).
     - optional notes: one per wrong option, shown when the learner picks that option. Without them the app
       builds a note from the question itself (mistakeNote in diagnose.js).
     - optional tested word: the dictionary form from data/jlpt/*.csv that this question tests
       (e.g. "飲む"). tools/coverage.mjs uses it to track syllabus coverage.
   IDs come from position, so always append new items at the END of a list. */

import WORDS from './generated/words.js';
import {PASSAGE_TR, LISTEN_TR} from './translations/index.js';

export const BANK = [];
export const PASSAGES = {};
/* Reading format of each passage, as in the real test: short 短文 (1 question), mid 中文, long 長文 (N3 only), info 情報検索.
   The mock exam picks passages by this, in the real per-test mix. */
export const PASSAGE_KIND = {};
const KINDS = ['short', 'mid', 'long', 'info'];
const OLD_KIND = {
    n5p1: 'short',
    n5p2: 'short',
    n5p3: 'mid',
    n4p1: 'short',
    n4p2: 'short',
    n4p3: 'mid',
    n4p4: 'info',
    n3p1: 'short',
    n3p2: 'short',
    n3p3: 'mid',
    n3p4: 'long',
    n3p5: 'info'
};

const SEC = {
    kr: 'kanji',
    ko: 'kanji',
    vc: 'vocab',
    vp: 'vocab',
    vu: 'vocab',
    gf: 'grammar',
    go: 'grammar',
    tg: 'grammar',
    rd: 'reading',
    ls: 'listening'
};
const tags = s => (s || '').split(/\s+/).filter(Boolean);

/* Items that tested a kanji above their level. They stay in the lists so later IDs don't move, but aren't used. */
const RETIRED = new Set(["n5-kr-4", "n5-ko-4", "n4-kr-1", "n4-kr-4", "n4-ko-6", "n3-kr-5", "n3-kr-6", "n3-kr-8", "n3-kr-11", "n3-kr-12", "n3-ko-4"]);
/* English translations of the hand-written kanji, vocabulary and older grammar sentences, keyed by question ID
   (paraphrase: the prompt sentence; usage: the correct sentence). */
const SENTENCE_TR = {
    "n5-kr-1": "I climbed a mountain.",
    "n5-kr-2": "I get up at nine every morning.",
    "n5-kr-3": "I bought a white bag.",
    "n5-kr-5": "My mother is good at cooking.",
    "n5-kr-6": "The eastern sky is bright.",
    "n5-kr-7": "This shop is cheap.",
    "n5-kr-8": "Let's meet at three in the afternoon.",
    "n5-kr-9": "There is a park to the north of the station.",
    "n5-kr-10": "I study Japanese every day.",
    "n5-kr-11": "I'm going to Japan next month.",
    "n5-kr-12": "Please write your name here.",
    "n5-kr-13": "Please turn off the light.",
    "n5-kr-14": "Who is that man?",
    "n5-kr-15": "I want to go abroad.",
    "n5-ko-1": "My ears hurt.",
    "n5-ko-2": "I go to school by train.",
    "n5-ko-3": "I watch films on my days off.",
    "n5-ko-5": "I walk toward the west.",
    "n5-ko-6": "These are new shoes.",
    "n5-ko-7": "Please turn right at the next corner.",
    "n5-ko-8": "I'll be at home tomorrow morning.",
    "n5-ko-9": "I listened to the teacher's talk.",
    "n5-ko-10": "What is that tall building?",
    "n5-ko-11": "The exit is over there.",
    "n4-kr-2": "We don't have time, so please hurry.",
    "n4-kr-3": "I caught a cold, so I'm going to the hospital.",
    "n4-kr-5": "Where is the highest mountain in the world?",
    "n4-kr-6": "I made plans for the summer holidays.",
    "n4-kr-7": "My father works at a bank.",
    "n4-kr-8": "Someone drove me to the station.",
    "n4-kr-9": "Today is a special day.",
    "n4-kr-10": "I cook in the kitchen.",
    "n4-kr-11": "On weekends I travel with my family.",
    "n4-kr-12": "Please don't walk on dark streets at night.",
    "n4-kr-13": "It rained from the evening.",
    "n4-kr-14": "I'm going to the department store to buy clothes.",
    "n4-kr-15": "May I borrow this book?",
    "n4-kr-16": "I study at the library.",
    "n4-ko-1": "I asked the teacher a question.",
    "n4-ko-2": "Please wait here a little.",
    "n4-ko-3": "Please tell us your opinion.",
    "n4-ko-4": "This room is spacious, isn't it?",
    "n4-ko-5": "Please collect everyone's homework.",
    "n4-ko-7": "Would you like to go see a film this Sunday?",
    "n4-ko-8": "I'm getting ready for next month's trip.",
    "n4-ko-9": "My younger brother is a university student.",
    "n4-ko-10": "Please don't take photos here.",
    "n4-ko-11": "May I use this computer?",
    "n3-kr-1": "I changed my travel plans.",
    "n3-kr-2": "I agree with his opinion.",
    "n3-kr-3": "Please check the time of the meeting.",
    "n3-kr-4": "Children grow up fast.",
    "n3-kr-7": "I left my luggage at the front desk.",
    "n3-kr-9": "I've decided to quit my company next month.",
    "n3-kr-10": "The view from the top of the mountain is wonderful.",
    "n3-kr-13": "My bag was stolen on the train.",
    "n3-kr-14": "Her dream is to become a doctor.",
    "n3-kr-15": "My salary goes up from next month.",
    "n3-kr-16": "Swimming in this river is dangerous.",
    "n3-kr-17": "Getting up early is a good habit.",
    "n3-kr-18": "When she got the present, she looked happy.",
    "n3-kr-19": "I went to the airport to pick up a friend.",
    "n3-kr-20": "When night came, the temperature suddenly dropped.",
    "n3-kr-21": "I worked hard every day and passed the exam.",
    "n3-ko-1": "My older brother passed the university entrance exam.",
    "n3-ko-2": "I study economics at university.",
    "n3-ko-3": "Please press this button.",
    "n3-ko-5": "I reported the results to the department manager.",
    "n3-ko-6": "The train was late because of snow.",
    "n3-ko-7": "I said goodbye to my friend at the station.",
    "n3-ko-8": "I believe what he says.",
    "n3-ko-9": "I'm planning to attend next week's meeting.",
    "n3-ko-10": "I lost to my opponent in the final.",
    "n3-ko-11": "This problem is very difficult.",
    "n3-ko-12": "The plane arrived earlier than scheduled.",
    "n3-ko-13": "At the weekend, I visited my teacher's home.",
    "n5-vc-1": "It's cold, so please close the window.",
    "n5-vc-2": "The room is dark, isn't it? Shall I turn on the light?",
    "n5-vc-3": "I sleep eight hours every night.",
    "n5-vc-4": "I bought three notebooks.",
    "n5-vc-5": "It rained yesterday, but today the sky is blue and the weather is nice.",
    "n5-vc-6": "This curry is really spicy. Some water, please.",
    "n5-vc-7": "I borrowed a book from the library.",
    "n5-vc-8": "My grandmother is my father's mother.",
    "n5-vc-9": "It's hot, so please turn on the air conditioner.",
    "n5-vc-10": "In the morning, I brush my teeth and then eat breakfast.",
    "n5-vc-11": "I take a shower and then go to bed.",
    "n5-vc-12": "I took my medicine, so I'm fine now.",
    "n5-vc-13": "Let's take a photo. Everyone, please line up.",
    "n5-vc-14": "It's raining, so I'll take an umbrella.",
    "n5-vc-15": "It's cold, so I'll put on a sweater.",
    "n5-vc-16": "In Japanese homes, you take off your shoes at the entrance.",
    "n5-vc-17": "It takes 10 minutes to walk to the station.",
    "n5-vc-18": "Go straight along this road and turn right at the next corner.",
    "n5-vc-19": "I get off the train at the next station.",
    "n5-vc-20": "I take the bus to school.",
    "n5-vc-21": "I write in my diary every day.",
    "n5-vc-22": "I like playing the piano.",
    "n5-vc-23": "That person is tall, isn't he? He's about two meters.",
    "n5-vc-24": "This bag is heavy. What's in it?",
    "n5-vc-25": "Yesterday I had a headache, so I stayed home from school.",
    "n5-vc-26": "I have a fever, so I'm going to the hospital.",
    "n5-vc-27": "I bought five stamps at the post office.",
    "n5-vc-28": "Two bottles of beer, please.",
    "n5-vc-29": "There are three dogs in the park.",
    "n5-vc-30": "There are five students in the classroom.",
    "n5-vc-31": "Excuse me, two cups of coffee, please.",
    "n5-vc-32": "My home is on the fifth floor of this building.",
    "n5-vc-33": "I love sweet things. I eat cake every day.",
    "n5-vc-34": "I'm busy with work every day, so I rest at home on Sundays.",
    "n5-vc-35": "The room is hot, so let's open the window.",
    "n5-vc-36": "This book is easy, so even children can read it.",
    "n5-vc-37": "I gave my older brother a tie. It was his birthday.",
    "n5-vc-38": "My friend gave me flowers.",
    "n5-vc-39": "I'm hungry. Let's eat something.",
    "n5-vc-40": "I'm thirsty, so I'll drink some water.",
    "n5-vc-41": "It's already late, so I'll be going soon.",
    "n5-vc-42": "Before eating, you say \"itadakimasu.\"",
    "n5-vc-43": "Vegetables are cheap at this supermarket, so I often come here to shop.",
    "n5-vc-44": "Tomorrow is a day off, so I don't have to get up early.",
    "n5-vc-45": "I'm waiting for my friend in front of the cinema.",
    "n5-vc-46": "Guests are coming tomorrow, so let's clean the room.",
    "n5-vp-1": "This room isn't clean.",
    "n5-vp-2": "I saw a film the day before yesterday.",
    "n5-vp-3": "Mr. Yamada is bad at tennis.",
    "n5-vp-4": "There are always few people at that shop.",
    "n5-vp-5": "I did my homework last night.",
    "n5-vp-6": "This room is small.",
    "n5-vp-7": "The bread at that shop tastes bad.",
    "n5-vp-8": "I don't like fruit.",
    "n5-vp-9": "My mother is in the kitchen.",
    "n5-vp-10": "Tomorrow is my day off.",
    "n5-vp-11": "Mr. Tanaka is famous.",
    "n5-vp-12": "This question isn't difficult.",
    "n5-vp-13": "I go to bed at 11 every night.",
    "n5-vp-14": "My parents are well.",
    "n5-vp-15": "I turn twenty next year.",
    "n5-vp-16": "The light in the room is off.",
    "n5-vp-17": "The station is close to here.",
    "n4-vc-1": "I'm interested in Japanese culture.",
    "n4-vc-2": "I was late for an important meeting and got scolded by the department manager.",
    "n4-vc-3": "There are a lot of cars on this road, so please be careful when you cross.",
    "n4-vc-4": "When I visited my teacher's home, I brought a gift.",
    "n4-vc-5": "I caught a cold and my throat hurts.",
    "n4-vc-6": "I practiced every day, so my Japanese has gotten a lot better.",
    "n4-vc-7": "Our child was born, so we decided to move to a bigger apartment.",
    "n4-vc-8": "It looked like rain, so I brought the laundry inside.",
    "n4-vc-9": "The phone is ringing. Please answer it quickly.",
    "n4-vc-10": "I caught a cold and stayed home from school.",
    "n4-vc-11": "I study every day so that I can pass the exam.",
    "n4-vc-12": "I helped my friend move house.",
    "n4-vc-13": "The elevator wasn't working, so I went up the stairs.",
    "n4-vc-14": "I booked a popular restaurant for the weekend in advance.",
    "n4-vc-15": "I promised to meet my friend at three.",
    "n4-vc-16": "Have you gotten used to life in Japan yet?",
    "n4-vc-17": "I have a habit of jogging every morning.",
    "n4-vc-18": "This room is dark, so please open the curtains.",
    "n4-vc-19": "This door opens automatically when someone comes near.",
    "n4-vc-20": "I fell asleep with the light on.",
    "n4-vc-21": "These are important documents, so please be careful not to lose them.",
    "n4-vc-22": "I really like the cakes at this shop, so I buy them every week.",
    "n4-vc-23": "If the meeting time changes, please let me know.",
    "n4-vc-24": "I took my injured friend to the hospital.",
    "n4-vc-25": "I bought shoes at the department store and paid by card.",
    "n4-vc-26": "I forgot to return the book I borrowed from the library.",
    "n4-vc-27": "I didn't know the way, so I asked for directions at the police box.",
    "n4-vc-28": "The person next door is noisy, so I can't sleep well at night.",
    "n4-vc-29": "This shirt is too small, so it doesn't fit me.",
    "n4-vc-30": "The sports day was cancelled because of rain.",
    "n4-vc-31": "Swimming in this river is prohibited.",
    "n4-vc-32": "Guests are coming, so I tidied up the room.",
    "n4-vc-33": "I dropped my wallet at the station.",
    "n4-vc-34": "I had my teacher correct the mistakes in my essay.",
    "n4-vc-35": "Let's walk carefully so we don't get hit by a car.",
    "n4-vc-36": "I left my wallet at home.",
    "n4-vc-37": "This restaurant is cheap, yet the food tastes good.",
    "n4-vc-38": "I have an early morning tomorrow, so I set my alarm clock for six.",
    "n4-vp-1": "Are you ready for the trip yet?",
    "n4-vp-2": "That novel wasn't very interesting.",
    "n4-vp-3": "Mountains at night are dangerous.",
    "n4-vp-4": "My younger brother told our mother a lie.",
    "n4-vp-5": "My younger brother tidied up his room.",
    "n4-vp-6": "Those two look exactly alike.",
    "n4-vp-7": "My father quit drinking.",
    "n4-vp-8": "The roads were empty yesterday.",
    "n4-vp-9": "This job is tough.",
    "n4-vp-10": "A little while ago, there was a call from Mr. Tanaka.",
    "n4-vp-11": "This problem is complicated.",
    "n4-vp-12": "My mother is out.",
    "n4-vp-13": "I go for a walk every morning.",
    "n4-vp-14": "This camera is broken.",
    "n4-vu-1": "He practices hard every day.",
    "n4-vu-2": "The station attendant kindly showed me the way.",
    "n4-vu-3": "Tomorrow isn't convenient for me, so I can't go.",
    "n4-vu-4": "The air conditioner broke down, and the room is hot.",
    "n4-vu-5": "Before going out, I checked whether I had locked the door.",
    "n4-vu-6": "The children made a racket in the classroom and got scolded by the teacher.",
    "n4-vu-7": "I found a wallet on the street and took it to the police box.",
    "n4-vu-8": "I boiled water to make tea.",
    "n4-vu-9": "I decorated the room with flowers.",
    "n4-vu-10": "The bus leaves Tokyo Station at eight.",
    "n4-vu-11": "Don't hold back — please eat a lot.",
    "n3-vc-1": "Because of the typhoon, the trains were two hours late.",
    "n3-vc-2": "He always keeps his promises, so everyone trusts him.",
    "n3-vc-3": "This medicine works well, so my fever went down right away.",
    "n3-vc-4": "Even if you fail, don't give up — try once more.",
    "n3-vc-5": "There was a long line in front of the popular ramen shop.",
    "n3-vc-6": "The president's talk was short, and the points were clear.",
    "n3-vc-7": "Ms. Yamada was chosen as the leader to pull the project together.",
    "n3-vc-8": "Because of rain, the match was postponed to next week.",
    "n3-vc-9": "I overslept and missed my usual train.",
    "n3-vc-10": "It took me half a year to get used to my new workplace.",
    "n3-vc-11": "He made his childhood dream come true and became a pilot.",
    "n3-vc-12": "The players were disappointed after losing the match.",
    "n3-vc-13": "I carelessly threw away an important document.",
    "n3-vc-14": "I was tired last night, so I slept soundly until morning.",
    "n3-vc-15": "My bag is packed full of books, so it's heavy.",
    "n3-vc-16": "According to the weather forecast, there's a high chance of rain tomorrow.",
    "n3-vc-17": "It's too expensive, so I can't decide whether to buy it.",
    "n3-vc-18": "This town has lots of greenery, so the environment is good.",
    "n3-vc-19": "This medicine may make you sleepy, so please don't drive after taking it.",
    "n3-vc-20": "Someone stepped on my foot on the train and said \"sorry.\"",
    "n3-vc-21": "Japan's population is shrinking year by year.",
    "n3-vc-22": "Prices went up, and life became hard.",
    "n3-vc-23": "This film is based on an incident that really happened.",
    "n3-vc-24": "Excuse me, could you look after this luggage for a while?",
    "n3-vc-25": "A new building went up in front of the station.",
    "n3-vc-26": "I put part of my salary into savings at the bank every month.",
    "n3-vc-27": "Before carrying out the plan, we asked for everyone's opinion.",
    "n3-vc-28": "He made long excuses for being late.",
    "n3-vc-29": "I wasn't satisfied with my test result, so I decided to take it again.",
    "n3-vc-30": "Lots of people doze off on the train.",
    "n3-vc-31": "My computer suddenly froze and the data was lost.",
    "n3-vc-32": "Even when he's late for an appointment, he shows no regret at all.",
    "n3-vc-33": "Roads get slippery on rainy days, so please be careful.",
    "n3-vc-34": "This dish is easy to make and doesn't take much effort.",
    "n3-vc-35": "I got a book I'd borrowed from a friend dirty, so I apologized.",
    "n3-vc-36": "If anything happens, feel free to call out to me.",
    "n3-vc-37": "She's a good cook, and she's especially good at making cakes.",
    "n3-vc-38": "Before the exam, I went over the questions I got wrong once more.",
    "n3-vp-1": "He's always grumbling.",
    "n3-vp-2": "How much does the trip cost?",
    "n3-vp-3": "She became popular in no time.",
    "n3-vp-4": "This shop is always nearly empty.",
    "n3-vp-5": "He went home quickly without hanging around.",
    "n3-vp-6": "This room is messy.",
    "n3-vp-7": "His explanation was vague.",
    "n3-vp-8": "My mother was irritated because I came home late.",
    "n3-vp-9": "That player has retired.",
    "n3-vp-10": "The meeting ran longer than planned.",
    "n3-vp-11": "This work has to be finished by next week.",
    "n3-vp-12": "She's a chatterbox.",
    "n3-vp-13": "This problem has to be solved urgently.",
    "n3-vp-14": "Mr. Tanaka is a careful person.",
    "n3-vu-1": "Because of rain, the sports day was cancelled.",
    "n3-vu-2": "I left my luggage at the hotel front desk.",
    "n3-vu-3": "That hat really suits you.",
    "n3-vu-4": "I'm getting ready to go out right now.",
    "n3-vu-5": "I cancelled my hotel reservation.",
    "n3-vu-6": "I overslept and rushed out of the house.",
    "n3-vu-7": "At the teacher's signal, everyone started running at once.",
    "n3-vu-8": "If you wear red clothes, you stand out even from far away.",
    "n3-vu-9": "I packed clothes into my bag to get ready for the trip.",
    "n3-vu-10": "I ran, so I made the last train.",
    "n3-vu-11": "Please put the tools you used back where they were.",
    // grammar (gf: the completed sentence; go: the sentence with the four parts in order)
    "n5-gf-1": "I am a student.",
    "n5-gf-2": "I eat bread every morning.",
    "n5-gf-3": "I study at the library.",
    "n5-gf-4": "There is a cat on the desk.",
    "n5-gf-5": "On Sunday I didn't go anywhere.",
    "n5-gf-6": "This cake is tasty, but it's expensive.",
    "n5-gf-7": "Would you like to go and see a film?",
    "n5-gf-8": "After I eat, I brush my teeth.",
    "n5-gf-9": "I study while listening to music.",
    "n5-gf-10": "May I come into this room?",
    "n5-gf-11": "It will probably rain tomorrow.",
    "n5-gf-12": "Have you had lunch yet? …No, not yet.",
    "n5-gf-13": "That restaurant is quiet and the food is good.",
    "n5-gf-14": "Yamada-san is taller than me.",
    "n5-go-1": "There are two desks in my room.",
    "n5-go-2": "Yesterday I bought a very expensive sweater at a department store.",
    "n5-go-3": "This is the cake my mother made yesterday.",
    "n5-go-4": "The person reading a newspaper over there is my older brother.",
    "n5-go-5": "The curry I ate at a restaurant yesterday was really delicious.",
    "n5-go-6": "I like eating sweet things.",
    "n4-gf-1": "According to the weather forecast, it's going to rain tomorrow.",
    "n4-gf-2": "This cake looks delicious, doesn't it?",
    "n4-gf-3": "My teacher kindly corrected my essay for me.",
    "n4-gf-4": "My younger brother ate my cake, and I was really sad.",
    "n4-gf-5": "The mother made her child eat vegetables.",
    "n4-gf-6": "I'm studying Japanese in order to go to Japan.",
    "n4-gf-7": "I practise every day so that I can speak Japanese.",
    "n4-gf-8": "I fell asleep with the light still on.",
    "n4-gf-9": "There's a party next week, so I'll buy drinks in advance.",
    "n4-gf-10": "No matter how busy I am, I eat breakfast.",
    "n4-gf-11": "When you turn right, you'll see the station.",
    "n4-gf-12": "Tanaka-san said they were taking today off, so they shouldn't be coming.",
    "n4-gf-13": "I only came to Japan last month, so I don't understand Japanese yet.",
    "n4-gf-14": "What time will the department manager arrive?",
    "n4-gf-15": "I'll carry the teacher's bag for them.",
    "n4-go-1": "I practise every day so that I can speak Japanese well.",
    "n4-go-2": "I'd like to try the food Tanaka-san's mother made at least once.",
    "n4-go-3": "This book has big letters and lots of pictures, so it's easy to understand.",
    "n4-go-4": "This book is one my father bought for me.",
    "n4-go-5": "I was tired yesterday, so I fell asleep with the light on.",
    "n4-go-6": "My mother told me to clean my room, but I haven't finished yet.",
    "n4-go-7": "This is a place where you must not smoke.",
    "n4-go-8": "I'm studying Japanese so that I won't have trouble when I go to Japan.",
    "n3-gf-1": "The sky is dark, isn't it? It looks like it's going to rain, so let's take an umbrella.",
    "n3-gf-2": "Even though he's a doctor, he doesn't take care of his own health.",
    "n3-gf-3": "While I was living in Japan, my Japanese got better.",
    "n3-gf-4": "Thanks to my teacher, I was able to pass the exam.",
    "n3-gf-5": "This restaurant is good for the price.",
    "n3-gf-6": "If the room is dark, why not turn on the light?",
    "n3-gf-7": "As a child I hated vegetables, but my mother forced me to eat them.",
    "n3-gf-8": "Despite the rain, a lot of people came.",
    "n3-gf-9": "A briefing was held about the new law.",
    "n3-gf-10": "For me, my family is the most important thing.",
    "n3-gf-11": "Just as I was doing my homework, a friend came over to hang out.",
    "n3-gf-12": "Once you've made a promise, you have to keep it.",
    "n3-gf-13": "He said he would come, so he should be here soon.",
    "n3-gf-14": "Every time I look at this photo, I remember my hometown.",
    "n3-go-1": "The moment she saw my face, she burst into tears.",
    "n3-go-2": "I practise every day so that I'll become able to speak Japanese.",
    "n3-go-3": "Even though it was raining, he went out.",
    "n3-go-4": "I have an exam tomorrow, so I can't afford to play around tonight.",
    "n3-go-5": "For my health, I make a point of walking for thirty minutes every morning.",
    "n3-go-6": "Not only is he a good singer, he's also a good cook.",
    "n3-go-7": "It's late, so you'd better go home before it gets dark.",
    "n3-go-8": "Yesterday I took a friend to the station and stopped by a bookshop on the way.",
    "n3-go-9": "As a child I hated vegetables so much, but now I eat them every day.",
    "n3-go-10": "Thanks to my teacher teaching me so carefully, I was able to pass."
};
function add(lv, t, list) {
    list.forEach( (x, i) => RETIRED.has(`n${lv}-${t}-${i + 1}`) || BANK.push({
        id: `n${lv}-${t}-${i + 1}`,
        lv,
        s: SEC[t],
        t,
        q: x[0],
        o: x[1],
        e: x[2],
        d: tags(x[3]),
        n: x[4] || undefined,
        w: x[5] || undefined,
        tr: SENTENCE_TR[`n${lv}-${t}-${i + 1}`]
    }));
}
/* Reading: passage(level, passageId, text, [entries], kind). Entries use the multiple-choice shape above, notes included. */
function passage(lv, pid, text, qs, kind=OLD_KIND[pid]) {
    if (!KINDS.includes(kind))
        throw new Error(`passage ${pid}: kind must be one of ${KINDS.join('/')}`);
    PASSAGES[pid] = text;
    PASSAGE_KIND[pid] = kind;
    qs.forEach( (x, i) => BANK.push({
        id: `n${lv}-${pid}-${i + 1}`,
        lv,
        s: 'reading',
        t: 'rd',
        p: pid,
        kind,
        q: x[0],
        o: x[1],
        e: x[2],
        d: tags(x[3]),
        n: x[4] || undefined,
        w: x[5] || undefined,
        tr: PASSAGE_TR[pid]?.q?.[i]
    }));
}
/* 文章の文法: textGrammar(level, passageId, text, [entries]). The text marks its blanks （１）（２）…; entry i is blank i+1,
   in the multiple-choice shape above (its first field, the blank number, is replaced by the standard prompt). The blanks share the passage the way reading does, but they belong to the grammar
   section and have no reading format (no PASSAGE_KIND), so the reading plan never picks them. Passage IDs: n<level>t<n>. */
function textGrammar(lv, pid, text, qs) {
    PASSAGES[pid] = text;
    qs.forEach( (x, i) => BANK.push({
        id: `n${lv}-${pid}-${i + 1}`,
        lv,
        s: 'grammar',
        t: 'tg',
        p: pid,
        q: `（${i + 1}）に 入る ものは どれですか。`,
        o: x[1],
        e: x[2],
        d: tags(x[3]),
        n: x[4] || undefined,
        w: x[5] || undefined,
        tr: PASSAGE_TR[pid]?.q?.[i]
    }));
}
/* Listening: { q, intro, lines: [[speaker N/M/F, text]], o, e, d, n }. n: one note per wrong option, as in the
   multiple-choice shape above.
   発話表現 and 即時応答 (intro === q) work like the real test: 3 options, only spoken, in a fixed order, so the
   recording and the screen agree. Only o[0..2], the first 2 trap tags and the first 2 notes are used; a 4th option is ignored. */
const SAY_NUM = ['いち', 'に', 'さん'];
const rotation = id => {
    const k = [...id].reduce( (s, c) => s + c.charCodeAt(0), 0) % 3;
    return [0, 1, 2].map(i => (i + k) % 3);
}
;
function listen(lv, list) {
    list.forEach( (x, i) => {
        const id = `n${lv}-ls-${i + 1}`
          , spoken = x.intro === x.q;
        BANK.push({
            id,
            lv,
            s: 'listening',
            t: 'ls',
            q: x.q,
            intro: x.intro,
            lines: x.lines || [],
            o: spoken ? x.o.slice(0, 3) : x.o,
            e: x.e,
            d: spoken ? tags(x.d).slice(0, 2) : tags(x.d),
            n: x.n ? (spoken ? x.n.slice(0, 2) : x.n) : undefined,
            spoken: spoken || undefined,
            fixed: spoken ? rotation(id) : undefined,
            str: LISTEN_TR[id]
        });
    }
    );
}
/** What a listening item plays, in order: situation, conversation, the question again (when it isn't the intro),
   and for spoken-option items the options as いち、… に、… さん、…. Used by the app's browser voice and tools/gen-audio.mjs. */
export function listenSequence(q) {
    const seq = [['N', q.intro], ...q.lines];
    if (q.lines.length && q.lines[q.lines.length - 1][0] !== 'N' && q.intro !== q.q)
        seq.push(['N', q.q]);
    if (q.spoken) {
        const who = q.lines.length && q.lines[0][0] === 'F' ? 'M' : 'F';
        q.fixed.forEach( (oi, k) => seq.push([who, `${SAY_NUM[k]}、${q.o[oi]}`]));
    }
    return seq;
}
/* Typed conjugation: [dictionary form, target form label, [accepted answers in kana], explanation] */
function conj(lv, list) {
    list.forEach( (x, i) => BANK.push({
        id: `n${lv}-cj-${i + 1}`,
        lv,
        s: 'typing',
        t: 'cj',
        q: x[0],
        form: x[1],
        ans: x[2],
        e: x[3]
    }));
}

/* ───────────────────────── N5 ───────────────────────── */
add(5, 'kr', [['<u>山</u>に のぼりました。', ['やま', 'かわ', 'そら', 'さん'], '山 = やま (mountain). さん is its reading in mountain names like ふじさん.', 'field field read', ['かわ is 川 (river). You climb a mountain: 山に のぼる.', 'そら means sky. 山 on its own is read やま.', 'さん is the reading of 山 in mountain names (ふじさん, Mt. Fuji). On its own, 山 is やま.']], ['まいあさ <u>九時</u>に おきます。', ['くじ', 'きゅうじ', 'くうじ', 'きゅじ'], '九時 is read くじ. 九 alone can be きゅう, but with 時 it is く.', 'read long you', ['きゅう is 九 on its own (nine), but with 時 the reading is く: くじ.', 'くうじ adds a long う. 九時 is just two beats: く・じ.', 'きゅじ is きゅう with the long vowel cut, and 九時 doesn\'t use きゅう anyway. It is くじ.']], ['<u>白い</u> かばんを かいました。', ['しろい', 'くろい', 'あかい', 'あおい'], '白い = しろい (white). くろい is black.', 'field field field', ['くろい means black, the opposite colour. 白い is しろい.', 'あかい means red. 白い is しろい (white).', 'あおい means blue. 白い is しろい (white).']], ['<u>先週</u> ともだちに あいました。', ['せんしゅう', 'せんしゅ', 'さきしゅう', 'せんしゅく'], '先週 = せんしゅう (last week). Watch the long う.', 'long read read'], ['<u>母</u>は りょうりが じょうずです。', ['はは', 'ちち', 'あね', 'あに'], '母 = はは (my mother). 父 = ちち.', 'field field field', ['ちち is 父 (my father). 母 is はは (my mother).', 'あね means my older sister. 母 is はは.', 'あに means my older brother. 母 is はは.']], ['<u>東</u>の そらが あかるいです。', ['ひがし', 'にし', 'みなみ', 'とう'], '東 = ひがし (east). 西 にし, 南 みなみ. In とうきょう the reading is とう.', 'field field read', ['にし is 西 (west), the opposite side. 東 is ひがし.', 'みなみ is 南 (south). 東 is ひがし.', 'とう is the reading of 東 inside words like とうきょう. On its own, 東 is ひがし.']], ['この みせは <u>安い</u>です。', ['やすい', 'たかい', 'ひくい', 'あんい'], '安い = やすい (cheap).', 'field l1 read', ['たかい is 高い (expensive), the opposite. 安い is やすい.', 'ひくい means low (a mountain, a voice). English says "low price", but cheap is やすい.', 'あん is the reading of 安 inside words like あんしん (relief). 安い on its own is やすい.']], ['<u>午後</u> さんじに あいましょう。', ['ごご', 'ごぜん', 'ごうご', 'ここ'], '午後 = ごご (p.m.). 午前 = ごぜん (a.m.).', 'field long voice', ['ごぜん is 午前 (a.m.), the other half of the day. 午後 is ごご.', 'ごうご adds a long う. 午後 is two short beats: ご・ご.', 'ここ means "here". 午後 starts with a voiced ご: ごご.']], ['えきの <u>北</u>に こうえんが あります。', ['きた', 'みなみ', 'にし', 'ひがし'], '北 = きた (north).', 'field field field', ['みなみ is 南 (south), the opposite direction. 北 is きた.', 'にし is 西 (west). 北 is きた.', 'ひがし is 東 (east). 北 is きた.']], ['<u>毎日</u> にほんごを べんきょうします。', ['まいにち', 'まいび', 'まいひ', 'まいじつ'], '毎日 = まいにち (every day).', 'voice read read', ['まいび voices ひ to び, but 毎日 uses the reading にち: まいにち.', 'ひ is 日 in words like この 日 (this day). In 毎日 it is にち.', 'じつ is a reading of 日 in other words, not this one. 毎日 is まいにち.']], ['<u>来月</u> にほんへ いきます。', ['らいげつ', 'らいつき', 'くるげつ', 'らいがつ'], '来月 = らいげつ (next month). 月 is げつ here, not がつ (がつ is for month names like 一月).', 'read read read', ['つき is 月 on its own (the moon). In 来月 it is げつ: らいげつ.', 'くる is 来る (come) on its own. In 来月 the reading of 来 is らい.', 'がつ is for month names (一月 いちがつ). "Next month" uses げつ: らいげつ.']], ['ここに <u>名前</u>を かいて ください。', ['なまえ', 'めいまえ', 'なぜん', 'めいぜん'], '名前 = なまえ (name). Both kanji use their Japanese (kun) reading here.', 'read read read', ['めい is a reading of 名 in other words (ゆうめい, famous). In 名前 it is な.', 'ぜん is a reading of 前 in words like 午前 (ごぜん). In 名前 it is まえ.', 'めいぜん joins the other readings of both kanji. 名前 uses な and まえ: なまえ.']], ['<u>電気</u>を けして ください。', ['でんき', 'てんき', 'でんぎ', 'てんぎ'], '電気 = でんき (light, electricity). てんき is weather.', 'voice voice voice', ['てんき means weather. 電気 starts with a voiced で: でんき.', 'でんぎ voices き to ぎ. 電気 keeps き: でんき.', 'てんぎ gets both sounds wrong. 電気 is でんき.']], ['あの <u>男の人</u>は だれですか。', ['おとこのひと', 'おんなのひと', 'おどこのひと', 'おとこのじん'], '男の人 = おとこのひと (man). 女の人 = おんなのひと.', 'field voice read', ['おんなのひと is 女の人 (woman). 男の人 is おとこのひと.', 'おどこ voices と to ど. 男 is おとこ.', 'じん is 人 inside words like にほんじん. In の人 it is ひと.']], ['<u>外国</u>へ いきたいです。', ['がいこく', 'がいごく', 'そとこく', 'かいこく'], '外国 = がいこく (foreign country). 外 alone is そと, but in 外国 it is がい.', 'voice read voice', ['がいごく voices こく to ごく. 国 stays こく here: がいこく.', 'そと is 外 on its own (outside). In 外国 it is がい.', 'かいこく drops the voicing on が. 外国 starts with が: がいこく.']]]);
add(5, 'ko', [['<u>みみ</u>が いたいです。', ['耳', '目', '口', '手'], 'みみ = 耳 (ear). 目 め, 口 くち, 手 て.', 'shape field field', ['目 is め (eye). It looks like 耳, but 耳 has strokes sticking out at the bottom and right.', '口 is くち (mouth). みみ is 耳.', '手 is て (hand). みみ is 耳.']], ['<u>でんしゃ</u>で がっこうへ いきます。', ['電車', '雨車', '電東', '雨東'], 'でんしゃ = 電車 (train). 雨 is only the top of 電; 東 looks like 車 with extra strokes.', 'shape shape shape', ['雨車 has 雨 (あめ, rain) instead of 電. 電 is 雨 on top plus a part below.', '電東 has 東 (ひがし) instead of 車. 東 is 車 with extra strokes; しゃ is 車.', '雨東 swaps both kanji: 雨 (あめ) and 東 (ひがし). でんしゃ is 電車.']], ['<u>やすみ</u>の ひに えいがを みます。', ['休み', '何み', '体み', '木み'], 'やすみ = 休み: a person (亻) leaning on a tree (木). 体 (からだ) is 亻 + 本; 何 also starts with 亻.', 'shape shape shape', ['何 is なに (what). It starts with 亻 like 休, but the right side is different.', '体 is からだ (body): 亻 + 本. 休 is 亻 + 木, without the extra line at the bottom.', '木 is き (tree), only the right half of 休. やすみ needs the person 亻 too.']], ['まどを <u>あけて</u> ください。', ['開けて', '閉けて', '間けて', '門けて'], 'あける = 開ける (open). 閉 is しめる (close). All four live inside the gate 門.', 'field shape shape'], ['<u>にし</u>の ほうへ あるきます。', ['西', '四', '百', '両'], 'にし = 西 (west). 四, 百 and 両 are boxes with a line on top, like 西.', 'shape shape shape', ['四 is よん (four). Both are boxes, but 西 has a line across the top.', '百 is ひゃく (hundred). It has the top line, but 日 inside.', '両 is りょう (both). Its middle line goes up through the top; 西 has two short lines inside.']], ['<u>あたらしい</u> くつです。', ['新しい', '新たしい', '新らしい', '新い'], 'あたらしい = 新しい: the kanji covers あたら, then しい.', 'okuri okuri okuri', ['新た is あらた (fresh), a different word. あたらしい is 新 + しい.', '新らしい puts ら in kana, but 新 already covers あたら. Write 新しい.', '新い leaves out し. The kana part is しい: 新しい.']], ['つぎの かどを <u>みぎ</u>に まがって ください。', ['右', '左', '名', '古'], 'みぎ = 右 (right). 左 = ひだり. 右 and 名 both have 口 at the bottom.', 'shape shape shape', ['左 is ひだり (left), the opposite. 右 and 左 differ only at the bottom: 右 has 口.', '名 is な (name). It also has 口 at the bottom, but the top is タ.', '古 is ふるい (old). It has 口 at the bottom with 十 on top.']], ['あしたの <u>ごぜん</u>は いえに います。', ['午前', '千前', '午先', '年前'], 'ごぜん = 午前 (a.m.). 午 has two flat lines; 千 (せん) has one.', 'shape shape shape', ['千 is せん (thousand). 午 has two flat lines; 千 has only one.', '先 is the せん of 先生. The second kanji of ごぜん is 前 (まえ, ぜん).', '年 is とし (year). It looks like 午 with extra strokes. ごぜん is 午前.']], ['せんせいの <u>はなし</u>を ききました。', ['話', '語', '読', '言'], 'はなし = 話, with 言 (say) on the left. 語 is ご (language), 読 is よむ.', 'shape shape shape', ['語 is ご (language), as in 日本語. はなし is 話.', '読 is よむ (read). It has 言 on the left too, but はなし is 話.', '言 is いう (say), only the left part of 話. はなし is 話.']], ['あの <u>たかい</u> たてものは なんですか。', ['高い', '安い', '古い', '長い'], 'たかい = 高い (tall, expensive). 安い やすい, 古い ふるい, 長い ながい.', 'field shape field', ['安い is やすい (cheap), the opposite of たかい in price.', '古い is ふるい (old). It has 口 like 高, but it is a different word.', '長い is ながい (long). A tall building is たかい: 高い.']], ['<u>でぐち</u>は あちらです。', ['出口', '山口', '出日', '土口'], 'でぐち = 出口 (exit): 出 (go out) + 口 (mouth, opening). 入口 = いりぐち.', 'shape shape shape', ['山口 is やまぐち, a place name. 出 is two 山 stacked: でぐち is 出口.', '出日 has 日 (ひ) instead of 口. 口 is an empty box; 日 has a line inside.', '土口 has 土 (つち, earth) instead of 出.']]]);
add(5, 'vc', [['さむいですから、まどを（　　）ください。', ['しめて', 'あけて', 'つけて', 'きって'], 'It is cold, so please close (しめて) the window.', 'dir colloc colloc', ['あける = open, the opposite. It is cold, so you close the window: まどを しめる.', 'つける is for lights and machines (でんきを つける). A window is opened and closed: しめる.', 'きる = cut. A window is closed: まどを しめる.']], ['へやが くらいですね。でんきを（　　）ましょうか。', ['つけ', 'けし', 'しめ', 'あけ'], 'でんきを つける = turn on the light. けす = turn off.', 'dir colloc colloc', ['けす = turn off, the opposite. The room is dark, so you turn the light on: つける.', 'しめる is for doors and windows (まどを しめる). A light is turned on: でんきを つける.', 'あける is for doors, windows and boxes. You don\'t "open" a light; you つける it.']], ['わたしは まいばん ８じかん（　　）。', ['ねます', 'おきます', 'たべます', 'のみます'], '８じかん ねます = I sleep 8 hours.', 'dir field field', ['おきる = get up, the opposite of ねる. Nobody gets up for 8 hours: 8じかん ねます = sleep 8 hours.', 'たべる = eat. まいばん goes with dinner too, but nobody eats for 8 hours. 8 hours every night is sleep: ねます.', 'のむ = drink. Nobody drinks for 8 hours every night. 8 hours every night is sleep: ねます.']], ['ノートを ３（　　）かいました。', ['さつ', 'ほん', 'まい', 'だい'], 'Books and notebooks use the counter さつ, like "buah/jilid" for books.', 'count count count', ['ほん counts long, thin things (pens, bottles, umbrellas). Notebooks and books use さつ.', 'まい counts flat things like paper and shirts. A notebook is thin, but it is bound like a book: さつ.', 'だい counts machines and vehicles (くるま, パソコン). Notebooks use さつ.']], ['きのうは あめでしたが、きょうは そらが あおくて いい（　　）です。', ['てんき', 'でんき', 'はれ', 'くもり'], 'いい てんき = nice weather.', 'voice field field', ['でんき (electricity, light) sounds like てんき but has ゛. Weather is てんき: いい てんき.', 'はれ = sunny, which fits a blue sky, but Japanese says いい てんき, not いい はれ. はれ is used as はれです.', 'くもり = cloudy. The sky is blue (そらが あおい), so it isn\'t cloudy.']], ['この カレーは とても（　　）ですね。みずを ください。', ['からい', 'あまい', 'つめたい', 'あたたかい'], 'Spicy (からい), so you want water.', 'field field field', ['あまい = sweet. Sweet curry doesn\'t make you need water; spicy curry does: からい.', 'つめたい = cold. Cold food doesn\'t burn your mouth. You want water because it is spicy: からい.', 'あたたかい = warm. Warm curry is normal. You ask for water because it is spicy: からい.']], ['としょかんで ほんを（　　）。', ['かりました', 'かしました', 'かいました', 'ならいました'], 'かりる = borrow; かす = lend. You borrow from a library.', 'dir field colloc', ['かす = lend: you give the book. At a library you are the one who borrows: かりる.', 'かう = buy. It sounds close to かりる, but a library doesn\'t sell books; you borrow them: かりる.', 'ならう = learn from someone (にほんごを ならう). You don\'t learn a book; you borrow it: かりる.']], ['わたしの（　　）は ちちの ははです。', ['そぼ', 'そふ', 'おば', 'あね'], 'Father\'s mother = そぼ (grandmother). そふ = grandfather.', 'field field field', ['そふ = grandfather. Your father\'s mother is a woman: そぼ.', 'おば = aunt (your father\'s or mother\'s sister). Your father\'s mother is your grandmother: そぼ.', 'あね = your older sister. Your father\'s mother is your grandmother: そぼ.']], ['あついですから、エアコンを（　　）ください。', ['つけて', 'けして', 'しめて', 'あけて'], 'エアコンを つける = turn on the air conditioner. It is hot, so you want it on.', 'field colloc colloc', ['けす is the opposite: turn OFF. It is hot, so you want the air conditioner on (つける).', 'しめる is for doors and windows (まどを しめる). Machines use つける / けす.', 'あける is for doors, windows and boxes. You don\'t "open" an air conditioner; you つける it.']], ['あさ、はを（　　）から、あさごはんを たべます。', ['みがいて', 'あらって', 'きって', 'ふいて'], 'はを みがく = brush your teeth.', 'colloc colloc colloc', ['あらう = wash (hands, face, dishes). Teeth are brushed: はを みがく.', 'きる = cut. Teeth go with みがく: はを みがく.', 'ふく = wipe (a table, a window). Teeth go with みがく (brush / polish).']], ['シャワーを（　　）から、ねます。', ['あびて', 'はいって', 'あらって', 'のんで'], 'シャワーを あびる = take a shower. A bath is おふろに はいる.', 'colloc colloc colloc', ['はいる goes with a bath: おふろに はいる. A shower is シャワーを あびる.', 'あらう needs something you wash (かおを あらう). You don\'t wash the shower; you あびる it.', 'のむ = drink. Learn 「シャワーを あびる」 as one chunk.']], ['くすりを（　　）ましたから、もう だいじょうぶです。', ['のみ', 'たべ', 'かき', 'とり'], 'くすりを のむ = take medicine, like Indonesian "minum obat". Even tablets are のむ.', 'l1 colloc l1', ['たべる feels logical for pills, but Japanese uses のむ for all medicine, like "minum obat".', 'かく = write. A doctor writes a prescription, but taking medicine is のむ.', 'English says "take medicine", but とる doesn\'t work here. Japanese says くすりを のむ.']], ['しゃしんを（　　）ましょう。みなさん、ならんで ください。', ['とり', 'かき', 'つくり', 'みせ'], 'しゃしんを とる = take a photo. Everyone lines up for it.', 'colloc colloc colloc', ['かく = write or draw. A photo is taken: しゃしんを とる.', 'つくる = make. You don\'t "make" a photo in Japanese; you とる it.', 'みせる = show. Everyone lining up means you\'re about to take a photo, not show one.']], ['あめですから、かさを（　　）いきます。', ['もって', 'きて', 'かけて', 'はいて'], 'かさを もって いく = take an umbrella with you.', 'colloc colloc colloc', ['きる is for clothes on your upper body (シャツを きる), not an umbrella.', 'かける is for glasses (めがねを かける). An umbrella is carried: もって いく.', 'はく is for shoes and trousers (くつを はく), not an umbrella.']], ['さむいですから、セーターを（　　）ます。', ['き', 'はき', 'かぶり', 'かけ'], 'セーターを きる = put on a sweater. Clothes on the upper body take きる.', 'colloc colloc colloc', ['はく is for things your legs go into: くつ, ズボン, スカート. A sweater is きる.', 'かぶる is for hats: ぼうしを かぶる. A sweater is きる.', 'かける is for glasses: めがねを かける. A sweater is きる.']], ['にほんの うちでは、げんかんで くつを（　　）。', ['ぬぎます', 'はきます', 'きます', 'かぶります'], 'くつを ぬぐ = take off shoes. In a Japanese home you take them off at the entrance (げんかん).', 'field colloc colloc', ['はく is the opposite: put shoes ON. At the entrance of a Japanese home you take them off: ぬぐ.', 'きる is for upper-body clothes. Shoes use はく (on) and ぬぐ (off).', 'かぶる is for hats (ぼうしを かぶる), not shoes.']], ['えきまで あるいて 10ぷん（　　）。', ['かかります', 'あります', 'なります', 'します'], 'じかんが かかる = it takes (time). 10ぷん かかります = it takes 10 minutes.', 'colloc colloc l1', ['あります = there is. Time a trip takes uses かかる: 10ぷん かかります.', 'なります = becomes. How long something takes is かかる.', 'English "it takes" or Indonesian "butuh" pulls you toward a "do" verb, but Japanese uses かかる, not する.']], ['この みちを まっすぐ いって、つぎの かどを みぎに（　　）ください。', ['まがって', 'わたって', 'とまって', 'おりて'], 'かどを まがる = turn at a corner.', 'colloc field field', ['わたる = cross (みちを わたる, はしを わたる). At a corner you まがる (turn).', 'とまる = stop. かどを みぎに means turning right: まがる.', 'おりる = get off (a bus, a train). It doesn\'t go with かど.']], ['つぎの えきで でんしゃを（　　）。', ['おります', 'でます', 'おちます', 'さがります'], 'でんしゃを おりる = get off the train. Note the particle を.', 'l1 field l1', ['でる = go out of a place (へやを でる). Getting off a vehicle is おりる.', 'おちる = fall or drop. It sounds close to おりる, but it means falling.', 'さがる = go down (prices, temperature). Getting off a vehicle is おりる.']], ['バスに（　　）、がっこうへ いきます。', ['のって', 'あがって', 'はいって', 'つけて'], 'バスに のる = get on / ride a bus. Note the particle に.', 'l1 l1 colloc', ['あがる = go up (stairs). Getting on any vehicle is のる.', 'はいる = enter (a room, a shop). For vehicles Japanese uses のる, even though you go "into" a bus.', 'つける = turn on or attach. Riding is のる: バスに のる.']], ['わたしは まいにち にっきを（　　）。', ['かきます', 'よみます', 'ききます', 'とります'], 'にっきを かく = write a diary.', 'field field colloc', ['よむ = read. Every day you write your own diary: にっきを かく.', 'きく = listen or ask. A diary is written: にっきを かく.', 'とる = take. にっきを とる isn\'t Japanese; a diary is かく.']], ['ピアノを（　　）のが すきです。', ['ひく', 'する', 'ふく', 'うたう'], 'ピアノを ひく = play the piano. Keyboard and string instruments use ひく.', 'l1 l1 field', ['English "play" and Indonesian "main" cover every instrument, but Japanese uses ひく for piano and guitar, not する.', 'ふく = blow. It\'s for wind instruments (フルートを ふく). Piano is ひく.', 'うたう = sing. It\'s a music word too, but a piano is played: ひく.']], ['あの ひとは せが（　　）ですね。2メートルぐらい あります。', ['たかい', 'おおきい', 'ながい', 'ひろい'], 'せが たかい = tall (for a person\'s height).', 'l1 field field', ['おおきい = big. A person\'s height is described as せが たかい.', 'ながい = long (hair, a river, time). Height is せが たかい.', 'ひろい = wide or spacious (a room, a park). Height is せが たかい.']], ['この かばんは（　　）ですね。なにが はいって いますか。', ['おもい', 'たかい', 'ふとい', 'つよい'], 'おもい = heavy. You ask what\'s inside because the bag is heavy.', 'field field l1', ['たかい = expensive or tall. What\'s inside makes a bag heavy (おもい), not expensive.', 'ふとい = thick (a pen, a tree). Weight is おもい.', 'つよい = strong (a person, wind). A bag full of things is おもい.']], ['きのうは あたまが（　　）、がっこうを やすみました。', ['いたくて', 'わるくて', 'あつくて', 'よわくて'], 'あたまが いたい = have a headache.', 'colloc colloc colloc', ['あたまが わるい means "not smart". A headache is あたまが いたい.', 'あたまが あつい isn\'t how you say you\'re sick. For a fever, say ねつが ある; for a headache, あたまが いたい.', 'よわい = weak. It doesn\'t go with あたま for pain; use いたい.']], ['ねつが（　　）から、びょういんへ いきます。', ['あります', 'います', 'します', 'なります'], 'ねつが ある = have a fever.', 'colloc colloc l1', ['いる is for people and animals. A fever is a thing you have: ねつが ある.', 'ねつが します isn\'t Japanese. A fever "exists": ねつが ある.', 'Indonesian "demam" and English "get a fever" tempt you to use a change verb, but Japanese says ねつが ある.']], ['ゆうびんきょくで きってを 5（　　）かいました。', ['まい', 'ほん', 'さつ', 'こ'], 'Stamps are flat: きってを 5まい.', 'count count count', ['ほん is for long thin things like pens and bottles. A stamp is flat: まい (≈ lembar).', 'さつ is for books and notebooks. A stamp is a flat sheet: まい.', 'こ is for small round or solid things. Flat things like stamps use まい.']], ['ビールを 2（　　）ください。', ['ほん', 'まい', 'だい', 'ひき'], 'Bottles are long and thin: ビールを 2ほん (にほん).', 'count count count', ['まい is for flat things like paper and tickets. A bottle is long: ほん (≈ batang).', 'だい is for machines and vehicles. A bottle of beer is ほん.', 'ひき is for small animals. A bottle is ほん.']], ['こうえんに いぬが 3（　　）います。', ['びき', 'にん', 'ほん', 'だい'], 'Small animals use ひき; after 3 it becomes びき: さんびき.', 'count count count', ['にん is for people. Dogs are animals: ひき (≈ ekor), and 3 makes it さんびき.', 'ほん also changes after 3 (さんぼん), but it\'s for long thin things. Dogs are ひき.', 'だい is for machines. Animals are ひき: さんびき.']], ['きょうしつに がくせいが 5（　　）います。', ['にん', 'り', 'こ', 'ひき'], 'People are counted with にん: ごにん. り is only used in ひとり and ふたり.', 'count count count', ['り only works for 1 and 2 people (ひとり, ふたり). From 3 on it\'s にん: ごにん.', 'こ is for small things like apples and eggs. People are にん.', 'ひき is for small animals. Students are people: ごにん.']], ['すみません、コーヒーを 2（　　）ください。', ['はい', 'ほん', 'こ', 'まい'], 'Cups and glasses of a drink use はい: コーヒーを 2はい (にはい).', 'count count count', ['ほん would count bottles or cans. Cups of coffee are はい (≈ gelas / cangkir).', 'こ is for small solid things. A cup of coffee is はい.', 'まい is for flat things. A cup of coffee is はい.']], ['わたしの うちは この ビルの 5（　　）です。', ['かい', 'だい', 'ほん', 'まい'], 'Floors of a building use かい: 5かい = the 5th floor.', 'count count count', ['だい is for machines and vehicles. Floors are かい (≈ lantai).', 'ほん is for long thin things. Floors are かい.', 'まい is for flat things like paper. Floors are かい.']], ['わたしは あまい ものが（　　）です。まいにち ケーキを たべます。', ['だいすき', 'へた', 'きらい', 'じょうず'], 'Eating cake every day means you love sweet things: だいすき.', 'l1 field l1', ['へた = bad at a skill. Liking food is すき / きらい, not じょうず / へた.', 'きらい = dislike, the opposite. You eat cake every day, so you love it.', 'じょうず = good at a skill. You don\'t "be good at" sweet things; you like them: だいすき.']], ['まいにち しごとが（　　）ですから、にちようびは うちで やすみます。', ['いそがしい', 'ひま', 'しずか', 'やすい'], 'Busy every day → rest at home on Sunday: いそがしい.', 'field field field', ['ひま = free, not busy, the opposite. If work were ひま, you wouldn\'t need the rest.', 'しずか = quiet. A quiet job isn\'t a reason to rest all Sunday.', 'やすい = cheap. It sounds like やすみます, but it\'s about price.']], ['へやが（　　）ですから、まどを あけましょう。', ['あつい', 'さむい', 'しずか', 'せまい'], 'The room is hot, so open the window: あつい.', 'field field field', ['さむい = cold, the opposite. If the room were cold, you\'d close the window.', 'しずか = quiet. Opening the window lets noise in; it\'s not a reason to open it.', 'せまい = small or cramped. Opening a window won\'t make the room bigger.']], ['この ほんは（　　）ですから、こどもでも よめます。', ['やさしい', 'むずかしい', 'たかい', 'あたらしい'], 'やさしい = easy (it also means kind). Easy, so even children can read it.', 'field field field', ['むずかしい = difficult, the opposite. Children can read it because it\'s easy.', 'たかい = expensive. Price doesn\'t make a book easy to read.', 'あたらしい = new. A new book isn\'t necessarily easy.']], ['わたしは あにに ネクタイを（　　）。あにの たんじょうびでしたから。', ['あげました', 'くれました', 'もらいました', 'かりました'], 'It was my brother\'s birthday, so I gave him a tie: あげる (I → brother).', 'dir dir dir', ['くれる is used when someone gives TO ME. Here I\'m the giver, so it\'s あげる.', 'もらう = I received. It was my brother\'s birthday, so the present went from me to him: あげる.', 'かりる = borrow. A birthday present is given, not borrowed.']], ['ともだちが わたしに はなを（　　）。', ['くれました', 'あげました', 'もらいました', 'かしました'], 'Someone gives to ME: くれる.', 'dir dir dir', ['あげる is for giving to others. When the receiver is わたし, use くれる.', 'もらう makes the receiver the subject: わたしは ともだちに はなを もらいました. Here ともだちが is the subject, so it\'s くれました.', 'かす = lend. Flowers are given, not lent.']], ['おなかが（　　）ました。なにか たべましょう。', ['すき', 'かわき', 'あき', 'とまり'], 'おなかが すく = get hungry.', 'colloc l1 colloc', ['かわく goes with のど: のどが かわく = get thirsty. Hunger is おなかが すく.', 'あく also means "become empty" (せきが あく = a seat frees up), but hunger is always おなかが すく.', 'とまる = stop. Learn 「おなかが すく」 as one chunk.']], ['のどが（　　）ましたから、みずを のみます。', ['かわき', 'すき', 'しめ', 'あき'], 'のどが かわく = get thirsty.', 'colloc colloc colloc', ['すく goes with おなか: おなかが すく = hungry. Thirst is のどが かわく.', 'しめる = close (a door). It doesn\'t go with のど.', 'あく = open or become empty. Thirst is always のどが かわく.']], ['もう おそいですから、そろそろ（　　）。', ['しつれいします', 'いただきます', 'はじめまして', 'おやすみなさい'], 'そろそろ しつれいします = I should be going now (polite way to leave).', 'situ situ situ', ['いただきます is said before eating, not when leaving.', 'はじめまして is for meeting someone for the first time, not for leaving.', 'おやすみなさい is good night before sleeping. To leave someone\'s place, say そろそろ しつれいします.']], ['ごはんを たべる まえに「（　　）」と いいます。', ['いただきます', 'ごちそうさま', 'おかえりなさい', 'いってきます'], 'Before eating: いただきます.', 'field situ situ', ['ごちそうさま is the pair word, said AFTER eating. Before eating it\'s いただきます.', 'おかえりなさい is said to someone who comes home.', 'いってきます is said when you leave home.']], ['この スーパーは やさいが（　　）ですから、よく かいに きます。', ['やすい', 'ひくい', 'すくない', 'ちいさい'], 'Cheap vegetables → you come often: やすい.', 'l1 field field', ['English says "low price", but ひくい is for height (a mountain, a voice). Cheap is やすい.', 'すくない = few. Few vegetables isn\'t why you\'d shop there often.', 'ちいさい = small. Small vegetables aren\'t why you\'d come often.']], ['あしたは（　　）ですから、あさ はやく おきなくても いいです。', ['やすみ', 'しごと', 'テスト', 'じゅぎょう'], 'A day off, so you don\'t need to get up early: やすみ.', 'field field field', ['しごと = work. If you had work, you\'d need to get up.', 'テスト = test. You\'d need to get up for a test.', 'じゅぎょう = class. You\'d need to get up for class.']], ['えいがかんの まえで ともだちを（　　）います。', ['まって', 'もって', 'とって', 'きって'], 'ともだちを まって いる = waiting for a friend.', 'field colloc colloc', ['もつ = hold or carry. It sounds close to まつ, but you can\'t carry your friend in front of the cinema.', 'とる = take. You\'re waiting for your friend: まつ.', 'きる = cut. You\'re waiting: まって います.']], ['あした おきゃくさんが きますから、へやを（　　）しましょう。', ['きれいに', 'しずかに', 'げんきに', 'じょうずに'], 'へやを きれいに する = clean up the room. Guests are coming.', 'colloc l1 l1', ['しずかに する = be quiet. Before guests come, you make the room clean: きれいに.', 'げんき is for people (healthy, energetic), not rooms.', 'じょうず is for skills. A room is made きれい (clean).']]]);
add(5, 'vp', [['この へやは きれいじゃ ありません。', ['この へやは きたないです。', 'この へやは ひろいです。', 'この へやは あかるいです。', 'この へやは しずかです。'], 'きれいじゃ ない ≈ きたない (dirty).', 'field field field', ['ひろい = spacious. きれいじゃ ない is about being clean, not size.', 'あかるい = bright. きれいじゃ ない is about being clean, not light.', 'しずか = quiet. きれいじゃ ない is about being clean, not sound.']], ['おととい えいがを みました。', ['ふつか まえに えいがを みました。', 'みっか まえに えいがを みました。', 'きのう えいがを みました。', 'あさって えいがを みます。'], 'おととい = the day before yesterday = ふつか まえ.', 'field field dir', ['みっか まえ = three days ago. おととい is two days ago: ふつか まえ.', 'きのう = yesterday, one day ago. おととい is the day before yesterday.', 'あさって = the day after tomorrow: two days in the other direction. おととい is two days AGO.']], ['やまださんは テニスが へたです。', ['やまださんは テニスが じょうずじゃ ありません。', 'やまださんは テニスが すきじゃ ありません。', 'やまださんは テニスが きらいです。', 'やまださんは よく テニスを します。'], 'へた = not good at = じょうずじゃ ない. Skill, not liking.', 'l1 l1 field', ['すきじゃ ない = don\'t like. へた is about skill, not liking.', 'きらい = dislike. Someone bad at tennis can still love it; へた is about skill: じょうずじゃ ない.', 'よく する = plays often. How often you play says nothing about skill; へた means not good at it.']], ['あの みせは いつも ひとが すくないです。', ['あの みせは いつも すいて います。', 'あの みせは いつも こんで います。', 'あの みせは いつも たかいです。', 'あの みせは いつも ちいさいです。'], 'Few people = すいて いる (not crowded).', 'dir over over', ['こんで いる = crowded, the opposite. Few people means すいて いる.', 'たかい = expensive. An expensive shop may have few people, but the sentence is only about how many people: すいて いる.', 'ちいさい = small. The sentence is about how many people there are, not the shop\'s size.']], ['ゆうべ しゅくだいを しました。', ['きのうの よる しゅくだいを しました。', 'きのうの あさ しゅくだいを しました。', 'けさ しゅくだいを しました。', 'こんばん しゅくだいを します。'], 'ゆうべ = last night = きのうの よる.', 'field field dir', ['きのうの あさ = yesterday morning. ゆうべ is last NIGHT: きのうの よる.', 'けさ = this morning. ゆうべ is last night: きのうの よる.', 'こんばん = tonight, still to come. ゆうべ is last night, already past.']], ['この へやは せまいです。', ['この へやは ひろく ありません。', 'この へやは きれいじゃ ありません。', 'この へやは あかるく ありません。', 'この へやは たかく ありません。'], 'せまい = small, cramped ≈ ひろく ない.', 'field field field', ['きれいじゃ ない = dirty. せまい is about size, not cleanliness.', 'あかるく ない = dark. せまい is about size, not light.', 'たかく ない = cheap. せまい is about size, not price.']], ['あの みせの パンは まずいです。', ['あの みせの パンは おいしく ありません。', 'あの みせの パンは たかく ありません。', 'あの みせの パンは やすいです。', 'あの みせの パンは おおきく ありません。'], 'まずい = tastes bad ≈ おいしく ない.', 'field field field', ['たかく ない = not expensive. まずい is about taste, not price.', 'やすい = cheap. まずい is about taste, not price.', 'おおきく ない = not big. まずい is about taste, not size.']], ['わたしは くだものが すきじゃ ありません。', ['わたしは くだものが きらいです。', 'わたしは くだものを たべません。', 'わたしは くだものが へたです。', 'わたしは くだものを かいません。'], 'すきじゃ ない ≈ きらい (dislike).', 'l1 l1 l1', ['Not liking fruit doesn\'t mean you never eat it. すきじゃ ない is about feeling: きらい.', 'へた = bad at a skill. Fruit isn\'t a skill; disliking it is きらい.', 'Not liking fruit doesn\'t mean you never buy it. The match is about feeling: きらい.']], ['ははは だいどころに います。', ['ははは りょうりを する へやに います。', 'ははは ふくを あらう へやに います。', 'ははは ねる へやに います。', 'ははは ごはんを たべる へやに います。'], 'だいどころ = kitchen, the room where you cook.', 'field field field', ['The room where you wash clothes isn\'t だいどころ. だいどころ is where you cook.', 'The room where you sleep is the bedroom. だいどころ is where you cook.', 'Eating happens near the kitchen, but だいどころ is the room where you COOK.']], ['あしたは やすみです。', ['あしたは しごとが ありません。', 'あしたは しごとが あります。', 'あしたは いそがしいです。', 'あしたは びょうきです。'], 'やすみ = a day off ≈ しごとが ない.', 'field field l1', ['しごとが ある is the opposite: a work day. やすみ means no work.', 'いそがしい = busy. A day off is usually the opposite.', 'You can be off because of illness, but やすみ itself just means no work or school, not sick.']], ['たなかさんは ゆうめいです。', ['たなかさんを しって いる ひとが おおいです。', 'たなかさんは やさしい ひとです。', 'たなかさんは ともだちが すくないです。', 'たなかさんは おかねが たくさん あります。'], 'ゆうめい = famous ≈ many people know them.', 'l1 field l1', ['やさしい = kind. Famous people aren\'t necessarily kind; ゆうめい means many people know them.', 'Few friends is closer to the opposite. ゆうめい means many people know them.', 'Famous people are often rich, but ゆうめい only means many people know them.']], ['この もんだいは むずかしく ありません。', ['この もんだいは やさしいです。', 'この もんだいは ながく ありません。', 'この もんだいは おもしろく ありません。', 'この もんだいは すくないです。'], 'むずかしく ない ≈ やさしい (easy).', 'field field field', ['ながく ない = short. Short and easy are different things.', 'おもしろく ない = boring. Easy and boring are different things.', 'すくない = few. The sentence is about difficulty, not number.']], ['まいばん 11じに ねます。', ['まいにち よる 11じに ねます。', 'まいにち あさ 11じに ねます。', 'まいしゅう よる 11じに ねます。', 'きのうの よる 11じに ねました。'], 'まいばん = every night = まいにち よる.', 'field field field', ['あさ = morning. まいばん is every night (ばん = evening / night).', 'まいしゅう = every week. まいばん is every night.', 'きのうの よる = last night, only once. まいばん is every night.']], ['りょうしんは げんきです。', ['ちちと ははは げんきです。', 'あにと あねは げんきです。', 'そふと そぼは げんきです。', 'ちちと あには げんきです。'], 'りょうしん = parents = ちちと はは.', 'field field field', ['あにと あね = older brother and sister. りょうしん means parents: father and mother.', 'そふと そぼ = grandparents. りょうしん means your parents.', 'あに is your older brother. りょうしん is father AND mother.']], ['わたしは らいねん はたちに なります。', ['わたしは らいねん 20さいに なります。', 'わたしは らいねん 2さいに なります。', 'わたしは らいねん 10さいに なります。', 'わたしは らいねん 12さいに なります。'], 'はたち = 20 years old (a special word, not にじゅっさい).', 'field field field', ['はたち starts with は like ふたつ, but it means 20 years old, not 2.', '10 years old is じゅっさい. はたち is 20.', 'はたち is 20. 12 is じゅうにさい.']], ['へやの でんきが きえて います。', ['へやは くらいです。', 'へやは あかるいです。', 'へやは さむいです。', 'へやは しずかです。'], 'The light is off, so the room is dark: くらい.', 'field field field', ['あかるい = bright, the opposite. The light is off, so it\'s dark.', 'さむい = cold. A light being off is about light, not temperature.', 'しずか = quiet. The light being off is about light, not sound.']], ['えきは ここから ちかいです。', ['えきは ここから とおく ありません。', 'えきは ここから とおいです。', 'えきは ここから みえません。', 'えきは ここから ひがしです。'], 'ちかい = near ≈ とおく ない.', 'field field field', ['とおい = far, the opposite of ちかい.', 'みえない = can\'t be seen. A near station might still be out of sight; ちかい is about distance.', 'ひがし = east. It gives a direction, not a distance.']]]);
add(5, 'gf', [['わたし（　　）学生です。', ['は', 'を', 'に', 'で'], 'Topic marker は: わたしは 学生です.', 'particle particle particle', ['を marks the object of a verb. です has no object.', 'に marks a place, time or receiver. The topic takes は.', 'で marks a place of action or a means. The topic takes は.']], ['まいあさ パン（　　）食べます。', ['を', 'が', 'に', 'へ'], 'Direct object of 食べる takes を.', 'particle particle particle', ['が marks the subject. Bread isn\'t eating. The thing you eat takes を.', 'に marks a place or a receiver. The thing you eat takes を.', 'へ marks direction. The thing you eat takes を.']], ['としょかん（　　）べんきょうします。', ['で', 'を', 'に', 'へ'], 'Place where an action HAPPENS takes で. (Indonesian "di" covers both で and に.)', 'particle particle particle', ['を marks an object. The library isn\'t what you study.', 'に marks where something is or goes. Where you study takes で.', 'へ marks direction. Where you study takes で.']], ['つくえの 上（　　）ねこが います。', ['に', 'で', 'を', 'へ'], 'Place where something EXISTS (いる/ある) takes に.', 'particle particle particle', ['で marks where an action happens. Being somewhere (います) takes に.', 'を marks an object. A place of existence takes に.', 'へ marks direction. A place of existence takes に.']], ['にちようびは どこ（　　）行きませんでした。', ['へも', 'へは', 'にを', 'でも'], 'どこへも + negative = (went) nowhere.', 'particle form particle', ['へは contrasts (to there, at least). "Nowhere" is どこへも + negative.', 'にを isn\'t a particle pair.', 'どこでも = anywhere at all, with a positive. "Went nowhere" is どこへも.']], ['この ケーキは おいしい（　　）、高いです。', ['ですが', 'くて', 'ですと', 'でも'], 'Contrast: tasty, but expensive → ですが. おいしい (good) and 高い (bad) are opposite points.', 'form particle form', ['くて attaches after dropping い (おいしくて), and it means "and", not "but".', 'と joins nouns or means "when". "But" between two sentences is ですが.', 'でも = but starts a new sentence (でも、高いです). It can\'t attach to おいしい.']], ['えいがを（　　）行きませんか。', ['見に', '見るに', '見る', '見た'], 'Purpose of going: verb stem + に 行く → 見に 行く.', 'form form form', ['Purpose + に 行く takes the stem: 見に, not 見るに.', 'A dictionary form can\'t go straight before 行く. Use 見に.', 'A past form can\'t go before 行く here. Use 見に.']], ['ごはんを 食べた（　　）、はを みがきます。', ['後で', '前に', 'ながら', '後ろで'], 'た-form + 後で = after doing. 前に needs the dictionary form.', 'form nuance field', ['前に = before, and it takes the dictionary form (食べる 前に).', 'ながら = at the same time, and it takes the stem (食べながら).', '後ろ = behind (a place). It shares the kanji 後, but "after" is 後で.']], ['おんがくを（　　）べんきょうします。', ['聞きながら', '聞いてながら', '聞くながら', '聞いたながら'], 'ながら attaches to the verb stem: 聞き + ながら.', 'form form form', ['ながら attaches to the stem, not the て-form.', 'ながら attaches to the stem, not the dictionary form.', 'ながら attaches to the stem, not the past.']], ['この へやに 入って（　　）いいですか。', ['も', 'が', 'は', 'で'], '〜ても いいですか = may I…?', 'particle particle particle', ['が can\'t follow a て-form. "May I" is ても いいですか.', 'ては goes with いけません (must not). "May I" is ても いいですか.', 'で can\'t follow a て-form. "May I" is ても いいですか.']], ['あしたは 雨が ふる（　　）。', ['でしょう', 'です', 'ました', 'ません'], 'Dictionary form + でしょう = probably.', 'form form form', ['です can\'t follow a verb\'s dictionary form.', 'ました attaches to a stem, not the dictionary form.', 'ません attaches to a stem, not the dictionary form.']], ['もう ひるごはんを 食べましたか。…いいえ、（　　）です。', ['まだ', 'もう', 'よく', 'すぐ'], 'いいえ、まだです = No, not yet.', 'dir field field', ['いいえ、もうです isn\'t an answer. "No, not yet" is いいえ、まだです.', 'よく = often or well. "Not yet" is まだです.', 'すぐ = soon. "Not yet" is まだです.']], ['あの レストランは（　　）で おいしいです。', ['しずか', 'しずかな', 'しずかに', 'しずかだ'], 'な-adjective て-form: しずか + で.', 'form form form', ['な is only used before a noun. To join adjectives, use で.', 'しずかに goes before a verb. To join adjectives, use しずかで.', 'だ ends a sentence. To join adjectives, use しずかで.']], ['やまださんは わたし（　　）せが 高いです。', ['より', 'ほど', 'まで', 'から'], 'A は B より… = A is more … than B. ほど needs a negative (Bほど 〜ない).', 'polar particle particle', ['ほど needs a negative (わたしほど 高くない). With a positive, use より.', 'まで = until. "Than" is より.', 'から = from. "Than" is より.']]]);
add(5, 'go', [['わたしの　★　＿＿　＿＿　＿＿　あります。', ['へや', 'つくえが', 'に', '二つ'], 'わたしの へや に つくえが 二つ あります。 ★ = へや.', 'order order order', ['つくえが comes after に (へやに つくえが). へや comes first.', 'に comes after へや (へやに).', '二つ comes last, right before あります.']], ['きのう　＿＿　＿＿　＿＿　★　を かいました。', ['セーター', '高い', 'デパートで', 'とても'], 'きのう デパートで とても 高い セーター を かいました。 ★ = セーター.', 'order order order', ['高い describes セーター, so it comes right before it, not in the last spot.', 'デパートで (where) comes first. セーター comes last, before を.', 'とても goes before 高い. セーター comes last.']], ['これは　＿＿　＿＿　＿＿　★　です。', ['ケーキ', 'つくった', 'きのう', '母が'], 'これは きのう 母が つくった ケーキ です。 The modifier (母が つくった) comes BEFORE the noun. ★ = ケーキ.', 'order order order', ['つくった describes ケーキ, so it comes right before it. ケーキ is last.', 'きのう comes first. ケーキ is last, before です.', '母が comes before つくった. ケーキ is last.']], ['あそこで　＿＿　＿＿　★　＿＿　わたしの あにです。', ['いる', '新聞を', '読んで', '人が'], 'あそこで 新聞を 読んで いる 人が わたしの あにです。 The whole action (新聞を 読んで いる) comes before 人. ★ = いる.', 'order order order', ['新聞を comes first: 新聞を 読んで いる.', '読んで comes before いる, in the second spot.', '人が comes last, right before わたしの あにです.']], ['きのう　★　＿＿　＿＿　＿＿　とても おいしかったです。', ['レストランで', 'カレー', '食べた', 'は'], 'きのう レストランで 食べた カレー は とても おいしかったです。 食べた describes カレー, so it comes right before it. ★ = レストランで.', 'order order order', ['カレー comes right before は. レストランで comes first.', '食べた describes カレー and comes right before it.', 'は comes last, right before とても.']], ['わたしは　＿＿　＿＿　＿＿　★　が すきです。', ['の', '食べる', 'あまい', 'ものを'], 'わたしは あまい ものを 食べる の が すきです。 〜の が すき turns an action into a thing you like. ★ = の.', 'order order order', ['食べる comes after ものを and right before の.', 'あまい describes もの and comes first.', 'ものを comes after あまい: あまい ものを 食べる の.']]]);
passage(5, 'n5p1', 'やまださんへ\n\nあしたの パーティーは ６時からです。わたしの うちは 駅の 前の ゆうびんきょくの となりです。飲みものは わたしが かいますから、やまださんは ケーキを かって きて ください。\n\nキム', [['やまださんは あした 何を しますか。', ['ケーキを かって、キムさんの うちへ 行きます。', '飲みものを かって、キムさんの うちへ 行きます。', '６時に 駅で キムさんに 会います。', 'ゆうびんきょくで ケーキを かいます。'], "The last sentence: 飲みものは わたしが かいますから、やまださんは ケーキを かって きて ください. Kim buys the drinks; Yamada brings a cake to the party at Kim's house.", 'dir keyword keyword', ["Drinks are キムさん's job: 飲みものは わたしが かいます (わたし = キムさん, who wrote the letter). やまださん brings the cake.", "６時 is when the party starts, and 駅の 前 only says where the house is. Nobody meets at the station: やまださん goes to the house.", "ゆうびんきょく is only a landmark: the house is next to it (ゆうびんきょくの となり). The letter doesn't say where to buy the cake."]], ['キムさんの うちは どこですか。', ['ゆうびんきょくの となり', 'ゆうびんきょくの 前', '駅の となり', 'ゆうびんきょくと 駅の 間'], 'Sentence 2: わたしの うちは 駅の 前の ゆうびんきょくの となりです. Read the の chain from the end: the house is next to (となり) the post office, and the post office is in front of the station.', 'keyword keyword keyword', ["前 belongs to the station: 駅の 前の ゆうびんきょく = the post office in front of the station. The house is ゆうびんきょくの となり.", "となり goes with ゆうびんきょく, the noun right before it, not with 駅.", "The letter names both places, but the house is not between them. It is right next to the post office."]]]);
passage(5, 'n5p2', 'わたしは まいしゅう 土よう日に プールへ 行きます。プールは うちから じてんしゃで １０分です。きょねんは ５０メートルしか およげませんでしたが、今は ５００メートル およげます。らいしゅうは 友だちと うみへ 行きます。', [['「わたし」は 今 どのぐらい およげますか。', ['５００メートル', '５０メートル', '１０メートル', 'ぜんぜん およげません'], 'Sentence 3: きょねんは ５０メートルしか およげませんでしたが、今は ５００メートル およげます. ５０ is last year; 今は gives the answer.', 'change keyword neg', ["５０メートル was last year (きょねんは … しか およげませんでした). The sentence goes on: 今は ５００メートル.", "１０ is from じてんしゃで １０分: the minutes to the pool, not metres.", "およげませんでした is past and comes with しか: last year the writer could swim ONLY 50 m. Now it's 500 m."]], ['「わたし」は らいしゅう だれと どこへ 行きますか。', ['友だちと うみへ 行きます。', '友だちと プールへ 行きます。', '一人で プールへ 行きます。', '一人で うみへ 行きます。'], 'The last sentence: らいしゅうは 友だちと うみへ 行きます. The pool is the usual Saturday plan (まいしゅう 土よう日).', 'keyword change keyword', ["友だち is right, but they go to the sea (うみ). The pool is the writer's weekly place.", "The pool is the usual plan (まいしゅう 土よう日に プールへ 行きます). Next week is different: らいしゅうは … うみへ.", "うみ is right, but not alone: らいしゅうは 友だちと うみへ 行きます."]]]);
listen(5, [{
    q: 'おんなの ひとは なにを かいますか。',
    intro: 'みせで おんなの ひとと みせの ひとが はなしています。おんなの ひとは なにを かいますか。',
    lines: [['F', 'すみません、りんごを みっつ ください。'], ['M', 'はい。きょうは みかんも やすいですよ。'], ['F', 'じゃあ、みかんも いつつ ください。'], ['M', 'ありがとうございます。']],
    o: ['りんご みっつと みかん いつつ', 'りんご いつつと みかん みっつ', 'りんご みっつだけ', 'みかん いつつだけ'],
    e: 'She orders 3 apples, then adds 5 mandarins.',
    d: 'keyword change detail',
    n: ['The numbers are swapped. She asks for りんごを みっつ and みかんも いつつ.', 'That was her first order. After he says みかんも やすい, she adds みかんも いつつ.', 'She does buy five mandarins, but also the three apples she asked for first.']
}, {
    q: 'ふたりは なんじに あいますか。',
    intro: 'おとこの ひとと おんなの ひとが はなしています。ふたりは なんじに あいますか。',
    lines: [['M', 'あした、えいがを みに いきませんか。'], ['F', 'いいですね。えいがは なんじからですか。'], ['M', '３じからです。２じはんに えきで あいましょう。'], ['F', 'すみません、２じはんは ちょっと…。２じ４５ふんは どうですか。'], ['M', 'いいですよ。']],
    o: ['２じ４５ふん', '２じはん', '３じ', '３じ４５ふん'],
    e: '2:30 does not work for her (ちょっと… = polite no); they agree on 2:45.',
    d: 'change detail keyword',
    n: ['He suggests ２じはん, but she says ちょっと… (a polite no) and offers ２じ４５ふん.', '３じ is when the film starts, not when they meet.', 'Nobody says ３じ４５ふん. It mixes ３じ (the film) with ４５ふん (the meeting time).']
}, {
    q: 'がくせいは あした なにを もって きますか。',
    intro: 'せんせいが はなしています。がくせいは あした なにを もって きますか。',
    lines: [['M', 'あしたは テストです。えんぴつと けしゴムを もって きて ください。じしょは いりません。ノートも いりません。']],
    o: ['えんぴつと けしゴム', 'じしょと ノート', 'えんぴつと じしょ', 'ノートと けしゴム'],
    e: 'Pencil and eraser; no dictionary (いりません), no notebook.',
    d: 'neg neg neg',
    n: ['The teacher says じしょは いりません and ノートも いりません: neither is needed.', 'えんぴつ is right, but じしょは いりません.', 'けしゴム is right, but ノートも いりません.']
}, {
    q: 'ともだちの うちから かえる とき、なんと いいますか。',
    intro: 'ともだちの うちから かえります。なんと いいますか。',
    lines: [],
    o: ['おじゃましました。', 'いただきます。', 'いってきます。', 'おかえりなさい。'],
    e: 'おじゃましました is said when leaving someone\'s home.',
    d: 'situ situ situ',
    n: ['いただきます is said before eating.', 'いってきます is said when you leave YOUR home. Leaving a friend\'s home is おじゃましました.', 'おかえりなさい is said to someone who comes home.']
}, {
    q: 'おとこの ひとの かさは どれですか。',
    intro: 'おんなの ひとと おとこの ひとが はなしています。おとこの ひとの かさは どれですか。',
    lines: [['F', 'その くろい かさは たなかさんのですか。'], ['M', 'いいえ、わたしのは あおくて、ながい かさです。'], ['F', 'これですか。'], ['M', 'あ、それです。']],
    o: ['あおくて ながい かさ', 'くろくて ながい かさ', 'あおくて みじかい かさ', 'くろくて みじかい かさ'],
    e: 'わたしのは あおくて、ながい かさです.',
    d: 'keyword keyword keyword',
    n: ['The くろい umbrella is the one she asks about, and it isn\'t his. His is あおくて、ながい.', 'あおい is right, but his umbrella is ながい, not みじかい.', 'Both are wrong: his is あおくて、ながい かさ.']
}, /* batch 1 — 課題理解 */
{
    q: 'おとこの こは なにを かいますか。',
    intro: 'うちで おかあさんと おとこの こが はなしています。おとこの こは なにを かいますか。',
    lines: [['F', 'スーパーで ぎゅうにゅうと パンを かって きて。'], ['M', 'うん。ほかには？'], ['F', 'あ、パンは まだ あるから いいわ。たまごを おねがい。'], ['M', 'わかった。']],
    o: ['ぎゅうにゅうと たまご', 'ぎゅうにゅうと パン', 'パンと たまご', 'たまごだけ'],
    e: 'パンは まだ ある から いい = no bread needed. Milk stays, eggs are added.',
    d: 'change change detail',
    n: ['Mother first says パン, then あ、パンは まだ あるから いいわ: no bread.', 'パンは まだ ある, so no bread, and ぎゅうにゅう is still on the list.', 'He buys たまご, but ぎゅうにゅう too: only the bread was dropped.']
}, {
    q: 'がくせいは あした どこに あつまりますか。',
    intro: 'せんせいが はなしています。がくせいは あした どこに あつまりますか。',
    lines: [['M', 'あしたは バスで こうえんへ いきます。８じはんに がっこうの まえに あつまって ください。きょうしつには はいらないで ください。']],
    o: ['がっこうの まえ', 'きょうしつ', 'こうえん', 'バスの なか'],
    e: 'がっこうの まえに あつまって. きょうしつには はいらないで = do not go into the classroom; こうえん is where the bus goes.',
    d: 'neg seq keyword',
    n: ['The teacher says きょうしつには はいらないで ください: don\'t go into the classroom.', 'こうえん is where the bus goes. They meet first at がっこうの まえ.', 'They go by バス, but they meet がっこうの まえに.']
}, {
    q: 'おんなの ひとは かみを なんまい コピーしますか。',
    intro: 'かいしゃで おとこの ひとと おんなの ひとが はなしています。おんなの ひとは かみを なんまい コピーしますか。',
    lines: [['M', 'すみません、この かみを ２０まい コピーして ください。'], ['F', 'はい、２０まいですね。'], ['M', 'あ、すみません。あしたは ５にん ふえますから、２５まい おねがいします。']],
    o: ['２５まい', '２０まい', '５まい', '１５まい'],
    e: '20 at first, then 5 more people (ふえます) → 25.',
    d: 'change keyword dir',
    n: ['２０まい was the first request. Then he says ５にん ふえます, so ２５まい.', '５ is the number of extra people, not the number of copies.', 'ふえます means "increase": ２０ plus ５, not minus.']
}, {
    q: 'おとこの ひとは なにを たのみますか。',
    intro: 'きっさてんで おとこの ひとと みせの ひとが はなしています。おとこの ひとは なにを たのみますか。',
    lines: [['M', 'コーヒーと ケーキを ください。'], ['F', 'すみません、きょうは ケーキが ありません。'], ['M', 'そうですか。じゃあ、コーヒーと サンドイッチを ください。あ、コーヒーは つめたいのを おねがいします。']],
    o: ['つめたい コーヒーと サンドイッチ', 'あつい コーヒーと サンドイッチ', 'つめたい コーヒーと ケーキ', 'コーヒーと ケーキ'],
    e: 'No cake today, so a sandwich; the coffee is つめたい (iced).',
    d: 'keyword change change',
    n: ['He says コーヒーは つめたいのを: cold coffee, not hot.', 'There is no cake today (ケーキが ありません), so he takes a sandwich.', 'That was his first order, but きょうは ケーキが ありません.']
}, {
    q: 'おんなの ひとは なにを もって いきますか。',
    intro: 'おとこの ひとと おんなの ひとが はなしています。おんなの ひとは パーティーに なにを もって いきますか。',
    lines: [['F', 'どようびの パーティー、なにか もって いきましょうか。'], ['M', 'のみものは わたしが かいます。くだものを おねがいします。'], ['F', 'わかりました。おかしも もって いきますね。'], ['M', 'あ、おかしは たくさん ありますから、いいですよ。']],
    o: ['くだもの', 'くだものと おかし', 'のみもの', 'おかし'],
    e: 'おかしは たくさん あります から いいです よ = no sweets needed. Only fruit.',
    d: 'change keyword change',
    n: ['She offers おかし, but he says おかしは たくさん ありますから、いいですよ: no sweets.', 'He buys the drinks himself (のみものは わたしが かいます).', 'おかしは たくさん あります, so she doesn\'t bring them.']
}, /* batch 1 — ポイント理解 */
{
    q: 'おとこの ひとの たんじょうびは いつですか。',
    intro: 'おとこの ひとと おんなの ひとが はなしています。おとこの ひとの たんじょうびは いつですか。',
    lines: [['F', 'たなかさんの たんじょうびは いつですか。'], ['M', '６がつ ８かです。'], ['F', 'あ、わたしは ８がつ ６かです。おもしろいですね。']],
    o: ['６がつ ８か', '８がつ ６か', '６がつ ６か', '８がつ ８か'],
    e: 'He says ６がつ ８か; ８がつ ６か is her birthday.',
    d: 'detail keyword keyword',
    n: ['８がつ ６か is HER birthday (わたしは ８がつ ６かです).', 'The month is right, but the day is ８か: ６がつ ８か.', 'The day is right, but the month is ６がつ. ８がつ is her month.']
}, {
    q: 'おんなの ひとは けさ どうやって えきへ いきましたか。',
    intro: 'おとこの ひとと おんなの ひとが はなしています。おんなの ひとは けさ どうやって えきへ いきましたか。',
    lines: [['M', 'けさは あめでしたね。じてんしゃで えきへ いきましたか。'], ['F', 'いいえ、あめでしたから、じてんしゃは やめました。'], ['M', 'じゃあ、バスですか。'], ['F', 'バスは こんで いましたから、あるいて いきました。'], ['M', 'タクシーは？'], ['F', 'タクシーは たかいですから。']],
    o: ['あるいて', 'じてんしゃで', 'バスで', 'タクシーで'],
    e: 'No bike (rain), no bus (crowded), no taxi (expensive) → she walked.',
    d: 'neg neg neg',
    n: ['あめでしたから、じてんしゃは やめました: no bike.', 'バスは こんで いましたから: she didn\'t take the bus.', 'タクシーは たかいですから: no taxi.']
}, {
    q: 'おんなの ひとの かぞくは なんにんですか。',
    intro: 'おんなの ひとが じぶんの かぞくに ついて はなしています。おんなの ひとの かぞくは なんにんですか。',
    lines: [['F', 'わたしの かぞくは ちちと ははと あにと わたしです。いもうとは いません。それから、いぬが いっぴき います。']],
    o: ['４にん', '５にん', '３にん', '６にん'],
    e: 'Father, mother, brother and herself = 4. No younger sister; the dog is いっぴき, not a person.',
    d: 'count keyword neg',
    n: ['The dog is いっぴき, an animal. The people are ちち, はは, あに and her: ４にん.', 'Don\'t forget her: ちちと ははと あにと わたし.', 'いもうとは いません, and the dog isn\'t a person.']
}, {
    q: 'おとこの ひとの ほんは どこに ありましたか。',
    intro: 'おとこの ひとと おんなの ひとが はなしています。おとこの ひとの ほんは どこに ありましたか。',
    lines: [['M', 'わたしの ほん、しりませんか。'], ['F', 'つくえの うえは？'], ['M', 'ありません。'], ['F', 'つくえの したは？'], ['M', 'したにも ありません。'], ['F', 'じゃあ、かばんの なかは？'], ['M', 'あ、ありました。']],
    o: ['かばんの なか', 'つくえの うえ', 'つくえの した', 'かばんの うえ'],
    e: 'Not on or under the desk; あ、ありました comes after かばんの なか.',
    d: 'neg neg keyword',
    n: ['He says ありません when she asks about つくえの うえ.', 'したにも ありません: not under the desk either.', 'The book was かばんの なか, inside the bag.']
}, /* batch 1 — 発話表現 */
{
    q: 'あさ、せんせいに あいました。なんと いいますか。',
    intro: 'あさ、せんせいに あいました。なんと いいますか。',
    lines: [],
    o: ['おはようございます。', 'こんばんは。', 'おやすみなさい。', 'いってきます。'],
    e: 'Morning greeting: おはようございます.',
    d: 'situ situ situ',
    n: ['こんばんは is for the evening.', 'おやすみなさい is said before going to bed.']
}, {
    q: 'ともだちに プレゼントを もらいました。なんと いいますか。',
    intro: 'ともだちに プレゼントを もらいました。なんと いいますか。',
    lines: [],
    o: ['ありがとう。', 'どういたしまして。', 'いただきます。', 'おめでとう。'],
    e: 'You received something: ありがとう. どういたしまして is the reply to thanks.',
    d: 'dir situ',
    n: ['どういたしまして is the reply when someone thanks YOU.', 'いただきます is said before eating, not for a present.']
}, {
    q: 'みせで みずが ほしいです。なんと いいますか。',
    intro: 'みせで みずが ほしいです。なんと いいますか。',
    lines: [],
    o: ['すみません、みずを ください。', 'みずを あげます。', 'みずは いかがですか。', 'みずを ありがとう。'],
    e: 'Asking for something: 〜を ください. あげます and いかがですか offer water to someone else.',
    d: 'dir dir situ',
    n: ['みずを あげます means YOU give water to someone.', 'みずは いかがですか offers water to someone else; the shop staff would say it.']
}, {
    q: 'あついので まどを あけたいです。せんせいに なんと いいますか。',
    intro: 'あついので まどを あけたいです。せんせいに なんと いいますか。',
    lines: [],
    o: ['まどを あけても いいですか。', 'まどを あけて ください。', 'まどを あけましたか。', 'まどが あいて います。'],
    e: 'Asking permission: 〜ても いいですか. あけて ください asks the teacher to do it.',
    d: 'dir situ form',
    n: ['まどを あけて ください asks the teacher to open it. You want to open it yourself.', 'まどを あけましたか asks if someone already opened it.']
}, /* batch 1 — 即時応答 */
{
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['M', 'おなまえは？']],
    o: ['やまだです。', 'げんきです。', 'にほんです。', '２０さいです。'],
    e: 'おなまえは？ asks your name.',
    d: 'situ situ situ',
    n: ['げんきです answers おげんきですか, not a question about your name.', 'にほんです answers where you are from (おくには？).']
}, {
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['F', 'いっしょに おちゃを のみませんか。']],
    o: ['ええ、のみましょう。', 'いいえ、のみませんでした。', 'はい、のみました。', 'おちゃは どこですか。'],
    e: '〜ませんか is an invitation; accept with 〜ましょう. Past forms answer a different question.',
    d: 'form form keyword',
    n: ['のみませんでした is past: "I didn\'t drink." It doesn\'t answer an invitation.', 'のみました is past: "I drank." To accept, say のみましょう.']
}, {
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['M', 'それは だれの かさですか。']],
    o: ['わたしのです。', 'あかい かさです。', 'えきで かいました。', 'はい、かさです。'],
    e: 'だれの = whose. Answer with a person: わたしのです.',
    d: 'keyword keyword keyword',
    n: ['あかい かさです says what the umbrella looks like, not whose it is (だれの).', 'えきで かいました says where you bought it, not whose it is.']
}, {
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['F', 'しゅくだいは もう おわりましたか。']],
    o: ['いいえ、まだです。', 'はい、まだです。', 'いいえ、もう おわりました。', 'はい、これからです。'],
    e: 'もう〜ましたか → はい、もう〜ました or いいえ、まだです. はい and まだ don\'t go together.',
    d: 'polar polar polar',
    n: ['はい goes with もう おわりました. はい and まだ don\'t go together.', 'いいえ goes with まだです. いいえ and もう おわりました don\'t go together.']
}, {
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['M', 'きょうは さむいですね。']],
    o: ['ええ、ほんとうに。', 'いいえ、どういたしまして。', 'では、また あした。', 'いってらっしゃい。'],
    e: 'Small talk about the weather: agree with ええ、ほんとうに.',
    d: 'situ situ situ',
    n: ['どういたしまして answers ありがとう, not small talk about the weather.', 'では、また あした is said when leaving.']
}, {
    q: 'なんと こたえますか。',
    intro: 'なんと こたえますか。',
    lines: [['F', 'えきまで どのぐらい かかりますか。']],
    o: ['あるいて １０ぷんぐらいです。', 'えきの まえです。', '２００えんです。', 'でんしゃで いきます。'],
    e: 'どのぐらい かかりますか asks how long it takes.',
    d: 'keyword keyword keyword',
    n: ['えきの まえです tells where something is, not how long it takes.', '２００えんです tells the price, not the time (どのぐらい かかりますか).']
}, {
    'q': 'おんなの ひとは どの バスに のりますか。',
    'intro': 'バスていで おんなの ひとと おとこの ひとが はなしています。おんなの ひとは どの バスに のりますか。',
    'lines': [['F', 'すみません、さくらびょういんへ いきたいんですが。'], ['M', '３ばんの バスに のって ください。'], ['F', '５ばんは いきませんか。'], ['M', '５ばんも いきますが、とても じかんが かかりますよ。'], ['F', 'そうですか。じゃあ、３ばんに のります。']],
    'o': ['３ばん', '５ばん', '３ばんと ５ばん', '３ばんでも ５ばんでも いい'],
    'e': 'Bus 5 also goes there but takes a long time, so she takes 3.',
    'd': 'detail keyword change',
    n: ['５ばんも いきますが、とても じかんが かかります: it goes there, but she chooses ３ばん.', 'She takes one bus: じゃあ、３ばんに のります.', 'Both go there, but at the end she decides: ３ばんに のります.']
}, {
    'q': 'ふたりは どこで ひるごはんを たべますか。',
    'intro': 'おとこの ひとと おんなの ひとが はなしています。ふたりは どこで ひるごはんを たべますか。',
    'lines': [['M', 'ひるごはん、どこで たべましょうか。'], ['F', 'えきの まえの レストランは どうですか。'], ['M', 'あそこは いつも ひとが おおいですよ。'], ['F', 'じゃあ、こうえんで パンを たべませんか。'], ['M', 'いいですね。そう しましょう。']],
    'o': ['こうえん', 'えきの まえの レストラン', 'えきの まえの パンや', 'パンやの なか'],
    'e': 'The restaurant is always crowded; they agree on bread in the park (そう しましょう).',
    'd': 'change keyword keyword',
    n: ['He says あそこは いつも ひとが おおい, so they don\'t go there.', 'Nobody mentions a bakery by the station. They eat パン in the park.', 'They eat パン, but in the park (こうえんで).']
}, {
    'q': 'おんなの ひとは きのう なにを しましたか。',
    'intro': 'おとこの ひとと おんなの ひとが はなしています。おんなの ひとは きのう なにを しましたか。',
    'lines': [['M', 'きのうは なにを しましたか。'], ['F', 'ともだちと えいがを みに いきたかったです。でも、ともだちが びょうきでした。'], ['M', 'そうですか。'], ['F', 'それで、うちで ほんを よみました。']],
    'o': ['うちで ほんを よんだ', 'ともだちと えいがを みた', 'ともだちの うちへ いった', 'びょういんへ いった'],
    'e': 'She wanted to see a film, but her friend was sick → それで she read at home.',
    'd': 'change keyword keyword',
    n: ['She wanted to (みに いきたかったです), but her friend was sick.', 'Nobody went to the friend\'s home. She stayed home: うちで ほんを よみました.', 'Her friend was びょうき, but she didn\'t go to the hospital.']
}, {
    'q': 'おとこの ひとは なんじの でんしゃに のりますか。',
    'intro': 'えきで おとこの ひとと えきの ひとが はなしています。おとこの ひとは なんじの でんしゃに のりますか。',
    'lines': [['M', 'すみません、つぎの でんしゃは なんじですか。'], ['F', '９じ１０ぷんです。そのつぎは ９じ４０ぷんです。'], ['M', 'ともだちと ここで ９じはんに あいます。だから、９じ４０ぷんので いきます。']],
    'o': ['９じ４０ぷん', '９じ１０ぷん', '９じはん', '９じ４ぷん'],
    'e': 'He meets his friend here at 9:30, so he takes the train after that: 9:40.',
    'd': 'detail keyword keyword',
    n: ['９じ１０ぷん is the next train, but he meets his friend at ９じはん, so he waits.', '９じはん is when he meets his friend, not a train time.', 'He says ４０ぷん (よんじゅっぷん), not ４ぷん (よんぷん).']
}, {
    'q': 'おんなの ひとの へやは どれですか。',
    'intro': 'おんなの ひとと おとこの ひとが はなしています。おんなの ひとの へやは どれですか。',
    'lines': [['F', 'わたしの へやは ２かいです。まどが おおきくて、あかるいです。'], ['M', 'ベッドは ありますか。'], ['F', 'いいえ、ベッドは ありません。ふとんで ねます。']],
    'o': ['２かいで、まどが おおきい へや', '２かいで、ベッドが ある へや', '１かいで、まどが おおきい へや', '１かいで、ベッドが ある へや'],
    'e': '2nd floor, big window, no bed (she sleeps on a futon).',
    'd': 'neg keyword neg',
    n: ['She says ベッドは ありません. She sleeps on a futon.', 'Her room is on ２かい, not １かい.', 'Both are wrong: ２かい, and no bed.']
}, {
    'q': 'おとこの ひとは ぜんぶで いくら はらいますか。',
    'intro': 'みせで おとこの ひとと みせの ひとが はなしています。おとこの ひとは ぜんぶで いくら はらいますか。',
    'lines': [['M', 'この ノートは いくらですか。'], ['F', '１さつ １２０えんです。'], ['M', 'じゃあ、３さつ ください。それから、この ボールペンも ください。'], ['F', 'ボールペンは １００えんです。ぜんぶで ４６０えんです。']],
    'o': ['４６０えん', '３６０えん', '２２０えん', '１２０えん'],
    'e': '3 notebooks × 120 = 360, plus a 100-yen pen = 460.',
    'd': 'detail count keyword',
    n: ['３６０えん is only the three notebooks. Add the pen (１００えん): ４６０えん.', '２２０えん is one notebook and the pen. He buys ３さつ.', '１２０えん is the price of one notebook.']
}, {
    'q': 'がくせいは あした どこで しけんを うけますか。',
    'intro': 'せんせいが がくせいに はなしています。がくせいは あした どこで しけんを うけますか。',
    'lines': [['M', 'あしたの しけんは ２かいの きょうしつでは ありません。３がいの おおきい へやです。９じまでに きて ください。']],
    'o': ['３がいの おおきい へや', '２かいの きょうしつ', '３がいの きょうしつ', '２かいの おおきい へや'],
    'e': 'Not the 2nd-floor classroom (〜では ありません): the big room on the 3rd floor.',
    'd': 'neg keyword keyword',
    n: ['The teacher says ２かいの きょうしつでは ありません: not there.', 'It is ３がい, but the big room (おおきい へや), not a classroom.', 'おおきい へや is right, but on ３がい, not ２かい.']
}, {
    'q': 'おんなの ひとは なにを のみますか。',
    'intro': 'きっさてんで みせの ひとと おんなの ひとが はなしています。おんなの ひとは なにを のみますか。',
    'lines': [['M', 'なにを のみますか。'], ['F', 'コーヒーを おねがいします。'], ['M', 'すみません、コーヒーは いま ありません。こうちゃは どうですか。'], ['F', 'こうちゃは あまり すきじゃ ありません。じゃあ、ジュースを ください。']],
    'o': ['ジュース', 'コーヒー', 'こうちゃ', 'こうちゃと ジュース'],
    'e': 'No coffee today, she doesn\'t like tea → juice.',
    'd': 'change change keyword',
    n: ['コーヒーは いま ありません: there is no coffee now.', 'She says こうちゃは あまり すきじゃ ありません.', 'She doesn\'t like tea. She only orders ジュース.']
}, {
    'q': 'おとこの ひとは どうして げんきが ありませんか。',
    'intro': 'おんなの ひとと おとこの ひとが はなしています。おとこの ひとは どうして げんきが ありませんか。',
    'lines': [['F', 'どう しましたか。げんきが ありませんね。'], ['M', 'きのう よる おそくまで しごとを しました。'], ['F', 'ねつが ありますか。'], ['M', 'いいえ、ねつは ありません。ちょっと ねむいです。']],
    'o': ['ねむいから', 'ねつが あるから', 'しごとが おおいから', 'しごとが ないから'],
    'e': 'He worked late; no fever, just ねむい (sleepy).',
    'd': 'neg over keyword',
    n: ['She asks ねつが ありますか and he says ねつは ありません.', 'He worked late yesterday, but he never says he has a lot of work. What he feels is ねむい.', 'He worked late, so there is work. しごとが ない is the opposite.']
}, {
    'q': 'ふたりは いつ やまへ いきますか。',
    'intro': 'おとこの ひとと おんなの ひとが はなしています。ふたりは いつ やまへ いきますか。',
    'lines': [['M', 'こんどの どようび、やまへ いきませんか。'], ['F', 'どようびは ともだちと あいます。にちようびは どうですか。'], ['M', 'にちようびは あめですよ。'], ['F', 'じゃあ、らいしゅうの どようびは？'], ['M', 'いいですね。']],
    'o': ['らいしゅうの どようび', 'こんどの どようび', 'こんどの にちようび', 'らいしゅうの にちようび'],
    'e': 'This Saturday she meets a friend, Sunday it rains → next Saturday.',
    'd': 'change change keyword',
    n: ['こんどの どようびは ともだちと あいます: she is busy then.', 'にちようびは あめです: it will rain.', 'They agree on らいしゅうの どようび, not にちようび.']
}, {
    'q': 'おんなの ひとは だれと すんで いますか。',
    'intro': 'おとこの ひとと おんなの ひとが はなしています。おんなの ひとは だれと すんで いますか。',
    'lines': [['M', 'ひとりで すんで いますか。'], ['F', 'いいえ、あねと すんで います。'], ['M', 'おとうさんと おかあさんは？'], ['F', 'ちちと ははは おおさかに います。']],
    'o': ['あね', 'ちちと はは', 'ひとりで', 'あねと はは'],
    'e': 'She lives with her older sister (あね); her parents are in Osaka.',
    'd': 'keyword neg keyword',
    n: ['Her parents are in おおさか (ちちと ははは おおさかに います).', 'He asks ひとりで？ and she says いいえ.', 'She lives with あね only; はは is in おおさか.']
}, {
    'q': 'おとこの ひとは なにを かいに いきますか。',
    'intro': 'おんなの ひとと おとこの ひとが はなしています。おとこの ひとは なにを かいに いきますか。',
    'lines': [['F', 'あしたは パーティーですね。のみものは ありますか。'], ['M', 'ビールは あります。ジュースが ありません。'], ['F', 'おかしは？'], ['M', 'おかしは たなかさんが もって きます。じゃあ、ジュースを かいに いきます。']],
    'o': ['ジュース', 'ビール', 'おかし', 'ジュースと おかし'],
    'e': 'There is beer, Tanaka brings sweets → he only buys juice.',
    'd': 'keyword keyword detail',
    n: ['ビールは あります: they already have beer.', 'たなかさんが もって きます: Tanaka brings the sweets.', 'He only buys ジュース; the sweets come from Tanaka.']
}, {
    'q': 'あしたの ごごの てんきは どうですか。',
    'intro': 'ラジオで おんなの ひとが はなしています。あしたの ごごの てんきは どうですか。',
    'lines': [['F', 'あしたの あさは あめですが、ひるから はれるでしょう。よるは すこし さむく なります。']],
    'o': ['はれ', 'あめ', 'ゆき', 'あめで さむい'],
    'e': 'Rain in the morning, clear from noon (ひるから はれる).',
    'd': 'detail over keyword',
    n: ['あめ is for the morning (あしたの あさは あめ). From noon it clears up.', 'She says よるは すこし さむく なります, but nothing about snow.', 'It rains in the morning and gets cold at night. In the afternoon it is はれ.']
}, {
    'q': 'ごはんを たべる まえに、なんと いいますか。',
    'intro': 'ごはんを たべる まえに、なんと いいますか。',
    'lines': [],
    'o': ['いただきます。', 'ごちそうさまでした。', 'いってきます。', 'おやすみなさい。'],
    'e': 'Before eating: いただきます. ごちそうさまでした is after.',
    'd': 'situ situ situ',
    n: ['ごちそうさまでした is said AFTER eating.', 'いってきます is said when you leave home.']
}, {
    'q': 'えきへ いきたいですが、みちが わかりません。なんと いいますか。',
    'intro': 'えきへ いきたいですが、みちが わかりません。なんと いいますか。',
    'lines': [],
    'o': ['すみません、えきは どこですか。', 'すみません、えきへ いきましょう。', 'えきは きれいですね。', 'えきで まって います。'],
    'e': 'Ask the way: 〜は どこですか.',
    'd': 'situ keyword',
    n: ['えきへ いきましょう invites someone to go. You need to ask the way.', 'えきは きれいですね comments on the station. It doesn\'t ask where it is.']
}, {
    'q': 'ともだちの ほんを みたいです。なんと いいますか。',
    'intro': 'ともだちの ほんを みたいです。なんと いいますか。',
    'lines': [],
    'o': ['その ほんを みせて ください。', 'その ほんを みて ください。', 'その ほんを あげましょう。', 'その ほんを よみましたか。'],
    'e': 'You want to see it: みせて ください (show me). みて ください asks HIM to look.',
    'd': 'dir dir situ',
    n: ['みて ください asks your friend to look. You want HIM to show you: みせて.', 'あげましょう offers to give the book away.']
}, {
    'q': 'おきゃくさんが うちに きました。なんと いいますか。',
    'intro': 'おきゃくさんが うちに きました。なんと いいますか。',
    'lines': [],
    'o': ['いらっしゃい。どうぞ。', 'おじゃまします。', 'いってらっしゃい。', 'いただきます。'],
    'e': 'The host says いらっしゃい. おじゃまします is what the guest says.',
    'd': 'dir situ situ',
    n: ['おじゃまします is what the guest says when coming in.', 'いってらっしゃい is said to someone leaving home.']
}, {
    'q': 'でんしゃで おとしよりが たって います。なんと いいますか。',
    'intro': 'でんしゃで おとしよりが たって います。なんと いいますか。',
    'lines': [],
    'o': ['どうぞ、すわって ください。', 'すわっても いいですか。', 'すわりましょうか。', 'たって ください。'],
    'e': 'You offer your seat: どうぞ、すわって ください.',
    'd': 'dir situ situ',
    n: ['すわっても いいですか asks if YOU may sit. You want to give your seat away.', 'すわりましょうか means "shall we sit?". You want to offer YOUR seat.']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['M', 'これは いくらですか。']],
    'o': ['５００えんです。', 'ふたつです。', 'あそこです。', 'あしたです。'],
    'e': 'いくら asks the price.',
    'd': 'count situ',
    n: ['ふたつです answers いくつ (how many), not いくら (how much).', 'あそこです answers どこ (where).']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['F', 'どうして きのう がっこうを やすみましたか。']],
    'o': ['あたまが いたかったからです。', 'あした やすみます。', 'がっこうは たのしいです。', 'はい、やすみました。'],
    'e': 'どうして asks the reason: 〜からです.',
    'd': 'form keyword',
    n: ['あした やすみます talks about tomorrow. The question is about きのう.', 'がっこうは たのしいです gives no reason. どうして needs 〜からです.']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['M', 'いっしょに かえりましょう。']],
    'o': ['ええ、かえりましょう。', 'いいえ、かえりました。', 'どうぞ、かえって ください。', 'はい、かえりませんでした。'],
    'e': 'Accept 〜ましょう with ええ、〜ましょう.',
    'd': 'form dir form',
    n: ['かえりました is past ("I went home"). To accept, say かえりましょう.', 'どうぞ、かえって ください sends him home alone. He invites you to go together.']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['F', 'おげんきですか。']],
    'o': ['はい、げんきです。', 'はい、おげんきです。', 'いいえ、どういたしまして。', 'では、また。'],
    'e': 'Answer about yourself without お: はい、げんきです.',
    'd': 'dir situ situ',
    n: ['お is for other people. About yourself, say げんきです.', 'どういたしまして answers ありがとう.']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['M', 'どこで かいましたか。']],
    'o': ['えきの まえの みせです。', 'きのう かいました。', '３つ かいました。', 'たかかったです。'],
    'e': 'どこで asks the place.',
    'd': 'keyword keyword',
    n: ['きのう かいました says when, not where (どこで).', '３つ かいました says how many, not where.']
}, {
    'q': 'なんと こたえますか。',
    'intro': 'なんと こたえますか。',
    'lines': [['F', 'すみません、いま なんじですか。']],
    'o': ['３じ はんです。', '３じかんです。', '３かいです。', '３にんです。'],
    'e': 'なんじ asks the time: 〜じ. 〜じかん is a length of time.',
    'd': 'count count count',
    n: ['３じかん is a length of time (three hours). なんじ asks the time.', '３かい is the third floor, or three times.']
}]);
conj(5, [['たべる', 'ます form', ['たべます'], 'Ichidan (る) verb: drop る, add ます.'], ['のむ', 'て form', ['のんで'], 'む・ぶ・ぬ → んで.'], ['いく', 'て form', ['いって'], 'Exception: いく → いって, not いいて.'], ['かく', 'ない form', ['かかない'], 'Godan: change the last u-sound to a-sound + ない.'], ['みる', 'た form', ['みた'], 'Ichidan: drop る, add た.'], ['よむ', 'た form', ['よんだ'], 'む → んだ.'], ['する', 'past negative, polite', ['しませんでした'], 'します → しません → しませんでした.'], ['おおきい', 'negative (plain)', ['おおきくない'], 'い-adjective: drop い, add くない.'], ['いい', 'past (plain)', ['よかった'], 'いい conjugates from よい: よかった.'], ['しずか', 'past negative (plain)', ['しずかじゃなかった', 'しずかではなかった'], 'な-adjective: じゃ(では)なかった.']]);

/* ───────────────────────── N4 ───────────────────────── */
add(4, 'kr', [['この <u>荷物</u>を おねがいします。', ['にもつ', 'かもつ', 'にぶつ', 'かぶつ'], '荷物 = にもつ (luggage). 貨物 かもつ is freight.', 'read read read'], ['時間が ないので、<u>急いで</u> ください。', ['いそいで', 'およいで', 'いそいて', 'ぬいで'], '急ぐ = いそぐ (hurry). ぐ verbs make their て form with いで: いそいで.', 'read voice read', ['およいで is 泳いで (swim). It ends in いで too, but 急 is いそぐ.', 'いそいて is not a form. 急ぐ ends in ぐ, so its て form is いそいで.', 'ぬいで comes from ぬぐ (take off clothes). 急ぐ is いそぐ (hurry).']], ['かぜを ひいたので、<u>病院</u>へ 行きます。', ['びょういん', 'びょうえん', 'びよういん', 'ぴょういん'], '病院 = びょういん (hospital). びよういん is a beauty salon.', 'read you voice', ['えん is the reading of a different kanji (as in こうえん, park). 院 is いん: びょういん.', 'びよういん (び + よう, no small ょ) is a beauty salon. 病院 has the small ょ: びょういん.', 'ぴょういん has ぴ instead of び. 病 is びょう.']], ['かぜで <u>熱</u>が あります。', ['ねつ', 'あつ', 'ねち', 'せつ'], '熱 = ねつ (fever). あつい (熱い) is the adjective reading.', 'read read read'], ['<u>世界</u>で いちばん 高い 山は どこですか。', ['せかい', 'せいかい', 'よかい', 'せがい'], '世界 = せかい (world).', 'long read voice', ['せいかい is a different word (correct answer). 世界 has a short せ: せかい.', 'よ is 世 in words like よのなか (the world, society). In 世界 it is せ.', 'せがい voices か to が. 界 stays かい: せかい.']], ['夏休みの <u>計画</u>を たてました。', ['けいかく', 'けいがく', 'けかく', 'けいが'], '計画 = けいかく (plan). 画 is かく here, が in 映画.', 'voice long read', ['けいがく voices かく to がく. 画 is かく here: けいかく.', 'けかく drops the long い of 計. 計 is けい: けいかく.', 'が is 画 in 映画 (えいが). In 計画 it is かく.']], ['父は <u>銀行</u>で 働いて います。', ['ぎんこう', 'ぎんぎょう', 'きんこう', 'ぎんこ'], '銀行 = ぎんこう (bank). 行 is こう here, ぎょう in 行事.', 'read voice long', ['ぎょう is 行 in words like 行事 (ぎょうじ, event). In 銀行 it is こう.', 'きんこう drops the voicing on ぎ. 銀 is ぎん.', 'ぎんこ drops the long う. 行 is こう: ぎんこう.']], ['駅まで 車で <u>送って</u> もらいました。', ['おくって', 'かえって', 'のって', 'むかって'], '送る = おくる (see off / give a ride).', 'field field field', ['かえって is 帰って (go home). Being driven to the station is 送って もらう.', 'のって is 乗って (ride). You ride in a car, but the kanji here is 送: おくって.', 'むかって means "heading toward". 送 is おくる.']], ['今日は <u>特別</u>な 日です。', ['とくべつ', 'とくへつ', 'どくべつ', 'とくべち'], '特別 = とくべつ (special).', 'voice voice read', ['とくへつ drops the voicing. 別 is べつ: とくべつ.', 'どく voices と. 特 is とく: とくべつ.', 'べち is not a reading of 別. It is べつ: とくべつ.']], ['<u>台所</u>で 料理を します。', ['だいどころ', 'たいどころ', 'だいところ', 'だいしょ'], '台所 = だいどころ (kitchen): ところ becomes どころ (rendaku).', 'voice voice read', ['たい is 台 in other words (たいふう, typhoon). Here it is だい: だいどころ.', 'だいところ misses the voicing: ところ becomes どころ after だい.', 'しょ is the reading of 所 in words like 住所 (じゅうしょ). 台所 uses どころ.']], ['しゅうまつは <u>家族</u>と 旅行します。', ['かぞく', 'かそく', 'がぞく', 'いえぞく'], '家族 = かぞく (family).', 'voice voice read', ['かそく leaves ぞく unvoiced. 族 is ぞく: かぞく.', 'がぞく voices か. 家 is か here: かぞく.', 'いえ is 家 on its own (house). In 家族 it is か.']], ['夜は <u>暗い</u> 道を 歩かないで ください。', ['くらい', 'くろい', 'あかるい', 'せまい'], '暗い = くらい (dark). The opposite is 明るい (あかるい).', 'field dir field', ['くろい is 黒い (black). Dark is くらい: 暗い.', 'あかるい is 明るい (bright), the opposite. 暗 and 明 both have 日 on the left.', 'せまい means narrow. A road can be narrow, but 暗い is くらい.']], ['<u>夕方</u>から 雨が ふりました。', ['ゆうがた', 'ゆうかた', 'ゆがた', 'ゆうほう'], '夕方 = ゆうがた (evening): かた becomes がた.', 'voice long read', ['ゆうかた misses the voicing: かた becomes がた after ゆう.', 'ゆがた drops the long う. 夕 is ゆう.', 'ほう is 方 in words like この 方 (direction). In 夕方 it is がた.']], ['デパートへ <u>洋服</u>を 買いに 行きます。', ['ようふく', 'ようぶく', 'よふく', 'ようふう'], '洋服 = ようふく (clothes). Long よう, and ふく stays unvoiced.', 'voice long read', ['ようぶく voices ふく. 服 stays ふく here: ようふく.', 'よふく drops the long う of 洋. 洋 is よう.', 'ようふう is a different word (Western style). 服 is ふく: ようふく.']], ['この 本を <u>借りて</u> も いいですか。', ['かりて', 'かして', 'かえして', 'おりて'], '借りる = かりる (borrow). 貸す かす is lend, 返す かえす is give back.', 'dir field read', ['かして is 貸して (lend), the other direction. Borrowing is かりる: かりて.', 'かえして is 返して (give back). 借 is かりる.', 'おりて means "get off" (a train, a bus). It rhymes with かりて, but 借 is かりる.']], ['<u>図書館</u>で 勉強します。', ['としょかん', 'ずしょかん', 'としょうかん', 'としょがん'], '図書館 = としょかん (library). 図 is と here, ず in 地図.', 'read long voice', ['ず is 図 in 地図 (ちず). In 図書館 it is と.', 'しょう adds a long う. 書 is しょ: としょかん.', 'がん voices かん. 館 is かん: としょかん.']]]);
add(4, 'ko', [['先生に <u>しつもん</u>しました。', ['質問', '質門', '室問', '質聞'], 'しつもん = 質問: a mouth (口) asking at the gate (門). 門 alone is only the gate.', 'shape read shape', ['門 is もん (gate) on its own. 問 has 口 inside the gate: 質問.', '室 is しつ (room), the same sound as 質. しつもん is written 質問.', '聞 is きく (listen): the gate with 耳 inside. しつもん uses 問, with 口.']], ['ここで 少し <u>まって</u> ください。', ['待って', '持って', '特って', '時って'], 'まつ = 待つ: 彳 "going" radical. 持つ (もつ) has the hand radical 扌; 特 and 時 have the same right-hand part.', 'shape shape shape', ['持 is もつ (hold), with the hand 扌 on the left. 待つ (まつ) has 彳.', '特 is とく (special), with 牛 on the left. まつ is 待つ.', '時 is じ, とき (time), with 日 on the left. まつ is 待つ.']], ['あなたの <u>いけん</u>を 言って ください。', ['意見', '医見', '意験', '以見'], 'いけん = 意見 (opinion). 医, 以 and 験 are read い / けん too, which is why they tempt.', 'read read read', ['医 is い too, as in 医者 (いしゃ). いけん is 意見.', '験 is けん too, as in 試験 (しけん). いけん is 意見.', '以 is い too, as in 以上 (いじょう). いけん is 意見.']], ['この へやは <u>ひろい</u>ですね。', ['広い', '店い', '度い', '太い'], 'ひろい = 広い (wide, spacious).', 'shape shape field', ['店 is みせ (shop). It has the same roof on top as 広.', '度 is ど (degree, times). It has that roof too.', '太い is ふとい (thick, fat), a different size word. ひろい is 広い.']], ['みんなの しゅくだいを <u>あつめて</u> ください。', ['集めて', '進めて', '曜めて', '乗めて'], 'あつめる = 集める: birds (隹) gathering on a tree (木). 進 and 曜 also contain 隹.', 'shape shape shape', ['進めて is すすめて (move forward). It has 隹 like 集, plus 辶.', '曜 is よう in 日曜日. It contains 隹, but it isn\'t a verb.', '乗 is のる (ride). Its bottom looks like 木, but it has no 隹.']], ['この パソコンは <u>じゆう</u>に 使って ください。', ['自由', '自田', '白由', '目由'], 'じゆう = 自由 (free, as you like).', 'shape shape shape'], ['こんどの 日曜日、<u>えいが</u>を 見に 行きませんか。', ['映画', '英画', '映図', '暗画'], 'えいが = 映画 (movie). 映 has 日 on the left; 英 is えい in 英語.', 'read shape shape', ['英 is えい too, as in 英語. えいが is 映画, with 日 on the left.', '図 is ず (地図). It is a closed box; 画 is open at the top.', '暗 is くらい (dark). It has 日 on the left like 映, but the right side is 音.']], ['来月の <u>りょこう</u>の じゅんびを します。', ['旅行', '族行', '旅考', '方行'], 'りょこう = 旅行 (trip). 族 (family) shares the 方 left side with 旅.', 'shape read shape', ['族 is ぞく (family, as in 家族). It shares the 方 side with 旅.', '考 is こう too (考える, think). りょこう uses 行.', '方 is ほう (direction), only the left part of 旅.']], ['<u>おとうと</u>は 大学生です。', ['弟', '兄', '妹', '姉'], 'おとうと = 弟 (younger brother). 兄 あに, 妹 いもうと, 姉 あね.', 'field field field', ['兄 is あに (older brother). おとうと is 弟.', '妹 is いもうと (younger sister). おとうと is 弟.', '姉 is あね (older sister). おとうと is 弟.']], ['ここで <u>しゃしん</u>を とらないで ください。', ['写真', '字真', '写首', '書真'], 'しゃしん = 写真 (photo). 字 じ has a roof like 写 but means letter.', 'shape shape read', ['字 is じ (letter). It has a roof like 写, but it is a different kanji.', '首 is くび (neck). Its top looks like 真, but the bottom is different.', '書 is しょ, かく (write), close in sound to しゃ. しゃしん is 写真.']], ['この パソコンを <u>つかって</u> も いいですか。', ['使って', '便って', '仕って', '作って'], 'つかう = 使う (use). 便 (べん, convenient), 仕 and 作 also start with 亻.', 'shape shape shape', ['便 is べん (convenient). It starts with 亻 like 使, but the right side is different.', '仕 is し, as in 仕事 (しごと). It also starts with 亻.', '作 is つくる (make). 作って is つくって, not つかって.']]]);
add(4, 'vc', [['日本の ぶんかに（　　）が あります。', ['きょうみ', 'しゅみ', 'きぶん', 'ようじ'], '〜に きょうみが ある = be interested in. しゅみ = hobby ("minat" vs "hobi").', 'l1 colloc colloc', ['しゅみ = hobby (しゅみは りょうりです). "Interested in" is 〜に きょうみが ある ("minat", not "hobi").', 'きぶん = mood. 〜に きぶんが ある isn\'t Japanese; interest is きょうみ.', 'ようじ = errand. You can have one (ようじが ある), but not ぶんかに ようじ. Interest is きょうみ.']], ['大事な かいぎに（　　）して、ぶちょうに しかられました。', ['ちこく', 'しっぱい', 'えんりょ', 'ちゅうい'], '〜に ちこくする = be late for.', 'l1 colloc colloc', ['しっぱい = failure, and it takes で (しごとで しっぱいする). 〜に + being scolded points to coming late: ちこく.', 'えんりょ = holding back politely. That wouldn\'t get you scolded; being late for the meeting would: ちこく.', '〜に ちゅういする = pay attention to. Being careful wouldn\'t get you scolded; being late would: ちこく.']], ['この 道は 車が 多いので、（　　）して わたって ください。', ['ちゅうい', 'あんしん', 'けんぶつ', 'ようい'], 'ちゅういする = be careful.', 'l1 colloc colloc', ['あんしん = feel relieved. Many cars are a reason to be careful, not relieved: ちゅういして.', 'けんぶつ = sightseeing. You don\'t sightsee while crossing a busy road; you are careful: ちゅういして.', 'ようい = get ready. You don\'t prepare to cross a road; with many cars you are careful: ちゅういして.']], ['先生の おたくに（　　）とき、おみやげを 持って いきました。', ['うかがった', 'いらっしゃった', 'めしあがった', 'ごらんになった'], 'うかがう = humble "visit" (I go to a superior). いらっしゃる raises the other person.', 'dir colloc colloc', ['いらっしゃる raises the person who goes. Here I visit my teacher, so I lower myself: うかがう.', 'めしあがる = (someone respected) eats. The sentence is about me visiting: うかがう.', 'ごらんに なる = (someone respected) looks. The sentence is about me visiting, so it is humble: うかがう.']], ['かぜを ひいて、のどが（　　）です。', ['いたい', 'ねむい', 'にがい', 'おもい'], 'のどが いたい = sore throat.', 'colloc colloc colloc', ['ねむい = sleepy. A cold can make you sleepy, but a throat can\'t be sleepy. A sore throat is のどが いたい.', 'にがい = bitter, for taste (くすりが にがい). A sore throat is のどが いたい.', 'おもい = heavy. あたまが おもい is a cold symptom, but a throat hurts: のどが いたい.']], ['毎日 れんしゅうしたので、日本語が（　　）上手に なりました。', ['だいぶ', 'ぜひ', 'けっして', 'ぜんぜん'], 'だいぶ = considerably. けっして and ぜんぜん need a negative; ぜひ is for wishes.', 'field polar polar', ['ぜひ goes with wishes and requests (ぜひ 来て ください). It can\'t say how much you improved.', 'けっして needs a negative (けっして 〜ない). This sentence is positive.', 'ぜんぜん needs a negative (ぜんぜん 〜ない). This sentence is positive.']], ['子どもが 生まれたので、広い アパートに（　　）ことに しました。', ['ひっこす', 'うつす', 'とまる', 'のりかえる'], 'ひっこす = move house. うつす = move an object.', 'l1 l1 l1', ['うつす = move an object somewhere else. Moving to a new home is ひっこす.', 'とまる = stay for a night or two (ホテルに とまる). Moving to live in a new home is ひっこす.', 'のりかえる = change trains or buses. Moving to a new home is ひっこす.']], ['雨が ふりそうなので、せんたくものを 中に（　　）。', ['入れました', 'ぬれました', '入りました', '出しました'], 'Bring the laundry inside = 中に 入れる (transitive: I do it).', 'field dir dir', ['ぬれる = get wet. Rain is coming, but the laundry gets wet by itself, and 〜を ぬれる isn\'t possible. You bring it in: 入れる.', '入る is the "by itself" verb (〜が 入る). You bring the laundry in yourself, with を: 入れる.', '出す = take out, the opposite. Rain is coming, so you bring the laundry in: 中に 入れる.']], ['電話が 鳴って いますよ。早く（　　）ください。', ['出て', 'かけて', '聞いて', '答えて'], '電話に 出る = answer the phone.', 'dir l1 l1', ['かける = make a call. The phone is ringing, so you answer it: 電話に 出る.', 'きく = listen. Picking up a ringing phone is 電話に 出る.', 'English "answer the phone" leads to こたえる, but Japanese says 電話に 出る.']], ['かぜを（　　）、学校を 休みました。', ['ひいて', 'とって', 'もらって', 'かかって'], 'かぜを ひく = catch a cold.', 'l1 l1 colloc', ['とる = take. Catching a cold is always かぜを ひく.', 'English "get a cold" pulls you to もらう, but Japanese says かぜを ひく.', 'かかる works with に (かぜに かかる). With を, the verb is ひく: かぜを ひく.']], ['試験に（　　）ように、毎日 勉強して います。', ['ごうかくする', '入学する', 'そつぎょうする', 'しゅっせきする'], '試験に ごうかくする = pass an exam.', 'field field colloc', ['入学する = enter a school (大学に 入学する). For an exam, it\'s ごうかくする (pass).', 'そつぎょうする = graduate from a school (大学を そつぎょうする). You pass (ごうかく) an exam.', 'しゅっせきする = attend (a class, a meeting). Studying every day is to PASS the exam: ごうかくする.']], ['友だちの 引っこしを（　　）あげました。', ['てつだって', 'たすけて', '世話して', 'なおして'], '〜を てつだう = help with a task.', 'l1 l1 colloc', ['たすける takes a person in trouble (人を たすける). Helping with a task like a move is てつだう.', 'せわを する is looking after someone (子どもの 世話を する), not helping with a move.', 'なおす = fix or repair. A move isn\'t fixed; you help with it: てつだう.']], ['エレベーターが 動かないので、かいだんを（　　）。', ['上りました', '乗りました', '入りました', '起きました'], 'かいだんを 上る = go up the stairs.', 'colloc colloc field', ['のる is for vehicles and elevators. The elevator is broken, so you climb the stairs: 上る.', 'はいる = enter. Stairs are climbed: かいだんを 上る.', 'おきる = get up (from bed). Going up stairs is 上る.']], ['しゅうまつ、人気の レストランを（　　）おきました。', ['よやくして', 'やくそくして', '用意して', 'ちゅうもんして'], 'レストランを よやくする = reserve a restaurant.', 'l1 field field', ['やくそく is a promise or appointment with a PERSON. Booking a place is よやく.', 'よういする = prepare. You don\'t prepare a restaurant; you reserve it.', 'ちゅうもんする = order (food, goods). You order food at the restaurant; the table is よやく.']], ['友だちと 3時に 会う（　　）を しました。', ['やくそく', 'よやく', 'よてい', '用事'], '人と やくそくを する = make an appointment / a promise with someone.', 'l1 field field', ['よやく is for booking a place or ticket (店を よやくする). Agreeing to meet a friend is やくそく.', 'よてい = your plan. "会うよていです" works, but よていを しました doesn\'t. With a friend, you make a やくそく.', 'ようじ = an errand. Meeting a friend at 3 is a やくそく.']], ['日本の せいかつに もう（　　）か。', ['なれました', 'おぼえました', 'わかりました', 'しりました'], '〜に なれる = get used to.', 'l1 colloc colloc', ['おぼえる = memorize, and takes を. Getting used to life is 〜に なれる.', 'わかる = understand. Life in Japan isn\'t "understood"; you get used to it: なれる.', 'しる takes を and is used as しって いる. Getting used to something is 〜に なれる.']], ['毎朝 ジョギングを する（　　）が あります。', ['しゅうかん', 'きかい', 'けいけん', 'しゅみ'], 'しゅうかん = habit. 毎朝 〜する しゅうかんが ある = I have a habit of doing it every morning.', 'field l1 l1', ['きかい = a chance. 毎朝 points to a habit: しゅうかん.', 'けいけん = experience, used with the past: 〜した けいけんが ある. Every morning is a habit: しゅうかん.', 'しゅみ = hobby, said as ジョギングが しゅみです. With 毎朝 〜する ＿が ある, it\'s しゅうかん.']], ['この へやは 暗いので、カーテンを（　　）ください。', ['開けて', '開いて', 'しめて', 'けして'], 'カーテンを 開ける = open the curtains (someone does it: transitive).', 'dir field colloc', ['あく (開いて) is intransitive: カーテンが 開く. With を and a request, you need the "I do it" verb: 開ける.', 'しめる = close, the opposite. The room is dark, so you open them.', 'けす is for lights and fire. Curtains are opened: 開ける.']], ['このドアは、人が 近づくと 自動で（　　）。', ['開きます', '開けます', 'つきます', '出ます'], 'ドアが 開く = the door opens (by itself: intransitive).', 'dir colloc colloc', ['あける needs someone doing it (ドアを 開ける). An automatic door opens by itself: 開く.', 'つく is for lights and machines turning on (電気が つく), not doors.', 'でる = come out. A door doesn\'t come out; it 開く.']], ['電気を（　　）まま、ねて しまいました。', ['つけた', 'ついた', 'けした', 'あけた'], '電気を つけた まま = with the light left on.', 'dir field colloc', ['つく is intransitive: 電気が ついた まま. With を, you need つけた.', 'まま means something was left in an unusual state. Turning the light off before sleeping is normal; leaving it on is the まま.', 'あける is for doors and windows. Lights are つける / けす.']], ['大切な しょるいなので、なくさないように（　　）ください。', ['気を つけて', '気が ついて', '気に 入って', '気が して'], '気を つける = be careful.', 'colloc colloc colloc', ['気が つく = notice (something). Being careful is 気を つける. Watch the particle: を, not が.', '気に 入る = like something. "So you don\'t lose it, please ___" calls for 気を つける.', '気が する = have a feeling. Being careful is 気を つける.']], ['この 店の ケーキが とても 気に（　　）、毎週 買って います。', ['入って', 'つけて', 'かけて', 'して'], '気に 入る = like, take a liking to.', 'colloc colloc colloc', ['気を つける (be careful) uses を. With に, liking something is 気に 入る.', '気に かける = care about / worry about a person. Liking a cake is 気に 入る.', '気に する = worry about. You buy it every week because you like it: 気に 入る.']], ['かいぎの 時間が かわったら、（　　）して ください。', ['れんらく', 'そうだん', 'せつめい', 'へんじ'], 'れんらくする = contact / let someone know.', 'field field field', ['そうだん = consult, ask for advice. A time change only needs a message: れんらく.', 'せつめい = explanation. A changed time just needs to be passed on: れんらく.', 'へんじ = reply. Nobody asked you anything; you let them know: れんらく.']], ['けがを した 友だちを 病院へ（　　）行きました。', ['つれて', 'もって', 'とって', 'かえして'], '人を つれて 行く = take a person somewhere.', 'l1 colloc colloc', ['もって 行く is for things. People are つれて 行く. "Bawa" covers both in Indonesian, but Japanese splits them.', 'とる = take (an object). A person is つれて 行く.', 'かえす = return something. You took your friend to the hospital: つれて 行く.']], ['デパートで くつを 買って、カードで お金を（　　）。', ['はらいました', 'かえしました', 'かしました', 'あげました'], 'お金を はらう = pay.', 'colloc dir dir', ['かえす = give back (a loan). Paying for a purchase is はらう.', 'かす = lend. You aren\'t lending the shop money; you pay: はらう.', 'あげる = give as a gift. Paying for shoes is はらう.']], ['図書館で 借りた 本を（　　）のを わすれて いました。', ['返す', '借りる', '貸す', 'もらう'], '本を 返す = return a book.', 'dir dir dir', ['かりる is what you already did (借りた 本). The thing you forgot is giving it back: 返す.', 'かす = lend. The library lent it to you; you return it: 返す.', 'もらう = receive. A library book isn\'t yours to keep; you return it: 返す.']], ['道が わからなかったので、こうばんで 道を（　　）。', ['たずねました', 'こたえました', 'しらべました', 'おしえました'], '道を たずねる = ask the way.', 'dir field dir', ['こたえる = answer. The police officer answered; you asked: たずねる.', 'しらべる = look something up (in a book, on a map). At a police box you ask a person: たずねる.', 'おしえる = teach / tell. The officer tells you the way; you ask: たずねる. (Or: 道を おしえて もらいました.)']], ['となりの 人が うるさくて、夜 よく（　　）。', ['ねむれません', 'ねません', 'おきません', 'やすみません'], 'ねむれない = can\'t sleep (potential form).', 'form field field', ['ねません = I don\'t sleep (my choice). The noise makes you UNABLE to sleep: ねむれません.', 'おきません = don\'t get up. Noise at night keeps you from sleeping: ねむれません.', 'やすみません = don\'t rest / don\'t take time off. The noise stops you from sleeping: ねむれません.']], ['この シャツは 小さすぎて、わたしには（　　）。', ['合いません', 'にて いません', '会いません', 'つきません'], 'サイズが 合わない = doesn\'t fit.', 'l1 field l1', ['にる = resemble (父に にて いる). A shirt that doesn\'t fit is 合いません.', '会う (meet) sounds the same as 合う (fit, match), but 会う is for meeting people.', 'つく = be attached / turn on. A shirt that is too small doesn\'t fit: 合わない.']], ['雨で 運動会が（　　）に なりました。', ['中止', 'きんし', 'ていし', '休止'], '中止に なる = be cancelled (an event).', 'field field field', ['きんし = prohibited (たばこは きんしです). A cancelled event is 中止.', 'ていし = stop (a machine, a train). A cancelled event is 中止.', 'きゅうし = a pause. An event called off because of rain is 中止.']], ['この 川で 泳ぐ ことは（　　）されて います。', ['きんし', '中止', 'ちゅうい', 'はんたい'], 'きんしされて いる = is prohibited.', 'field field field', ['ちゅうし is for cancelling an event (試合が 中止に なる). A rule saying "you may not" is きんし.', 'ちゅうい = caution, a warning. ちゅういされて いる means someone was warned. A rule is きんし.', 'はんたい = opposition. People may be against it, but a rule that forbids swimming is きんし.']], ['おきゃくさんが 来るので、へやを（　　）。', ['かたづけました', 'すてました', 'なくしました', 'こわしました'], 'へやを かたづける = tidy up a room.', 'colloc colloc colloc', ['すてる = throw away. You throw away trash, not the room. Tidying a room is かたづける.', 'なくす = lose. Before guests come, you tidy: かたづける.', 'こわす = break. Before guests come, you tidy the room: かたづける.']], ['駅で さいふを（　　）しまいました。', ['おとして', 'おちて', '下りて', '下げて'], 'さいふを おとす = drop / lose a wallet (transitive).', 'dir field l1', ['おちる is intransitive: さいふが おちる. With を, you need おとす.', 'おりる = get off a vehicle or go down. Losing a wallet is おとす.', 'さげる = lower (a price, your head). Dropping a wallet is おとす.']], ['先生に 作文の まちがいを（　　）もらいました。', ['なおして', 'かえして', 'まちがえて', 'こわして'], 'まちがいを なおす = correct mistakes.', 'field field colloc', ['かえす = give back. The teacher may hand the essay back, but mistakes are corrected: なおす.', 'まちがえる = make a mistake. The teacher fixed them: なおす.', 'こわす = break (an object). Mistakes are fixed: なおす.']], ['車に（　　）ように、気を つけて 歩きましょう。', ['ひかれない', 'ひかない', 'ひかせない', 'ひいて いない'], '車に ひかれる = be hit by a car (passive).', 'pcv pcv form', ['ひく (active) means YOU hit someone with a car. A walker is the one hit: passive 車に ひかれる.', 'ひかせる is causative (make someone run something over). The walker is affected: ひかれる.', 'ひいて いない describes a present state. ように needs a plain form: ひかれない ように.']], ['さいふを 家に（　　）きて しまいました。', ['わすれて', 'なくして', 'おとして', 'すてて'], '〜を 家に わすれる = leave something at home by mistake.', 'l1 field field', ['なくす = lose; you don\'t know where it is. You know it\'s at home: わすれる.', 'おとす = drop. Something left at home is わすれる.', 'すてる = throw away. Leaving it at home by mistake is わすれる.']], ['この レストランは ねだんが 安いのに、料理の（　　）が いい。', ['あじ', 'ねだん', 'こえ', 'おと'], '料理の あじが いい = the food tastes good.', 'field field field', ['ねだん is already in the first half (ねだんが 安い). The のに contrast is about taste: あじ.', 'こえ = voice. Food is judged by taste: あじ.', 'おと = sound. Food is judged by taste: あじ.']], ['あしたの 朝は 早いので、めざまし時計を 6時に（　　）。', ['かけました', 'つけました', 'おきました', 'たてました'], 'めざましを かける = set an alarm.', 'colloc colloc colloc', ['つける is for lights and TVs. An alarm clock is めざましを かける.', 'おく = put something down. Setting an alarm is かける.', 'たてる = stand something up / make a plan. An alarm is かける.']]]);
add(4, 'vp', [['旅行の よういは もう できましたか。', ['旅行の じゅんびは もう できましたか。', '旅行の よやくは もう できましたか。', '旅行の そうだんは もう できましたか。', '旅行の けいかくは もう できましたか。'], 'ようい = じゅんび (preparation).', 'l1 field field', ['よやく = booking. Booking is one part of getting ready, but ようい means preparation in general: じゅんび.', 'そうだん = talking it over. ようい means getting ready: じゅんび.', 'けいかく = plan. Planning comes before getting ready; ようい is the preparation itself: じゅんび.']], ['その 小説は あまり おもしろく なかったです。', ['その 小説は つまらなかったです。', 'その 小説は むずかしかったです。', 'その 小説は 長かったです。', 'その 小説は こわかったです。'], 'Not interesting = つまらない.', 'field field field', ['むずかしい = difficult. A hard novel can still be interesting. おもしろく ない = boring: つまらない.', '長い = long. Long isn\'t the same as boring: つまらない.', 'こわい = scary. Scary isn\'t the same as boring: つまらない.']], ['夜の 山は きけんです。', ['夜の 山は あぶないです。', '夜の 山は さむいです。', '夜の 山は しずかです。', '夜の 山は きれいです。'], 'きけん = あぶない (dangerous).', 'field field field', ['さむい = cold. Mountains at night are cold, but きけん means dangerous: あぶない.', 'しずか = quiet. きけん is about danger, not sound: あぶない.', 'きれい = beautiful. きけん is about danger, not looks: あぶない.']], ['弟は 母に うそを つきました。', ['弟は 母に ほんとうでは ない ことを 言いました。', '弟は 母に 大事な ことを 言いました。', '弟は 母に 何も 言いませんでした。', '弟は 母に 大きい 声で 言いました。'], 'うそを つく = tell a lie.', 'field field field', ['うそを つく = say something untrue, not something important.', 'うそを つく means he said something untrue. 何も 言わない (said nothing) is different.', 'Speaking loudly isn\'t lying. うそ = something that isn\'t true.']], ['弟は へやを かたづけました。', ['弟は へやを きれいに しました。', '弟は へやを きたなく しました。', '弟は へやを ひろく しました。', '弟は へやを くらく しました。'], 'かたづける = tidy up ≈ きれいに する.', 'field field field', ['きたなく する = make it dirty, the opposite of tidying.', 'ひろく する = make it bigger. Tidying makes a room look neater, not bigger.', 'くらく する = make it dark. Tidying is about order: きれいに する.']], ['あの 二人は そっくりです。', ['あの 二人は よく にて います。', 'あの 二人は なかが いいです。', 'あの 二人は いつも いっしょです。', 'あの 二人は せが 高いです。'], 'そっくり = look exactly alike ≈ よく にて いる.', 'field field field', ['なかが いい = get along well. そっくり is about looking alike.', 'いつも いっしょ = always together. そっくり is about looking alike.', 'せが 高い = tall. そっくり is about looking alike.']], ['父は お酒を やめました。', ['父は もう お酒を 飲みません。', '父は お酒が きらいに なりました。', '父は お酒を 少し 飲みます。', '父は お酒を 買いました。'], 'お酒を やめる = quit drinking ≈ もう 飲まない.', 'l1 field field', ['やめる = stop doing something. It says nothing about liking; maybe he still likes it.', 'すこし 飲む = still drinks a little. やめた means he doesn\'t drink anymore.', 'かう = buy. やめた means he stopped drinking.']], ['きのうは 道が すいて いました。', ['きのうは 車が 少なかったです。', 'きのうは 車が 多かったです。', 'きのうは 道が 広かったです。', 'きのうは 道が きれいでした。'], '道が すいて いる = the road is empty (little traffic).', 'field field field', ['くるまが 多い = traffic, the opposite of すいて いる.', 'みちが 広い = the road is wide. すいて いる is about how many cars there are.', 'みちが きれい = the road is clean. すいて いる is about traffic.']], ['この 仕事は きついです。', ['この 仕事は たいへんです。', 'この 仕事は 楽です。', 'この 仕事は おもしろいです。', 'この 仕事は あんぜんです。'], 'きつい = hard, demanding ≈ たいへん.', 'field field field', ['らく = easy, the opposite of きつい.', 'おもしろい = interesting. A hard job can be interesting or not; きつい is about effort.', 'あんぜん = safe. きつい is about how hard the work is.']], ['さっき 田中さんから 電話が ありました。', ['少し 前に 田中さんから 電話が ありました。', '少し あとで 田中さんから 電話が あります。', 'きのう 田中さんから 電話が ありました。', 'ずっと 前に 田中さんから 電話が ありました。'], 'さっき = a little while ago ≈ 少し 前に.', 'field field field', ['少し あとで = a little later (future). さっき is a little while AGO.', 'きのう = yesterday. さっき means earlier today, just a short time ago.', 'ずっと 前 = a long time ago. さっき is only a short time ago.']], ['この 問題は ふくざつです。', ['この 問題は かんたんでは ありません。', 'この 問題は 大切では ありません。', 'この 問題は 新しく ありません。', 'この 問題は おもしろく ありません。'], 'ふくざつ = complicated ≈ かんたんでは ない.', 'field field field', ['たいせつでは ない = not important. ふくざつ is about difficulty, not importance.', 'あたらしく ない = old. ふくざつ is about difficulty.', 'おもしろく ない = boring. A complicated problem isn\'t necessarily boring.']], ['母は るすです。', ['母は 今 家に いません。', '母は 今 ねて います。', '母は 今 いそがしいです。', '母は 今 びょうきです。'], 'るす = away from home ≈ 家に いない.', 'field field field', ['ねて いる = sleeping (she\'s still home). るす means she\'s not at home.', 'いそがしい = busy. るす means she\'s out.', 'びょうき = sick. るす means she\'s out of the house.']], ['わたしは 毎朝 さんぽを します。', ['わたしは 毎朝 ちかくを 歩きます。', 'わたしは 毎朝 走ります。', 'わたしは 毎朝 買い物を します。', 'わたしは 毎朝 そうじを します。'], 'さんぽ = a walk ≈ ちかくを 歩く.', 'field field field', ['はしる = run. さんぽ is a relaxed walk.', 'かいもの = shopping. さんぽ is walking for pleasure.', 'そうじ = cleaning. さんぽ is going for a walk.']], ['この カメラは こしょうして います。', ['この カメラは こわれて います。', 'この カメラは 古く なって います。', 'この カメラは 売って います。', 'この カメラは 高く なって います。'], 'こしょう = broken down ≈ こわれて いる.', 'field field field', ['ふるい = old. An old camera can still work; こしょう means it doesn\'t.', 'うって いる = being sold. こしょう means it\'s broken.', 'たかく なる = more expensive. こしょう means it\'s broken.']]]);
add(4, 'vu', [['ねっしん', ['かれは 毎日 ねっしんに れんしゅうして います。', 'きょうは ねっしんな 天気ですね。', 'この スープは ねっしんで おいしいです。', 'ねっしんな へやに 住んで います。'], 'ねっしん = enthusiastic, eager — used for effort. The ねつ (heat) in it tempts you to use it for weather or soup.', 'l1 l1 l1', ['Hot weather is あつい 天気. ねっしん has ねつ (heat) in it, but it means eager and describes effort.', 'Hot soup is あつい スープ. ねっしん is for people\'s effort, not temperature.', 'A hot room is あつい へや. ねっしん describes people who try hard.']], ['しんせつ', ['駅員さんが しんせつに 道を 教えて くれました。', 'この へやは しんせつで 広いです。', 'きのう しんせつな 雨が ふりました。', 'この パンは とても しんせつです。'], 'しんせつ = kind, used for people\'s behavior.', 'l1 l1 l1', ['A nice clean room is きれいな へや. しんせつ describes how people treat others.', 'しんせつ (kind) is for people. Rain can\'t be kind.', 'Good bread is おいしい パン. しんせつ is for people, not food.']], ['つごう', ['あしたは つごうが 悪いので、行けません。', 'かぜを ひいて、つごうが 悪いので、病院へ 行きました。', 'テストの つごうが 悪くて、母に しかられました。', 'この パソコンは 古くて、つごうが 悪いです。'], 'つごう = whether a time or plan works for you: つごうが いい・悪い. Feeling sick is ぐあいが 悪い.', 'field field l1', ['Feeling sick is ぐあいが 悪い. つごうが 悪い only means a time or plan doesn\'t work for you.', 'A bad test result is てんが 悪い. つごう is about whether a time or plan works for you.', 'For a machine that doesn\'t work well, say うまく うごかない. つごう is about whether a time or plan works for you.']], ['こしょう', ['エアコンが こしょうして、へやが 暑い。', 'かぜが こしょうして、学校を 休んだ。', 'やくそくが こしょうして、会えなかった。', '天気が こしょうして、雨が ふった。'], 'こしょう = a machine breaks down. Only machines こしょうする.', 'l1 l1 l1', ['こしょう is only for machines. For a cold: かぜを ひいて 学校を 休んだ.', 'A promise isn\'t a machine. A plan falling through is やくそくが だめに なった or やくそくを やぶった.', 'Weather doesn\'t break down. For a change: 天気が 悪く なった.']], ['たしかめる', ['出かける 前に、かぎを かけたか たしかめた。', '毎日 はを たしかめて います。', 'たしかめた 料理を 食べた。', '体が たしかめて 元気に なった。'], 'たしかめる = check, make sure (that something is true or done).', 'l1 l1 l1', ['Brushing teeth is はを みがく. たしかめる is checking that something is true or done.', 'あじを みる is tasting food. たしかめる is checking a fact.', 'たしかめる needs a person doing the checking. For getting better: 体が よく なった.']], ['さわぐ', ['子どもたちが 教室で さわいで、先生に しかられた。', '静かな 図書館で 本を さわいだ。', '雨が さわいで いる。', 'テレビの 音を さわいで ください。'], 'さわぐ = make noise, be loud (people).', 'l1 l1 l1', ['さわぐ doesn\'t take an object. You read a book (本を 読む); さわぐ is people being loud.', 'Rain doesn\'t さわぐ. Heavy rain is 雨が はげしく ふって いる.', 'さわぐ isn\'t for volume. To change TV volume: テレビの 音を 大きく / 小さく して ください.']], ['ひろう', ['道で さいふを ひろって、こうばんに とどけた。', '友だちから 手紙を ひろった。', 'デパートで 新しい くつを ひろった。', '先生から 日本語を ひろった。'], 'ひろう = pick up something lying on the ground.', 'l1 l1 l1', ['A letter from a friend is received: 手紙を もらった. ひろう is picking up something on the ground.', 'Things from a shop are bought: くつを 買った.', 'A language is learned: 日本語を ならった. English "pick up a language" doesn\'t carry over.']], ['わかす', ['お茶を 入れるので、おゆを わかした。', 'ご飯を わかして 食べた。', 'へやを わかして あたたかく した。', 'パンを わかして 食べた。'], 'わかす = boil (water).', 'l1 l1 l1', ['Rice is cooked with たく: ご飯を たく. わかす is only for boiling water.', 'A room is warmed: へやを あたためる. わかす is for water.', 'Bread is toasted: パンを やく. わかす is for water.']], ['かざる', ['へやに 花を かざりました。', '毎日 かおを かざって 学校に 行く。', '料理に さとうを かざった。', '友だちの 話を かざって 聞いた。'], 'かざる = decorate, display something to make a place look nice.', 'l1 l1 l1', ['Makeup is けしょうを する. かざる is for decorating a room or a place.', 'Adding sugar is さとうを 入れる. かざる is for decoration.', 'Listening carefully is しっかり 聞く. かざる is about decoration.']], ['しゅっぱつ', ['バスは 8時に 東京駅を しゅっぱつします。', 'コンサートは 7時に しゅっぱつします。', '新しい 仕事を しゅっぱつしました。', 'ごはんの 前に 手を しゅっぱつしました。'], 'しゅっぱつ = depart, leave a place on a trip.', 'l1 l1 l1', ['Events start: コンサートは 7時に はじまります. しゅっぱつ is leaving a place.', 'A new job is started: 新しい 仕事を はじめました.', 'Hands are washed: 手を あらいました. しゅっぱつ is departure.']], ['えんりょ', ['えんりょしないで、たくさん 食べて ください。', '雨なので、試合を えんりょしました。', 'この 道は あぶないので、えんりょして 歩いて ください。', '友だちに 本を えんりょしました。'], 'えんりょ = hold back out of politeness.', 'l1 l1 l1', ['A game called off because of rain is 中止. えんりょ is holding back out of politeness.', 'Being careful is 気を つけて. えんりょ is about politeness, not safety.', 'Lending a book is 本を かしました. えんりょ is holding back politely.']]]);
add(4, 'gf', [['天気よほうに よると、あしたは 雨が（　　）そうです。', ['ふる', 'ふり', 'ふって', 'ふった'], 'Hearsay そうだ follows the plain form: ふるそうです. ふりそう = "looks like it will".', 'nuance form nuance', ['ふりそう = "looks like it will". 〜に よると is hearsay: ふる そうです.', 'The て-form can\'t take そう.', 'ふった そう is past hearsay. The forecast is about tomorrow.']], ['この ケーキは おいし（　　）ですね。', ['そう', 'よう', 'らしい', 'みたい'], 'Looks tasty: い-adjective stem + そう.', 'form form form', ['ようです needs おいしい (おいしい ようです). After the stem, use そう.', 'らしい needs the full adjective (おいしい らしい).', 'みたい needs the full adjective (おいしい みたい).']], ['先生に 作文を（　　）。', ['なおして いただきました', 'なおして さしあげました', 'なおして くださいました', 'なおして やりました'], '先生に 〜て いただく = I receive the favor from the teacher. 先生が〜てくださった would need が.', 'dir dir dir', ['さしあげる is me doing a favor for a superior.', 'くださる needs the teacher as subject (先生が). With 先生に, use いただく.', 'やる is doing something for someone below you.']], ['弟に わたしの ケーキを（　　）、とても かなしかったです。', ['食べられて', '食べれて', '食べて', '食べに'], 'Suffering passive: 弟に 食べられた = my brother ate it (and I was the victim).', 'form form form', ['食べれる drops ら and is the potential "can eat". The passive is 食べられる.', '食べて: 弟に would need a passive verb. Use 食べられて.', '食べに shows purpose (食べに 行く).']], ['母は 子どもに やさいを（　　）。', ['食べさせました', '食べられました', '食べさせられました', '食べました'], 'Causative: the mother made the child eat vegetables.', 'pcv pcv pcv', ['食べられる is passive. The mother made the child eat: causative.', '食べさせられる = was made to eat. The mother is the one making.', '食べました: the mother ate herself. 子どもに shows she made the child eat.']], ['日本へ 行く（　　）、日本語を 勉強して います。', ['ために', 'ように', 'のに', 'ながら'], 'Volitional verb (行く — you control it) + ために = in order to.', 'nuance nuance nuance', ['ように follows a state or ability. 行く is a choice you make: ために.', 'のに = even though.', 'ながら = while. It takes the stem.']], ['日本語が 話せる（　　）、毎日 れんしゅうして います。', ['ように', 'ために', 'のに', 'のは'], 'Potential verb (話せる — a state you can\'t just decide) + ように = so that.', 'nuance nuance form', ['ために needs a choice you control. 話せる is an ability: ように.', 'のに = even though.', 'のは makes a topic. "So that I can speak" is ように.']], ['電気が（　　）まま、ねて しまいました。', ['ついた', 'つける', 'ついて', 'つく'], 'た-form + まま = leaving it as it is: 電気が ついた まま.', 'form form form', ['まま takes the た-form: ついた まま.', 'The て-form can\'t take まま.', 'まま takes the た-form here: ついた まま.']], ['来週 パーティーが あるので、飲み物を 買って（　　）。', ['おきます', 'あります', 'みせます', 'なります'], '〜て おく = do in advance.', 'nuance nuance form', ['て ある describes a state with が (飲み物が 買って ある). Doing it to prepare is て おく.', 'て みせる = show how. Preparing for the party is て おく.', 'なる can\'t follow a て-form.']], ['どんなに いそがしく（　　）、朝ごはんは 食べます。', ['ても', 'たら', 'ば', 'なら'], 'どんなに 〜ても = no matter how.', 'nuance form nuance', ['たら attaches to the た-form, and どんなに pairs with ても.', 'ば can\'t follow く like this. どんなに pairs with ても.', 'なら can\'t follow いそがしく. どんなに pairs with ても.']], ['右に まがる（　　）、駅が 見えます。', ['と', 'たら', 'ば', 'ても'], 'Dictionary form + と = whenever / as soon as (natural result).', 'form form form', ['たら attaches to the た-form (まがったら), not まがる.', 'ば attaches to the ば-form (まがれば), not まがる.', 'ても = even if, and attaches to the て-form.']], ['田中さんは 今日 休むと 言って いたから、来ない（　　）です。', ['はず', 'つもり', 'ところ', 'ため'], 'はずだ = should be (expected from evidence). つもり is only for your own intention.', 'nuance nuance nuance', ['つもり is only for your own intention.', 'ところ = about to / a moment. The evidence (he said so) points to はず.', 'ため = for / because of.']], ['先月 日本に 来た（　　）なので、まだ 日本語が わかりません。', ['ばかり', 'ところ', 'まま', 'ほう'], 'た-form + ばかり = just did (recently, still feels new).', 'nuance nuance nuance', ['た ところ is only for right this moment. A month ago, felt as recent, is た ばかり.', 'まま = leaving as it is.', 'ほう is for comparisons.']], ['ぶちょうは 何時に（　　）か。', ['いらっしゃいます', 'まいります', 'おります', 'いたします'], 'Honorific (raise the manager): いらっしゃる. まいる/おる/いたす lower yourself.', 'dir dir dir', ['まいる is humble, for yourself.', 'おる is humble, for yourself.', 'いたす is humble する.']], ['わたしが 先生の かばんを お（　　）します。', ['持ち', '持って', '持つ', '持た'], 'Humble pattern お + stem + する: お持ちします.', 'form form form', ['お〜する takes the stem, not the て-form.', 'お〜する takes the stem, not the dictionary form.', '持た is the ない-stem. Use 持ち.']]]);
add(4, 'go', [['日本語が　＿＿　★　＿＿　＿＿　れんしゅうして います。', ['話せる', 'ように', '上手に', '毎日'], '日本語が 上手に 話せる ように 毎日 れんしゅうして います。 ★ = 話せる.', 'order order order', ['ように comes right after 話せる.', '上手に comes first, before 話せる.', '毎日 comes last, before れんしゅう.']], ['田中さんの　＿＿　＿＿　★　＿＿　食べて みたいです。', ['料理を', 'お母さんが', '作った', '一度'], '田中さんの お母さんが 作った 料理を 一度 食べて みたいです。 ★ = 料理を.', 'order order order', ['お母さんが comes first, after 田中さんの.', '作った comes before 料理を, in the second spot.', '一度 comes last, before 食べて みたい.']], ['この 本は　★　＿＿　＿＿　＿＿　わかりやすいです。', ['字が', 'えも', '大きくて', '多いので'], 'この 本は 字が 大きくて えも 多いので わかりやすいです。 ★ = 字が.', 'order order order', ['えも comes after 大きくて.', '大きくて comes right after 字が.', '多いので comes last, before わかりやすい.']], ['この 本は　＿＿　＿＿　＿＿　★　です。', ['もの', 'もらった', '父に', '買って'], 'この 本は 父に 買って もらった もの です。 〜て もらう: 父に is the giver. ★ = もの.', 'order order order', ['もらった comes right before もの.', '父に comes first: 父に 買って もらった.', '買って comes after 父に.']], ['きのうは つかれて いたので、　＿＿　★　＿＿　＿＿　しまいました。', ['つけた', 'まま', '電気を', 'ねて'], '電気を つけた まま ねて しまいました。 〜た まま = leaving it as it is. ★ = つけた.', 'order order order', ['まま comes right after つけた.', '電気を comes first.', 'ねて comes last, before しまいました.']], ['母に　＿＿　＿＿　★　＿＿　、まだ 終わって いません。', ['ように', 'へやを', 'そうじする', '言われましたが'], '母に へやを そうじする ように 言われましたが、まだ 終わって いません。 〜ように 言われる = be told to do. ★ = ように.', 'order order order', ['へやを comes first.', 'そうじする comes before ように.', '言われましたが comes last.']], ['ここは　★　＿＿　＿＿　＿＿　です。', ['たばこを', 'いけない', '吸っては', '場所'], 'ここは たばこを 吸っては いけない 場所 です。 The rule 〜ては いけない describes 場所. ★ = たばこを.', 'order order order', ['いけない comes after 吸っては.', '吸っては comes after たばこを.', '場所 comes last, before です.']], ['日本へ　＿＿　＿＿　＿＿　★　、日本語を 勉強して います。', ['ように', 'こまらない', '行った', 'とき'], '日本へ 行った とき こまらない ように、日本語を 勉強して います。 〜ように = so that. ★ = ように.', 'order order order', ['こまらない comes right before ように.', '行った comes first, after 日本へ.', 'とき comes after 行った.']]]);
passage(4, 'n4p1', 'さくら市 図書館からの お知らせ\n\n来月から、図書館の 開館時間が {変|か}わります。{平日|へいじつ}は 午前９時から 午後８時まで、土曜日と 日曜日は 午前１０時から 午後６時までです。毎週 月曜日は 休みです。また、本は 一人 １０さつまで、２週間 借りる ことが できます。', [['来月の 土曜日、図書館は 何時まで 開いて いますか。', ['午後６時', '午後８時', '午前１０時', '土曜日は 休み'], 'Sentence 2: 土曜日と 日曜日は 午前１０時から 午後６時までです.', 'detail detail keyword', ["午後８時 is when the library closes on weekdays ({平日|へいじつ}).", "午前１０時 is when it OPENS on weekends. The question asks until when (何時まで).", "The library is closed on Mondays (毎週 月曜日は 休みです), not Saturdays."]], ['この お知らせの {内容|ないよう}と 合って いる ものは どれですか。', ['月曜日は 図書館が 休みだ。', '{平日|へいじつ}は 午前１０時から 開く。', '日曜日は 午後８時まで 開いて いる。', '本は 一人 ２さつまで 借りられる。'], 'Sentence 3: 毎週 月曜日は 休みです. Each wrong option swaps the weekday and weekend times, or the two numbers in the last sentence.', 'detail detail keyword', ["午前１０時 is the weekend opening time. On weekdays it opens at 午前９時.", "午後８時 is the weekday closing time. On Sunday it closes at 午後６時.", "２ is the weeks (２週間). The number of books is １０さつまで."]]]);
passage(4, 'n4p2', 'わたしは 去年 日本に 来ました。来た ばかりの ころは、電車の 乗り方も わからなくて、とても {困|こま}りました。ある 日、駅で {切符|きっぷ}の 買い方が わからなくて {困|こま}って いたら、知らない おばあさんが 教えて くれました。おばあさんは わたしの 下手な 日本語を ゆっくり 聞いて くれました。その とき、もっと 日本語を 勉強しようと 思いました。今は 毎日 日本人の 友だちと 日本語で 話して います。', [['「わたし」は 駅で どうして {困|こま}って いましたか。', ['{切符|きっぷ}の 買い方が わからなかったから', '{切符|きっぷ}を なくしたから', '日本語が 下手で、話せなかったから', '知らない おばあさんに 話しかけられたから'], 'Sentence 3: ある 日、駅で {切符|きっぷ}の 買い方が わからなくて {困|こま}って いたら…. 〜て {困|こま}る gives the reason.', 'keyword detail dir', ["{切符|きっぷ} is in the sentence, but the problem was how to BUY one (買い方が わからなくて).", "下手な 日本語 comes later, when the old woman listened. The trouble at the station was the ticket.", "The old woman came AFTER the writer was in trouble, to help (教えて くれました). She wasn't the problem."]], ['「わたし」が もっと 日本語を 勉強しようと 思ったのは どうしてですか。', ['おばあさんが 親切に 話を 聞いて くれたから', '日本人の 友だちと 日本語で 話したかったから', 'おばあさんの 日本語が わからなかったから', '電車の 乗り方を 習いたかったから'], 'Sentences 4–5: おばあさんは わたしの 下手な 日本語を ゆっくり 聞いて くれました。その とき、もっと 日本語を 勉強しようと 思いました. その とき points to the old woman listening.', 'change dir keyword', ["Talking with Japanese friends is what the writer does NOW (今は 毎日 …), the result of studying, not the reason.", "It was the WRITER's Japanese that was poor (わたしの 下手な 日本語). The old woman understood and listened.", "Not knowing how to ride the train was the first trouble in Japan. その とき points to the old woman listening patiently."]]]);
listen(4, [{
    q: '女の人は この あと まず 何を しますか。',
    intro: '会社で 男の人と 女の人が 話しています。女の人は この あと まず 何を しますか。',
    lines: [['M', '山田さん、あしたの かいぎの しりょう、もう コピーしましたか。'], ['F', 'いいえ、まだです。'], ['M', 'じゃあ、コピーの 前に、ぶちょうに しりょうを 見せて ください。少し なおすかもしれませんから。'], ['F', 'わかりました。'], ['M', 'それから、かいぎしつの よやくも おねがいします。']],
    o: ['ぶちょうに しりょうを 見せる', 'しりょうを コピーする', 'かいぎしつを よやくする', 'しりょうを なおす'],
    e: 'コピーの 前に ぶちょうに 見せて — showing the manager comes first.',
    d: 'seq seq keyword',
    n: ['コピーの 前に、ぶちょうに 見せて: the copying comes after.', 'かいぎしつの よやく comes with それから: later.', 'The manager might fix it (なおすかもしれません). She doesn\'t fix it herself first.']
}, {
    q: '男の人は どうして ひっこしますか。',
    intro: '女の人と 男の人が 話しています。男の人は どうして ひっこしますか。',
    lines: [['F', 'ひっこすんですか。今の アパート、駅から 近くて いいって 言って いましたよね。'], ['M', 'ええ、駅からは 近いんですが、となりの へやの 人が 夜 うるさくて、よく ねむれないんです。'], ['F', 'そうですか。それは たいへんですね。']],
    o: ['夜 うるさくて ねむれないから', '駅から 遠いから', '駅から 近いから', 'となりの 人が きらいだから'],
    e: 'The neighbor is noisy at night, so he cannot sleep.',
    d: 'keyword detail over',
    n: ['He says 駅からは 近い: the station is close.', 'The station is close, and that is a good point. It isn\'t why he moves.', 'He only says the neighbor is noisy at night. He never says he dislikes them.']
}, {
    q: '二人は 何で くうこうへ 行きますか。',
    intro: '男の人と 女の人が 話しています。二人は 何で くうこうへ 行きますか。',
    lines: [['M', 'くうこうまで タクシーで 行きましょうか。'], ['F', 'タクシーは 高いですよ。バスは どうですか。'], ['M', 'バスは 時間が かかりますよ。電車なら はやいし、安いですよ。'], ['F', 'そうですね。じゃ、そう しましょう。']],
    o: ['電車', 'バス', 'タクシー', '電車と バス'],
    e: 'Train is fast and cheap; she agrees (そう しましょう).',
    d: 'change change keyword',
    n: ['He says バスは 時間が かかります.', 'She says タクシーは 高いですよ.', 'They take only the train (電車なら はやいし、安い).']
}, {
    q: '友だちの ペンを 借りたいです。何と 言いますか。',
    intro: '友だちの ペンを 借りたいです。何と 言いますか。',
    lines: [],
    o: ['ペン、貸して くれない？', 'ペン、借りて くれない？', 'ペン、貸して あげようか。', 'ペン、借りても いいよ。'],
    e: 'You ask the friend to LEND (貸す) to you: 貸して くれない？',
    d: 'dir dir dir',
    n: ['借りる is what YOU do. 借りて くれない？ asks the friend to borrow. Ask them to lend: 貸して.', '貸して あげようか offers to lend YOUR pen.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'すみません、この せき、空いて いますか。']],
    o: ['ええ、どうぞ。', 'はい、いただきます。', 'いいえ、どういたしまして。', 'では、お先に。'],
    e: 'Is this seat free? → ええ、どうぞ (Yes, go ahead).',
    d: 'situ situ situ',
    n: ['いただきます is said before eating, or when you accept food.', 'どういたしまして answers ありがとう.']
}, /* batch 1 — 課題理解 */
{
    q: '学生は まず 何を しますか。',
    intro: '大学で 学生と 先生が 話しています。学生は まず 何を しますか。',
    lines: [['F', '先生、レポートは どこに 出せば いいですか。'], ['M', 'わたしの へやの 前に はこが あるので、そこに 入れて ください。'], ['F', 'わかりました。'], ['M', 'あ、その 前に、じむしつで はんこを もらって ください。はんこが ない レポートは うけとれません。']],
    o: ['じむしつで はんこを もらう', '先生の へやへ 行く', 'はこに レポートを 入れる', 'レポートを 書きなおす'],
    e: 'その 前に じむしつで はんこ — the stamp comes before the box.',
    d: 'seq seq keyword',
    n: ['先生の へやの 前 is where the box is, but その 前に she goes to じむしつ.', 'The box comes after the stamp: はんこが ない レポートは うけとれません.', 'Nobody says to rewrite the report. It only needs a はんこ.']
}, {
    q: '女の人は 何を 買いますか。',
    intro: '女の人と 男の人が 電話で 話しています。女の人は 何を 買いますか。',
    lines: [['F', '今 スーパーに いるんだけど、何か 買う もの ある？'], ['M', 'たまごと 牛にゅう…あ、牛にゅうは きのう 買ったから いいや。それと、パンも おねがい。'], ['F', 'パンは あしたの 朝、パン屋で 買う つもりだよ。'], ['M', 'そうか。じゃあ、たまごだけで いいよ。']],
    o: ['たまご', 'たまごと 牛にゅう', 'たまごと パン', '牛にゅうと パン'],
    e: 'Milk was bought yesterday (いいや = not needed), bread will come from the bakery → only eggs.',
    d: 'change change keyword',
    n: ['He says 牛にゅうは きのう 買ったから いいや: no milk.', 'She buys パン tomorrow at the bakery, so not now.', 'Neither: the milk was bought yesterday, and the bread comes tomorrow.']
}, {
    q: '女の人は この あと まず 何を しますか。',
    intro: '会社で 男の人と 女の人が 話しています。女の人は この あと まず 何を しますか。',
    lines: [['M', '田中さん、この しょるいを 三時までに 送って ください。'], ['F', '三時ですか。今 かいぎの じゅんびを して いるので、四時でも いいですか。'], ['M', 'うーん、かいぎの じゅんびは すずきさんに たのむので、先に しょるいを おねがいします。'], ['F', 'わかりました。']],
    o: ['しょるいを 送る', 'かいぎの じゅんびを する', 'すずきさんに たのむ', '四時まで まつ'],
    e: '先に しょるいを — the papers come first; the man will ask すずきさん himself.',
    d: 'seq dir change',
    n: ['かいぎの じゅんび goes to すずきさん: 先に しょるいを.', 'The man asks すずきさん himself (すずきさんに たのむ).', 'She asks for four o\'clock, but he says 先に しょるいを: do the papers first.']
}, {
    q: '男の人は まず 何を しますか。',
    intro: 'びょういんで うけつけの 人と 男の人が 話しています。男の人は まず 何を しますか。',
    lines: [['F', 'はじめての 方ですね。では、この 紙に 名前と 住所を 書いて ください。'], ['M', 'はい。'], ['F', 'あ、書く 前に、あちらで ねつを はかって ください。'], ['M', 'わかりました。']],
    o: ['ねつを はかる', '紙に 名前と 住所を 書く', '住所を 言う', 'あちらで まつ'],
    e: '書く 前に ねつを はかって — temperature first, then the form.',
    d: 'seq keyword keyword',
    n: ['書く 前に、ねつを はかって: writing comes after.', 'He writes his 住所 on the paper; he doesn\'t say it.', 'あちら is where he takes his temperature, not where he waits.']
}, {
    q: '女の人は この あと まず 何を しますか。',
    intro: 'ゆうびんきょくで 女の人と 男の人が 話しています。女の人は この あと まず 何を しますか。',
    lines: [['F', 'この にもつを 送りたいんですが。'], ['M', 'はい。中に 何が 入って いますか。'], ['F', 'おかしです。'], ['M', 'おかしなら だいじょうぶです。でも、この はこは 少し 大きいですね。住所を 書く 前に、こちらの 小さい はこに 入れかえて ください。']],
    o: ['小さい はこに 入れかえる', '紙に 住所を 書く', '大きい はこを 買う', 'おかしを 出す'],
    e: '住所を 書く 前に 小さい はこに 入れかえて — change boxes first.',
    d: 'seq keyword keyword',
    n: ['住所を 書く 前に: the address comes after changing boxes.', 'The box is 少し 大きい. She moves it into a SMALLER box: 小さい はこに 入れかえて.', 'おかしなら だいじょうぶ: the sweets can be sent.']
}, {
    q: '学生は あした 何を 持って 行かなければ なりませんか。',
    intro: '先生が 学生に 話して います。学生は あした 何を 持って 行かなければ なりませんか。',
    lines: [['M', 'あしたの 旅行ですが、朝 八時に 駅に 集まって ください。昼ご飯は ホテルで 出ますから、持って こなくて いいです。飲み物は 自分で 持って きて ください。あしたは 天気が いいそうですから、かさは いりません。']],
    o: ['飲み物', '昼ご飯', 'かさ', '昼ご飯と 飲み物'],
    e: 'Lunch is served at the hotel, no umbrella needed → only a drink.',
    d: 'neg neg neg',
    n: ['昼ご飯は ホテルで 出ます: lunch is served, so don\'t bring it.', 'かさは いりません: the weather will be good.', '飲み物 is right, but 昼ご飯は 持って こなくて いい.']
}, /* batch 1 — ポイント理解 */
{
    q: '二人は 何時に 会いますか。',
    intro: '男の人と 女の人が 話しています。二人は 何時に 会いますか。',
    lines: [['M', 'あした、何時に 会う？'], ['F', '十時は どう？'], ['M', '十時は ちょっと 早いな。十一時は？'], ['F', 'いいよ。あ、でも 映画が 十一時半からだから、十一時だと いそがしいね。'], ['M', 'じゃあ、十時半に しよう。'], ['F', 'うん、そう しよう。']],
    o: ['十時半', '十時', '十一時', '十一時半'],
    e: '10 is too early, 11 is too close to the 11:30 film → 10:30.',
    d: 'change change keyword',
    n: ['十時は ちょっと 早い: he says it is too early.', 'The film is at 十一時半, so 十一時 is too busy.', '十一時半 is when the film starts.']
}, {
    q: '男の人は どうして おくれましたか。',
    intro: '会社で 女の人と 男の人が 話しています。男の人は どうして おくれましたか。',
    lines: [['F', 'どうして おくれたんですか。ねぼうですか。'], ['M', 'いいえ、朝は 早く 起きたんですが、電車が 止まって しまって。'], ['F', 'え、じこですか。'], ['M', 'いいえ、雪の せいです。']],
    o: ['雪で 電車が 止まったから', 'ねぼうしたから', '電車の じこが あったから', '朝 おそく 起きたから'],
    e: 'He got up early; the train stopped because of snow, not an accident.',
    d: 'neg neg neg',
    n: ['He says いいえ to ねぼう: he got up early.', 'She asks じこですか and he says いいえ、雪の せいです.', '朝は 早く 起きた: he got up early.']
}, {
    q: '男の人は レストランの 何が よくなかったと 言って いますか。',
    intro: '女の人と 男の人が 話しています。男の人は レストランの 何が よくなかったと 言って いますか。',
    lines: [['F', 'きのうの レストラン、どうだった？'], ['M', '料理は おいしかったし、店員も 親切だったよ。'], ['F', 'よかったね。'], ['M', 'うん。でも、ちょっと 高かったな。']],
    o: ['ねだん', '料理の あじ', '店員', 'よくない ところは なかった'],
    e: 'でも、ちょっと 高かった — the price.',
    d: 'neg neg neg',
    n: ['料理は おいしかった: the food was good.', '店員も 親切だった: the staff were kind.', 'He says でも、ちょっと 高かった: there was one bad point, the price.']
}, {
    q: '女の人の 今の しゅみは 何ですか。',
    intro: '男の人と 女の人が 話しています。女の人の 今の しゅみは 何ですか。',
    lines: [['M', '山田さんの しゅみは テニスでしたよね。'], ['F', '前は そうでしたが、足を けがしてから、やめました。今は 料理教室に 通って います。'], ['M', '料理ですか。いいですね。'], ['F', 'ええ。来月からは ピアノも 習う つもりです。']],
    o: ['料理', 'テニス', 'ピアノ', '料理と ピアノ'],
    e: 'Tennis was before; piano starts next month. Now = cooking.',
    d: 'change change over',
    n: ['テニス was before (前は). She quit after hurting her leg.', 'ピアノ starts next month (来月から), not now.', 'Now it is only 料理. ピアノ is next month.']
},
{
    q: 'かいぎは どこで ありますか。',
    intro: '会社で 男の人が 話しています。かいぎは どこで ありますか。',
    lines: [['M', 'みなさん、きょうの かいぎは ３かいの かいぎしつの よていでしたが、エアコンが こわれたので、へやが かわりました。５かいの、エレベーターの 前の へやです。時間は 同じです。']],
    o: ['５かいの エレベーターの 前の へや', '３かいの かいぎしつ', '５かいの かいぎしつ', '３かいの エレベーターの 前の へや'],
    e: 'The room changed from the 3rd floor to the room in front of the elevator on the 5th.',
    d: 'change keyword keyword',
    n: ['The meeting was planned on the 3rd floor, but the room changed.', '５かい is right, but the room is in front of the elevator, not a かいぎしつ.', '３かい is the old floor.']
}, {
    q: '女の人は ぜんぶで いくら はらいましたか。',
    intro: '女の人と 男の人が 話しています。女の人は ぜんぶで いくら はらいましたか。',
    lines: [['F', 'この シャツ、三千円でしたが、セールで 半分に なって いました。'], ['M', 'へえ、安いですね。'], ['F', 'それで、同じ ものを 二まい 買いました。']],
    o: ['三千円', '千五百円', '六千円', '四千五百円'],
    e: 'Half of 3,000 = 1,500 each, two shirts → 3,000.',
    d: 'detail change keyword',
    n: ['千五百円 is the price of ONE shirt after the sale. She bought two.', '六千円 is two shirts at the old price. The sale made each one half.', 'Nobody says 四千五百円. Each shirt is 千五百円, and two make 三千円.']
}, /* batch 1 — 発話表現 */
{
    q: '先生の へやに 入ります。何と 言いますか。',
    intro: '先生の へやに 入ります。何と 言いますか。',
    lines: [],
    o: ['しつれいします。', 'おじゃましました。', 'いってらっしゃい。', 'おかえりなさい。'],
    e: 'Entering a teacher\'s or boss\'s room: しつれいします. おじゃましました is for leaving.',
    d: 'situ situ situ',
    n: ['おじゃましました is said when you LEAVE someone\'s home.', 'いってらっしゃい is said to someone going out.']
}, {
    q: '会社で、みんなより 先に 帰ります。何と 言いますか。',
    intro: '会社で、みんなより 先に 帰ります。何と 言いますか。',
    lines: [],
    o: ['お先に しつれいします。', 'いってきます。', 'ただいま。', 'いらっしゃいませ。'],
    e: 'Leaving work before others: お先に しつれいします.',
    d: 'situ situ situ',
    n: ['いってきます is said when you leave home and will come back.', 'ただいま is said when you come home.']
}, {
    q: '店で 服を 着て みたいです。店の 人に 何と 言いますか。',
    intro: '店で 服を 着て みたいです。店の 人に 何と 言いますか。',
    lines: [],
    o: ['これ、着て みても いいですか。', 'これ、着て みて ください。', 'これ、着せて あげましょうか。', 'これ、着ても かまいませんよ。'],
    e: 'You ask permission: 〜ても いいですか. The others ask, offer or allow from the wrong side.',
    d: 'dir dir dir',
    n: ['着て みて ください asks the shop staff to try it on.', '着せて あげましょうか offers to dress someone else.']
}, {
    q: '友だちが かぜで 学校を 休んで います。電話で 何と 言いますか。',
    intro: '友だちが かぜで 学校を 休んで います。電話で 何と 言いますか。',
    lines: [],
    o: ['だいじょうぶ？ おだいじに。', 'おめでとう。', 'いただきます。', 'よろしく おねがいします。'],
    e: 'To someone who is sick: おだいじに.',
    d: 'situ situ situ',
    n: ['おめでとう is for good news, like a birthday.', 'いただきます is said before eating.']
}, /* batch 1 — 即時応答 */
{
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', 'すみません、この ペン、使っても いいですか。']],
    o: ['ええ、どうぞ。', 'はい、使いましょう。', 'いいえ、使って いません。', 'どういたしまして。'],
    e: 'Asked for permission → ええ、どうぞ.',
    d: 'form keyword',
    n: ['使いましょう invites her to use it together. She asks for permission.', '使って いません says you aren\'t using it. A polite no is すみません、ちょっと….']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'あした、ひっこしの てつだいに 来て くれない？']],
    o: ['うん、いいよ。何時に 行けば いい？', 'うん、てつだって もらうね。', 'うん、来て くれて ありがとう。', 'じゃあ、てつだいに 来て あげて。'],
    e: '〜て くれない？ asks YOU to help. Agree and ask the time.',
    d: 'dir dir dir',
    n: ['てつだって もらう means YOU get help. He asks YOU to help him.', '来て くれて ありがとう thanks him for coming. He is asking you to come.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', 'お茶でも 飲みに 行きませんか。']],
    o: ['いいですね。行きましょう。', 'いいえ、飲みませんでした。', 'はい、お茶です。', 'じゃあ、行って ください。'],
    e: 'Invitation (〜ませんか) → いいですね。行きましょう.',
    d: 'form keyword dir',
    n: ['飲みませんでした is past. An invitation needs いいですね or a polite no.', 'はい、お茶です only repeats お茶. It doesn\'t answer the invitation.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'お先に しつれいします。']],
    o: ['おつかれさまでした。', 'いってらっしゃい。', 'いらっしゃいませ。', 'いただきます。'],
    e: 'A coworker leaves first → おつかれさまでした.',
    d: 'situ situ situ',
    n: ['いってらっしゃい is for someone going out who will come back.', 'いらっしゃいませ is said to customers in a shop.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', '駅まで 車で 送りましょうか。']],
    o: ['ありがとうございます。おねがいします。', 'はい、送って あげます。', 'では、送らせて ください。', 'いいえ、送りませんでした。'],
    e: '〜ましょうか is an offer; accept with おねがいします.',
    d: 'dir pcv form',
    n: ['送って あげます offers to drive HER. She is the one offering.', '送らせて ください asks her to let YOU drive. She is offering to drive you.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'この 料理、もう 少し 食べる？']],
    o: ['ううん、もう おなか いっぱい。', 'うん、もう 食べた。', 'ううん、少し 食べる。', 'うん、食べさせて あげる。'],
    e: 'Decline more food: ううん、もう おなか いっぱい. ううん and 食べる contradict.',
    d: 'polar polar pcv',
    n: ['もう 食べた is "I already ate it". He asks if you want MORE.', 'ううん is no, but 少し 食べる is yes. They contradict.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', 'しゅくだい、てつだって あげようか。']],
    o: ['ほんとう？ ありがとう。', 'うん、てつだって あげるね。', 'え、てつだって くれたの？', 'いいえ、どういたしまして。'],
    e: 'She offers to help you → ほんとう？ ありがとう.',
    d: 'dir form situ',
    n: ['てつだって あげる offers YOUR help. She is offering hers.', 'てつだって くれたの？ is past: "Did you help me?" She hasn\'t helped yet.']
}, {
    'q': '女の人は この あと まず 何を しますか。',
    'intro': '会社で 男の人と 女の人が 話しています。女の人は この あと まず 何を しますか。',
    'lines': [['M', '山田さん、あしたの かいぎの しりょう、もう コピーした？'], ['F', 'いいえ、まだです。'], ['M', 'じゃあ、コピーの 前に、すうじが 正しいか もう一度 見て くれる？'], ['F', 'はい、わかりました。それから かいぎしつの じゅんびも しますね。'], ['M', 'かいぎしつは 田中さんが やるから いいよ。']],
    'o': ['しりょうの すうじを 見る', 'しりょうを コピーする', 'かいぎしつの じゅんびを する', '田中さんに 電話する'],
    'e': 'コピーの 前に すうじを 見て — checking comes first. Tanaka does the room.',
    'd': 'seq change keyword',
    n: ['コピーの 前に、すうじを 見て: the copying comes after the check.', 'She offers, but he says かいぎしつは 田中さんが やる.', 'Nobody says to call 田中さん. 田中さん does the room.']
}, {
    'q': '男の人は どうして アルバイトを やめましたか。',
    'intro': '女の人と 男の人が 話しています。男の人は どうして アルバイトを やめましたか。',
    'lines': [['F', 'アルバイト、やめたんですか。'], ['M', 'ええ。店の 人は みんな 親切だったんですけど…。'], ['F', '時間が 合わなかったんですか。'], ['M', 'いいえ、時間は だいじょうぶでした。家から 遠くて、通うのが たいへんだったんです。']],
    'o': ['家から 遠かったから', '店の 人が 親切じゃ なかったから', '時間が 合わなかったから', '家から 近かったから'],
    'e': 'People were kind, time was fine; it was too far from home.',
    'd': 'neg neg dir',
    n: ['店の 人は みんな 親切だった: they were kind.', 'She asks about the time and he says 時間は だいじょうぶでした.', 'It was the opposite: 家から 遠くて.']
}, {
    'q': '二人は 何を 持って 行きますか。',
    'intro': '女の人と 男の人が 話しています。二人は 何を 持って 行きますか。',
    'lines': [['F', 'すずきさんの おみまい、何を 持って 行こうか。'], ['M', '花は どう？'], ['F', '病院は 花が だめな ところも あるよ。'], ['M', 'じゃあ、くだものに しよう。'], ['F', 'そうだね。']],
    'o': ['くだもの', '花', '花と くだもの', '何も 持って 行かない'],
    'e': 'Flowers may not be allowed in hospitals → fruit (くだものに しよう).',
    'd': 'change keyword neg',
    n: ['He suggests 花, but she says some hospitals don\'t allow flowers.', 'They take only くだもの; 花 was dropped.', 'They do take something: くだものに しよう.']
}, {
    'q': '学生は 何時までに 教室に 入らなければ なりませんか。',
    'intro': '先生が 学生に 話して います。学生は 何時までに 教室に 入らなければ なりませんか。',
    'lines': [['M', 'あしたの テストは ９時半に 始まります。でも、その 前に せつめいが ありますから、９時１５分までに 教室に 入って ください。おくれた 人は 入れません。']],
    'o': ['９時１５分', '９時半', '９時４５分', '９時半より 前なら いつでも'],
    'e': 'The test starts at 9:30, but there is an explanation first: be in by 9:15.',
    'd': 'detail keyword over',
    n: ['９時半 is when the test starts. There is an explanation before it.', 'Nobody says ９時４５分. The times are ９時半 and ９時１５分.', 'He says ９時１５分までに: earlier than ９時半, not any time before it.']
}, {
    'q': '女の人は 何を わすれましたか。',
    'intro': '男の人と 女の人が 話しています。女の人は 何を わすれましたか。',
    'lines': [['M', 'どうしたの？'], ['F', '会社の かぎが ないの。'], ['M', 'かばんの 中は？'], ['F', 'さいふと けいたいは あるんだけど…。あ、きのう ほかの かばんに 入れたんだ。']],
    'o': ['会社の かぎ', 'さいふ', 'けいたい', 'かばん'],
    'e': 'The wallet and phone are there; the office key is in another bag.',
    'd': 'keyword keyword keyword',
    n: ['さいふと けいたいは ある: she has the wallet.', 'She has the phone too.', 'The bag is there; the key is in ANOTHER bag.']
}, {
    'q': '男の学生は どこで 本を 買いますか。',
    'intro': '女の学生と 男の学生が 話しています。男の学生は どこで 本を 買いますか。',
    'lines': [['F', 'その 本、どこで 買うの？'], ['M', '駅前の 本屋に なかったから、ネットで 買おうと 思って。'], ['F', '大学の 本屋に あったよ。それに 学生は 安く 買えるよ。'], ['M', 'え、ほんとう？ じゃあ、そこで 買う。']],
    'o': ['大学の 本屋', '駅前の 本屋', 'インターネット', '大学の 図書館'],
    'e': 'He planned to order online, then changes to the university shop (cheaper for students).',
    'd': 'change change keyword',
    n: ['駅前の 本屋に なかった: they didn\'t have it.', 'He planned to buy it online (ネットで), then changed his mind.', 'She says 大学の 本屋, the bookshop, not the library.']
}, {
    'q': '女の人は 今 何曜日に ピアノを ならって いますか。',
    'intro': '男の人と 女の人が 話しています。女の人は 今 何曜日に ピアノを ならって いますか。',
    'lines': [['M', 'ピアノは 毎週 何曜日？'], ['F', '前は 月曜日だったけど、先生が いそがしく なって、今は 水曜日。'], ['M', '金曜日も？'], ['F', 'ううん、金曜日は テニス。']],
    'o': ['水曜日', '月曜日', '金曜日', '月曜日と 水曜日'],
    'e': 'Monday was before; now Wednesday. Friday is tennis.',
    'd': 'change detail keyword',
    n: ['月曜日 was before (前は). Now it is 水曜日.', '金曜日は テニス, not piano.', '月曜日 was before; now it is only 水曜日.']
}, {
    'q': '男の人は この あと まず 何を しますか。',
    'intro': '女の人と 男の人が 旅行の 話を して います。男の人は この あと まず 何を しますか。',
    'lines': [['F', 'ホテルの よやく、した？'], ['M', 'まだ。どこが いいか しらべて いる ところ。'], ['F', '先に 電車の きっぷを 買った ほうが いいよ。休みの 日は すぐ なくなるから。'], ['M', 'そうだね。じゃあ、きっぷから。']],
    'o': ['電車の きっぷを 買う', 'ホテルを よやくする', 'ホテルを しらべる', '休みを とる'],
    'e': '先に きっぷ: tickets sell out, so they come first (きっぷから).',
    'd': 'seq detail keyword',
    n: ['ホテルの よやく is still to come; 先に きっぷ.', 'He is looking up hotels now, but she says to buy tickets first and he agrees: きっぷから.', 'She says tickets sell out on holidays (休みの 日). Nobody takes a day off.']
}, {
    'q': '女の人は どんな へやを かりますか。',
    'intro': 'へやを かす 店で 男の人と 女の人が 話しています。女の人は どんな へやを かりますか。',
    'lines': [['M', 'こちらの へやは 駅から ５分ですが、少し せまいです。こちらは 広いですが、駅から ２０分です。'], ['F', '毎朝 早いので、駅に 近い ほうが いいです。せまくても いいです。']],
    'o': ['駅に 近くて せまい へや', '駅に 近くて 広い へや', '駅から 遠くて 広い へや', '駅から 遠くて せまい へや'],
    'e': 'Close to the station matters more; small is OK (せまくても いい).',
    'd': 'keyword detail keyword',
    n: ['The 広い room is 駅から ２０分: far.', 'She doesn\'t want the far room, even if it is 広い.', 'No such room is offered: the close one is せまい, the far one is 広い.']
}, {
    'q': '男の人は どうして 元気が ないのですか。',
    'intro': '女の人と 男の人が 話しています。男の人は どうして 元気が ないのですか。',
    'lines': [['F', '元気 ないね。テスト、だめだったの？'], ['M', 'ううん、テストは よかったよ。'], ['F', 'じゃあ、どうしたの？'], ['M', 'かって いる 犬が びょうきなんだ。']],
    'o': ['犬が びょうきだから', 'テストが わるかったから', '自分が びょうきだから', '犬が いなく なったから'],
    'e': 'The test went well; his dog is sick.',
    'd': 'neg keyword keyword',
    n: ['テストは よかった: the test went well.', 'The one who is sick is his dog (犬が びょうき).', 'The dog is sick, not gone.']
}, {
    'q': 'パーティーは 何時に 始まりますか。',
    'intro': '男の人と 女の人が 話しています。パーティーは 何時に 始まりますか。',
    'lines': [['M', '金曜日の パーティー、７時からだよね。'], ['F', 'あ、店が いっぱいで、７時半からに なったよ。'], ['M', 'そうなんだ。'], ['F', 'でも じゅんびが あるから、わたしたちは ７時に 行こう。']],
    'o': ['７時半', '７時', '７時と ７時半', 'まだ きまって いない'],
    'e': 'Moved to 7:30; they go at 7 only to get ready.',
    'd': 'change keyword keyword',
    n: ['７時 was the old start time, and it is when they go to get ready. The party starts at ７時半.', 'The party has one start time. It moved from ７時 to ７時半.', 'The shop was full (店が いっぱい), but the new time is set: ７時半からに なった.']
}, {
    'q': '女の人は 夏休みに 何を しますか。',
    'intro': '男の人と 女の人が 話しています。女の人は 夏休みに 何を しますか。',
    'lines': [['M', '夏休み、国へ 帰る？'], ['F', '帰りたかったけど、ひこうきが 高くて。'], ['M', 'じゃあ、日本で 旅行？'], ['F', 'ううん。アルバイトを して、お金を ためる つもり。']],
    'o': ['アルバイトを する', '国へ 帰る', '日本で 旅行する', 'ひこうきに のる'],
    'e': 'Flights are expensive, no trip either: she will work part-time and save.',
    'd': 'change keyword keyword',
    n: ['She wanted to go home, but the flight is too expensive.', 'He asks 日本で 旅行？ and she says ううん.', 'ひこうき comes up only because it is too expensive.']
}, {
    'q': '男の人は コーヒーに 何を 入れますか。',
    'intro': 'きっさてんで 店の 人と 男の人が 話しています。男の人は コーヒーに 何を 入れますか。',
    'lines': [['F', 'さとうと ミルク、入れますか。'], ['M', 'さとうは けっこうです。ミルクだけ おねがいします。'], ['F', 'ミルク、たくさん 入れますか。'], ['M', 'いいえ、少しで いいです。']],
    'o': ['ミルクを 少し', 'ミルクを たくさん', 'さとうと ミルク', '何も 入れない'],
    'e': 'さとうは けっこうです = no sugar. Only a little milk.',
    'd': 'keyword neg neg',
    n: ['She asks たくさん？ and he says いいえ、少しで いい.', 'さとうは けっこうです: no sugar.', 'He wants ミルクだけ, so something goes in.']
}, {
    'q': '店の 人は どの ケーキが いちばん 売れて いると 言って いますか。',
    'intro': 'ケーキ屋で 女の人と 店の 人が 話しています。店の 人は どの ケーキが いちばん 売れて いると 言って いますか。',
    'lines': [['F', 'いちばん 人気が ある ケーキは どれですか。'], ['M', 'チーズケーキも よく 売れますが、いちばんは この いちごの ケーキです。チョコレートの ケーキは 冬に 人気が あります。']],
    'o': ['いちごの ケーキ', 'チーズケーキ', 'チョコレートの ケーキ', 'チーズケーキと いちごの ケーキ'],
    'e': 'Cheesecake also sells well, but いちばんは いちごの ケーキ.',
    'd': 'detail detail keyword',
    n: ['チーズケーキも よく 売れます, but いちばんは いちごの ケーキ.', 'チョコレートの ケーキ is popular in winter.', 'Only one is いちばん: the いちごの ケーキ.']
}, {
    'q': '男の人は いつ 病院へ 行きますか。',
    'intro': '女の人と 男の人が 話しています。男の人は いつ 病院へ 行きますか。',
    'lines': [['F', 'かぜ、まだ なおらないの？ 早く 病院へ 行った ほうが いいよ。'], ['M', '今日は 午後 休みだから 行こうと 思ったけど、病院が 休みなんだ。'], ['F', 'じゃあ、あしたの 朝は？'], ['M', 'うん、会社に 行く 前に 行くよ。']],
    'o': ['あしたの 朝', '今日の 午後', 'あしたの 午後', '会社の あと'],
    'e': 'The hospital is closed this afternoon → tomorrow morning, before work.',
    'd': 'change keyword seq',
    n: ['He wanted to go this afternoon, but the hospital is closed.', 'It is あしたの 朝, not the afternoon.', 'He goes 会社に 行く 前に: before work.']
}, {
    'q': '友だちの 家で トイレを 使いたいです。何と 言いますか。',
    'intro': '友だちの 家で トイレを 使いたいです。何と 言いますか。',
    'lines': [],
    'o': ['トイレ、かりても いい？', 'トイレ、かして あげる。', 'トイレ、使って くれる？', 'トイレ、どうだった？'],
    'e': 'Ask permission to use it: かりても いい？',
    'd': 'dir dir situ',
    n: ['かして あげる offers to lend the toilet. You want to use theirs.', '使って くれる？ asks your friend to use it.']
}, {
    'q': 'レストランで 料理が まだ 来ません。店の 人に 何と 言いますか。',
    'intro': 'レストランで 料理が まだ 来ません。店の 人に 何と 言いますか。',
    'lines': [],
    'o': ['すみません、料理は まだですか。', 'すみません、料理は もう いいです。', '料理を 作りましょうか。', 'ごちそうさまでした。'],
    'e': 'Ask about the order: 〜は まだですか.',
    'd': 'situ dir situ',
    n: ['料理は もう いいです cancels the food. You still want it.', '作りましょうか offers to cook. You are the customer.']
}, {
    'q': 'しりょうを わすれました。となりの 人に 何と 言いますか。',
    'intro': 'しりょうを わすれました。となりの 人に 何と 言いますか。',
    'lines': [],
    'o': ['すみません、いっしょに 見せて もらえませんか。', 'すみません、いっしょに 見せて あげましょうか。', 'しりょうを 見て ください。', 'しりょうを わすれないで ください。'],
    'e': 'You need the neighbour to show you: 見せて もらえませんか.',
    'd': 'dir situ situ',
    n: ['見せて あげましょうか offers to show YOUR papers. You forgot yours.', 'しりょうを 見て ください asks them to look. You need to see theirs.']
}, {
    'q': '先生に かりた 本を 返します。何と 言いますか。',
    'intro': '先生に かりた 本を 返します。何と 言いますか。',
    'lines': [],
    'o': ['ありがとう ございました。とても おもしろかったです。', 'どういたしまして。', 'この 本、かして ください。', 'また 来て ください。'],
    'e': 'Returning something: thank them. どういたしまして is the reply to thanks.',
    'd': 'situ dir situ',
    n: ['どういたしまして answers ありがとう. You are the one who should thank.', 'かして ください asks to borrow it. You are giving it back.']
}, {
    'q': 'こんで いる バスを おりたいです。前の 人に 何と 言いますか。',
    'intro': 'こんで いる バスを おりたいです。前の 人に 何と 言いますか。',
    'lines': [],
    'o': ['すみません、おります。', 'すみません、のります。', 'どうぞ、おりて ください。', 'いってらっしゃい。'],
    'e': 'Getting off a crowded bus: すみません、おります.',
    'd': 'keyword dir situ',
    n: ['You want to get OFF, not on: おります.', 'どうぞ、おりて ください tells the other person to get off.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'この しょるい、あしたまでに 出して くれる？']],
    'o': ['はい、わかりました。', 'はい、出して あげます。', 'いいえ、出しませんでした。', 'はい、もらいました。'],
    'e': 'A request from your boss → はい、わかりました.',
    'd': 'dir form dir',
    n: ['出して あげます sounds like a favor to your boss. Just accept: わかりました.', '出しませんでした is past: "I didn\'t hand it in."']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', 'ここで 写真を とっても いいですか。']],
    'o': ['すみません、ここは ちょっと…。', 'ええ、とって くださいませんか。', 'はい、とりました。', 'いいえ、どういたしまして。'],
    'e': 'A soft no to permission: ここは ちょっと….',
    'd': 'form form situ',
    n: ['とって くださいませんか asks HER to take a photo for you.', 'とりました is past: "I took it."']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'もう 少し ゆっくり 話して もらえますか。']],
    'o': ['あ、すみません。', 'はい、ゆっくり 話して もらいます。', 'ゆっくりで いいですよ。', 'いいえ、話しません。'],
    'e': 'He asks YOU to slow down → apologise. ゆっくりで いいですよ is what HE would say.',
    'd': 'dir dir neg',
    n: ['話して もらいます means YOU get someone to speak. He asks YOU to slow down.', 'ゆっくりで いいですよ is what HE would say to you.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', 'きのうの えいが、どうだった？']],
    'o': ['すごく おもしろかったよ。', 'あした 見に 行くよ。', 'えいがかんの 前だよ。', '２時間ぐらいだよ。'],
    'e': 'どうだった asks your impression.',
    'd': 'form keyword situ',
    n: ['あした 見に 行く is future. どうだった asks about a film you already saw.', 'えいがかんの 前 says where, not how it was.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'あ、雨が ふって きましたね。']],
    'o': ['ほんとうだ。かさ、持って きて よかった。', 'ええ、はれて きましたね。', '雨が ふりましょうか。', 'いいえ、ふって いきます。'],
    'e': 'React to the rain: ほんとうだ.',
    'd': 'dir form',
    n: ['はれて きました is the opposite: the sky is clearing.', 'ふりましょうか is a strange offer ("shall I make it rain?").']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', 'すみません、この 近くに ゆうびんきょくは ありますか。']],
    'o': ['ええ、あの 銀行の となりです。', 'ええ、ゆうびんきょくへ 行きます。', 'いいえ、行って ください。', 'はい、送りました。'],
    'e': 'She asks where it is → give the place.',
    'd': 'situ situ situ',
    n: ['ゆうびんきょくへ 行きます says you are going there. She asks where it is.', '行って ください tells her to go, without saying where.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'しゅくだい、てつだおうか。']],
    'o': ['ありがとう。たすかる。', 'うん、てつだって あげる。', 'てつだいましょうか。', 'ううん、てつだって くれた。'],
    'e': '〜(よ)うか is an offer → accept with thanks.',
    'd': 'dir dir form',
    n: ['てつだって あげる offers YOUR help. He is the one offering.', 'てつだいましょうか offers the same help back. Accept it with thanks.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', '田中さん、まだ 来て いませんね。']],
    'o': ['ええ、どう したんでしょうね。', 'ええ、もう 来ましたね。', 'はい、来て ください。', 'いいえ、行きません。'],
    'e': 'Agree he isn\'t here yet and wonder why.',
    'd': 'polar dir situ',
    n: ['She says まだ 来て いません: he hasn\'t come.', '来て ください asks someone to come. 田中さん isn\'t here to hear it.']
}]);
conj(4, [['かく', 'potential form', ['かける'], 'Godan: u-sound → e-sound + る.'], ['たべる', 'passive form', ['たべられる'], 'Ichidan: drop る, add られる.'], ['よむ', 'causative form', ['よませる'], 'Godan: a-sound + せる.'], ['いく', 'volitional form (plain)', ['いこう'], 'Godan: o-sound + う.'], ['する', 'potential form', ['できる'], 'する → できる.'], ['くる', 'passive form', ['こられる'], 'くる → こられる.'], ['のむ', 'ば conditional', ['のめば'], 'Godan: e-sound + ば.'], ['まつ', 'imperative (plain)', ['まて'], 'Godan: e-sound.'], ['みる', 'honorific (尊敬語)', ['ごらんになる'], '見る → ごらんになる.'], ['いう', 'humble (謙譲語)', ['もうす', 'もうします'], '言う → もうす / もうします.']]);

/* ───────────────────────── N3 ───────────────────────── */
add(3, 'kr', [['旅行の 予定を <u>変更</u>しました。', ['へんこう', 'へんこ', 'へんごう', 'べんこう'], '変更 = へんこう (change).', 'long voice voice', ['へんこ drops the long う. 更 is こう: へんこう.', 'へんごう voices こう. It stays こう: へんこう.', 'べんこう voices へん. 変 is へん.']], ['私は 彼の 意見に <u>賛成</u>です。', ['さんせい', 'さんぜい', 'ざんせい', 'さんしょう'], '賛成 = さんせい (agree). 反対 = はんたい.', 'voice voice read', ['さんぜい voices せい. 成 is せい here: さんせい.', 'ざんせい voices さん. 賛 is さん.', 'さんしょう is a different word (to refer to something). 成 is せい: さんせい.']], ['会議の 時間を <u>確認</u>して ください。', ['かくにん', 'かくしん', 'かくじん', 'がくにん'], '確認 = かくにん (confirm).', 'read read voice', ['かくしん is a different word with the same 確 (strong belief). 認 is にん: かくにん.', 'じん is a reading of 人, not 認. 認 is にん: かくにん.', 'がくにん voices かく. 確 is かく.']], ['子どもの <u>成長</u>は 早い。', ['せいちょう', 'せいちょ', 'じょうちょう', 'せちょう'], '成長 = せいちょう (growth).', 'long read long', ['せいちょ drops the long う. 長 is ちょう: せいちょう.', 'じょう is a rare reading of 成. In 成長 it is せい.', 'せちょう drops the long い of 成. It is せい: せいちょう.']], ['朝の 電車は いつも <u>こんで</u> いる。', ['こんで', 'からんで', 'ならんで', 'すんで'], 'こむ = こむ (be crowded).', 'read read read'], ['高速道路で 大きな <u>じこ</u>が あった。', ['じこ', 'じご', 'じこう', 'しこ'], 'じこ = じこ (accident).', 'voice long voice'], ['フロントに 荷物を <u>預けた</u>。', ['あずけた', 'あづけた', 'たすけた', 'さずけた'], '預ける = あずける (leave in someone\'s care). Spelled ず, not づ.', 'voice read read', ['あづけた uses づ. It sounds the same, but the word is spelled with ず: あずける.', 'たすけた is 助けた (helped). It rhymes, but 預 is あずける.', 'さずけた is a different verb (grant, give from above). 預ける is あずける.']], ['この 店の <u>えいぎょう</u>時間は 何時までですか。', ['えいぎょう', 'えいごう', 'えいぎょ', 'けいぎょう'], 'えいぎょう = えいぎょう (business, opening hours).', 'read long read'], ['来月、会社を <u>辞める</u> ことに した。', ['やめる', 'とめる', 'しめる', 'さめる'], '辞める = やめる (quit a job).', 'field read read', ['とめる is 止める (stop something, like a car). Quitting a job is やめる: 辞める.', 'しめる is 閉める (close). 辞 is やめる.', 'さめる means wake up or cool down. 辞 is やめる.']], ['山の 上から 見る <u>景色</u>は すばらしい。', ['けしき', 'けいしょく', 'けいしき', 'けしょく'], '景色 = けしき (scenery), an irregular reading.', 'read read read', ['けいしょく is not a word. 景色 has an irregular reading: けしき.', 'けいしき is 形式 (form, format), a different word. 景色 is けしき.', '色 is しょく in a few words (特色 とくしょく), but 景色 is けしき.']], ['<u>まわり</u>の 人に めいわくを かけないように しよう。', ['まわり', 'めぐり', 'あたり', 'となり'], 'まわり = まわり (surroundings, people around).', 'read field field'], ['出かける 前に 部屋を <u>かたづけた</u>。', ['かたづけた', 'かたつけた', 'へんづけた', 'かたずけた'], 'かたづける = かたづける. かたずける is a common spelling mistake.', 'voice read voice'], ['電車の 中で かばんを <u>盗まれた</u>。', ['ぬすまれた', 'うばわれた', 'ふまれた', 'すまれた'], '盗む = ぬすむ (steal). うばう is take by force.', 'field field read', ['うばわれた means "taken by force". 盗まれた is ぬすまれた (stolen without being seen).', 'ふまれた means "got stepped on", which also happens on trains. 盗 is ぬすむ.', 'すまれた comes from 住む (live). 盗 is ぬすむ: ぬすまれた.']], ['彼女の <u>夢</u>は 医者に なる ことだ。', ['ゆめ', 'む', 'ねむり', 'ゆび'], '夢 = ゆめ (dream). む is its reading in words like むちゅう (夢中, absorbed in).', 'read field read', ['む is 夢 inside words like むちゅう (absorbed in). On its own, 夢 is ゆめ.', 'ねむり means sleep. Dreams come in sleep, but 夢 is ゆめ.', 'ゆび is 指 (finger). It starts with ゆ like ゆめ, but it is a different word.']], ['来月から <u>給料</u>が 上がる。', ['きゅうりょう', 'きゅりょう', 'きゅうりょ', 'きょうりょう'], '給料 = きゅうりょう (salary). Both halves are long.', 'long long you', ['きゅりょう drops the long う of 給. It is きゅう.', 'きゅうりょ drops the long う of 料. It is りょう.', 'きょう has ょ where 給 has ゅ. 給 is きゅう.']], ['この 川で 泳ぐのは <u>危険</u>だ。', ['きけん', 'きげん', 'きっけん', 'きけい'], '危険 = きけん (danger). 険 is けん, unvoiced.', 'voice soku read', ['きげん is a different word (deadline, or mood). 険 is unvoiced: きけん.', 'きっけん adds a small っ. 危険 is three beats: き・け・ん.', 'けい is not a reading of 険. It is けん: きけん.']], ['早起きは よい <u>習慣</u>だ。', ['しゅうかん', 'しゅかん', 'しゅうがん', 'じゅうかん'], '習慣 = しゅうかん (habit). Long しゅう, and かん stays unvoiced.', 'long voice voice', ['しゅかん drops the long う. 習 is しゅう.', 'しゅうがん voices かん. 慣 is かん: しゅうかん.', 'じゅうかん voices しゅう. 習 is しゅう, unvoiced.']], ['プレゼントを もらって、彼女は うれしそうな <u>表情</u>を した。', ['ひょうじょう', 'ひょうしょう', 'ひょじょう', 'おもてじょう'], '表情 = ひょうじょう (facial expression). 情 is じょう here.', 'voice long read', ['ひょうしょう leaves 情 unvoiced. Here it is じょう: ひょうじょう.', 'ひょじょう drops the long う of 表. It is ひょう.', 'おもて is 表 on its own (front side). In 表情 it is ひょう.']], ['空港まで 友人を <u>迎え</u>に 行った。', ['むかえ', 'おくり', 'むかい', 'げい'], '迎える = むかえる (meet, pick up). 送る おくる is see off; 向かい むかい is opposite.', 'dir read read', ['おくり is 送り (seeing someone off), the opposite. Going to meet a friend who arrives is むかえ.', 'むかい is 向かい (the opposite side). It sounds close, but 迎 is むかえる.', 'げい is 迎 in words like かんげい (welcome). Before に 行く, the Japanese reading むかえ is used.']], ['夜に なって、<u>温度</u>が 急に 下がった。', ['おんど', 'おんと', 'うんど', 'おんどう'], '温度 = おんど (temperature). 度 is ど, short.', 'voice read long', ['おんと leaves 度 unvoiced. It is ど: おんど.', 'うん is not a reading of 温. It is おん.', 'おんどう adds a long う. 度 is short: おんど.']], ['毎日 <u>努力</u>して、試験に 合格した。', ['どりょく', 'どうりょく', 'どりき', 'どりく'], '努力 = どりょく (effort). 力 is りょく here.', 'long read you', ['どうりょく adds a long う, which makes a different word (power for machines). 努 is ど.', 'りき is a reading of 力 in other words. In 努力 it is りょく.', 'どりく drops the small ょ. 力 is りょく.']]]);
add(3, 'ko', [['兄は 大学の 試験に <u>ごうかく</u>した。', ['合格', '合客', '合確', '会格'], 'ごうかく = 合格 (pass an exam).', 'shape read shape', ['客 is きゃく (guest). Its bottom looks like the right side of 格, but it sits under a roof.', '確 is かく too (確認). ごうかく uses 格.', '会 is かい (meet). Its top looks like 合, but ごう is 合.']], ['大学で <u>けいざい</u>を 勉強して います。', ['経済', '軽済', '経渡', '経財'], 'けいざい = 経済 (economics).', 'shape shape read', ['軽 is かるい (light). It has the same right side as 経.', '渡 is わたる (cross). It has 氵 like 済.', '財 is ざい too (ざいさん, property), but けいざい uses 済.']], ['この ボタンを <u>おして</u> ください。', ['押して', '指して', '打して', '投して'], 'おす = 押す (push).', 'shape shape shape', ['指す is さす (point at). It has 扌 like 押, but おす is 押す.', '打 is うつ (hit). It also has 扌.', '投 is なげる (throw). It also has 扌.']], ['二つの 品物を <u>くらべて</u> から 買う。', ['くらべて', '北べて', '批べて', '此べて'], 'くらべる = くらべる: two people side by side.', 'shape shape shape'], ['部長に けっかを <u>ほうこく</u>した。', ['報告', '方告', '報刻', '放告'], 'ほうこく = 報告 (report). 方, 放 (ほう) and 刻 (こく) share its sounds.', 'read read read', ['方 is ほう too (direction). ほうこく uses 報.', '刻 is こく too (carve, time). ほうこく uses 告.', '放 is ほう too (release). ほうこく uses 報.']], ['雪で 電車が <u>おくれた</u>。', ['遅れた', '過れた', '違れた', '達れた'], 'おくれる = 遅れる (be late, delayed).', 'shape shape shape', ['過 is すぎる (pass). It has 辶 like 遅.', '違 is ちがう (differ). It also has 辶.', '達 is たち, as in 友達. It also has 辶.']], ['駅で 友人と <u>わかれた</u>。', ['別れた', '列れた', '判れた', '例れた'], 'わかれる = 別れる (part from someone). 列, 判 and 例 all share the 刂 knife on the right.', 'shape shape shape', ['列 is れつ (line). It has 刂 like 別.', '判 is はん (judge). It also has 刂.', '例 is れい (example). It has 列 on the right.']], ['私は 彼の 話を <u>しんじて</u> いる。', ['信じて', '借じて', '住じて', '任じて'], 'しんじる = 信じる (believe): 亻 person + 言 word — a person standing by their word.', 'shape shape shape', ['借 is かりる (borrow). It has 亻 like 信.', '住 is すむ (live). It also has 亻.', '任 is にん (duty). It also has 亻.']], ['来週の 会議に <u>さんか</u>する 予定だ。', ['参加', '参化', '参助', '残加'], 'さんか = 参加 (take part). 加 is 力 + 口; 化 has 亻 on the left.', 'read shape read', ['化 is か too (change). さんか uses 加.', '助 is たすける (help). It has 力 like 加.', '残 is ざん (remain). さんか starts with 参.']], ['決勝で 相手に <u>まけた</u>。', ['負けた', '員けた', '貧けた', '費けた'], 'まける = 負ける (lose). Only 負 has ク on top; 員, 貧 and 費 look alike at the bottom.', 'shape shape shape', ['員 is いん (member). Its bottom looks like the bottom of 負.', '貧 is まずしい (poor). It has the same bottom.', '費 is ひ (cost). It has the same bottom too.']], ['この 問題は とても <u>むずかしい</u>。', ['難しい', '漢しい', '勤しい', '観しい'], 'むずかしい = 難しい (difficult). 難 and 漢 share the left side; 難 has 隹 on the right.', 'shape shape shape', ['漢 is かん, as in 漢字. It shares the left side with 難.', '勤 is つとめる (work for). It shares the left side with 難.', '観 is かん (view). It also contains 隹.']], ['飛行機は 予定より 早く <u>とうちゃく</u>した。', ['到着', '倒着', '到差', '列着'], 'とうちゃく = 到着 (arrival). 倒 (たおれる) adds 亻; 差 has the same top as 着.', 'shape shape shape', ['倒 is たおれる (fall over). It adds 亻 to 到.', '差 is さ (difference). It has the same top as 着.', '列 is れつ (line). It has 刂 like 到.']], ['週末、先生の お宅を <u>たずねた</u>。', ['訪ねた', '許ねた', '説ねた', '尋ねた'], 'たずねる = 訪ねる (visit). 尋ねる is also たずねる, but it means "ask"; visiting a person or place is 訪ねる.', 'shape shape read', ['許 is ゆるす (allow). It has 言 on the left like 訪.', '説 is せつ (explain). It also has 言 on the left.', '尋ねる is also read たずねる, but it means "ask a question". Visiting someone\'s home is 訪ねる.']]]);
add(3, 'vc', [['台風の えいきょうで、電車が ２時間（　　）。', ['おくれた', 'さがった', 'へった', 'のびた'], '電車が おくれる = the train is delayed.', 'colloc colloc l1', ['さがる = go down (prices, temperature). A train running late is おくれる.', 'へる = decrease in number. A train two hours late is おくれる.', 'のびる = get longer, like Indonesian "molor", but the train itself doesn\'t のびる. A late train おくれる.']], ['彼は 約束を 必ず 守るので、みんなから（　　）されて いる。', ['信頼', '信号', '安定', '感動'], '信頼される = be trusted.', 'shape colloc colloc', ['信号 = traffic light. It shares 信 with 信頼, but only 信頼 means trust.', '安定 = stability. A person isn\'t "stabilized" by everyone; keeping promises earns trust: 信頼される.', '感動 = being deeply moved. Keeping promises doesn\'t move people to tears; it earns trust: 信頼される.']], ['この 薬は よく（　　）ので、すぐに 熱が 下がった。', ['きく', 'なおる', 'かかる', 'とどく'], '薬が きく = medicine works. The illness なおる, not the medicine.', 'l1 colloc colloc', ['なおる = (an illness) gets better. The illness なおる, but the medicine きく.', 'かかる = take (time, money), or catch an illness (病気に かかる). Medicine doesn\'t かかる; it きく.', 'とどく = arrive, reach (a parcel). Medicine working is きく.']], ['失敗しても（　　）ずに、もう一度 やって みよう。', ['あきらめ', 'まちがえ', 'わすれ', 'すて'], 'あきらめずに = without giving up.', 'colloc colloc l1', ['まちがえる = make a mistake. "Try again without making mistakes" doesn\'t follow 失敗しても; you try again without giving up: あきらめずに.', 'わすれる = forget. After a failure you try again without giving up: あきらめずに.', 'すてる = throw away (things). English "give up" may suggest it, but giving up is あきらめる.']], ['人気の ラーメン屋の 前に、長い 行列が（　　）いた。', ['できて', 'たって', 'ならべて', 'あいて'], '行列が できる = a line forms.', 'l1 dir colloc', ['たつ = stand. People stand in a line, but the line itself forms: 行列が できる.', 'ならべる is transitive: you line things up (〜を ならべる). With 行列が, use できる.', 'あく = open, become empty. A line doesn\'t open; it forms: できる.']], ['社長の 話は 短くて、ポイントが（　　）して いた。', ['はっきり', 'のんびり', 'ぐっすり', 'がっかり'], 'はっきり する = be clear.', 'field field field', ['のんびり = relaxed, slow-paced. A short talk with a clear point is はっきり.', 'ぐっすり = (sleep) soundly. It goes with ねる, not with a point.', 'がっかり = disappointed. That is a feeling, not how clear a point is.']], ['山田さんは、プロジェクトを まとめる（　　）に 選ばれた。', ['リーダー', 'ルール', 'サービス', 'レベル'], 'The person who leads a project = リーダー.', 'colloc colloc colloc', ['ルール = rule. A person is chosen as a leader, not as a rule.', 'サービス = service. A person who brings a project together isn\'t a service; they are the リーダー.', 'レベル = level. A person who brings a project together is the リーダー.']], ['雨の ため、試合は 来週に（　　）された。', ['えんき', '遅刻', 'ていし', 'きゅうけい'], 'えんき = postpone.', 'l1 l1 colloc', ['遅刻 = a person arriving late. A match moved to next week is えんき.', 'ていし = stopping (a machine, a service). A match moved to another day is えんき.', 'きゅうけい = a break. A short rest doesn\'t move the match to next week: えんき.']], ['ねぼうして、いつもの 電車に（　　）。', ['乗り遅れた', '遅刻した', '乗りかえた', '間に合った'], '電車に 乗り遅れる = miss a train.', 'colloc field field', ['ちこくする is for being late to school, work or a meeting (会社に 遅刻する). Missing a train is 電車に 乗り遅れる.', 'のりかえる = change trains. Oversleeping makes you MISS the train: 乗り遅れた.', 'まにあう = make it in time, the opposite. Oversleeping means you missed it.']], ['新しい 職場に（　　）までに、半年 かかった。', ['慣れる', '覚える', '知る', '似る'], '〜に 慣れる = get used to.', 'colloc colloc l1', ['おぼえる = memorize, and takes を. Adjusting to a workplace is 〜に 慣れる.', 'しる takes を and means learning a fact. Getting used to a place is 慣れる.', 'にる = resemble (父に 似る). The に particle tempts you, but adjusting is 慣れる.']], ['子どもの ころの 夢を（　　）、パイロットに なった。', ['かなえて', 'あきらめて', '守って', '決めて'], '夢を かなえる = make a dream come true.', 'field colloc colloc', ['あきらめる = give up. Becoming a pilot means the dream came true: かなえた.', 'まもる goes with promises and rules (約束を 守る). A dream is realized: かなえる.', 'きめる = decide. Deciding on a dream isn\'t the same as achieving it: かなえる.']], ['試合に 負けて、選手たちは（　　）して いた。', ['がっかり', 'うっかり', 'すっきり', 'しっかり'], 'がっかりする = be disappointed.', 'field field field', ['うっかり = carelessly, by mistake. After losing, players feel disappointed: がっかり.', 'すっきり = refreshed, clear. Losing doesn\'t make you feel refreshed.', 'しっかり = firmly, reliably. After losing, players are disappointed: がっかり.']], ['大事な 書類を（　　）すてて しまった。', ['うっかり', 'がっかり', 'ぐっすり', 'きっぱり'], 'うっかり = carelessly, by mistake. 〜て しまった shows it wasn\'t on purpose.', 'field field field', ['がっかり = disappointed. Throwing something away by mistake is うっかり.', 'ぐっすり = (sleep) soundly. A mistake is うっかり.', 'きっぱり = flatly, firmly (refuse, quit). てしまった shows an accident: うっかり.']], ['昨夜は 疲れて いたので、朝まで（　　）眠った。', ['ぐっすり', 'ぎっしり', 'すっかり', 'がっかり'], 'ぐっすり 眠る = sleep soundly.', 'field field field', ['ぎっしり = packed tight (a bag, a schedule). Deep sleep is ぐっすり.', 'すっかり = completely (すっかり 忘れた). Sleep goes with ぐっすり.', 'がっかり = disappointed. Sleep goes with ぐっすり.']], ['かばんに 本が（　　）入って いて、重い。', ['ぎっしり', 'ぐっすり', 'うっかり', 'そっくり'], 'ぎっしり = packed full.', 'field field field', ['ぐっすり is only for sleep. A full bag is ぎっしり.', 'うっかり = by mistake. A heavy, packed bag is ぎっしり.', 'そっくり = look exactly alike. A packed bag is ぎっしり.']], ['天気予報に よると、明日は 雨が 降る（　　）が 高い そうだ。', ['かのうせい', '予定', '計画', '都合'], '〜かのうせいが 高い = there is a high chance that.', 'colloc field field', ['よてい = a plan. Rain isn\'t planned; chance is かのうせい.', 'けいかく = a plan people make. Rain has a chance: かのうせい.', 'つごう = convenience / schedule (つごうが いい). Rain has a chance: かのうせい.']], ['値段が 高すぎて、買うか どうか（　　）いる。', ['迷って', '間違えて', '決まって', 'くらべて'], '〜か どうか 迷う = can\'t decide whether to.', 'field field field', ['まちがえる = make a mistake. Unable to decide is 迷う.', 'きまる = be decided, the opposite. "Whether to buy" shows you haven\'t decided: 迷って いる.', 'くらべる = compare two things (AとBを くらべる). Whether or not to buy is 迷う.']], ['この 町は みどりが 多くて、（　　）が いい。', ['かんきょう', '景気', '関係', 'きげん'], 'かんきょうが いい = a good environment / surroundings.', 'field field field', ['けいき = the economy (景気が いい = the economy is good). Green spaces make the environment good: かんきょう.', 'かんけい = relationship. Lots of green describes surroundings: かんきょう.', 'きげん = mood (きげんが いい = in a good mood). It\'s for people, not towns.']], ['この 薬を 飲むと 眠く なる（　　）が あるので、運転しないで ください。', ['おそれ', 'つもり', 'はず', 'ため'], '〜おそれが ある = there is a risk that (something bad).', 'nuance nuance nuance', ['つもり = a person\'s intention. Medicine has no intention; the risk is おそれ.', 'はず is used as はずだ (it should be). 〜はずが ある isn\'t used for risks; that\'s 〜おそれが ある.', 'ため = purpose or cause. "There is a risk" is おそれが ある.']], ['電車の 中で 足を（　　）、「すみません」と 言われた。', ['ふまれて', 'ふんで', '払われて', 'かけて'], '足を ふまれる = get your foot stepped on (passive).', 'dir colloc colloc', ['If you stepped on someone (ふんで), YOU would say すみません. Someone apologized to you, so your foot was stepped on: ふまれて.', 'はらわれる = be paid / brushed off. Someone said sorry because they stepped on your foot.', 'あしを かける = trip someone. The apology fits stepping on a foot: ふまれて.']], ['日本の 人口は 年々（　　）いる。', ['へって', '下がって', '落ちて', '低く なって'], '人口が へる = the population decreases.', 'colloc colloc l1', ['さがる is for prices, temperature and levels. A number of people decreases: へる.', 'おちる = fall or drop (an object, a grade). A population decreases: へる.', 'English "lower" or Indonesian "turun" fits both, but population (a number of people) uses へる.']], ['ぶっかが（　　）、生活が 苦しく なった。', ['上がって', '増えて', '高まって', 'のびて'], 'ぶっかが 上がる = prices rise.', 'colloc colloc colloc', ['ふえる is for numbers and amounts (人口が 増える). Prices rise: 上がる.', 'たかまる is for feelings and interest (関心が 高まる). Prices rise: 上がる.', 'のびる = grow, extend (背が のびる, 売り上げが のびる). Prices rise: 上がる.']], ['この 映画は 実際に あった 事件を（　　）に して いる。', ['もと', 'うら', 'あと', 'わけ'], '〜を もとに する = be based on.', 'colloc colloc colloc', ['うら = the back side. "Based on" is 〜を もとに する.', 'あと = after. "Based on" is 〜を もとに する.', 'わけ = reason. "Based on a real event" is 〜を もとに する.']], ['すみませんが、この 荷物を しばらく（　　）もらえませんか。', ['預かって', '預けて', '貸して', '借りて'], '預かる = keep something for someone (they ask you to hold it).', 'dir dir dir', ['あずける is what YOU do (leave it with someone). You ask the other person to hold it: 預かって もらう.', 'かす = lend. You\'re asking them to look after your bag, not lend it: 預かる.', 'かりる = borrow. You want them to hold your bag: 預かって もらう.']], ['駅前に 新しい ビルが（　　）。', ['建った', '建てた', '起きた', '出た'], 'ビルが 建つ = a building is built (intransitive, with が).', 'dir colloc colloc', ['たてる needs を (ビルを 建てた). With が, use the intransitive 建つ: ビルが 建った.', 'おきる = get up or happen (じこが 起きる). A building 建つ.', 'でる = come out or appear. For a new building: 建った.']], ['毎月 給料の 一部を 銀行に（　　）いる。', ['ちょきんして', '預かって', '借りて', '払って'], 'ちょきんする = save money (in a bank).', 'field dir dir', ['あずかる is the bank\'s side (the bank keeps your money). You put it in: 預けて or ちょきんして.', 'かりる = borrow, the opposite. Putting part of your pay into the bank is ちょきん.', 'はらう = pay. Money you put aside is ちょきん.']], ['計画を 実行する 前に、みんなの（　　）を 聞いた。', ['意見', '意味', '意外', 'いし'], '意見を 聞く = ask for opinions.', 'field field field', ['いみ = meaning. Before carrying out a plan, you ask everyone\'s opinion: 意見.', 'いがい = unexpected (a な-adjective). It can\'t be "heard"; opinions are 意見.', 'いし = will, determination. Before carrying out a plan, you ask for opinions: 意見.']], ['彼は 遅刻した 理由を 長々と（　　）した。', ['言いわけ', '言葉', '言い方', '伝言'], '言いわけを する = make excuses.', 'field field field', ['ことば = word, language. Explaining at length why you were late is making excuses: 言いわけ.', 'いいかた = way of saying something. Long reasons for being late are 言いわけ.', 'でんごん = a message passed on for someone. Excuses for being late are 言いわけ.']], ['テストの けっかに（　　）できなくて、もう 一度 受ける ことに した。', ['満足', '安心', '注意', '感心'], '〜に 満足する = be satisfied with.', 'field field field', ['あんしん = relief. Being unhappy with the result leads to retaking: not 満足.', 'ちゅうい = care, caution. Retaking a test is about not being satisfied: 満足.', 'かんしん = be impressed by someone else. Your own result: 満足.']], ['電車の 中で（　　）を して いる 人が 多い。', ['居眠り', '昼寝', 'ねぼう', '夜ふかし'], '居眠り = dozing off while sitting (on a train, in class).', 'field field field', ['ひるね = a planned afternoon nap, usually lying down. Dozing on a train is 居眠り.', 'ねぼう = oversleeping in the morning. Dozing on a train is 居眠り.', 'よふかし = staying up late. Dozing on a train is 居眠り.']], ['パソコンが 急に（　　）、データが 消えて しまった。', ['かたまって', '止めて', 'こわして', '切って'], 'パソコンが かたまる = the computer freezes (intransitive, with が).', 'dir dir dir', ['とめる needs someone stopping it (〜を 止める). With が, it\'s intransitive: かたまる or 止まる.', 'こわす = break something on purpose (〜を こわす). With が, the computer こわれる or かたまる.', 'きる = cut / switch off (〜を 切る). With が, the computer freezes: かたまる.']], ['彼は 約束の 時間に 遅れても、全然（　　）いない。', ['はんせいして', 'かんしゃして', '満足して', '期待して'], 'はんせいする = reflect on your fault and feel sorry.', 'field field field', ['かんしゃ = gratitude. Someone who is late "not at all ___" is not sorry: はんせい.', 'まんぞく = satisfaction. Being late calls for はんせい (regret).', 'きたい = expectation, hope. Being late and not sorry is はんせいして いない.']], ['雨の 日は 道が（　　）やすいので、気を つけて ください。', ['すべり', 'ころび', 'おち', 'たおれ'], '道が すべる = the road is slippery.', 'l1 l1 l1', ['ころぶ is for people falling. The road doesn\'t fall; it\'s slippery: すべりやすい.', 'おちる = fall from a height. The road is slippery: すべる.', 'たおれる = fall over (a person, a tree). Roads are slippery: すべる.']], ['この 料理は 作り方が かんたんで、（　　）が かからない。', ['手間', '手段', '手本', '手前'], '手間が かかる = take time and effort.', 'field field field', ['しゅだん = a means, a method. Effort is 手間: 手間が かからない.', 'てほん = a model, an example to copy. Effort is 手間.', 'てまえ = this side / in front of. Effort is 手間.']], ['友だちに 借りた 本を よごして しまい、（　　）。', ['あやまった', 'かんしゃした', 'お礼を 言った', 'あいさつした'], 'You dirtied a borrowed book, so you apologized: あやまる.', 'field l1 situ', ['かんしゃ = thanks. Damaging a book needs an apology: あやまる.', 'English and Indonesian "terima kasih" pair with borrowing, but dirtying the book needs an apology: あやまる.', 'あいさつ = a greeting. Damaging something needs an apology: あやまる.']], ['もし 何か あったら、えんりょなく（　　）ください。', ['声を かけて', '声を 出して', '口を 出して', '耳を かして'], '声を かける = call out to someone, talk to them.', 'colloc colloc colloc', ['こえを だす = make a sound, raise your voice. To ask for help, you 声を かける (speak to someone).', 'くちを だす = butt in on others\' business. Asking for help is 声を かける.', 'みみを かす = lend an ear, listen. The other person would be the one to 声を かける.']], ['彼女は 料理が 上手で、特に ケーキを 作るのが（　　）だ。', ['得意', '有名', '自信', '満足'], '〜が 得意だ = be good at.', 'field l1 field', ['ゆうめい = famous. "作るのが 有名" isn\'t natural; being good at something is 得意.', 'じしん is a noun (自信が ある). 〜のが 自信だ isn\'t Japanese; use 得意だ.', 'まんぞく = satisfaction. Being good at making cakes is 得意.']], ['試験の 前に、もう 一度 間違えた 問題を（　　）。', ['ふくしゅうした', '予習した', '出題した', '解決した'], 'ふくしゅうする = review what you already studied.', 'field field l1', ['よしゅう = study ahead before a class. Problems you already got wrong are reviewed: ふくしゅう.', 'しゅつだい = set a question (what the teacher does). You review: ふくしゅう.', 'かいけつ = solve a problem or situation. Going over test questions again is ふくしゅう.']]]);
add(3, 'vp', [['彼は いつも ぶつぶつ 言って いる。', ['彼は いつも もんくを 言って いる。', '彼は いつも じょうだんを 言って いる。', '彼は いつも お礼を 言って いる。', '彼は いつも うそを 言って いる。'], 'ぶつぶつ 言う = grumble = もんくを 言う.', 'field dir field', ['じょうだん = joke. ぶつぶつ 言う is grumbling, not joking: もんくを 言う.', 'お礼 = thanks, close to the opposite. ぶつぶつ 言う is complaining: もんくを 言う.', 'うそ = lie. ぶつぶつ 言う is complaining in a low voice, not lying.']], ['旅行の 費用は いくらですか。', ['旅行に かかる お金は いくらですか。', '旅行に 必要な 時間は どのくらいですか。', '旅行で 行く 場所は どこですか。', '旅行で とまる ホテルは どこですか。'], '費用 = cost.', 'field field field', ['費用 is money (いくら), not time.', '費用 is the money a trip costs, not the place you go.', 'Hotel costs are part of 費用, but 費用 is the money, not which hotel.']], ['彼女は たちまち 人気者に なった。', ['彼女は すぐに 人気者に なった。', '彼女は だんだん 人気者に なった。', '彼女は やっと 人気者に なった。', '彼女は ふたたび 人気者に なった。'], 'たちまち = instantly = すぐに.', 'dir field field', ['だんだん = gradually, the opposite of たちまち (instantly).', 'やっと = finally, after a long wait. たちまち is instantly: すぐに.', 'ふたたび = again. たちまち is about speed, not repeating: すぐに.']], ['この 店は いつも がらがらだ。', ['この 店は いつも 客が 少ない。', 'この 店は いつも 客が 多い。', 'この 店は いつも 値段が 安い。', 'この 店は いつも うるさい。'], 'がらがら = (nearly) empty.', 'dir field field', ['客が 多い is the opposite. がらがら means (nearly) empty: 客が 少ない.', 'がらがら is about how many customers there are, not price.', 'がらがら can be a rattling sound, but この 店は がらがらだ means it is almost empty.']], ['彼は さっさと 帰って しまった。', ['彼は すぐに 帰って しまった。', '彼は ゆっくり 帰って しまった。', '彼は 一人で 帰って しまった。', '彼は だまって 帰って しまった。'], 'さっさと = quickly, without hesitating ≈ すぐに.', 'field field field', ['ゆっくり = slowly, the opposite of さっさと.', 'ひとりで = alone. さっさと is about speed.', 'だまって = without a word. さっさと is about speed.']], ['この 部屋は 散らかって いる。', ['この 部屋は 物が あちこちに ある。', 'この 部屋は 物が 少ない。', 'この 部屋は 物が きちんと ならんで いる。', 'この 部屋は 物が 新しい。'], '散らかって いる = messy, things everywhere.', 'field field field', ['ものが すくない = few things. 散らかって いる means things are all over the place.', 'きちんと ならんで いる = neatly arranged, the opposite.', 'ものが 新しい = things are new. 散らかって いる is about mess.']], ['彼の 説明は あいまいだった。', ['彼の 説明は はっきり しなかった。', '彼の 説明は 長かった。', '彼の 説明は 間違って いた。', '彼の 説明は 速かった。'], 'あいまい = vague ≈ はっきり しない.', 'field field field', ['ながい = long. A vague explanation can be short; あいまい is about clarity.', 'まちがって いる = wrong. A vague explanation isn\'t necessarily wrong, just unclear.', 'はやい = fast. あいまい is about clarity.']], ['母は 私の 帰りが 遅いので いらいらして いた。', ['母は 私の 帰りが 遅いので 怒って いた。', '母は 私の 帰りが 遅いので 心配して いた。', '母は 私の 帰りが 遅いので 悲しんで いた。', '母は 私の 帰りが 遅いので 寝て いた。'], 'いらいら = irritated, annoyed ≈ 怒る.', 'l1 field field', ['しんぱい = worry. A parent waiting might worry, but いらいら is irritation.', 'かなしむ = feel sad. いらいら is irritation.', 'ねる = sleep. いらいら is irritation.']], ['あの 選手は 引退した。', ['あの 選手は 選手を やめた。', 'あの 選手は けがを した。', 'あの 選手は チームを 変えた。', 'あの 選手は 試合に 勝った。'], '引退する = retire ≈ 選手を やめる.', 'field field field', ['けがを する = get injured. Injury can cause retirement, but 引退 means quitting.', 'チームを かえる = change teams. 引退 means stopping completely.', 'しあいに かつ = win a match. 引退 means retiring.']], ['会議は 予定より のびた。', ['会議は 予定より 長く なった。', '会議は 予定より 短く なった。', '会議は 予定より 早く 始まった。', '会議は 予定より 遅く 始まった。'], 'のびる = run longer ≈ 長く なる.', 'field field l1', ['みじかく なる = became shorter, the opposite.', 'はやく 始まる = started earlier. のびる is about lasting longer.', 'えんき means postponed, which is like starting later. But のびる here means the meeting ran longer.']], ['この 仕事は 来週までに 仕上げなければ ならない。', ['この 仕事は 来週までに 終わらせなければ ならない。', 'この 仕事は 来週までに 始めなければ ならない。', 'この 仕事は 来週までに 決めなければ ならない。', 'この 仕事は 来週までに 届けなければ ならない。'], '仕上げる = finish, complete ≈ 終わらせる.', 'field field field', ['はじめる = start, the opposite. 仕上げる is finishing.', 'きめる = decide. 仕上げる is completing the work.', 'とどける = deliver. Delivery can come after finishing, but 仕上げる is finishing.']], ['彼女は おしゃべりだ。', ['彼女は よく 話す。', '彼女は よく 笑う。', '彼女は 話が うまい。', '彼女は 声が 大きい。'], 'おしゃべり = talkative ≈ よく 話す.', 'field l1 field', ['よく わらう = laughs a lot. おしゃべり is about talking a lot.', 'はなしが うまい = a good speaker. おしゃべり is talking a LOT, not talking well.', 'こえが 大きい = loud voice. おしゃべり is about how much someone talks.']], ['この 問題は しきゅう 解決しなければ ならない。', ['この 問題は すぐに 解決しなければ ならない。', 'この 問題は いつか 解決しなければ ならない。', 'この 問題は みんなで 解決しなければ ならない。', 'この 問題は 一人で 解決しなければ ならない。'], 'しきゅう = urgently ≈ すぐに.', 'field field field', ['いつか = someday. しきゅう means right away.', 'みんなで = together. しきゅう is about time, not who.', 'ひとりで = alone. しきゅう is about time, not who.']], ['田中さんは しんちょうな 人だ。', ['田中さんは よく 注意して 行動する 人だ。', '田中さんは 行動が 速い 人だ。', '田中さんは 声が 小さい 人だ。', '田中さんは よく 怒る 人だ。'], 'しんちょう = careful, cautious ≈ よく 注意して 行動する.', 'field field field', ['こうどうが はやい = acts fast. A しんちょう person acts carefully, often slowly.', 'こえが 小さい = quiet voice. しんちょう is about being careful.', 'よく おこる = gets angry a lot. しんちょう is about being careful.']]]);
add(3, 'vu', [['中止', ['雨の ため、運動会は 中止に なった。', '体に 悪いので、たばこを 中止して ください。', '車が 交差点で 急に 中止した。', '彼は 先月 会社を 中止した。'], '中止 = cancel an event. Quitting a habit is やめる; a car stopping is 止まる. "Stop" in English/Indonesian ("berhenti") covers all of them.', 'l1 l1 l1', ['Quitting a habit is やめる: たばこを やめる. 中止 is for cancelling events or plans.', 'A car stopping is 止まる. 中止 is for cancelling events or plans.', 'Quitting a company is やめる: 会社を やめる. 中止 is for events or plans.']], ['預ける', ['ホテルの フロントに 荷物を 預けた。', '友だちに 手紙を 預けて 読んだ。', '毎朝 体を 預けて 運動する。', '先生に 質問を 預けた。'], '預ける = leave something in someone\'s care ("menitipkan").', 'l1 l1 l1', ['Giving a letter to a friend is 渡す. 預ける means leaving it in their care, so you couldn\'t read it.', 'Moving your body for exercise is 体を 動かす. 預ける is leaving something in someone\'s care.', 'Asking a teacher is 質問する: 先生に 質問した. 預ける is leaving something in someone\'s care.']], ['似合う', ['その ぼうし、よく 似合って いますね。', 'この 二つの 答えは よく 似合って いる。', '彼と 私は 意見が 似合う。', '天気が 似合って よかった。'], '似合う = suits (someone) ("cocok dipakai"). Two similar things are 似て いる ("mirip").', 'l1 l1 l1', ['Two similar things are 似て いる ("mirip"). 似合う is about clothes or style suiting a person.', 'Sharing an opinion is 意見が 合う. 似合う is about clothes or style suiting a person.', 'Good weather is 天気が いい. 似合う is about clothes or style suiting a person.']], ['支度', ['今、出かける 支度を して いる ところだ。', '宿題の 支度を 先生に 出した。', '会議の 支度は 3時に 始まる。', '彼は 支度が 高い 人だ。'], '支度 = getting ready (to go out, a meal).', 'l1 l1 l1', ['Homework is handed in: 宿題を 出した. 支度 is getting ready.', 'A meeting starts: 会議は 3時に 始まる. 支度 is preparation, not the event.', 'Tall is 背が 高い. 支度 means getting ready.']], ['取り消す', ['ホテルの 予約を 取り消した。', 'こくばんの 字を 取り消した。', '電気を 取り消して 寝た。', '彼は 会社を 取り消した。'], '取り消す = cancel (a booking, an order, a statement).', 'l1 l1 l1', ['Writing on a board is erased: 字を 消した. 取り消す is cancelling a booking or a statement.', 'Lights are turned off: 電気を 消して. 取り消す is cancelling.', 'Quitting a job is 会社を 辞めた. 取り消す is cancelling.']], ['あわてる', ['ねぼうして、あわてて 家を 出た。', '彼は あわてた 声で 静かに 話した。', '試験に 合格して あわてた。', 'あわてた 天気で かさを 忘れた。'], 'あわてる = panic, rush in a hurry.', 'l1 l1 l1', ['あわてる and 静かに contradict each other. Panicking people don\'t speak calmly.', 'Passing an exam makes you happy: 喜んだ. あわてる is panicking and rushing.', 'Weather doesn\'t panic. Unstable weather is 変な 天気 or 天気が 変わりやすい.']], ['合図', ['先生の 合図で、みんな いっせいに 走り出した。', '駅で 友だちと 3時に 合図した。', '道に 迷ったので、地図の 合図を 見た。', '電話の 合図が 鳴った。'], '合図 = a signal (a sign, gesture, or sound telling people to act).', 'l1 l1 l1', ['Agreeing on a meeting time is 約束した. 合図 is a signal to act.', 'Marks on a map are 記号 or しるし. 合図 is a signal given to people.', 'A ringing phone is 電話が 鳴った, or 着信. 合図 is a signal to act.']], ['目立つ', ['赤い 服を 着て いると、遠くからでも 目立つ。', '目が 疲れたので、少し 目立った。', '朝 6時に 目立って、顔を 洗った。', '彼の 話は 目立って よく わかった。'], '目立つ = stand out, be noticeable.', 'l1 l1 l1', ['Resting your eyes is 目を 休めた. 目立つ is standing out.', 'Waking up is 目が 覚めて. 目立つ is standing out.', 'Easy to understand is わかりやすい. 目立つ is being noticeable.']], ['つめる', ['かばんに 服を つめて、旅行の じゅんびを した。', '電車が つめて いて 座れなかった。', '水道の 水を つめて 飲んだ。', '窓を つめて 寒さを ふせいだ。'], 'つめる = pack, stuff things into a space.', 'dir l1 l1', ['A crowded train is 込んで いて. つめる needs someone packing something (を つめる).', 'Tap water is poured: 水を くんで / 入れて. つめる is packing things in tightly.', 'Windows are closed: 窓を 閉めて. つめる is packing.']], ['間に合う', ['走ったので、最終電車に 間に合った。', 'この 服は 私の サイズに 間に合う。', '二人は 意見が 間に合って いる。', '駅で 友だちと 間に合った。'], '間に合う = be in time.', 'l1 l1 l1', ['A fitting size is サイズに 合う. 間に合う is about time.', 'Agreeing is 意見が 合って いる. 間に合う is being in time.', 'Meeting a friend is 友だちと 会った. 間に合う is being in time.']], ['かたづける', ['使った 道具は 元の 場所に かたづけて ください。', '問題が かたづけて よかった。', 'つくえの 上が かたづけて いる。', '料理を かたづけて おいしく 作った。'], 'かたづける = put away, tidy up (someone does it, with を).', 'dir dir l1', ['With が, use the intransitive form: 問題が かたづいて よかった.', 'With が and a state, it\'s つくえの 上が かたづいて いる.', 'Cooking well is 上手に 作った. かたづける is tidying up.']]]);
add(3, 'gf', [['空が 暗いね。雨が 降り（　　）だから、かさを 持って いこう。', ['そう', 'よう', 'らしい', 'みたい'], 'Stem + そうだ = looks like it is about to.', 'form form form', ['よう needs a full verb or の (降る ようだ). It doesn\'t follow the stem 降り. "About to rain" is 降りそうだ.', 'らしい needs a full verb (降る らしい) and is hearsay. Looking at the sky, it\'s 降りそうだ.', 'みたい needs a full verb (降る みたい). After the stem 降り, use そう.']], ['彼は 医者の（　　）、自分の {健康|けんこう}には 気を つけない。', ['くせに', 'おかげで', 'せいで', 'ために'], 'Nの くせに = even though (critical tone).', 'nuance nuance nuance', ['おかげで is "thanks to" for a good result. Not taking care of himself is criticism: くせに.', 'N の せいで blames someone else. He is the doctor: N の くせに.', 'N の ために is "for N" or "because of N". A doctor who doesn\'t care is くせに.']], ['日本に 住んで いる（　　）、日本語が 上手に なった。', ['うちに', 'ところで', 'までに', 'ばかりに'], '〜て いる うちに = while (a change happens gradually).', 'nuance nuance nuance', ['ところで is "by the way" or "even if". Gradual change while living there is うちに.', 'までに is a deadline. It can\'t follow 〜て いる. Use うちに.', 'ばかりに is "just because" with a bad result. Getting good at Japanese is good: うちに.']], ['先生の（　　）、試験に 合格できました。', ['おかげで', 'せいで', 'くせに', 'わりに'], 'おかげで = thanks to (good result). せいで is for a bad result.', 'nuance nuance nuance', ['せいで blames a cause for a bad result. Passing is good: おかげで.', 'くせに criticizes "even though". Thanks to the teacher is おかげで.', 'わりに means "considering". Use おかげで.']], ['この レストランは 値段の（　　）、おいしい。', ['わりに', 'ように', 'くせに', 'せいで'], 'Nの わりに = considering, for (better/worse than expected).', 'nuance nuance nuance', ['N の ように means "like N". Good food considering the price is わりに.', 'くせに criticizes a person. Praise for a restaurant is わりに.', 'せいで blames a bad result. Tasty food is good: わりに.']], ['部屋が 暗い（　　）、電気を つけたら どう？', ['なら', 'のに', 'ても', 'ば'], '〜なら = if that is the case (giving advice).', 'nuance form form', ['のに is "even though". Being dark is the reason to turn on the light: なら.', 'An い-adjective becomes 暗くても, not 暗いても. And "even if" doesn\'t fit: なら.', 'An い-adjective becomes 暗ければ, not 暗いば. With 暗い as it is, use なら.']], ['子どもの とき、私は 野菜が きらいだったのに、母に むりやり 野菜を（　　）。', ['食べさせられた', '食べさせた', '食べられた', '食べさせて もらった'], 'Causative-passive: my mother made me eat vegetables, even though I hated them.', 'pcv pcv dir', ['食べさせた means YOU made your mother eat. You hated vegetables, and she forced you: 食べさせられた.', '食べられた is passive: your mother ate the vegetables. You were made to eat: 食べさせられた.', '食べさせて もらった means she kindly let you eat. むりやり (by force) needs 食べさせられた.']], ['雨（　　）、たくさんの 人が 集まった。', ['にもかかわらず', 'によって', 'について', 'に対して'], 'Nにもかかわらず = despite.', 'nuance nuance nuance', ['によって means "by / because of". Rain doesn\'t make people come. Use にもかかわらず.', 'について means "about". "Despite the rain" is にもかかわらず.', 'に対して means "toward". Use にもかかわらず.']], ['新しい {法律|ほうりつ}（　　）、説明会が 開かれた。', ['について', 'として', 'に対して', 'にとって'], 'について = about, regarding.', 'nuance nuance nuance', ['として means "as (a role)". A meeting about the law is について.', 'に対して means "toward". Explaining a topic is について.', 'にとって means "for (someone)". Use について.']], ['私（　　）、家族が いちばん 大切だ。', ['にとって', 'について', 'によって', 'に対して'], 'Nにとって = for (from the viewpoint of) N ("bagi saya").', 'nuance nuance nuance', ['について means "about". "For me" (my view) is にとって.', 'によって means "by / depending on". Use にとって.', 'に対して means "toward". Use にとって.']], ['宿題を して いる（　　）、友だちが 遊びに 来た。', ['ところへ', 'ばかりで', 'うちは', 'までに'], '〜て いる ところへ = just as (someone was doing).', 'nuance nuance nuance', ['ばかりで means "only". A friend arriving just then is ところへ.', 'うちは means "as long as". Someone arriving is ところへ.', 'までに is a deadline. Use ところへ.']], ['一度 約束した（　　）、守らなければ ならない。', ['以上', 'うちに', 'ところ', 'たびに'], '〜た 以上 = now that, since (an obligation follows).', 'nuance nuance nuance', ['うちに means "while it lasts". "Now that I\'ve promised" is 以上.', 'ところ is about timing. An obligation is 以上.', 'たびに means "every time". Use 以上.']], ['彼は 来ると 言って いたから、もうすぐ 来る（　　）。', ['はずだ', 'わけがない', 'ことだ', 'ものだ'], 'はずだ = should (strong expectation).', 'nuance nuance nuance', ['わけがない means "no way". He said he\'d come: はずだ.', 'ことだ gives advice. An expectation is はずだ.', 'ものだ is a general truth. An expectation is はずだ.']], ['この 写真を 見る（　　）、ふるさとを 思い出す。', ['たびに', 'うちに', '最中に', 'とたんに'], 'Dictionary form + たびに = every time. とたんに needs the た-form.', 'nuance form form', ['うちに after a verb needs 〜て いる (見て いる うちに) and means "while". "Every time I see it" is たびに.', '最中に needs 〜て いる or N の. "Every time" is たびに.', 'とたんに needs the た-form (見た とたんに). "Every time" is 見る たびに.']]]);
add(3, 'go', [['彼女は　＿＿　★　＿＿　＿＿　{泣|な}き出した。', ['顔を', '見た', '私の', 'とたんに'], '彼女は 私の 顔を 見た とたんに {泣|な}き出した。 ★ = 顔を.', 'order order order', ['見た goes 3rd: 私の 顔を 見た とたんに.', '私の goes 1st, before 顔を.', 'とたんに goes 4th, after 見た.']], ['日本語を　＿＿　＿＿　★　＿＿　、毎日 練習して いる。', ['なる', '話せる', 'ように', 'ために'], '日本語を 話せる ように なる ために、毎日 練習して いる。 ★ = なる.', 'order order order', ['話せる goes 1st: 話せる ように なる ために.', 'ように goes 2nd, after 話せる.', 'ために goes last, before the comma.']], ['雨が　★　＿＿　＿＿　＿＿　、彼は 出かけた。', ['降って', 'にも', 'いる', 'かかわらず'], '雨が 降って いる にも かかわらず、彼は 出かけた。 ★ = 降って.', 'order order order', ['にも goes 3rd: 降って いる にも かかわらず.', 'いる goes 2nd, after 降って.', 'かかわらず goes last, before the comma.']], ['明日は 試験が あるので、今夜は　＿＿　＿＿　＿＿　★　。', ['いかない', 'わけには', '遊んで', 'いる'], '今夜は 遊んで いる わけには いかない。 〜わけには いかない = I can\'t (because of the situation). ★ = いかない.', 'order order order', ['わけには goes 3rd: 遊んで いる わけには いかない.', '遊んで goes 1st, right after 今夜は.', 'いる goes 2nd, after 遊んで.']], ['体の ために、毎朝　＿＿　★　＿＿　＿＿　いる。', ['歩く', 'ことに', '三十分', 'して'], '毎朝 三十分 歩く ことに して いる。 〜ことに して いる = a habit I decided on. ★ = 歩く.', 'order order order', ['ことに goes 3rd: 三十分 歩く ことに して いる.', '三十分 goes 1st, before the verb.', 'して goes last, before いる.']], ['彼は　＿＿　＿＿　★　＿＿　、料理も 上手だ。', ['ばかりで', '歌が', 'うまい', 'なく'], '彼は 歌が うまい ばかりで なく、料理も 上手だ。 〜ばかりで なく〜も = not only … but also. ★ = ばかりで.', 'order order order', ['歌が goes 1st: 歌が うまい ばかりで なく.', 'うまい goes 2nd, after 歌が.', 'なく goes last: ばかりで なく.']], ['もう 遅いので、暗く　★　＿＿　＿＿　＿＿　ほうが いい。', ['ならない', '家に', 'うちに', '帰った'], '暗く ならない うちに 家に 帰った ほうが いい。 〜ない うちに = before it happens. ★ = ならない.', 'order order order', ['家に goes 3rd: ならない うちに 家に 帰った.', 'うちに goes 2nd, after ならない.', '帰った goes last, before ほうが いい.']], ['昨日は　＿＿　＿＿　＿＿　★　、本屋に 寄った。', ['ついでに', '送った', '友だちを', '駅まで'], '昨日は 友だちを 駅まで 送った ついでに、本屋に 寄った。 〜ついでに = while I was at it. ★ = ついでに.', 'order order order', ['送った goes 3rd: 友だちを 駅まで 送った ついでに.', '友だちを goes 1st, the object of 送った.', '駅まで goes 2nd, after 友だちを.']], ['子どもの ころは　＿＿　★　＿＿　＿＿　、今は 毎日 食べて いる。', ['きらいだった', '野菜', 'あんなに', 'なのに'], '子どもの ころは あんなに きらいだった 野菜 なのに、今は 毎日 食べて いる。 Noun + な のに. ★ = きらいだった.', 'order order order', ['野菜 goes 3rd: あんなに きらいだった 野菜 なのに.', 'あんなに goes 1st, before きらいだった.', 'なのに goes last, after 野菜.']], ['先生が　＿＿　＿＿　★　＿＿　合格できました。', ['くださった', '{丁寧|ていねい}に', '教えて', 'おかげで'], '先生が {丁寧|ていねい}に 教えて くださった おかげで 合格できました。 〜て くださった おかげで = thanks to. ★ = くださった.', 'order order order', ['{丁寧|ていねい}に goes 1st: {丁寧|ていねい}に 教えて くださった.', '教えて goes 2nd, before くださった.', 'おかげで goes last, after くださった.']]]);
passage(3, 'n3p1', '最近、スマートフォンで 本を 読む 人が 増えて いる。画面で 読めば、重い 本を 持ち歩く 必要が ないし、夜でも 明かりを つけずに 読める。しかし、私は 今でも 紙の 本を 買う ことが 多い。紙の 本は、ページを めくる 感覚や、どこまで 読んだかが 手で わかるのが いい。それに、読み終わった 本が 本だなに {並|なら}んで いるのを 見ると、自分が 歩いて きた 道を 見て いるような 気持ちに なるのだ。', [['{筆者|ひっしゃ}が 紙の 本を 買う 理由として 合わない ものは どれか。', ['夜でも 明かりを つけずに 読めるから', 'ページを めくる 感覚が いいから', 'どこまで 読んだか 手で わかるから', '読み終わった 本を 本だなで 見られるから'], 'The first two sentences are about screens: 画面で 読めば…夜でも 明かりを つけずに 読める. That is a plus of the smartphone. The paper-book reasons come after しかし: the feel of turning pages, knowing by hand how far you have read, the shelf of finished books.', 'neg neg neg', ["The writer DOES give this as a reason for paper books (ページを めくる 感覚…が いい). The question asks for the one that does NOT fit (合わない).", "This is a reason the writer gives for paper: どこまで 読んだかが 手で わかるのが いい. It fits, so it is not the answer to 合わない.", "Seeing finished books on the shelf is the writer's last reason for paper. It fits; the question wants the one that doesn't."]], ['「自分が 歩いて きた 道」とは 何を 指して いるか。', ['これまでに 読んで きた 本や その 経験', '家から 本屋までの 道', '本だなを 置いた 場所', 'これから 読む 予定の 本'], 'Last sentence: 読み終わった 本が 本だなに {並|なら}んで いるのを 見ると…自分が 歩いて きた 道. The finished books on the shelf are a picture of all the reading the writer has done so far.', 'keyword ref dir', ["道 here is not a real road. The writer is looking at the bookshelf, so the \"road\" is a picture for all the books read so far.", "The shelf is where the books are, but 「道」 points to what the books stand for: the reading done so far, not the place.", "〜て きた looks back to the past (\"the road I have walked\"). Books still to be read are the future, the opposite direction."]]]);
passage(3, 'n3p2', '件名：社員旅行について\n\n社員の 皆様\n\n今年の 社員旅行は、１１月１５日（金）から １６日（土）まで、はこねで 行います。参加を {希望|きぼう}する 方は、１０月３１日までに {総務部|そうむぶ}の さとうに メールで {連絡|れんらく}して ください。なお、家族の 参加も {可能|かのう}ですが、その 場合は 一人 ５，０００円の 費用が かかります。社員の 費用は 会社が {負担|ふたん}します。', [['家族と 一緒に 参加したい 人は どう しなければ ならないか。', ['10月31日までに さとうさんに メールし、家族の 費用を 払う。', '11月15日に はこねで 申し込み、5,000円を 払う。', '{総務部|そうむぶ}に 行って 申し込み、費用は 会社が 払う。', '10月31日までに さとうさんに 電話する。'], 'Two lines of the email together: 10月31日までに…さとうに メールで {連絡|れんらく}して ください, and 家族の 参加も {可能|かのう}ですが…一人 ５，０００円の 費用が かかります.', 'keyword detail keyword', ["11月15日 is the trip date, not the deadline. Applications go to Sato by email by 10月31日.", "会社が {負担|ふたん}します is only for 社員. Family members cost 5,000円 each, and you apply by email, not at the office.", "Right deadline, wrong method: the email says メールで {連絡|れんらく}して ください, not a phone call."]], ['この メールの 内容と 合って いる ものは どれか。', ['社員は 旅行の 費用を 払わなくて よい。', '旅行は ２はく３日で ある。', '家族は 参加できない。', '申し込みは 電話で する。'], 'Last line of the email: 社員の 費用は 会社が {負担|ふたん}します. The company pays for staff, so staff pay nothing.', 'keyword polar keyword', ["15日（金）to 16日（土）is one night, two days (1はく2日), not 2はく3日.", "The opposite of the text: 家族の 参加も {可能|かのう}です (family may come, for a fee).", "The email says メールで, not 電話. An option that changes the method is a classic trap."]]]);
listen(3, [{
    q: '男の学生は この あと まず 何を しますか。',
    intro: '大学で 女の学生と 男の学生が 話しています。男の学生は この あと まず 何を しますか。',
    lines: [['F', '来週の 発表の じゅんび、進んでる？'], ['M', 'うん、資料は だいたい できたよ。'], ['F', '先生に 一度 見て もらった ほうが いいんじゃない？'], ['M', 'そうだね。でも 先生、今週は しゅっちょうで いないんだ。'], ['F', 'じゃあ、メールで 送ったら？'], ['M', 'そうする。その前に、グラフを もう少し わかりやすく 直さないと。']],
    o: ['グラフを 直す', '先生に 会いに 行く', '資料を 作り始める', '先生に メールで 送る'],
    e: 'その前に グラフを 直さないと — fixing the graph comes before emailing.',
    d: 'neg keyword seq',
    n: ['先生、今週は しゅっちょうで いない: the teacher is away this week.', 'The materials are nearly done (だいたい できた). He doesn\'t start them now.', 'He will email them, but その前に he fixes the graph.']
}, {
    q: '女の人は どうして 昨日の パーティーに 行かなかったのですか。',
    intro: '男の人と 女の人が 話しています。女の人は どうして 昨日の パーティーに 行かなかったのですか。',
    lines: [['M', '昨日の パーティー、来なかったね。体調でも 悪かったの？'], ['F', 'ううん、元気だったんだけど、急に 母が 東京に 来る ことに なって、駅まで 迎えに 行ったの。'], ['M', 'そうだったんだ。'], ['F', '本当は 行きたかったんだけどね。']],
    o: ['母を 駅まで 迎えに 行ったから', '体調が 悪かったから', '行きたくなかったから', '東京へ 母に 会いに 行ったから'],
    e: 'She went to pick up her mother at the station.',
    d: 'keyword neg keyword',
    n: ['He asks 体調でも 悪かったの？ and she says ううん、元気だった.', 'She says 本当は 行きたかった: she wanted to go.', 'Her mother came TO Tokyo (母が 東京に 来る). She went to the station to meet her.']
}, {
    q: '男の人が いちばん 言いたい ことは 何ですか。',
    intro: 'ラジオで 男の人が 話しています。',
    lines: [['M', '最近、朝ごはんを 食べない 若い 人が 増えて います。時間が ない、食欲が ない などの 理由が 多いようです。しかし、朝ごはんを 食べないと、午前中 頭が よく 働かず、仕事や 勉強の こうりつが 下がると 言われて います。バナナ 一本や ヨーグルトだけでも いいので、何か 口に 入れる ことを おすすめします。'], ['N', '男の人が いちばん 言いたい ことは 何ですか。']],
    o: ['少しでも いいから 朝ごはんを 食べた ほうが いい', '朝ごはんは バナナが いちばん いい', '若い 人は 朝 時間が ない', '午前中は 勉強しない ほうが いい'],
    e: 'Main point: eat something in the morning, even a little.',
    d: 'over detail keyword',
    n: ['Bananas are one example (バナナ 一本や ヨーグルトだけでも). He never says they are the best.', 'True, it is one reason young people skip breakfast, but not his main point.', 'He says the head works badly in the morning WITHOUT breakfast. He never says not to study.']
}, {
    q: 'せんぱいに 仕事を 手伝って ほしいです。何と 言いますか。',
    intro: 'せんぱいに 仕事を 手伝って ほしいです。何と 言いますか。',
    lines: [],
    o: ['すみません、ちょっと 手伝って いただけませんか。', '手伝って あげましょうか。', '手伝って もらって ください。', '手伝っても いいですよ。'],
    e: 'Polite request to a senior: 〜て いただけませんか.',
    d: 'dir dir dir',
    n: ['手伝って あげましょうか offers YOUR help. You want the senior to help you.', '手伝って もらって ください tells the senior to get help from someone else.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'この 資料、明日までに まとめて おいて くれる？']],
    o: ['はい、わかりました。やって おきます。', 'いいえ、まとめて ありました。', 'はい、まとめて くれました。', 'じゃあ、明日 くれますね。'],
    e: 'Accepting a task: はい、やって おきます.',
    d: 'situ situ situ',
    n: ['まとめて ありました is past: "it was already done". He asks you to do it.', 'まとめて くれました says someone did it for you. He asks YOU.']
}, /* batch 1 — 課題理解 */
{
    q: '女の人は この あと 何を しますか。',
    intro: '会社で 男の人と 女の人が 話しています。女の人は この あと 何を しますか。',
    lines: [['M', '明日の 午後、お客さんが 来るから、会議室を 予約して おいて くれる？'], ['F', '会議室なら、もう 予約して あります。資料も 作りましょうか。'], ['M', 'ありがとう。でも 資料は ぼくが 作るから だいじょうぶ。それより、お客さんに 会社までの 地図を メールで 送って おいて。'], ['F', 'わかりました。']],
    o: ['お客さんに 地図を 送る', '会議室を 予約する', '資料を 作る', '地図を コピーする'],
    e: 'The room is already booked and he makes the materials himself → send the map.',
    d: 'detail change keyword',
    n: ['会議室なら、もう 予約して あります: it is already booked.', 'She offers, but he says 資料は ぼくが 作る.', 'She sends the map by email (メールで 送って); nobody says to copy it.']
}, {
    q: '男の学生は この あと まず 何を しますか。',
    intro: '大学の 事務室で 男の学生と 職員が 話しています。男の学生は この あと まず 何を しますか。',
    lines: [['F', '申し込みには、この 用紙と 成績の しょうめいしょが 必要です。しょうめいしょは 二階の きかいで 出せますが、がくせいしょうが いります。'], ['M', 'あ、がくせいしょう、家に 忘れて しまいました。'], ['F', 'それなら、先に 用紙を 書いて おいて、しょうめいしょは 明日 持って きて ください。'], ['M', 'わかりました。']],
    o: ['用紙を 書く', 'しょうめいしょを 出す', 'がくせいしょうを 取りに 帰る', '二階へ 行く'],
    e: 'No student card today → write the form first, bring the certificate tomorrow.',
    d: 'change keyword keyword',
    n: ['He has no student card today, so the certificate is for tomorrow (明日 持って きて).', 'The clerk says to write the form first and bring the certificate tomorrow. Nobody tells him to go home.', 'The machine is on the 2nd floor, but without his card he can\'t use it today.']
}, {
    q: '女の人は 来た 人に まず 何を しますか。',
    intro: 'イベントの 会場で 男の人と 女の人が 話しています。女の人は 来た 人に まず 何を しますか。',
    lines: [['M', 'じゃあ、受付を お願いします。来た 人に 名前を 聞いて、この 表に まるを つけて ください。それから、パンフレットを 渡して。'], ['F', '飲み物も 渡しますか。'], ['M', 'いや、飲み物は 中で 配るから いいよ。']],
    o: ['名前を 聞く', 'パンフレットを 渡す', '飲み物を 配る', '表に 名前を 書いて もらう'],
    e: 'Order: ask the name → mark the list → hand over the pamphlet. Drinks are given inside.',
    d: 'seq neg keyword',
    n: ['Pamphlets come last: それから、パンフレットを 渡して.', 'He says 飲み物は 中で 配るから いい.', 'She asks the name and marks the list herself. Nobody writes their own name.']
}, {
    q: '男の人は この あと まず 何を しますか。',
    intro: '男の人が レストランに 電話を して います。男の人は この あと まず 何を しますか。',
    lines: [['M', 'もしもし、土曜日の 七時に 四人で 予約したいんですが。'], ['F', 'もうしわけございません。土曜日は 八時以降でしたら 空いて おりますが。'], ['M', 'そうですか。じゃあ、友達に 確認してから、もう 一度 電話します。'], ['F', 'はい、お待ちして おります。']],
    o: ['友達に 時間を 確認する', '店に もう 一度 電話する', '八時に 予約する', 'ほかの 店を 探す'],
    e: '確認してから 電話します — check with friends first, then call again.',
    d: 'seq keyword over',
    n: ['He calls again AFTER checking with his friends (確認してから).', 'Eight o\'clock is free, but he hasn\'t booked it. He checks with his friends first.', 'He never says he will try another restaurant.']
}, {
    q: '男の人は 今晩 何を しますか。',
    intro: '家で 女の人と 男の人が 話しています。男の人は 今晩 何を しますか。',
    lines: [['F', '明日は ごみの 日だから、今晩 出して おいてね。'], ['M', 'あれ、この マンション、ごみは 朝 出す ことに なって なかった？'], ['F', 'あ、そうだった。じゃあ、ごみは 明日の 朝 お願い。今晩は 台所の びんを 洗って おいて。'], ['M', 'わかった。']],
    o: ['びんを 洗う', 'ごみを 出す', 'びんを 出す', 'ごみを 分ける'],
    e: 'Garbage goes out in the morning; tonight he washes the bottles.',
    d: 'change keyword keyword',
    n: ['The garbage goes out tomorrow morning (ごみは 明日の 朝).', 'He washes the bottles tonight; nobody says to take them out.', 'Nobody says to sort the garbage. Tonight he washes the bottles.']
}, /* batch 1 — ポイント理解 */
{
    q: '男の人は どうして ジムを やめましたか。',
    intro: '女の人と 男の人が 話しています。男の人は どうして ジムを やめましたか。',
    lines: [['F', 'ジム、やめたんだって？ 高かったの？'], ['M', 'いや、料金は 安かったんだけど、家から 遠くて、だんだん 行かなく なっちゃって。'], ['F', 'そうなんだ。'], ['M', '今は 会社の 近くの プールに 通ってるよ。']],
    o: ['家から 遠くて 行かなく なったから', '料金が 高かったから', 'プールの ほうが 安いから', '会社から 遠かったから'],
    e: 'It was cheap; far from home, so he stopped going.',
    d: 'neg keyword keyword',
    n: ['She asks 高かったの？ and he says 料金は 安かった.', 'He goes to a pool now, but nobody compares the prices.', 'It was far from HOME (家から 遠くて). The pool he goes to now is near his office.']
}, {
    q: '女の人は 何が 心配ですか。',
    intro: '男の人と 女の人が 話しています。女の人は 何が 心配ですか。',
    lines: [['M', '来週の 旅行、天気 だいじょうぶかな。'], ['F', '天気は 晴れるらしいよ。それより 心配なのは、飛行機の 時間。朝 六時の 出発だから、ちゃんと 起きられるかどうか…'], ['M', 'じゃあ、ぼくが 電話で 起こして あげるよ。']],
    o: ['朝 早く 起きられるか', '天気が 悪く ならないか', '飛行機が おくれないか', '男の人が 起きられるか'],
    e: 'The weather will be fine; she worries about getting up for a 6 a.m. flight.',
    d: 'neg keyword ref',
    n: ['She says 天気は 晴れるらしい: the weather will be fine.', 'She worries about the 6 a.m. departure time, not about delays.', 'She worries about HER getting up. He offers to wake her.']
}, {
    q: '来週の じゅぎょうは 何が いつもと 違いますか。',
    intro: '大学で 先生が 話しています。来週の じゅぎょうは 何が いつもと 違いますか。',
    lines: [['M', '来週の じゅぎょうは、いつもの 教室では なく、図書館の 三階で 行います。時間は 同じです。それから、教科書は いりませんが、ノートパソコンを 持って きて ください。']],
    o: ['場所と 持ち物', '時間と 場所', '時間と 持ち物', '場所だけ'],
    e: 'Room changes and you bring a laptop instead of the textbook; time is the same.',
    d: 'neg neg detail',
    n: ['時間は 同じです: the time stays the same.', 'The time is the same. The room and what you bring change.', 'The room changes, and you also bring a laptop instead of the textbook.']
}, {
    q: '男の人は 映画の どこが よかったと 言って いますか。',
    intro: '女の人と 男の人が 映画に ついて 話しています。男の人は 映画の どこが よかったと 言って いますか。',
    lines: [['F', 'この 間の 映画、どうだった？'], ['M', '話は ちょっと 分かりにくかったな。はいゆうは まあまあかな。でも、音楽が すごく よくて、もう 一度 見たいと 思ったよ。']],
    o: ['音楽', '話の 内容', 'はいゆう', '全部'],
    e: 'Story hard to follow, actors so-so; the music was great.',
    d: 'neg keyword over',
    n: ['話は ちょっと 分かりにくかった: he found the story hard to follow.', 'はいゆうは まあまあ: the actors were only so-so.', 'Only the music was great. The story and the actors weren\'t.']
}, {
    q: '食事会には 何人 来ますか。',
    intro: '男の人と 女の人が 話しています。食事会には 何人 来ますか。',
    lines: [['M', '土曜日の 食事会、何人 来るの？'], ['F', '最初は 十人の 予定だったんだけど、二人 来られなく なって。'], ['M', 'そうか。'], ['F', 'でも、その あと 田中さんが 来られる ことに なったの。']],
    o: ['九人', '十人', '八人', '十一人'],
    e: '10 − 2 + 1 (田中さん) = 9.',
    d: 'change change neg',
    n: ['十人 was the first plan. Two can\'t come, and 田中さん can.', '十 minus 二 is 八, but then 田中さんが 来られる ことに なった: plus one.', 'She adds 田中さん, but this forgets the two who can\'t come (来られなく なって).']
}, /* batch 1 — 概要理解 */
{
    q: '女の人は 自転車で 通う ことに ついて どう 思って いますか。',
    intro: '女の人が 話しています。',
    lines: [['F', '私は 去年から 自転車で 会社に 通って います。最初は 疲れましたが、今では 体の 調子が よく なりました。朝の 込んだ 電車に 乗らなくて いいのも うれしいです。ただ、雨の 日は 大変なので、電車を 使って います。'], ['N', '女の人は 自転車で 通う ことに ついて どう 思って いますか。']],
    o: ['いい ことが 多いと 思って いる', '疲れるので やめたいと 思って いる', '雨の 日も 自転車が いいと 思って いる', '電車の ほうが 楽だと 思って いる'],
    e: 'Tired at first, but now healthier and no crowded train → mostly positive. Only rainy days are hard.',
    d: 'change neg keyword',
    n: ['She was tired only at first (最初は). Now she feels healthier.', 'On rainy days she takes the train (雨の 日は 大変).', 'She only uses the train on rainy days. She is glad to skip the crowded train.']
}, {
    q: '店長は 何に ついて 話して いますか。',
    intro: '店で 店長が 店員に 話しています。',
    lines: [['M', 'みなさん、来月から お店の 時間が 変わります。今は 夜 十時までですが、来月からは 九時に 閉めます。その代わり、朝は 一時間 早く 開けます。お客さんの 多い 時間に 合わせる ためです。よろしく お願いします。'], ['N', '店長は 何に ついて 話して いますか。']],
    o: ['店が 開いて いる 時間が 変わる こと', '店が 休みの 日が 変わる こと', '店員の 働く 時間が 長く なる こと', '夜の お客さんが 増えた こと'],
    e: 'Closing at 9 instead of 10, opening an hour earlier = opening hours change.',
    d: 'keyword keyword over',
    n: ['The hours change, not the days off. He talks about 夜 and 朝.', 'The shop closes an hour earlier and opens an hour earlier. The total stays the same.', 'He says お客さんの 多い 時間に 合わせる. He never says evening customers increased.']
}, /* batch 1 — 発話表現 */
{
    q: '図書館で、となりの 人の 話し声が うるさいです。何と 言いますか。',
    intro: '図書館で、となりの 人の 話し声が うるさいです。何と 言いますか。',
    lines: [],
    o: ['すみません、もう 少し 静かに して いただけますか。', '静かに して あげましょうか。', 'うるさく しても かまいませんよ。', '静かに させて ください。'],
    e: 'Polite request: 〜て いただけますか.',
    d: 'dir situ pcv',
    n: ['静かに して あげましょうか offers to be quiet for them. THEY are the noisy ones.', 'うるさく しても かまいません says they may be noisy.']
}, {
    q: '昨日 買った シャツを 返したいです。店の 人に 何と 言いますか。',
    intro: '昨日 買った シャツを 返したいです。店の 人に 何と 言いますか。',
    lines: [],
    o: ['すみません、これ、昨日 買ったんですが、返品できますか。', 'これ、返品して あげましょうか。', 'これ、返品して いただきました。', 'これ、お返しに なりますか。'],
    e: 'Asking if you can return it: 返品できますか.',
    d: 'dir dir dir',
    n: ['返品して あげましょうか offers to do the return for the shop staff.', '返品して いただきました is past: "it was returned for me".']
}, {
    q: '部長の 話が よく 聞こえませんでした。何と 言いますか。',
    intro: '部長の 話が よく 聞こえませんでした。何と 言いますか。',
    lines: [],
    o: ['すみません、もう 一度 おっしゃって いただけませんか。', 'すみません、もう 一度 申し上げて ください。', 'もう 一度 言って あげましょうか。', 'もう 一度 聞いて いただけませんか。'],
    e: 'おっしゃる is the respectful 言う for your boss. 申し上げる is humble — only for yourself.',
    d: 'nuance dir dir',
    n: ['申し上げる is humble, for what YOU say. For the manager, use おっしゃる.', '言って あげましょうか offers to say it again yourself.']
}, /* batch 1 — 即時応答 */
{
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', '駅までの 道、分かる？ 地図、書こうか。']],
    o: ['ありがとう。でも、たぶん だいじょうぶ。', 'うん、書いて あげる。', 'じゃあ、書かせて。', 'え、もう 書いたの？'],
    e: 'She offers to draw a map → thank her and decline politely.',
    d: 'dir pcv form',
    n: ['書いて あげる offers YOUR help. She is the one offering.', '書かせて asks her to let YOU draw it.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'この 書類、かちょうに 渡して おいて もらえる？']],
    o: ['はい、渡して おきます。', 'はい、もらって おきます。', 'はい、渡して もらいました。', 'いいえ、かちょうが 渡しました。'],
    e: '〜て もらえる？ asks YOU to hand it over → 渡して おきます.',
    d: 'dir dir dir',
    n: ['もらって おきます means you will receive it. He asks you to hand it over.', '渡して もらいました is past: someone handed it over for you.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', 'せっかく 来たのに、店、閉まってるね。']],
    o: ['本当だ。残念だね。', 'じゃあ、早く 入ろう。', 'うん、開いてて よかったね。', 'せっかくだから、閉めよう。'],
    e: 'せっかく〜のに = all that way for nothing; the shop is closed → 残念だね.',
    d: 'neg neg keyword',
    n: ['The shop is closed (閉まってる). You can\'t go in.', 'The shop is closed, not open (開いてて).']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', '田中さん、さっきから 顔色が 悪いけど、だいじょうぶ？']],
    o: ['ちょっと 頭が 痛くて…。', 'ええ、さっき 顔を 洗いました。', 'ありがとう、この 色、似合う？', 'はい、悪いのは 私です。'],
    e: '顔色が 悪い = you look pale/unwell. Explain how you feel.',
    d: 'keyword keyword keyword',
    n: ['顔色が 悪い means you look unwell. It isn\'t about washing your face.', '顔色 is how you look, not the color of your clothes.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', '明日の 会議、代わりに 出席して もらえないかな。']],
    o: ['すみません、明日は ちょっと…。', 'はい、出席して もらいます。', 'じゃあ、出席させて あげます。', 'いいえ、出席しなかったです。'],
    e: 'A soft refusal: 明日は ちょっと…. The others mix up who does it or the tense.',
    d: 'dir pcv form',
    n: ['出席して もらいます means someone else attends for you. She asks YOU.', '出席させて あげます means you let someone attend.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', 'この ケーキ、山田さんが 作ったんだって。']],
    o: ['へえ、お店のみたいだね。', 'え、私が 作ったの？', 'うん、作って あげたよ。', 'そう、作らないでね。'],
    e: 'Reacting to news about 山田さん: へえ、お店のみたい = it looks store-bought.',
    d: 'ref dir neg',
    n: ['山田さん made it, not you.', '作って あげた says YOU made it. He says 山田さんが 作った.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['F', '雨、なかなか やみそうに ないね。']],
    o: ['うん、もう 少し 待つしか ないね。', 'よかった、もう やんだね。', 'うん、そろそろ やみそうだね。', '雨が 好きじゃ ないの？'],
    e: 'やみそうに ない = doesn\'t look like stopping. Agree: we just have to wait.',
    d: 'neg nuance keyword',
    n: ['やみそうに ない means it doesn\'t look like stopping. It hasn\'t stopped.', 'そろそろ やみそう says it will stop soon, the opposite.']
}, {
    q: '何と 答えますか。',
    intro: '何と 答えますか。',
    lines: [['M', '今度の 日曜、引っ越しの 手伝い、頼んでも いい？']],
    o: ['いいよ。何時に 行けば いい？', 'うん、頼んで あげる。', 'じゃあ、手伝って もらうね。', 'もう 引っ越したよ。'],
    e: 'He asks you for help → agree and ask the time.',
    d: 'dir dir keyword',
    n: ['頼んで あげる offers to ask someone for him. He is asking YOU.', '手伝って もらう means YOU get help. He is asking for your help.']
}, {
    'q': '女の人は この あと まず 何を しますか。',
    'intro': '会社で 男の人と 女の人が 話しています。女の人は この あと まず 何を しますか。',
    'lines': [['M', '来週の 説明会の じゅんび、どうなってる？'], ['F', '会場は 予約しました。今から あんないの メールを 送ります。'], ['M', 'あ、メールの 前に、資料の 内容を 部長に 確認して もらって。日にちが 変わるかも しれないから。'], ['F', 'わかりました。']],
    'o': ['部長に 資料を 確認して もらう', 'あんないの メールを 送る', '会場を 予約する', '日にちを 変える'],
    'e': 'メールの 前に 部長に 確認 — the check comes first; the room is already booked.',
    'd': 'seq detail keyword',
    n: ['The email comes after: メールの 前に、部長に 確認して もらって.', '会場は 予約しました: already done.', 'The date MIGHT change (変わるかも). She doesn\'t change it herself.']
}, {
    'q': '女の人は どうして 料理教室を やめたのですか。',
    'intro': '男の人と 女の人が 話しています。女の人は どうして 料理教室を やめたのですか。',
    'lines': [['M', '料理教室、やめたんだって？ 先生と 合わなかったの？'], ['F', 'ううん、先生は 優しかったよ。料金も 高くなかったし。'], ['M', 'じゃあ、どうして？'], ['F', '仕事が 変わって、夜 遅くまで 働く ように なったから、時間に 間に合わなくて。']],
    'o': ['仕事が 忙しく なったから', '先生と 合わなかったから', '料金が 高かったから', '料理が 上手に なったから'],
    'e': 'The teacher and price were fine; her new job runs late, so she can\'t make it.',
    'd': 'neg neg keyword',
    n: ['先生は 優しかった: the teacher was kind.', '料金も 高くなかった: it wasn\'t expensive.', 'Nobody says she got good at cooking. Her new job ends late.']
}, {
    'q': '男の人は どの 掃除機を 買いますか。',
    'intro': '店で 店員と 男の人が 話しています。男の人は どの 掃除機を 買いますか。',
    'lines': [['F', 'こちらの 掃除機は 軽くて 人気が あります。'], ['M', 'でも、音が 大きいですね。夜 使う ことが 多いので…。'], ['F', 'では、こちらは いかがですか。少し 重いですが、音は とても 静かです。'], ['M', 'じゃあ、それに します。']],
    'o': ['重いが 音が 静かな 掃除機', '軽くて 人気が ある 掃除機', '軽くて 音が 静かな 掃除機', '重くて 音が 大きい 掃除機'],
    'e': 'He uses it at night, so quiet matters more than weight.',
    'd': 'keyword detail keyword',
    n: ['That one is 軽い and 人気, but loud. He uses it at night.', 'The quiet one is 重い, not 軽い.', 'The one he buys is 重い, but quiet, not loud.']
}, {
    'q': '二人は 何時に 駅で 会いますか。',
    'intro': '男の人と 女の人が 話しています。二人は 何時に 駅で 会いますか。',
    'lines': [['M', 'あしたの コンサート、６時半開始だよね。'], ['F', 'うん。駅から 会場まで 歩いて １５分ぐらいかな。'], ['M', 'じゃあ、６時に 駅で 会おうか。'], ['F', '始まる 前に 食事も したいから、もう 少し 早く したい。５時に しない？'], ['M', 'いいよ。']],
    'o': ['５時', '６時', '６時半', '６時１５分'],
    'e': '6:00 was his idea; she wants dinner first → 5:00 (いいよ).',
    'd': 'change detail keyword',
    n: ['６時 was his idea. She wants to eat first, so ５時.', '６時半 is when the concert starts.', 'The walk takes １５分, but nobody says ６時１５分.']
}, {
    'q': '女の人は この あと どう しますか。',
    'intro': '駅で 女の人と 駅員が 話しています。女の人は この あと どう しますか。',
    'lines': [['F', 'すみません、電車に かさを 忘れて しまったんですが。'], ['M', 'どの 電車ですか。'], ['F', '１０時ごろの 急行です。'], ['M', 'それなら、終点の 駅に 届いて いる かもしれません。こちらで 問い合わせますので、少し お待ち ください。'], ['F', 'はい。']],
    'o': ['この 駅で 待つ', '終点の 駅へ 行く', '電車に もう一度 乗る', '終点の 駅に 電話する'],
    'e': 'The staff will ask the last station; she waits here (少し お待ち ください).',
    'd': 'keyword keyword dir',
    n: ['The umbrella may be at 終点, but the staff will ask for her.', 'Nobody says to get on the train again. She waits here.', 'The station staff will ask (こちらで 問い合わせます), not her.']
}, {
    'q': '男の人は 来週 何曜日に 休みを とりますか。',
    'intro': '会社で 女の人と 男の人が 話しています。男の人は 来週 何曜日に 休みを とりますか。',
    'lines': [['F', '来週、一日 休みを とるんだって？'], ['M', 'うん。月曜日に しようと 思ってたんだけど、会議が 入っちゃって。'], ['F', 'じゃあ、火曜日？'], ['M', '火曜日は 部長が 休みだから、水曜日に した。']],
    'o': ['水曜日', '月曜日', '火曜日', '月曜日と 水曜日'],
    'e': 'Monday has a meeting, Tuesday the manager is off → Wednesday.',
    'd': 'change change keyword',
    n: ['月曜日 now has a meeting (会議が 入っちゃって).', '火曜日は 部長が 休み.', 'He takes one day off (一日). 月曜日 was dropped, so only 水曜日.']
}, {
    'q': '女の人は 新しい アパートの 何が いちばん 気に 入って いますか。',
    'intro': '男の人と 女の人が 話しています。女の人は 新しい アパートの 何が いちばん 気に 入って いますか。',
    'lines': [['M', '新しい アパート、どう？'], ['F', '駅から ちょっと 遠いけど、部屋は 広いし、やちんも 前と 同じぐらい。でも 何より、ベランダから 海が 見えるのが うれしいの。']],
    'o': ['ベランダから 海が 見える こと', '部屋が 広い こと', 'やちんが 安い こと', '駅から 近い こと'],
    'e': '何より = above all: the sea view.',
    'd': 'detail over dir',
    n: ['部屋は 広い is true, but 何より (above all) is the sea view.', 'やちんは 前と 同じぐらい: about the same as before, not cheaper.', 'She says 駅から ちょっと 遠い: a bit far.']
}, {
    'q': '男の人は 何が 心配だと 言って いますか。',
    'intro': '女の人と 男の人が 話しています。男の人は 何が 心配だと 言って いますか。',
    'lines': [['F', '来月から 海外で 働くんでしょう？ 言葉は だいじょうぶ？'], ['M', '英語は 仕事で 使って いたから、問題ないと 思う。それより、食べ物が 合うか どうかが ちょっと ね。'], ['F', 'そうか。']],
    'o': ['食べ物が 合うか どうか', '英語が 話せるか どうか', '仕事が 見つかるか どうか', '海外の 生活に なれるか どうか'],
    'e': 'English is no problem; それより the food worries him.',
    'd': 'neg keyword over',
    n: ['英語は 問題ない: English is no problem.', 'He already has the job: 来月から 海外で 働く.', 'He only names the food (食べ物が 合うか どうか), not life abroad in general.']
}, {
    'q': '女の人は 何の ために 電話しましたか。',
    'intro': '女の人が レストランに 電話して います。女の人は 何の ために 電話しましたか。',
    'lines': [['F', 'もしもし、土曜日の ７時に ４人で 予約して いる 田中ですが。'], ['M', 'はい、田中様ですね。'], ['F', '実は ２人 増えて、６人に なったんですが、だいじょうぶですか。'], ['M', 'はい、だいじょうぶです。']],
    'o': ['人数が 増えた ことを 伝える ため', '時間を 変える ため', '日にちを 変える ため', '予約を 取り消す ため'],
    'e': 'Same day and time; two more people (６人に なった).',
    'd': 'keyword keyword dir',
    n: ['She says 土曜日の ７時 again; the time stays.', 'The day stays 土曜日.', 'She adds two people; she doesn\'t cancel.']
}, {
    'q': '学生は 明日 何を 持って 行きますか。',
    'intro': '先生が 学生に 話して います。学生は 明日 何を 持って 行きますか。',
    'lines': [['M', '明日の 見学ですが、工場の 中では 写真を とる ことが できませんので、カメラは 持って こないで ください。メモを とる ための ノートと ペンは 必ず 持って きて ください。お昼ごはんは 工場の 食堂で 食べます。']],
    'o': ['ノートと ペン', 'カメラ', 'お昼ごはん', 'カメラと ノート'],
    'e': 'No cameras, lunch is at the canteen → only a notebook and pen.',
    'd': 'neg neg neg',
    n: ['カメラは 持って こないで: no camera.', 'お昼ごはんは 工場の 食堂で 食べます: lunch is there.', 'ノート is right, but no カメラ.']
}, {
    'q': '男の人は 週末 何を しましたか。',
    'intro': '女の人と 男の人が 話しています。男の人は 週末 何を しましたか。',
    'lines': [['F', '週末、山に 登るって 言ってたよね。どうだった？'], ['M', 'それが、雨で 行けなかったんだ。'], ['F', '残念。じゃあ、家で ゆっくり？'], ['M', 'ううん、せっかくだから 友だちと 美術館に 行ったよ。']],
    'o': ['友だちと 美術館に 行った', '山に 登った', '家で ゆっくり した', '雨の 中を 歩いた'],
    'e': 'Rain cancelled the hike; he went to a museum instead.',
    'd': 'change keyword keyword',
    n: ['雨で 行けなかった: the rain stopped him.', 'She asks 家で ゆっくり？ and he says ううん.', 'It rained, but he went to the museum.']
}, {
    'q': '女の人は 会議で 何に ついて 説明しますか。',
    'intro': '会社で 男の人と 女の人が 話しています。女の人は 会議で 何に ついて 説明しますか。',
    'lines': [['M', '明日の 会議、田中さんが 売り上げの 説明を する ことに なってたけど、田中さん、しゅっちょうに なったんだ。'], ['F', 'じゃあ、私が 売り上げの 説明を？'], ['M', 'いや、売り上げは ぼくが やる。山本さんには 新しい 商品の 説明を お願いしたいんだけど。'], ['F', 'わかりました。']],
    'o': ['新しい 商品', '売り上げ', '田中さんの しゅっちょう', '売り上げと 新しい 商品'],
    'e': 'He takes the sales report himself; she explains the new product.',
    'd': 'change keyword over',
    n: ['She thinks she does the sales, but he says 売り上げは ぼくが やる.', '田中さん\'s business trip is why the plan changed, not her topic.', 'She does only the new product; he does the sales.']
}, {
    'q': '女の人が いちばん 言いたい ことは 何ですか。',
    'intro': 'テレビで 女の人が 話しています。',
    'lines': [['F', '最近、本を 読む 時間が ないと いう 人が 多いようです。でも、一日 十分でも いいんです。電車の 中や 寝る 前など、少しの 時間を 使って 読めば、一か月で いっさつは 読めます。大切なのは、長い 時間 読む ことより、毎日 続ける ことです。'], ['N', '女の人が いちばん 言いたい ことは 何ですか。']],
    'o': ['少しでも 毎日 読む ことが 大切だ', '本は 寝る 前に 読む ほうが いい', '長い 時間 読まないと 意味が ない', '最近の 人は 本を 読まない'],
    'e': '大切なのは … 毎日 続ける こと: the main point comes at the end.',
    'd': 'keyword keyword over',
    n: ['寝る 前 is one example of free time (電車の 中や 寝る 前など).', 'She says the opposite: 長い 時間 読む ことより、毎日 続ける こと.', 'She says many people say they have no time, not that people don\'t read.']
}, {
    'q': '男の人は 何に ついて 話して いますか。',
    'intro': '会社で 男の人が 話しています。',
    'lines': [['M', 'みなさん、来月から 会社の 中で ペットボトルの 飲み物を 売るのを やめる ことに なりました。ゴミを 少なく する ためです。そのかわり、それぞれの 階に 水を 入れられる きかいを 置きます。自分の コップや ボトルを 持って きて ください。'], ['N', '男の人は 何に ついて 話して いますか。']],
    'o': ['ゴミを 少なく する ための 新しい ルール', '新しい 飲み物の 売り方', '会社の きかいの 使い方', 'ペットボトルの 正しい すて方'],
    'e': 'Bottles are no longer sold to cut waste; bring your own cup: a new rule.',
    'd': 'keyword keyword keyword',
    n: ['Bottled drinks will no longer be sold. Nothing new is sold.', 'Water machines are part of the rule, but he doesn\'t explain how to use them.', 'He talks about stopping bottle sales, not how to throw bottles away.']
}, {
    'q': '男の人は 何に ついて 話して いますか。',
    'intro': 'ラジオで 男の人が 話しています。',
    'lines': [['M', 'みなさんは 寝る 前に スマートフォンを 見て いませんか。画面の 光は 目を 覚まして しまうので、寝る 一時間 前には 見ないのが いいと 言われて います。そのかわりに、本を 読んだり、音楽を 聞いたり すると、よく 眠れるそうです。'], ['N', '男の人は 何に ついて 話して いますか。']],
    'o': ['よく 眠る ための 方法', 'スマートフォンの 便利な 使い方', '目が 悪く なる 理由', '音楽の 聞き方'],
    'e': 'Everything points to one theme: how to sleep well.',
    'd': 'keyword over keyword',
    n: ['He tells you NOT to look at your phone before bed.', 'He says the light wakes you up; nothing about eyesight getting worse.', 'Music is one way to sleep well, not the topic.']
}, {
    'q': '会議室を 使いたいですが、せんぱいが 使って います。何と 言いますか。',
    'intro': '会議室を 使いたいですが、せんぱいが 使って います。何と 言いますか。',
    'lines': [],
    'o': ['会議室、何時ごろまで お使いに なりますか。', '会議室、使って いただけませんか。', '会議室、お使いして ください。', '会議室、使わせて あげましょうか。'],
    'e': 'Politely ask when they will finish: お使いに なりますか (respectful).',
    'd': 'dir form dir',
    n: ['使って いただけませんか asks the senior to use it. You want to use it.', 'お使いして ください mixes humble and request forms; it isn\'t correct keigo.']
}, {
    'q': '友だちに 借りた かさを なくして しまいました。何と 言いますか。',
    'intro': '友だちに 借りた かさを なくして しまいました。何と 言いますか。',
    'lines': [],
    'o': ['ごめん。借りた かさ、なくしちゃって…。', 'かさ、なくして くれて ありがとう。', 'かさ、借りても いい？', 'かさ、返して もらえる？'],
    'e': 'Apologise: ごめん + what happened (〜ちゃって).',
    'd': 'situ situ dir',
    n: ['なくして くれて ありがとう thanks your friend for losing it.', '借りても いい？ asks to borrow it now. You already lost it.']
}, {
    'q': '先生に 作文を 見て ほしいです。何と 言いますか。',
    'intro': '先生に 作文を 見て ほしいです。何と 言いますか。',
    'lines': [],
    'o': ['先生、この 作文を 見て いただけませんか。', '先生、この 作文を お見せに なりませんか。', '先生、この 作文を 見て さしあげます。', '先生、この 作文を 見させて ください。'],
    'e': 'Asking a teacher a favour: 〜て いただけませんか.',
    'd': 'form dir dir',
    n: ['お見せに なりませんか would ask the teacher to show something. You want them to look.', '見て さしあげます offers to look at something for the teacher.']
}, {
    'q': 'お客さんに お茶を 出します。何と 言いますか。',
    'intro': 'お客さんに お茶を 出します。何と 言いますか。',
    'lines': [],
    'o': ['どうぞ、めしあがって ください。', 'どうぞ、いただいて ください。', 'いただきます。', 'お茶を ください。'],
    'e': 'めしあがる is respectful for the guest. いただく is humble, for yourself.',
    'd': 'form dir situ',
    n: ['いただく is humble, for yourself. For the guest, use めしあがって.', 'いただきます is what the guest says.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', '悪いけど、この 荷物、ちょっと 持って いて くれない？']],
    'o': ['うん、いいよ。', 'うん、持って くれて ありがとう。', 'ううん、持って いない。', 'じゃあ、持って もらうね。'],
    'e': '〜て くれない？ asks YOU → うん、いいよ.',
    'd': 'dir neg dir',
    n: ['持って くれて ありがとう thanks HIM. He is asking YOU to hold it.', '持って いない says you aren\'t holding it. He asks you to hold it.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', 'この レポート、明日までに 終わりそう？']],
    'o': ['うーん、ちょっと 難しいかも。', 'うん、終わったら いいね。', '終わりそうに 見えるね。', '明日なら もう 終わったよ。'],
    'e': 'Asked if you\'ll finish → say how it looks for you.',
    'd': 'situ keyword form',
    n: ['終わったら いいね is said about someone else\'s work. She asks about yours.', '終わりそうに 見える talks like an outsider. It is your report.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', '山田さん、今日 休みだって。']],
    'o': ['え、どう したんだろう。', 'うん、休んで ください。', 'じゃあ、休みましょう。', 'へえ、来て よかった。'],
    'e': 'News about someone absent → wonder why.',
    'd': 'situ dir polar',
    n: ['休んで ください tells someone to rest. 山田さん isn\'t here.', '休みましょう invites everyone to take a day off.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', '駅まで 送りましょうか。']],
    'o': ['いいんですか。じゃあ、お願いします。', 'ええ、送って あげます。', 'いいえ、送りました。', 'はい、送らせて ください。'],
    'e': 'An offer (〜ましょうか) → accept: お願いします.',
    'd': 'dir form dir',
    n: ['送って あげます offers to drive HER. She is offering.', '送りました is past.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'あれ、もう 帰るの？ まだ ７時だよ。']],
    'o': ['うん、明日 朝 早いんだ。', 'うん、もう ７時に 来たよ。', 'まだ 帰らないで ください。', 'じゃあ、早く 帰ろう。'],
    'e': 'Surprised you\'re leaving → give your reason.',
    'd': 'situ keyword polar',
    n: ['７時に 来た says when you came. He asks why you are leaving.', 'まだ 帰らないで is what HE would say.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', 'この 料理、少し しょっぱすぎない？']],
    'o': ['そう？ ちょうど いいと 思うけど。', 'うん、しょっぱく なさそうだね。', 'もっと しょっぱく しないと。', 'しょっぱすぎて よかった。'],
    'e': '〜すぎない？ asks if you agree it\'s too salty → agree or disagree.',
    'd': 'polar form polar',
    n: ['しょっぱく なさそう means "it doesn\'t look salty". うん doesn\'t go with her question.', 'もっと しょっぱく makes it saltier. She thinks it is too salty already.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', '会議の 時間、３時からに 変わったの、知ってた？']],
    'o': ['え、知らなかった。', 'うん、変わって いないよ。', '３時に 知ったよ。', 'じゃあ、知らせないでね。'],
    'e': 'Did you know? → え、知らなかった.',
    'd': 'situ keyword situ',
    n: ['変わって いない contradicts him. He says it changed.', '３時に 知った says when you found out. ３時 is the meeting time.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['F', '昨日は お忙しい ところ、ありがとう ございました。']],
    'o': ['いいえ、こちらこそ。', 'いいえ、忙しく ありません。', 'では、またに しましょう。', 'はい、ありがとう ございました。'],
    'e': 'Thanks for your time → いいえ、こちらこそ (thank YOU).',
    'd': 'keyword situ situ',
    n: ['忙しく ありません answers literally. お忙しい ところ is a polite set phrase.', 'またに しましょう puts off a plan. She is thanking you.']
}, {
    'q': '何と 答えますか。',
    'intro': '何と 答えますか。',
    'lines': [['M', 'その 本、読み終わったら 貸して もらえる？']],
    'o': ['うん、いいよ。来週には 終わると 思う。', 'うん、借りて あげる。', '読み終わって よかったね。', 'じゃあ、貸して もらうね。'],
    'e': 'He asks to borrow it → うん、いいよ.',
    'd': 'dir situ dir',
    n: ['借りて あげる would mean YOU borrow it for him. He wants to borrow yours.', '読み終わって よかった is about finishing. He hasn\'t borrowed it yet.']
}]);
conj(3, [['たべる', 'causative-passive', ['たべさせられる'], 'Ichidan: させられる.'], ['のむ', 'causative-passive', ['のまされる', 'のませられる'], 'Godan short form: a-sound + される (のまされる).'], ['いく', 'causative-passive', ['いかされる', 'いかせられる'], 'Godan short form: いかされる.'], ['する', 'causative-passive', ['させられる'], 'する → させられる.'], ['くる', 'causative form', ['こさせる'], 'くる → こさせる.'], ['あるく', '〜ずに form', ['あるかずに'], 'ない-stem + ずに: あるかない → あるかずに.'], ['する', '〜ずに form', ['せずに'], 'Exception: する → せずに.'], ['たべる', '〜ざるを得ない', ['たべざるをえない'], 'ない-stem + ざるを得ない (have no choice but to).'], ['いる', 'humble (謙譲語)', ['おる', 'おります'], 'いる → おる / おります.'], ['たべる', 'honorific (尊敬語)', ['めしあがる'], '食べる → めし上がる.']]);

/* ───────── Longer reading: 中文 / 長文 / 情報検索, the formats that are hardest under time pressure ───────── */
passage(5, 'n5p3', 'リンさんへ\n\nらいしゅうの 土よう日に、わたしの いえで たんじょうびパーティーを します。午後 ２時から ５時までです。ケーキと 飲みものは わたしが じゅんびします。リンさんは 何も もって こなくても いいです。でも、もし ギターが あったら、もって きて ください。みんなで うたを うたいたいです。\nわたしの いえは さくら駅から あるいて １０分です。駅に ついたら、電話して ください。むかえに 行きます。\n\nマリア', [['リンさんは パーティーに 何を もって 行くと いいですか。', ['ギター', 'ケーキ', '飲みもの', '何も もって 行かない'], 'Paragraph 1: 何も もって こなくても いいです。でも、もし ギターが あったら、もって きて ください. マリアさん wants everyone to sing, so the guitar is the answer.', 'dir dir detail', ["ケーキ is マリアさん's job: ケーキと 飲みものは わたしが じゅんびします.", "Drinks are マリアさん's job too: ケーキと 飲みものは わたしが じゅんびします.", "何も もって こなくても いい is true, but the next sentence adds でも、もし ギターが あったら、もって きて ください."]], ['リンさんは さくら駅に ついたら、何を しますか。', ['マリアさんに 電話します。', '一人で マリアさんの いえへ 行きます。', '駅で １０分 まちます。', '駅から マリアさんの いえへ むかえに 行きます。'], 'Paragraph 2: 駅に ついたら、電話して ください。むかえに 行きます. Lin phones; マリアさん comes to the station.', 'keyword keyword dir', ["あるいて １０分 only says how far the house is. マリアさん asks for a call and will come and get Lin (むかえに 行きます).", "１０分 is the walk from the station to the house, not a wait.", "むかえに 行きます is what マリアさん does: she comes to the station for Lin. Lin's job is to phone."]]]);
passage(4, 'n4p3', 'わたしは 毎朝 ７時の 電車で 会社へ 行きます。この 電車は いつも とても {混|こ}んで いて、{座|すわ}る ことが できません。前は 立ったまま スマートフォンで ゲームを して いましたが、目が {疲|つか}れるし、時間が もったいないと 思うように なりました。\n　それで、先月から、電車の 中で 日本語の ポッドキャストを 聞く ことに しました。はじめは {速|はや}くて、ほとんど わかりませんでした。でも、同じ {番組|ばんぐみ}を 何回も 聞いて いるうちに、少しずつ {言葉|ことば}が 聞こえるように なりました。今は、わからない {言葉|ことば}が あったら メモして おいて、会社に 着いてから {調|しら}べて います。\n　毎日 たった ３０分ですが、１か月で 聞く 力が ずいぶん 上がったと 思います。{混|こ}んで いる 電車も、今は あまり いやでは ありません。', [['「わたし」は 前、電車の 中で 何を して いましたか。', ['スマートフォンで ゲームを して いた。', '日本語の ポッドキャストを 聞いて いた。', '{座|すわ}って {寝|ね}て いた。', 'わからない {言葉|ことば}を {調|しら}べて いた。'], 'Paragraph 1: 前は 立ったまま スマートフォンで ゲームを して いました. The podcast only started 先月から.', 'change neg keyword', ["The podcast is what the writer does NOW: 先月から … 聞く ことに しました.", "The train is so full that {座|すわ}る ことが できません; the writer stood (立ったまま).", "Looking words up is the new habit, and it happens at the office (会社に 着いてから), not on the train."]], ['わからない {言葉|ことば}が あったら、「わたし」は どう しますか。', ['メモして、会社に 着いてから {調|しら}べる。', '電車の 中で すぐに {調|しら}べる。', 'メモして、家に 帰ってから {調|しら}べる。', '同じ {番組|ばんぐみ}を 聞くのを やめる。'], 'Paragraph 2, last sentence: わからない {言葉|ことば}が あったら メモして おいて、会社に 着いてから {調|しら}べて います.', 'seq keyword keyword', ["On the train the writer only notes the word (メモして おいて). The looking up comes later: 会社に 着いてから.", "メモ is right, but the place is the office (会社に 着いてから), not home.", "The opposite: the writer listens to the same show again and again (同じ {番組|ばんぐみ}を 何回も 聞いて いる)."]], ['この ぶんしょうで 「わたし」が いちばん 言いたい ことは 何ですか。', ['短い 時間でも 毎日 聞けば、聞く 力が 上がる。', '{混|こ}んで いる 電車で {座|すわ}れないのは いやだ。', 'スマートフォンの ゲームは 目が {疲|つか}れる。', 'ポッドキャストは {速|はや}すぎて わからない。'], 'Paragraph 3 sums it up: 毎日 たった ３０分ですが、１か月で 聞く 力が ずいぶん 上がった. The rest of the story leads up to that.', 'change detail change', ["That changed: the last sentence says {混|こ}んで いる 電車も、今は あまり いやでは ありません.", "True (目が {疲|つか}れるし), but it is only one reason the writer stopped playing games, not the main point.", "Only at first: はじめは {速|はや}くて … わかりませんでした. Then the writer began to catch words (聞こえるように なりました)."]]]);
passage(4, 'n4p4', 'みどり市 スポーツセンター　プールの 使い方\n\n■ 開いて いる 時間\n　月〜金：午前９時〜午後９時\n　土・日：午前８時〜午後６時\n　※ 毎月 {第|だい}２水曜日は 休みです。\n\n■ 料金（１回）\n　大人（中学生以上）：５００円\n　子ども（小学生）：２００円\n　６５さい以上：３００円\n\n■ 注意\n・小学生は 大人と いっしょに 入って ください。\n・水着と {帽子|ぼうし}が {必要|ひつよう}です。{帽子|ぼうし}は {受付|うけつけ}で 買う ことも できます（３００円）。\n・タオルの 貸し出しは ありません。', [['土曜日に、大人 １人と 小学生 １人で プールに 行きます。料金は {全部|ぜんぶ}で いくらですか。', ['７００円', '５００円', '８００円', '１，０００円'], '■ 料金: 大人 ５００円 + 子ども（小学生）２００円 = ７００円. The day of the week does not change the price.', 'detail keyword detail', ["５００円 is the adult alone. The child pays ２００円 too.", "３００円 is the price for 65 and over (and for a cap). A 小学生 pays ２００円, so 500 + 300 is wrong.", "１，０００円 counts the child as an adult. 大人 means 中学生以上; a 小学生 is 子ども."]], ['{帽子|ぼうし}を 忘れた 人は どう すれば いいですか。', ['{受付|うけつけ}で ３００円で 買う。', '{帽子|ぼうし}なしで 入る。', '{受付|うけつけ}で 借りる。', 'その日は 入れない。'], '■ 注意: {帽子|ぼうし}は {受付|うけつけ}で 買う ことも できます（３００円）.', 'keyword keyword over', ["Caps are required: 水着と {帽子|ぼうし}が {必要|ひつよう}です.", "貸し出しは ありません is about towels. Caps can't be borrowed, but they can be BOUGHT at reception.", "You don't have to go home: you can buy a cap at reception (買う ことも できます)."]]]);
passage(3, 'n3p3', '最近、「タイパ」という 言葉を よく 耳に する。タイムパフォーマンス、つまり かけた 時間に 対して どれだけの {効果|こうか}が 得られるか という 意味だ。映画を {倍速|ばいそく}で 見たり、本の あらすじだけを 読んだり する 人が 増えて いるのも、タイパを {重視|じゅうし}して いるからだろう。\n　確かに、忙しい 現代人に とって、時間を {無駄|むだ}に しない ことは 大切だ。しかし、私は 何でも {効率|こうりつ}で 考える ことには 反対だ。映画の 中の 静かな 場面や、本の 中の 何気ない 一文が、あとに なって 心に 残る ことが ある。そういう 経験は、早送りでは 得られない。\n　{効率|こうりつ}よく 済ませる ことと、時間を かけて 味わう こと。その 両方を 使い分けられる 人こそ、本当に 時間を 上手に 使って いると 言えるのでは ないだろうか。', [['「タイパ」とは どういう 意味か。', ['かけた 時間に 対して 得られる {効果|こうか}', '映画を {倍速|ばいそく}で 見る こと', '忙しくて 時間が ない こと', '本の あらすじだけを 読む こと'], 'つまり … という 意味だ gives the definition. {倍速|ばいそく} and あらすじ are examples, not the meaning.', 'detail keyword detail', ["{倍速|ばいそく}で 見る is an example of people who care about タイパ, not what the word means. The meaning comes after つまり.", "忙しい appears in the text, but as the reason time matters, not as the meaning of タイパ.", "あらすじだけを 読む is an example, like the double-speed films. The definition is the line with つまり … という 意味だ."]], ['{筆者|ひっしゃ}は なぜ 何でも {効率|こうりつ}で 考える ことに 反対なのか。', ['時間を かけて 初めて 得られる 経験が あるから', '現代人は 忙しすぎるから', '{倍速|ばいそく}で 見ると 内容が わからないから', '映画や 本が 好きではないから'], 'Paragraph 2, after しかし: a quiet film scene or an ordinary line in a book can stay with you later, and そういう 経験は、早送りでは 得られない.', 'detail over polar', ["The writer agrees time matters for busy people (確かに…). That is the part they accept, not the reason they object.", "The text never says you can't understand the content at double speed. It says some experiences (quiet scenes, a small line) only come with time.", "The opposite: the writer's own example is a quiet film scene or an ordinary line in a book that stays in the heart (心に 残る). They value films and books; they just don't want to rush them."]], ['{筆者|ひっしゃ}の 考えに 合う ものは どれか。', ['{効率|こうりつ}と、時間を かけて 味わう ことを 場合に よって 使い分けるのが よい。', '時間を {無駄|むだ}に しない ことが いちばん 大切だ。', '映画は {倍速|ばいそく}で 見る べきでは ない。', '{効率|こうりつ}で 考える 人は 時間を 上手に 使えない。'], 'The conclusion: 両方を 使い分けられる 人こそ…. The other options take one part of the text too far.', 'over over over', ["Too strong: the writer says wasting no time is 大切, but argues against doing everything for efficiency. いちばん goes further than the text.", "The writer never says べきでは ない. They say some experiences need time, and you should switch between the two ways.", "The writer does not judge efficient people. They say the person who can use BOTH is the one who uses time well."]]]);
passage(3, 'n3p4', '私が 日本の 会社で 働き始めて、もうすぐ ３年に なる。来た ばかりの ころ、いちばん 困ったのは、日本語の テストでは 習わなかった 表現だった。\n　たとえば、{上司|じょうし}に 「この 資料、明日までに 見て おいて もらえる？」と 言われた とき、私は 「見る」だけで いいと 思い、ざっと 目を 通しただけだった。ところが、次の 日の 会議で、{上司|じょうし}は 私に 資料に ついての 意見を 求めた。「見て おいて」には、「内容を 確認して、意見を 言えるように して おいて」という 意味が {含|ふく}まれて いたのだ。何も {準備|じゅんび}して いなかった 私は、何も 答えられなかった。\n　また、{同僚|どうりょう}に 飲み会に {誘|さそ}われた とき、「考えて おきます」と 答えた ことが ある。私は 本当に 考える つもりだったが、{同僚|どうりょう}は 私が 行きたくないのだと 思ったらしい。それ以来、二度と {誘|さそ}われなかった。日本では、「考えて おきます」が 遠回しな 断りの 言葉として 使われる ことが 多いと 知ったのは、ずっと あとの ことだ。\n　こうした 失敗から、私は 言葉の 意味だけでなく、その 言葉が 使われる 場面や 相手の 気持ちを 考える ように なった。わからない ときは、{遠慮|えんりょ}せずに 「それは どういう 意味ですか」と 聞く ことに して いる。聞くのは 恥ずかしいが、間違えたまま 進むよりは ずっと いい。言葉を 学ぶ ことは、その 国の 人の 考え方を 学ぶ ことでも あるのだと 思う。', [['{上司|じょうし}の 「見て おいて もらえる？」には どんな 意味が あったか。', ['内容を 確認して、意見を 言えるように して おく。', '資料に ざっと 目を 通す だけで よい。', '明日までに 資料を 作り直す。', '会議の 前に 資料を コピーする。'], 'The text spells it out: 「内容を 確認して、意見を 言えるように して おいて」.', 'detail keyword keyword', ["That is what 「私」 THOUGHT it meant, and it was the mistake. The real meaning is in 「内容を 確認して、意見を 言えるように」.", "Nobody asked to remake the document. 資料 is repeated from the text, but the request was to read it well enough to give an opinion.", "Copying is never mentioned. The boss asked for 「私」's opinion in the meeting."]], ['{同僚|どうりょう}が 二度と {誘|さそ}わなかったのは なぜか。', ['「私」が 行きたくないのだと 思ったから', '「私」が 飲み会で 失敗したから', '「私」が 本当に 考える つもりだったから', '飲み会が なくなったから'], '{同僚|どうりょう}は 私が 行きたくないのだと 思ったらしい. Option 3 is true in the text but is not the reason.', 'keyword detail keyword', ["「私」 never went to the 飲み会, so there was no failure there. The coworker heard 「考えて おきます」 as a polite no.", "True in the text: 「私」 really meant to think about it. But the question asks why the coworker stopped, which is how the coworker understood it.", "Nothing says the drinking parties stopped. The coworker stopped inviting 「私」 only."]], ['「私」は 今、わからない 言葉が ある とき どう して いるか。', ['{遠慮|えんりょ}せずに 意味を 聞く。', '恥ずかしいので 聞かない。', 'あとで 自分で 調べる。', '{上司|じょうし}に メールで 聞く。'], 'Last paragraph: わからない ときは、{遠慮|えんりょ}せずに 「それは どういう 意味ですか」と 聞く ことに して いる. 〜ことに して いる = a habit they keep now.', 'polar keyword keyword', ["The opposite: 聞くのは 恥ずかしいが…ずっと いい. It is embarrassing, but they ask anyway.", "The text says 「私」 asks right away ({遠慮|えんりょ}せずに 聞く), not that they look it up later.", "Email is never mentioned; 「私」 asks directly: 「それは どういう 意味ですか」."]], ['この {文章|ぶんしょう}で {筆者|ひっしゃ}が いちばん 言いたい ことは 何か。', ['言葉を 学ぶ ことは、その 国の 人の 考え方を 学ぶ ことでも ある。', '日本語の テストは 仕事では 役に 立たない。', '飲み会に {誘|さそ}われたら 行く べきだ。', '{上司|じょうし}の 指示は 必ず メモする べきだ。'], 'The last sentence carries the main point. The others are details or go further than the text.', 'over over over', ["Too strong: the writer only says the test did not teach these expressions, not that the test is useless at work.", "The 飲み会 is one example of a misunderstanding. The writer never says you should always go.", "Taking notes is never mentioned. The lesson is about how words are used, not about the boss's instructions."]]]);
passage(3, 'n3p5', 'ひかり日本語学校　週末クラスの ご{案内|あんない}\n\nＡ　会話クラス｜土曜 10:00〜12:00｜{初級|しょきゅう}｜12,000円\nＢ　JLPT N3 たいさく｜土曜 13:00〜16:00｜{中級|ちゅうきゅう}｜18,000円\nＣ　ビジネス日本語｜日曜 10:00〜12:00｜{中級|ちゅうきゅう}〜じょうきゅう｜15,000円\nＤ　漢字クラス｜日曜 14:00〜15:30｜{初級|しょきゅう}〜{中級|ちゅうきゅう}｜9,000円\n（{受講料|じゅこうりょう}は すべて １か月分です）\n\n※ 初めて {受講|じゅこう}する 方は、入学金 5,000円が 必要です。\n※ {中級|ちゅうきゅう}以上の クラスを {受講|じゅこう}する 方は、{受講|じゅこう}前に レベルチェックテスト（{無料|むりょう}）を 受けて ください。\n※ ２つ以上の クラスを {受講|じゅこう}する 場合、{受講料|じゅこうりょう}の 合計が 10％ 安く なります（入学金は {対象外|たいしょうがい}）。', [['ワンさんは 日曜日の 午前中しか 時間が ない。{中級|ちゅうきゅう}の クラスを 受けたい。この 学校で {受講|じゅこう}するのは 初めてだ。最初の 月に いくら 払うか。', ['20,000円', '15,000円', '23,000円', '18,000円'], 'Sunday morning, {中級|ちゅうきゅう} → Ｃ (15,000円) + first-time 入学金 5,000円 = 20,000円.', 'detail keyword keyword', ["15,000円 is Ｃ's fee alone. ワンさん is new (初めて), so the 入学金 5,000円 is added.", "23,000円 is Ｂ + 入学金, but Ｂ is on Saturday afternoon. ワンさん can only come Sunday morning.", "18,000円 is Ｂ's fee: right level, wrong day, and the 入学金 is missing too."]], ['前から Ａクラスを 受けて いる キムさんは、来月から Ａと Ｄの ２つを 受ける ことに した。来月の {受講料|じゅこうりょう}は いくらか。', ['18,900円', '21,000円', '23,900円', '26,000円'], 'Ａ 12,000 + Ｄ 9,000 = 21,000円. The last ※ line takes 10％ off for two or more classes = 18,900円. The first ※ line charges the 入学金 only to people taking a class for the first time, and キムさん already takes Ａ.', 'detail detail detail', ["21,000円 is Ａ + Ｄ before the discount. Two or more classes are 10％ cheaper.", "23,900円 is the discounted 18,900円 plus a 5,000円 入学金. But the 入学金 is only for 初めて {受講|じゅこう}する 方, and キムさん already takes Ａ.", "26,000円 adds the 入学金 and skips the discount: two conditions missed."]]]);

/* ───────── N3 reading, batch 1: real-test formats. 短文 = 1 question, 中文 = 3, 長文 = 4, 情報検索 = 2. ───────── */
passage(3, 'n3p6', 'ミンさんへ\n\n午後の 会議の 資料ですが、３ページ目の グラフが 去年の 数字の ままでした。ぼくが 今、新しい 数字に 直して いるので、ミンさんは {印刷|いんさつ}を 待って ください。直したら、４時までに メールで 送ります。それを 人数分 {印刷|いんさつ}して、会議室の {机|つくえ}に 置いて おいて ください。\n\n山下', [['ミンさんは まず 何を しなければ ならないか。', ['山下さんから メールが 来るのを 待つ。', '３ページ目の グラフを 新しい 数字に 直す。', '資料を 人数分 {印刷|いんさつ}する。', '会議室の {机|つくえ}に 資料を 置く。'], 'まず = first. 山下さん is fixing the graph, and ミンさん must wait ({印刷|いんさつ}を 待って ください) until the email comes.', 'dir seq seq', ["ぼくが 今…直して いる: 山下さん fixes the graph himself. Check WHO does each action.", "Printing comes later: first the corrected file has to arrive by email. The memo says {印刷|いんさつ}を 待って.", "Putting the papers on the desk is the LAST step. The question asks what to do first (まず)."]]], 'short');
passage(3, 'n3p7', 'マンションに お住まいの 皆様へ\n\n来週 ３日（水）の 午前９時から 正午まで、水道の 工事を 行います。この 間は、台所や お{風呂|ふろ}で 水が 使えません。トイレは 工事の 前に 流して おいて ください。なお、工事が 早く 終わった 場合も、正午までは 水を 使わないで ください。\n\n{管理|かんり}会社', [['この お知らせの 内容と 合って いる ものは どれか。', ['工事が 早く 終わっても、正午までは 水を 使っては いけない。', '工事が 終われば、正午より 前でも 水を 使って よい。', '工事の 間も、トイレの 水は 流せる。', '工事は 水曜日の 午後に 行われる。'], 'The last line of the notice: なお、工事が 早く 終わった 場合も、正午までは 水を 使わないで ください. 〜場合も = even if.', 'neg keyword keyword', ["The opposite of the last sentence: even if the work ends early (早く 終わった 場合も), do not use water until noon.", "The notice says flush the toilet BEFORE the work (工事の 前に 流して おいて). During the work there is no water at all.", "正午 is 12:00 noon. The work is 9:00 to 12:00, in the morning, not the afternoon."]]], 'short');
passage(3, 'n3p8', '子どもの ころ、私は 本を 読むのが 苦手だった。親に 「本を 読みなさい」と 言われる たびに、もっと 読みたく なくなった。ところが 中学生の とき、好きな 歌手が {勧|すす}めて いた 小説を 読んで みたら、止まらなく なった。読書が 好きに なるか どうかは、読む りょうより、最初に どんな 本と 出会うかで 決まるのでは ないだろうか。', [['この {文章|ぶんしょう}を 書いた 人が いちばん 言いたい ことは 何か。', ['読書が 好きに なるには、最初に 出会う 本が 大切だ。', '子どもには たくさん 本を 読ませた ほうが いい。', '親は 子どもに 「本を 読みなさい」と 言っては いけない。', '好きな 歌手が {勧|すす}める 本は 面白い。'], 'The point is in the last sentence: 読む りょうより、最初に どんな 本と 出会うか.', 'polar over detail', ["The writer says the opposite: 読む りょうより… The AMOUNT matters less than the first book you meet.", "Too strong. The writer only says being told to read made THEM want to read less. They never give parents a rule (〜ては いけない).", "This is the example from the writer's own life, not the point. The singer is just how they met their first good book."]]], 'short');
passage(3, 'n3p9', '件名：レポートの {締|し}め切りに ついて\n\nリーさん\n\n先日 お話しした レポートの {締|し}め切りですが、金曜日の {授業|じゅぎょう}の 前と 言いましたが、間違いでした。正しくは、来週の 月曜日の 午後５時です。{提出|ていしゅつ}は 紙ではなく、大学の ホームページから お願いします。ほかの 学生には {授業|じゅぎょう}で 伝えますので、リーさんから {連絡|れんらく}しなくても だいじょうぶです。\n\n田村', [['リーさんは どう すれば いいか。', ['月曜日の 午後５時までに、ホームページから レポートを 出す。', '金曜日の {授業|じゅぎょう}の 前に、レポートを 紙で 出す。', '月曜日の 午後５時までに、レポートを 紙で 出す。', 'ほかの 学生に {締|し}め切りが 変わった ことを 伝える。'], 'New deadline: 月曜日の 午後５時. Method: 紙ではなく、ホームページから.', 'change keyword dir', ["That was the OLD deadline, and the email says it was a mistake (間違いでした). The answer is the corrected plan.", "Right time, wrong method: 紙ではなく means NOT on paper. Hand it in through the website.", "The teacher will tell the others in class, and says リーさん does not need to ({連絡|れんらく}しなくても だいじょうぶ)."]]], 'short');
passage(3, 'n3p10', 'さくら書店からの お知らせ\n\nいつも ご利用 いただき、ありがとう ございます。当店は ３月３１日で 駅前の 店を 閉める ことに なりました。４月からは、駅の 反対側に ある 「さくらモール」の ２階で 店を 開きます。ポイントカードは 新しい 店でも 使えます。また、取り置きの 本は、３月２５日までに 受け取りに 来て ください。', [['この お知らせから わかる ことは 何か。', ['さくら書店は ４月から 別の 場所で 店を 開く。', 'さくら書店は ３月３１日で 店を やめて しまう。', '今の ポイントカードは ４月から 使えなく なる。', '取り置きの 本は ３月３１日までに 受け取れば いい。'], 'Only the station-front shop closes. From April the shop opens in さくらモール, on the other side of the station.', 'over polar keyword', ["Too strong: only 駅前の 店 closes. The shop moves to さくらモール, it does not stop doing business.", "The opposite: ポイントカードは 新しい 店でも 使えます.", "The deadline for held books is 3月25日. 3月31日 is when the old shop closes. Two dates in one notice: match each to its action."]]], 'short');
passage(3, 'n3p11', '最近、近所の スーパーに 「セルフレジ」が 増えた。自分で 商品の バーコードを 読ませて、お金を 払う {機械|きかい}だ。確かに、レジに {並|なら}ぶ 時間は 短く なった。しかし、私の 母は 使い方が わからず、店員に 聞くのも 悪いと 思って、少し 遠い 別の 店に 行く ように なった。便利な ものが 増えても、それを 使えない 人の ことも 考える 必要が あるだろう。', [['「それを 使えない 人」の 「それ」は 何を 指して いるか。', ['セルフレジのような 便利な {機械|きかい}', '少し 遠い 別の 店', 'レジに {並|なら}ぶ 時間', '店員に 聞く こと'], 'それ points to 便利な もの in the same sentence: new convenient machines like the self-checkout.', 'ref ref ref', ["The other shop is the nearest noun before the last sentence, but you cannot 使えない a shop. Put it in place of それ and the sentence breaks.", "Time spent in line got shorter. It is not something people can or cannot use.", "Asking a clerk is what the mother felt bad about. それ is in the sentence about 便利な もの, so it points there."]]], 'short');
passage(3, 'n3p12', '市民体育館を ご利用の 皆様へ\n\n４月から、体育館の 利用方法が 変わります。これまでは、当日 受付で 申し込む ことが できましたが、４月からは インターネットでの 予約が 必要に なります。予約は 利用日の １か月前から 前日まで できます。当日の 予約は できませんので、ご注意 ください。', [['４月１０日に 体育館を 使いたい 人は どう しなければ ならないか。', ['４月９日までに インターネットで 予約する。', '４月１０日に 受付で 申し込む。', '４月１０日に インターネットで 予約する。', '３月１０日までに 受付で 申し込む。'], 'From April: internet booking only, from one month before until the day before (前日). The day before 4/10 is 4/9.', 'change neg keyword', ["That is the OLD way (これまでは). From April, booking at the counter on the day is gone.", "当日の 予約は できません: you cannot book on the day itself, even online.", "3月10日 is the FIRST day you can book (１か月前から), not the deadline. And the counter is no longer used."]]], 'short');
passage(3, 'n3p13', '朝 早く 起きるのが いいと よく 言われる。私も 試しに 毎朝 ５時に 起きて みたが、昼すぎには 眠くて、仕事に 集中できなかった。それで、今は ７時に 起きて いる。大切なのは 何時に 起きるかでは なく、自分の 体に 合った 時間に 起きて、決まった 時間 寝る ことだと 思う。', [['この {文章|ぶんしょう}を 書いた 人の 考えに 合う ものは どれか。', ['起きる 時間は 自分の 体に 合わせて 決めれば いい。', '毎朝 ５時に 起きる ほうが 仕事に 集中できる。', '朝 早く 起きるのは 体に 悪い。', '毎朝 ７時に 起きるのが いちばん いい。'], 'Last sentence: 大切なのは 何時に 起きるかでは なく、自分の 体に 合った 時間に 起きて、決まった 時間 寝る こと. A では なく B: B is the writer\'s view.', 'polar over over', ["The opposite of what happened: at 5:00 the writer was sleepy and could NOT concentrate.", "Too strong. 5:00 did not suit THIS writer. They never say getting up early is bad for everyone.", "7:00 is the writer's own time. Their point is that the right time is different for each body, so there is no best hour."]]], 'short');
passage(3, 'n3p14', '日本に 来て {驚|おどろ}いたのは、「すみません」という 言葉が 一日に 何回も 聞こえる ことだ。店員を 呼ぶ とき、道を 聞く とき、エレベーターの ドアを 開けて もらった ときにも、日本人は 「すみません」と 言う。\n　最初、私は 不思議に 思った。ドアを 開けて もらったなら、悪い ことは して いないのだから、「ありがとう」で いいはずだ。ところが、日本人の 友人に 聞くと、「相手に 手間を かけさせて 悪かった、という 気持ちも 入って いるんだよ」と 教えて くれた。つまり、この 場合の 「すみません」には、お礼と おわびの 両方の 気持ちが あるのだ。\n　それを 知ってから、私も 少しずつ 使える ように なった。ただ、国の 家族と 電話で 話して いる ときにも、つい 「すみません」と 言って しまい、笑われた ことが ある。言葉と いっしょに、気持ちの 表し方も 体に 入って くるのだろう。', [['「私」は 最初、なぜ 不思議に 思ったのか。', ['悪い ことを して いないのに、{謝|あやま}る 言葉を 使うから', '日本人が 「ありがとう」を ぜんぜん 言わないから', '店員を 呼ぶ ときに 「すみません」と 言うから', '日本人の 友人が 理由を 教えて くれなかったから'], 'Paragraph 2, right after 最初、私は 不思議に 思った: ドアを 開けて もらったなら、悪い ことは して いないのだから、「ありがとう」で いいはずだ. すみません is an apology, but nothing bad was done.', 'over detail keyword', ["Too strong: the text never says Japanese people NEVER say ありがとう (ぜんぜん). It says they say すみません even when ありがとう would do.", "Calling a clerk is one of the examples of when people say it. The puzzle was using an apology when nothing bad was done.", "The friend DID explain it. That is how 「私」 learned the reason."]], ['ドアを 開けて もらった ときの 「すみません」には、どんな 気持ちが あるか。', ['お礼と、相手に 手間を かけさせた ことへの おわび', '悪い ことを した ことへの おわびだけ', '「ありがとう」と 同じ、お礼の 気持ちだけ', '店員を 呼ぶ ときと 同じ 気持ち'], 'End of paragraph 2, after the friend explains: つまり、この 場合の 「すみません」には、お礼と おわびの 両方の 気持ちが ある.', 'detail detail keyword', ["Half the answer. つまり gives both: お礼と おわびの 両方. だけ (only) cuts off the thanks.", "Half the answer again, the other half. The friend adds that a feeling of sorry for the trouble is inside it too.", "Calling a clerk is a different scene from the list at the start. The question is about the door, and the answer is after つまり."]], ['「私」が 家族に 笑われたのは なぜか。', ['家族と 話して いる ときにも、つい 「すみません」と 言ったから', '「すみません」の 使い方を 間違えたから', '家族に 何回も 電話を かけたから', '日本語が 上手に なったから'], 'The habit came home with them: 国の 家族と 電話で 話して いる ときにも、つい 「すみません」と 言って しまい….', 'detail keyword over', ["The word was not used wrongly for Japan. The family laughed because the Japanese habit slipped out while talking to them.", "電話 is in the text, but nothing says they called too often. The laugh came from what they said.", "Being good at Japanese is not why they laughed. The writer's point is that a way of showing feelings becomes part of you."]]], 'mid');
passage(3, 'n3p15', '最近、駅や コンビニで 「{傘|かさ}の シェアサービス」を 見かける ように なった。スマートフォンで {登録|とうろく}すれば、急に 雨が 降って きた とき、近くの スタンドから {傘|かさ}を 借りられる。返す ときは、借りた 場所で なくても、近くの スタンドに 返せば いい。\n　この サービスが 生まれた きっかけは、ビニールがさの ごみの 問題だった。日本では 一年に 何千万本もの ビニールがさが 使われ、その 多くが すぐに {捨|す}てられて いる。安いので、雨が 降る たびに 買って しまう 人が 多いのだ。\n　しかし、問題も ある。借りた {傘|かさ}を 返さない 人が いる ことだ。そこで、ある 会社では、決まった 日数を すぎると 料金が 高く なる 仕組みを 作った。これで、{傘|かさ}を 返す 人が かなり 増えたと いう。', [['この サービスで {傘|かさ}を 返す ときは、どう すれば いいか。', ['借りた 場所でなくても、近くの スタンドに 返せば いい。', '借りた 場所の スタンドに 返さなければ ならない。', '駅か コンビニの 店員に 返す。', 'スマートフォンで {登録|とうろく}してから 返す。'], 'Paragraph 1, last sentence: 返す ときは、借りた 場所で なくても、近くの スタンドに 返せば いい.', 'neg keyword seq', ["The text says 借りた 場所で なくても: it does NOT have to be the place you borrowed from. The なくても was missed.", "駅 and コンビニ are where you see the stands, not people who take the umbrella back. You return it to a stand.", "Registering comes first, before you BORROW. The question is about returning."]], ['この サービスが 生まれた 理由は 何か。', ['すぐに {捨|す}てられる ビニールがさを {減|へ}らしたかったから', '急に 雨が 降る ことが 多いから', 'ビニールがさが 高いから', '{傘|かさ}を 返さない 人が 多いから'], 'Paragraph 2 opens with it: この サービスが 生まれた きっかけは、ビニールがさの ごみの 問題だった. Cheap umbrellas are bought and soon thrown away (すぐに {捨|す}てられて いる).', 'detail polar detail', ["Sudden rain is when you USE the service. The reason it was made is in the sentence with きっかけ: umbrella waste.", "The opposite: they are 安い, which is exactly why people keep buying and throwing them away.", "Unreturned umbrellas are a problem that came AFTER the service started (しかし、問題も ある), not the reason it was made."]], ['「これ」は 何を 指して いるか。', ['決まった 日数を すぎると 料金が 高く なる 仕組み', '{傘|かさ}を 返さない 人が いる こと', 'スマートフォンで {登録|とうろく}する こと', 'ビニールがさの ごみの 問題'], 'これ points to the sentence just before it: the system where the fee goes up after a set number of days.', 'ref ref ref', ["Put it in place of これ: \"because people don't return umbrellas, more people return them\" makes no sense. This is the problem, これ is the fix.", "Registering is in the first paragraph, far from これ. A これ usually points back to the sentence right before it.", "The waste problem is the topic of the second paragraph. これ is in the third and points to the new fee system."]]], 'mid');
passage(3, 'n3p16', '私は 三十歳に なるまで、ほとんど 料理を した ことが なかった。仕事が 忙しく、食事は いつも コンビニの お{弁当|べんとう}か 外食だった。料理は 時間が かかるし、一人分を 作るのは かえって お金が かかると 思って いた。\n　変わったのは、{健康診断|けんこうしんだん}で 医者に 「このままの 食生活を 続けると、十年後に 困りますよ」と 言われた ときだ。正直に 言うと、病気が 怖かったと いうより、医者の あきれた 顔が {悔|くや}しかった。その 日の 帰りに、私は 初めて {包丁|ほうちょう}を 買った。\n　最初の 一か月は 失敗ばかりだった。ご飯は {固|かた}く、みそしるは からすぎた。それでも 続けられたのは、毎日 同じ ものを 作ると 決めたからだ。メニューを 考える 必要が なく、少しずつ 上手に なるのが 自分で わかった。一か月後、母に 作り方を 聞いて、二品目を 覚えた。\n　今では、週に 五日は 自分で 作って いる。お金も 思って いたほど かからない。何より、料理を して いる 間は 仕事の ことを 忘れられる。台所に 立つ 時間が、一日の 中で いちばん 落ち着く 時間に なった。\n　何か 新しい ことを 始める とき、私たちは つい 最初から 上手に やろうと する。しかし、大切なのは、続けられる 形を 作る ことなのでは ないだろうか。', [['「私」が 三十歳まで 料理を しなかったのは なぜか。', ['時間が かかるし、一人分だと お金が かかると 思って いたから', '料理が {嫌|きら}いだったから', '医者に 止められて いたから', '母に 作り方を 聞けなかったから'], 'Paragraph 1, last sentence: 料理は 時間が かかるし、一人分を 作るのは かえって お金が かかると 思って いた.', 'over keyword keyword', ["The text never says they disliked cooking. The reasons given are time and money.", "The doctor appears later, and he did the opposite: his warning is what STARTED the cooking.", "The mother taught them a second dish after a month. Nothing says they couldn't ask her before."]], ['「私」が 料理を 始めた いちばんの 理由は 何か。', ['医者の あきれた 顔が {悔|くや}しかったから', '病気に なるのが 怖かったから', 'お金を 使いすぎたく なかったから', '{包丁|ほうちょう}を 買ったから'], 'Paragraph 2: 病気が 怖かったと いうより、医者の あきれた 顔が {悔|くや}しかった. A と いうより B: B is the real reason.', 'detail polar seq', ["A と いうより B = not so much A as B. The writer puts fear of illness aside and names the doctor's face as the real reason.", "At the time the writer believed cooking for one costs MORE (かえって お金が かかる), so saving money was not the reason.", "Buying the knife was the first ACTION after deciding, not the reason for deciding."]], ['最初の 一か月、料理を 続けられたのは なぜか。', ['毎日 同じ ものを 作ると 決めたから', '母が 作り方を 教えて くれたから', '最初から 上手に 作れたから', 'メニューを 考えるのが 楽しかったから'], 'Paragraph 3, after the failures: それでも 続けられたのは、毎日 同じ ものを 作ると 決めたからだ.', 'seq polar keyword', ["The mother helped AFTER the first month (一か月後), with a second dish. The question is about the first month.", "The opposite: 最初の 一か月は 失敗ばかりだった. The rice was hard and the miso soup too salty.", "メニュー is in the text, but the point is the opposite: making the same dish meant they did NOT need to think about the menu."]], ['この {文章|ぶんしょう}で {筆者|ひっしゃ}が いちばん 言いたい ことは 何か。', ['新しい ことを 始める ときは、続けられる 形を 作る ことが 大切だ。', '{健康|けんこう}の ために、毎日 自分で 料理を する べきだ。', '料理を すれば、外食より お金が かからない。', '仕事が 忙しい 人こそ、料理を して 仕事を 忘れる べきだ。'], 'The last paragraph moves from cooking to a general point: 大切なのは、続けられる 形を 作る ことなのでは ないだろうか.', 'over detail over', ["Too strong, and too narrow. The writer cooks five days a week, not every day, and never tells readers what they should do (べきだ).", "Money is one detail from the fourth paragraph (思って いたほど かからない). The main point comes in the last paragraph and is about starting anything new.", "Forgetting work is a personal plus the writer found, not advice for busy people. べきだ goes further than the text."]]], 'long');
passage(3, 'n3p17', 'みなみ駅 自転車置き場の ご利用に ついて\n\n■ 利用料金\n　１日利用（当日のみ）　　自転車 150円 ／ バイク 300円\n　１か月利用（定期）　　　自転車 2,000円 ／ バイク 4,000円\n　※ 学生（高校生・大学生）は、定期の 料金が 半分に なります。学生{証|しょう}を 見せて ください。\n\n■ 定期の 申し込み\n　・申し込みは、毎月 20日から 月の 終わりまで、{管理|かんり}室で 受け付けます。\n　・申し込んだ 次の 月の １日から 使えます。\n　・{管理|かんり}室の 受付時間：午前７時〜午後８時\n\n■ 注意\n　・午前０時から 午前５時までは、自転車の 出し入れが できません。\n　・３日以上 置いた ままの 自転車は、ほかの 場所へ {移動|いどう}します。', [['大学生の チャンさんは、来月から 毎日 自転車で この 駅まで 来る。いちばん 安く 使うには、どう すれば いいか。', ['今月 20日から 月の 終わりまでに、学生{証|しょう}を 持って {管理|かんり}室で 定期を 申し込み、1,000円 払う。', '来月 1日に {管理|かんり}室で 定期を 申し込み、1,000円 払う。', '今月 20日から 月の 終わりまでに {管理|かんり}室で 定期を 申し込み、2,000円 払う。', '毎日 １日利用に して、150円ずつ 払う。'], 'Daily for a month → 定期. Student → half of 2,000円 = 1,000円, with a student card. Apply 20日〜月の 終わり to use it from the 1st.', 'seq detail keyword', ["Too late: the 定期 can be used from the 1st of the month AFTER you apply, and you apply from the 20th to the end of the month before.", "2,000円 is the normal price. The ※ line halves 定期 for 高校生・大学生, and チャンさん is a university student.", "150円 × about 30 days is far more than 1,000円. The question asks for the cheapest way."]], ['この 自転車置き場に ついて、正しい ものは どれか。', ['夜中の ２時には 自転車を 出す ことが できない。', '定期は 申し込んだ 日から すぐに 使える。', 'バイクの １日利用は、学生なら 150円に なる。', '{管理|かんり}室は 午前０時から 午前５時まで 開いて いる。'], '午前０時から 午前５時までは、自転車の 出し入れが できません. 2:00 a.m. is inside that time.', 'keyword detail keyword', ["The 定期 starts on the 1st of the NEXT month (次の 月の １日から), not on the day you apply.", "The student half price is only for 定期. The １日利用 price is the same for everyone.", "0:00–5:00 is when bikes can't be moved in or out. The office is open 7:00–20:00."]]], 'info');

/* ───────── N3 reading, batch 2: 7 短文, 2 中文, 1 長文, 2 情報検索. ───────── */
passage(3, 'n3p18', '件名：土曜日の シフトに ついて\n\nグエンさん\n\nお疲れさまです。実は、今週の 土曜日、家族の 用事で アルバイトに 来られなく なって しまいました。もし よかったら、ぼくの 土曜日の 夕方の シフトと、グエンさんの 来週 水曜日の シフトを 交代して もらえませんか。店長には、決まったら ぼくから 話します。難しければ、ほかの 人にも 聞いて みるので、{遠慮|えんりょ}なく 言って ください。\n\n木村', [['木村さんが グエンさんに 頼みたい ことは 何か。', ['土曜日の シフトと 来週 水曜日の シフトを 交代して ほしい。', '土曜日に 休む ことを 店長に 話して ほしい。', 'シフトを 交代できる 人を ほかに 探して ほしい。', '土曜日の 家族の 用事を 手伝って ほしい。'], 'The request is 〜を 交代して もらえませんか: swap Kimura\'s Saturday evening shift for Nguyen\'s Wednesday shift.', 'dir dir keyword', ["店長には…ぼくから 話します: 木村さん will tell the manager himself. Check WHO does each action.", "Asking other people is 木村さん's own plan B (ほかの 人にも 聞いて みる), not something he wants グエンさん to do.", "家族の 用事 is why 木村さん can't come. Nobody asks for help with it."]]], 'short');
passage(3, 'n3p19', 'やまかわ歯科からの お知らせ\n\n予約の 日時を 変えたい 方は、前の 日の 午後６時までに お電話 ください。インターネットでの 変更は できません。当日に 来られなく なった 場合も、必ず お電話 ください。{連絡|れんらく}が ないまま ２回 来られなかった 方は、次から 予約を お受けできない ことが あります。', [['予約した 日の 朝、急に 行けなく なった 人は どう すれば いいか。', ['すぐに 歯科に 電話する。', '前の 日の 午後６時までに 電話する。', 'インターネットで 予約を 変える。', '{連絡|れんらく}しないで、次の 予約の 日に 行く。'], '当日に 来られなく なった 場合も、必ず お電話 ください. It is already the day itself, so the only way is to call now.', 'detail neg polar', ["That is the rule for changing a booking in advance. It is already the morning of the day, so 前の 日 has passed. The 当日 line is the one that fits.", "インターネットでの 変更は できません: changes online are not possible at all.", "The opposite of 必ず お電話 ください. And no contact twice can mean they stop taking your bookings."]]], 'short');
passage(3, 'n3p20', '私は 大阪で 生まれ、十八歳で 東京の 大学に 入った。最初の ころ、大阪の 言葉で 話すと、{周|まわ}りの 人が 「面白い」と 笑った。悪い 意味では なかったと 思う。それでも、何を 言っても 話の 内容より 言葉の ほうに 注目されるのが いやで、私は だんだん 東京の 言葉で 話す ように なった。今では、大阪の 友だちに 「話し方が 変わったね」と 言われると、少し {寂|さび}しい 気持ちに なる。', [['「私」が 東京の 言葉で 話す ように なったのは なぜか。', ['話の 内容より 言葉の ほうに 注目されるのが いやだったから', '{周|まわ}りの 人に 大阪の 言葉を 悪く 言われたから', '大阪の 言葉を 忘れて しまったから', '大阪の 友だちに 話し方が 変わったと 言われたから'], 'Middle of the text: それでも、何を 言っても 話の 内容より 言葉の ほうに 注目されるのが いやで、私は だんだん 東京の 言葉で 話す ように なった. それでも = even though the laughing was not mean.', 'polar over seq', ["The writer says 悪い 意味では なかったと 思う: people laughed, but not to be mean.", "Nothing says they forgot it. They chose to switch, and they still talk with friends from Osaka.", "The friends' comment comes now (今では), after the change. It is a result, not the reason."]]], 'short');
passage(3, 'n3p21', '件名：ご注文の 商品に ついて\n\nハリス様\n\nこの たびは ご注文 ありがとう ございます。ご注文の 黒い 靴（２５．５センチ）は、ただいま 品切れの ため、お届けが ２週間ほど 遅れる 予定です。お待ち いただける 場合は、何も なさらなくて けっこうです。キャンセルを ご{希望|きぼう}の 場合は、５日までに この メールに お返事 ください。代金は 全部 お返しします。\n\nオンラインショップ みどり', [['靴が 来るのを 待つ ことに した ハリスさんは、どう すれば いいか。', ['何も しなくて いい。', '５日までに この メールに 返事を する。', '２週間後に もう一度 注文する。', '店に {連絡|れんらく}して、待つ ことを 伝える。'], 'お待ち いただける 場合は、何も なさらなくて けっこうです. なさる is the honorific of する.', 'detail keyword neg', ["Replying by the 5th is only for people who want to cancel (キャンセルを ご{希望|きぼう}の 場合). Harris is waiting.", "２週間 is how late the shoes will arrive, not a time to order again. The order is still there.", "何も なさらなくて けっこう = you don't need to do anything. Missing that ない turns it into \"do something\"."]]], 'short');
passage(3, 'n3p22', '先日、電車で 前に 立った お年寄りに 席を {譲|ゆず}ろうと した。ところが、「次で おりますから」と 断られて しまった。少し 恥ずかしかったが、その 人は 二駅 先まで 降りなかった。あとで 考えると、あれは 私に 気を つかわせない ための 言葉だったのかも しれない。{譲|ゆず}る ほうにも、{譲|ゆず}られる ほうにも、それぞれの 気づかいが あるのだ。', [['{筆者|ひっしゃ}は、お年寄りが 席に 座らなかった 理由を どう 考えて いるか。', ['{筆者|ひっしゃ}に 気を つかわせたく なかったのでは ないか。', '本当に 次の 駅で 降りる つもりだったのでは ないか。', '{筆者|ひっしゃ}が 恥ずかしそうに して いたからでは ないか。', '席に 座るのが {嫌|きら}いだったのでは ないか。'], 'あれは 私に 気を つかわせない ための 言葉だったのかも しれない. The proof: the person did not get off for two more stations.', 'keyword dir over', ["That is what the words said, but the person stayed on for 二駅 先. The writer reads 「次で おります」 as a kind excuse.", "It was the WRITER who felt embarrassed, and only after being refused. The order and the person are both wrong.", "Nothing in the text says they dislike sitting. The writer's guess is about being kind, not about likes."]]], 'short');
passage(3, 'n3p23', '社員の 皆様へ\n\n７月から ９月まで、電気を 節約する ため、事務所の エアコンは ２８度に させて いただきます。暑い 日は、ネクタイや 上着を 着なくても かまいません。ただし、お客様と 会う 日は、これまで どおり 上着を 着て ください。また、昼休みの 間は、事務所の 電気を 消します。\n\n{総務部|そうむぶ}', [['８月の 暑い 日に、お客様と 会う 予定の ある 社員は どう すれば いいか。', ['いつもの ように 上着を 着る。', '上着を 着なくても いい。', 'エアコンを ２８度より 低く して もらう。', '昼休みも 事務所の 電気を つけて おく。'], 'ただし、お客様と 会う 日は、これまで どおり 上着を 着て ください. ただし marks the exception.', 'detail over keyword', ["True for ordinary hot days, but ただし adds an exception: on days with a customer, wear the jacket as before.", "Nothing allows anyone to change the 28°C setting, even on customer days.", "Lights go OFF at lunch for everyone. Customer days change only the jacket rule."]]], 'short');
passage(3, 'n3p24', '毎月 お金が 足りなく なるので、先月から 使った お金を 全部 ノートに 書く ことに した。大きな 買い物は して いない つもりだったが、一か月 書いて みて {驚|おどろ}いた。コンビニで 毎日のように 買う 飲み物や お{菓子|かし}が、合わせると 一万円を {超|こ}えて いたのだ。一回 一回は 安いから、使って いる ことに 気が つかなかったのだろう。', [['ノートに 書いて みて、{筆者|ひっしゃ}が 気が ついた ことは 何か。', ['毎日の 小さな 買い物が、合わせると 大きな {金額|きんがく}に なって いた こと', '大きな 買い物を しすぎて いた こと', 'ノートに 書くと、お金を 使わなく なる こと', 'コンビニで 使った お金は 一万円より 少なかった こと'], 'The surprise: drinks and snacks bought almost every day came to more than ¥10,000 (一万円を {超|こ}えて いた).', 'polar over keyword', ["The opposite: 大きな 買い物は して いない つもりだった. The problem was the small things.", "The text stops at what the writer noticed. It never says writing it down made them spend less.", "こえる = go over. It was MORE than ¥10,000, not less."]]], 'short');
passage(3, 'n3p25', '日本に 来て 二か月目の ことだ。私は 駅の ホームで {財布|さいふ}を 落として しまった。中には お金だけで なく、在留カードも 入って いた。もう 戻って こないだろうと 思いながら 駅員さんに 話すと、「近くの 交番に 行って みて ください」と 言われた。\n　交番に 行くと、警察官が 私の 話を 聞いて、すぐに どこかに 電話を かけた。そして、「届いて いますよ」と 言ったのだ。電車に 乗って いた 高校生が {拾|ひろ}って、次の 駅の 交番に 届けて くれたらしい。お金も カードも、一つも なくなって いなかった。\n　国の 友だちに この 話を すると、みんな 「うそだろう」と 言う。確かに、私も 自分の ことで なければ 信じなかったかも しれない。でも、私が 本当に うれしかったのは、{財布|さいふ}が 戻った ことより、知らない 人が 私の ために 時間を 使って くれた ことだった。お礼を 言いたかったが、高校生は 名前を 残して いなかった。', [['交番で、警察官は 何を したか。', ['すぐに 電話を かけて、{財布|さいふ}が 届いて いるか 調べた。', '「私」と いっしょに 駅の ホームを 探した。', '高校生に {連絡|れんらく}して、お礼を 伝えた。', '次の 駅の 交番に 行く ように 言った。'], 'Paragraph 2, first sentence: 警察官が 私の 話を 聞いて、すぐに どこかに 電話を かけた。そして、「届いて いますよ」と 言った.', 'keyword over dir', ["The ホーム is where the wallet was lost, and the station staff sent 「私」 to the 交番. Nobody searched the platform.", "Nobody thanked the student: the last line says they left no name, so 「私」 couldn't even say thank you.", "次の 駅の 交番 is where the STUDENT took the wallet (届けて くれたらしい). The officer didn't send 「私」 anywhere: he phoned (すぐに どこかに 電話を かけた) and found it."]], ['友だちが 「うそだろう」と 言うのは なぜか。', ['落とした {財布|さいふ}が そのまま 戻って くるとは 思えないから', '「私」が よく うそを つくから', '高校生が 名前を 残さなかったから', '交番が 駅から 遠かったから'], 'The writer agrees: 私も 自分の ことで なければ 信じなかったかも しれない. A lost wallet coming back untouched is hard to believe.', 'over detail keyword', ["Nothing says 「私」 is a liar. うそだろう here means \"no way, that can't be true\".", "True in the text, but it is the last detail of the story, not why the friends doubt it.", "The text says 近くの 交番: it was close. Distance has nothing to do with the friends' reaction."]], ['「私」が 本当に うれしかった ことは 何か。', ['知らない 人が 自分の ために 時間を 使って くれた こと', '{財布|さいふ}が 戻って きた こと', 'お金が 一つも なくなって いなかった こと', '高校生に お礼を 言えた こと'], 'A ことより B: B is what mattered more. うれしかったのは、{財布|さいふ}が 戻った ことより、知らない 人が…時間を 使って くれた こと.', 'detail keyword polar', ["{財布|さいふ}が 戻った ことより puts this in second place. ～より B means B is the real answer.", "The money is in the text (一つも なくなって いなかった), but it is part of the wallet coming back, which the writer ranks second.", "The opposite: お礼を 言いたかったが、高校生は 名前を 残して いなかった. They never could."]]], 'mid');
passage(3, 'n3p26', 'スーパーで 売られて いる 食品には、「{賞味|しょうみ}期限」か 「消費期限」の どちらかが 書かれて いる。この 二つは 似て いるが、意味は 違う。\n　消費期限は 「この 日までに 食べて ください」という 日で、お{弁当|べんとう}や サンドイッチなど、早く 悪く なる 食品に 書かれて いる。一方、{賞味|しょうみ}期限は 「おいしく 食べられる 期限」で、スナック{菓子|がし}や {缶詰|かんづめ}など、長く もつ 食品に 書かれて いる。つまり、{賞味|しょうみ}期限が すぎても、すぐに 食べられなく なる わけでは ないのだ。\n　ところが、この 違いを 知らずに、{賞味|しょうみ}期限が すぎた 食品を 全部 {捨|す}てて しまう 人が 少なくない。まだ 食べられる 物が ごみに なるのは、もったいない ことだ。期限を 見る ときは、まず どちらの 期限なのかを 確かめる ように したい。', [['消費期限の 説明として 正しい ものは どれか。', ['その 日までに 食べる 必要が あり、早く 悪く なる 食品に 書かれる。', 'おいしく 食べられる 期限で、{缶詰|かんづめ}などに 書かれる。', 'すぎても、すぐに 食べられなく なる わけでは ない。', 'スナック{菓子|がし}など、長く もつ 食品に 書かれる。'], 'Paragraph 2, first sentence: 消費期限は 「この 日までに 食べて ください」という 日で、お{弁当|べんとう}や サンドイッチなど、早く 悪く なる 食品に 書かれて いる.', 'detail keyword detail', ["That is {賞味|しょうみ}期限, the other label. The two are explained side by side, so check which name each sentence goes with.", "This line is about {賞味|しょうみ}期限 (つまり、{賞味|しょうみ}期限が すぎても…). For 消費期限 the date is a real limit.", "Snacks and cans are the {賞味|しょうみ}期限 examples. 消費期限 goes on bento and sandwiches."]], ['「すぐに 食べられなく なる わけでは ない」とは どういう ことか。', ['{賞味|しょうみ}期限が すぎても、まだ 食べられる 場合が ある。', '{賞味|しょうみ}期限が すぎたら、すぐに 食べては いけない。', '{賞味|しょうみ}期限が すぎた 食品は、何日 すぎても 食べられる。', '消費期限が すぎても、まだ 食べられる。'], '〜わけでは ない = it does not mean that…. Past the {賞味|しょうみ}期限, food does not suddenly become uneatable.', 'neg over keyword', ["わけでは ない denies the whole idea. Reading it without the ない gives the opposite meaning.", "Too strong. The text says not IMMEDIATELY (すぐに); it never says any number of days is fine.", "The sentence is about {賞味|しょうみ}期限. 消費期限 is the one you should keep to."]], ['この {文章|ぶんしょう}で {筆者|ひっしゃ}が いちばん 言いたい ことは 何か。', ['期限を 見る ときは、どちらの 期限かを まず 確かめた ほうが いい。', '{賞味|しょうみ}期限が すぎた 食品を {捨|す}てる 人は ほとんど いない。', '食品は 期限に 関係なく 食べられる。', 'スーパーは 期限を 一つだけ 書く べきだ。'], 'The last sentence: まず どちらの 期限なのかを 確かめる ように したい.', 'neg over over', ["少なくない = not few, i.e. QUITE A LOT of people. Two negatives make it positive.", "Too strong: 消費期限 is a real limit. Only {賞味|しょうみ}期限 can be passed a little.", "The writer never tells shops what to do. Each food already has just one of the two labels (どちらか)."]]], 'mid');
passage(3, 'n3p27', '入社して 三年目、私は 「頼まれたら 断らない 人」として 知られて いた。資料の 作成、会議の {準備|じゅんび}、新人の 世話。頼まれると、自分の 仕事が 終わって いなくても 「いいですよ」と 答えた。断ったら {嫌|きら}われるのでは ないか、仕事が できない 人だと 思われるのでは ないかと、怖かったのだ。\n　そう して いる うちに、毎日 夜 十時すぎまで 会社に 残る ように なった。それでも 仕事は なかなか 終わらず、ある 日、大切な 書類の 数字を 間違えて しまった。その 書類は、私が 自分から 作ると 言った ものだった。\n　その とき、{課長|かちょう}に 言われた 言葉を 今でも 覚えて いる。「全部 引き受けて、全部 {中途半端|ちゅうとはんぱ}に なるのが いちばん 困るんだよ。できない ときは、できないと 言って くれた ほうが、こちらも 助かる」。私は、断らない ことが 相手の ためだと 思って いたが、それは 違って いたのだ。\n　それから、私は 頼まれた とき、すぐには 答えず、今 自分が 何を 抱えて いるかを 確かめる ように した。そして、難しい ときは 「今週は 難しいですが、来週の 水曜日なら できます」と、できる ことも いっしょに 伝える ように した。{驚|おどろ}いた ことに、そう 答えても、いやな 顔を する 人は ほとんど いなかった。\n　断るのは、今でも 少し {勇気|ゆうき}が いる。しかし、断り方しだいで、相手との 関係は かえって よく なる ことも ある。大切なのは、「はい」か 「いいえ」かでは なく、相手に とって 何が 役に 立つかを 考える ことだと 思う。', [['「私」が 前、頼まれた 仕事を 断らなかったのは なぜか。', ['断ると、{嫌|きら}われたり、仕事が できないと 思われたり すると 思ったから', '自分の 仕事が もう 終わって いたから', '{課長|かちょう}に 断らない ように 言われて いたから', '新人の 世話を するのが 好きだったから'], 'Paragraph 1, last sentence: 断ったら {嫌|きら}われるのでは ないか、仕事が できない 人だと 思われるのでは ないかと、怖かったのだ.', 'neg polar keyword', ["The text says 終わって いなくても: they said yes EVEN THOUGH their own work was not finished.", "The opposite: the section chief later asked them to say so when they can't (できないと 言って くれた ほうが…助かる).", "新人の 世話 is one item in the list of jobs they took on. Nothing says they liked it; the reason was fear."]], ['「それは 違って いた」とは、どういう ことか。', ['断らない ことが、相手の ために なるとは かぎらなかった。', '{課長|かちょう}の 言った ことが 間違って いた。', '書類の 数字が 間違って いた。', '自分の 仕事が 終わって いなかった。'], 'それ = the belief just before it: 断らない ことが 相手の ためだ. The chief\'s words showed it was wrong.', 'ref keyword ref', ["それ points back to what 「私」 believed, not to the chief. The chief's words are what PROVED the belief wrong.", "The wrong numbers were a real mistake, but 違って いた here is about the belief in the same sentence.", "Unfinished work comes from the first paragraph. それ points to the nearest idea: 「断らない ことが 相手の ためだ」."]], ['今、「私」は 仕事を 頼まれた とき、まず 何を するか。', ['今 自分が 抱えて いる 仕事を 確かめる。', 'すぐに 「いいですよ」と 答える。', 'できる 日を 伝えて 断る。', '{課長|かちょう}に 相談する。'], 'すぐには 答えず、今 自分が 何を 抱えて いるかを 確かめる. Then (そして) they answer.', 'change seq keyword', ["That is the OLD habit, from before the chief spoke to them. Now they do not answer right away (すぐには 答えず).", "Offering another day comes after checking (そして…), and only when it is hard.", "The chief appears in the story, but nothing says 「私」 asks him first. Their first step is checking their own work."]], ['{筆者|ひっしゃ}の 考えに 合う ものは どれか。', ['頼まれた ときは、相手に とって 何が 役に 立つかを 考えて 答えるのが 大切だ。', '頼まれた 仕事は、できるだけ 断った ほうが いい。', '断ると、相手との 関係は 必ず 悪く なる。', '断り方を 考えれば、断るのに {勇気|ゆうき}は いらない。'], 'The last sentence: 「はい」か 「いいえ」かでは なく、相手に とって 何が 役に 立つかを 考える こと.', 'over polar polar', ["Too strong. The writer still helps; they say no only when it's hard, and offer another day.", "The opposite: 断り方しだいで…かえって よく なる ことも ある.", "The opposite: 断るのは、今でも 少し {勇気|ゆうき}が いる. It still takes some courage."]]], 'long');
passage(3, 'n3p28', 'あおば市　大きな ごみ（{粗大|そだい}ごみ）の 出し方\n\n■ 出せる もの\n　いちばん 長い ところが 50センチ以上の もの（家具、自転車、{布団|ふとん} など）\n　※ エアコン、テレビ、{冷蔵庫|れいぞうこ}、{洗濯機|せんたくき}は 市では 集めません。買った 店に 相談して ください。\n\n■ 出し方\n　①　電話か インターネットで 申し込む（集める 日の １週間前まで）\n　②　コンビニで 「{粗大|そだい}ごみ シール」を 買う\n　③　シールを ごみに はって、集める 日の 朝 ８時までに、決められた 場所に 出す\n\n■ 料金（１つに つき）\n　50センチ以上 1メートル未満　　400円\n　1メートル以上 2メートル未満　800円\n　2メートル以上　　　　　　　　1,200円\n\n■ 自分で 運ぶ 場合\n　あおば市 クリーンセンターに 持って 行く ことも できます。この 場合、料金は 半分です（申し込みは いりません）。', [['長さ 1.5メートルの 本だなと、長さ 60センチの いすを、家の 前から 集めて もらいたい。料金は 合わせて いくらか。', ['1,200円', '600円', '800円', '1,600円'], 'Bookshelf 1.5 m → 1–2 m → 800円. Chair 60 cm → 50 cm–1 m → 400円. 800 + 400 = 1,200円.', 'detail detail keyword', ["600円 is the half price for taking both to the クリーンセンター yourself. Here the city collects them from the house.", "800円 is the bookshelf alone. 料金（１つに つき）: each item has its own fee, so the chair is added.", "1,600円 prices the chair like the bookshelf. 60センチ is under 1メートル, so the chair is 400円."]], ['この お知らせの 内容と 合って いる ものは どれか。', ['クリーンセンターに 自分で 持って 行く ときは、申し込まなくて いい。', '古い テレビは、シールを はれば 市が 集めて くれる。', '申し込みは、集める 日の 前の 日まで できる。', '{粗大|そだい}ごみ シールは、市の クリーンセンターで 買う。'], '自分で 運ぶ 場合: 申し込みは いりません, and the fee is half.', 'neg keyword keyword', ["テレビ is in the ※ line: 市では 集めません. Ask the shop where you bought it.", "The deadline is 集める 日の １週間前まで, a week before, not the day before.", "The sticker is bought at a convenience store (コンビニで…買う). The クリーンセンター is where you can take things yourself."]]], 'info');
passage(3, 'n3p29', 'まちだ市立美術館　ご{案内|あんない}\n\n■ 開館時間　午前10時〜午後6時（入館は 午後5時30分まで）\n■ 休館日　　月曜日（月曜日が 休日の 場合は、次の 日）\n\n■ 入館料\n　大人　　　　　　800円\n　大学生・高校生　500円\n　中学生以下　　　かかりません\n　※ 20人以上の グループは、一人 100円 安く なります。\n　※ 毎月 初めの 日曜日は、どなたも 入館料が かかりません。\n\n■ 注意\n　・館内で 写真を とれるのは、２階の 「ふれあいコーナー」だけです。\n　・大きな 荷物は、入口の ロッカー（100円。あとで 戻って きます）に 入れて ください。', [['高校生の 兄と 中学生の 妹が、母と 三人で ある 土曜日に 行く。三人の 入館料は 合わせて いくらか。', ['1,300円', '1,800円', '1,000円', '0円'], 'Mother 800円 + high-school brother 500円 + junior-high sister 0円 = 1,300円.', 'detail detail keyword', ["1,800円 charges the sister 500円. 中学生以下 pay nothing; only 大学生・高校生 pay 500円.", "1,000円 uses the brother's price for the mother too. 大人 is 800円.", "The free day is 初めの 日曜日. They go on a Saturday, so they pay."]], ['この 美術館に ついて 正しい ものは どれか。', ['月曜日が 休日の 週は、火曜日が 休館日に なる。', '午後5時45分に 着いても、まだ 入館できる。', '館内なら どこでも 写真を とって よい。', 'ロッカーを 使うと、100円 かかって 戻って こない。'], '月曜日が 休日の 場合は、次の 日: the museum opens on the holiday Monday and closes on Tuesday instead.', 'detail neg polar', ["The museum is open until 6:00, but you can only ENTER until 5:30 (入館は 午後5時30分まで).", "だけです limits photos to the ２階 corner. Everywhere else, no photos.", "The opposite: 100円。あとで 戻って きます. The coin comes back."]]], 'info');

/* ───────── N3 reading, batch 3: 7 短文, 2 中文, 2 長文, 1 情報検索. ───────── */
passage(3, 'n3p30', 'ご不在 {連絡|れんらく}\n\nハン様\n\n本日 14時ごろ、お荷物を お届けに まいりましたが、お留守でしたので 持ち帰りました。お荷物は {営業所|えいぎょうしょ}で ７日間 お預かりします。\nもう一度 お届けを ご{希望|きぼう}の 方は、下の 番号に お電話 ください。午後７時までに お電話 いただければ、その 日の うちに お届けします。それより あとの 場合は、次の 日 以後の お届けに なります。\n\nはやて便　電話 0120-00-0000', [['午後８時に 帰って この 紙を 見た ハンさんが、すぐに 電話を した。荷物は いつ 届くか。', ['早くて 次の 日', 'その 日の うちに', '７日後', '自分で {営業所|えいぎょうしょ}に 取りに 行くまで 届かない'], '午後７時までに お電話 いただければ、その 日の うちに…. ハンさん called after 7, so それより あとの 場合は、次の 日 以後.', 'detail keyword over', ["Same-day delivery is only for calls before 7 p.m. (午後７時までに). ハンさん called at 8.", "７日間 is how long the office keeps the parcel, not when it comes. It is the limit for asking.", "Too strong: picking it up yourself is never required. A phone call is enough to get it delivered again."]]], 'short');
passage(3, 'n3p31', '駅まで いつも バスに 乗って いたが、先月 バスの 時間が 変わって 不便に なったので、歩く ことに した。二十分 かかるが、歩いて みると、バスの 窓からは 見えなかった ものが 見えて くる。小さな パン屋、古い 神社、毎朝 同じ 場所で 寝て いる 猫。同じ 道でも、速さが 変わると、町は まるで 別の 顔を 見せるのだ。', [['{筆者|ひっしゃ}が 歩いて みて 気が ついた ことは 何か。', ['ゆっくり 進むと、同じ 町でも 違って 見える こと', 'バスより 歩く ほうが 早く 駅に 着く こと', 'バスの 時間が 変わって 不便に なった こと', '町に 新しい パン屋が できた こと'], '速さが 変わると、町は まるで 別の 顔を 見せる. The things were always there; only the speed changed.', 'over seq keyword', ["The text never compares the times. It only says walking takes 二十分.", "That is WHY the writer started walking, before any of the noticing. It is the start of the story, not the discovery.", "Nothing says the bakery is new. It was there all along; the writer just couldn't see it from the bus."]]], 'short');
passage(3, 'n3p32', '件名：あしたの {授業|じゅぎょう}に ついて\n\n日本語クラスの 皆さん\n\n台風が 近づいて いるため、あしたの {授業|じゅぎょう}は 教室ではなく、オンラインで 行います。時間は いつもと 同じ 午前10時からです。参加する ための アドレスは、あしたの 朝 ９時までに メールで 送ります。台風が 早く 通りすぎて、電車が {普通|ふつう}に 動いて いても、オンラインで 行いますので、学校には 来ないで ください。\n\n林', [['あしたの 朝、電車が {普通|ふつう}に 動いて いた。学生は どう すれば いいか。', ['10時から オンラインの {授業|じゅぎょう}に 参加する。', '10時に 学校の 教室に 行く。', '９時から オンラインの {授業|じゅぎょう}に 参加する。', '林先生に メールで アドレスを 聞く。'], '電車が {普通|ふつう}に 動いて いても、オンラインで 行います. The class stays online at the usual time, 10:00.', 'change keyword dir', ["That was the usual plan, and the email changes it. Even if trains run, 学校には 来ないで ください.", "９時 is the time the address arrives by email. The class itself starts at 10, いつもと 同じ.", "The teacher sends the address (メールで 送ります). Students don't need to ask for it."]]], 'short');
passage(3, 'n3p33', '祖父は 毎年、百まい以上の {年賀状|ねんがじょう}を 手で 書く。「メールの ほうが 楽なのに」と 言うと、祖父は 「一年に 一度、相手の ことを 思い出す 時間なんだ」と 答えた。一人に 何分も かけて、その 人との 思い出を 考えながら 書くのだと いう。祖父に とって {年賀状|ねんがじょう}は、送る ための ものと いうより、書く ための ものなのかも しれない。', [['「書く ための もの」とは、どういう 意味か。', ['書きながら 相手の ことを 思い出す 時間に 意味が ある。', '字を 上手に 書く 練習の ための ものだ。', '相手に 早く 届ける ための ものだ。', 'メールより 楽に 送れる ものだ。'], 'The grandfather\'s own words: 「一年に 一度、相手の ことを 思い出す 時間なんだ」. Writing is the point, more than sending.', 'keyword polar polar', ["書く here is not about handwriting skill. It is about the time spent thinking of each person while writing.", "A と いうより B puts sending (A) second. And taking several minutes a card is the opposite of fast.", "The opposite: the grandson says email is the easy one (メールの ほうが 楽). Handwriting 100 cards is not easy."]]], 'short');
passage(3, 'n3p34', 'みなみ図書館からの お知らせ\n\n５月３日から ６日までは 休館日です。この 間に 本を 返したい 方は、入口の 横の 「返す ポスト」を ご利用 ください。ただし、ＣＤや ＤＶＤは {壊|こわ}れる おそれが あるので、ポストには 入れず、７日以後に カウンターへ お返し ください。休館中に 返す 日が 来た ものは、７日以後に 返しても、遅れた ことには なりません。', [['５月４日までに 返す ＤＶＤを 借りて いる 人は、どう すれば いいか。', ['７日以後に カウンターに 返す。', '５月４日に 入口の ポストに 入れる。', '休館日の 前の ５月２日までに 返さなければ ならない。', '５月４日までに 返さないと、遅れた ことに なる。'], 'ＣＤや ＤＶＤは…ポストには 入れず、７日以後に カウンターへ. Its date falls in the closure, so returning on the 7th is not late.', 'detail over polar', ["The post box is only for books. ただし: CDs and DVDs could break, so they must not go in it.", "Too strong: nothing asks you to return early. Items due during the closure can come back from the 7th.", "The opposite of the last line: due dates inside the closure are not counted as late (遅れた ことには なりません)."]]], 'short');
passage(3, 'n3p35', '最近、友だちとの グループチャットが 少し 疲れる。だれかが メッセージを 送ると、すぐに 返事を しないと いけないような 気が するのだ。読んだ ことが 相手に わかるので、返事が 遅いと 「{無視|むし}された」と 思われそうで 心配に なる。でも、先日 友だちに 聞いて みたら、「そんなの 気に して ないよ」と 笑われた。疲れて いたのは、自分で 決めた ルールの せいだったのかも しれない。', [['「自分で 決めた ルール」とは 何か。', ['メッセージには すぐに 返事を しなければ ならない という 考え', '友だちが 決めた グループチャットの 使い方', '読んだ ことを 相手に 知らせない という 考え', '返事が 遅い 人を {無視|むし}する という 考え'], 'The rule is the feeling from the second sentence: すぐに 返事を しないと いけない. Nobody else made it; the friends don\'t even care.', 'dir keyword ref', ["自分で 決めた = made by MYSELF. The friends laugh that they don't care, so the rule was never theirs.", "The text says the other person CAN see it was read (相手に わかる). That is what made the writer worry, not a rule they made.", "Ignoring people is what the writer was afraid others would think of THEM ({無視|むし}された). It is not something the writer does."]]], 'short');
passage(3, 'n3p36', 'でんごんメモ\n\nアリさんへ\n\n10時半ごろ、ABC商事の 森さんから お電話が ありました。来週の 打ち合わせを、火曜日から 木曜日に 変えて ほしいそうです。時間は 同じ 午後２時で いいそうです。森さんは 今日の 午後は 外に 出て いて、４時すぎに 会社に 戻るので、それより あとに お電話 くださいとの ことです。（電話番号：03-0000-0000）\n\nさとう　10:35', [['アリさんは この あと、どう すれば いいか。', ['４時すぎに 森さんに 電話を かける。', 'すぐに 森さんに 電話を かける。', '火曜日の 午後２時に 森さんの 会社に 行く。', '森さんから 電話が 来るのを 待つ。'], '４時すぎに 会社に 戻るので、それより あとに お電話 ください. Ari calls back after 4.', 'seq dir change', ["森さん is out this afternoon. The memo asks Ari to call after he is back, after 4.", "The meeting moved FROM Tuesday TO Thursday (火曜日から 木曜日に). Tuesday is the old plan.", "Mori asks to be called (お電話 ください). Ari is the one who calls, not the one who waits."]]], 'short');
passage(3, 'n3p37', '引っ越して 半年、私は {隣|となり}に だれが 住んで いるのかも 知らなかった。ある 日、ポストに 「公園の 掃除に 参加しませんか」という 町内会の 紙が 入って いた。日曜日の 朝 七時から 一時間。正直、面倒だと 思った。それでも 行って みたのは、紙に 「お茶と お{菓子|かし}も あります」と 書いて あったからだ。\n　当日、公園には 二十人ほどが 集まって いた。ほとんどが 年上の 人だったが、みんな 気軽に 話しかけて くれた。安くて おいしい 八百屋、雨の 日に 水が たまる 道、夜 一人で 歩かない ほうが いい 場所。地図には のって いない 町の 情報を、たった 一時間で たくさん 教えて もらった。\n　それから、道で 会うと {挨拶|あいさつ}を する 人が 増えた。町が 少し 自分の 町に なった 気が する。', [['「私」が 掃除に 行って みたのは なぜか。', ['お茶と お{菓子|かし}が あると 書いて あったから', '{隣|となり}の 人と 知り合いに なりたかったから', '掃除が 好きだったから', '町内会の 人に 会って 頼まれたから'], 'Paragraph 1, last sentence: それでも 行って みたのは、紙に 「お茶と お{菓子|かし}も あります」と 書いて あったからだ. それでも = even though they found it a bother.', 'over polar keyword', ["Meeting neighbours happened, but it was not the reason. The text gives the reason in one line: the tea and snacks.", "The opposite: 正直、面倒だと 思った.", "Nobody asked in person. The invitation was a paper in the mailbox."]], ['「地図には のって いない 町の 情報」の 例として 合わない ものは どれか。', ['公園の 掃除が ある 時間', '安くて おいしい 八百屋', '雨の 日に 水が たまる 道', '夜 一人で 歩かない ほうが いい 場所'], 'The three examples are listed right before the phrase. The cleaning time was on the paper in the mailbox, not something the neighbours told.', 'neg neg neg', ["安くて おいしい 八百屋 is the first item of the list in paragraph 2, right before 地図には のって いない 町の 情報. It fits, so it is not the 合わない one.", "雨の 日に 水が たまる 道 is the second item of that same list: something the neighbours told. It fits.", "夜 一人で 歩かない ほうが いい 場所 closes the list. The odd one out is the cleaning time, which was printed on the paper in the mailbox (paragraph 1), not told by the neighbours."]], ['「町が 少し 自分の 町に なった」とは、どういう ことか。', ['町の 人と つながりが できて、町を 近く 感じる ように なった。', '町内会に 入って、町の ルールを 決める ように なった。', 'その 町に 家を 買った。', '地図を 見なくても 町を 歩ける ように なった。'], 'The line right before: 道で 会うと {挨拶|あいさつ}を する 人が 増えた. Knowing people makes the town feel like home.', 'over keyword keyword', ["Too strong. The writer went to one cleaning; nothing says they joined or make rules.", "自分の 町 is about feeling, not owning. Nothing in the text is about buying a house.", "地図 appears in the text, but about information maps don't show. The change is about people and greetings."]]], 'mid');
passage(3, 'n3p38', '最近、昼休みに 短い 昼寝を {勧|すす}める 会社が 増えて いる。昼ごはんの あとに 眠く なるのは、食べすぎの せいだと 思われがちだが、実は 体の リズムの ためで、何も 食べなくても 午後２時ごろには 眠く なりやすい。\n　ある 研究に よると、十五分から 二十分ほどの 昼寝を すると、午後の 集中力が 上がると いう。ただし、三十分 以上 寝ると、深い 眠りに 入って しまい、起きた あと かえって 頭が ぼんやりする。また、夜 眠れなく なる ことも ある。\n　大切なのは、長く 寝ない ことだ。いすに 座った まま 目を 閉じるだけでも {効果|こうか}が あると いう。ベッドで 横に なるより、その ほうが 起きやすいそうだ。', [['午後に 眠く なる 理由として、{文章|ぶんしょう}に 合う ものは どれか。', ['体の リズムの ためで、食べなくても 眠く なりやすい。', '昼ごはんを 食べすぎるから', '夜 よく 寝て いないから', '会社が 昼寝を {勧|すす}めて いるから'], 'Paragraph 1: 食べすぎの せいだと 思われがちだが、実は 体の リズムの ためで、何も 食べなくても 午後２時ごろには 眠く なりやすい.', 'keyword over detail', ["〜と 思われがちだが, 実は… = people tend to think so, BUT actually…. The text sets eating too much aside.", "Night sleep is never given as the cause. It appears only later, as a side effect of long naps.", "Companies recommending naps is the topic of the first line, not the reason people get sleepy."]], ['三十分 以上 昼寝を すると、どう なるか。', ['起きた あと、頭が ぼんやりする ことが ある。', '午後の 集中力が 上がる。', '深く 眠れるので、疲れが よく とれる。', '夜 早く 眠く なる。'], 'Paragraph 2, after ただし: 三十分 以上 寝ると、深い 眠りに 入って しまい、起きた あと かえって 頭が ぼんやりする.', 'detail polar polar', ["That is the result of a 15–20 minute nap. Over 30 minutes the result turns around (かえって).", "Deep sleep is the problem here: 深い 眠りに 入って しまい… The しまう shows it is a bad thing.", "The opposite: 夜 眠れなく なる ことも ある. You may NOT be able to sleep at night."]], ['「その ほう」とは、何を 指して いるか。', ['いすに 座った まま 目を 閉じる こと', 'ベッドで 横に なる こと', '三十分 以上 寝る こと', '夜 早く 寝る こと'], 'Bed is compared with the chair: ベッドで 横に なるより、その ほうが…. その ほう is the other side of the comparison, the chair.', 'ref ref ref', ["A より、その ほうが: A is the bed, and その ほう is the thing it is compared WITH, the chair from the sentence before.", "Long naps are what the writer warns against. Saying they make waking easier contradicts the paragraph above.", "Night sleep is not compared here. The sentence is about two ways to nap."]]], 'mid');
passage(3, 'n3p39', '東京の 会社で 十年 働いた あと、私は 家族と いっしょに 山の 近くの 小さな 町に 引っ越した。会社が 家で 仕事を する ことを 認めて くれたのが きっかけだった。空気が きれいで、{家賃|やちん}は 東京の 半分。子どもを 自然の 中で 育てたいと いう 夢も あった。\n　しかし、生活は 思って いたほど 楽では なかった。いちばん 近い スーパーまで 車で 二十分。バスは 一時間に 一本しか ない。冬は 雪が 多く、朝 家の 前の 雪を どかさないと 車が 出せない。東京では 考えた ことも なかった ことに、毎日 時間を 取られた。\n　もう 一つ {驚|おどろ}いたのは、町の 人との 関係だ。引っ越して すぐ、{隣|となり}の おばあさんが 野菜を 持って きて くれた。うれしかったが、その あと、町の 行事や 掃除に 何度も {誘|さそ}われた。最初は、正直 少し 重く 感じた。\n　考えが 変わったのは、最初の 冬だ。大雪の 朝、車が 出せずに 困って いると、近所の 人たちが 何も 言わずに 雪を どかして くれた。その とき、町の 行事は 「面倒な こと」では なく、こういう ときに 助け合う ための ものだと わかった。\n　今では、町の 祭りの {準備|じゅんび}を 手伝って いる。東京の ほうが 便利だったのは 確かだ。でも、ここには、便利さとは 別の {豊|ゆた}かさが ある。引っこす 前の 自分に 言いたい。「楽に なると 思うなら、やめた ほうが いい。でも、変わりたいなら、来たら いい」と。', [['「私」が 町に 引っ越した きっかけは 何か。', ['会社が 家で 仕事を する ことを 認めて くれた こと', '{家賃|やちん}が 東京の 半分だった こと', '子どもを 自然の 中で 育てたかった こと', '{隣|となり}の おばあさんに {誘|さそ}われた こと'], 'The text names it: 認めて くれたのが きっかけだった. Rent and nature are extra good points, not the きっかけ.', 'detail detail seq', ["Cheap rent is a plus listed after the きっかけ sentence. The question asks for the きっかけ, the event that started it.", "A dream the writer had, but the text marks the remote-work permission as the きっかけ.", "The neighbour came AFTER they moved (引っ越して すぐ). She can't be the reason they moved."]], ['引っ越して 困った ことは 何か。', ['買い物や 雪の ことで、毎日 時間を 取られる こと', '{家賃|やちん}が 高かった こと', '車が なくて、スーパーに 行けない こと', '町の 人が 話しかけて くれなかった こと'], '東京では 考えた ことも なかった ことに、毎日 時間を 取られた: a 20-minute drive to shop, snow to clear.', 'polar keyword polar', ["The opposite: rent was half of Tokyo's (東京の 半分).", "The writer has a car (車で 二十分). The problem is the distance and the snow, not having no car.", "The opposite: the neighbour came with vegetables, and the writer was invited again and again."]], ['「私」の 考えが 変わったのは なぜか。', ['困って いる とき、近所の 人たちが 助けて くれたから', '町の 祭りの {準備|じゅんび}を 手伝ったから', 'おばあさんが 野菜を 持って きて くれたから', '雪の 少ない 冬だったから'], '大雪の 朝…近所の 人たちが 何も 言わずに 雪を どかして くれた. Then the writer understood what the events are for.', 'seq detail polar', ["Helping with the festival is what the writer does NOW (今では), after the change of mind.", "The vegetables came first, and after them the invitations still felt heavy (重く 感じた). The change came in winter.", "The opposite: it was a heavy-snow morning (大雪の 朝)."]], ['この {文章|ぶんしょう}で {筆者|ひっしゃ}が いちばん 言いたい ことは 何か。', ['{田舎|いなか}の 生活は 楽では ないが、便利さとは 別の よさが ある。', '東京より {田舎|いなか}の ほうが 便利だ。', '{田舎|いなか}に 引っこすのは やめた ほうが いい。', '町の 行事には すべて 参加する べきだ。'], 'The last paragraph: 東京の ほうが 便利だった…でも、ここには、便利さとは 別の {豊|ゆた}かさが ある.', 'polar over over', ["The opposite: 東京の ほうが 便利だったのは 確かだ.", "Only half the advice. やめた ほうが いい is for people who expect an easy life (楽に なると 思うなら); for people who want to change, the writer says come.", "The writer says the events are for helping each other, but never says everyone must join all of them."]]], 'long');
passage(3, 'n3p40', '小学校の 教師に なって 二十年に なる。{授業|じゅぎょう}の 最後に 「何か 質問は ありますか」と 聞くと、教室は たいてい 静かに なる。わかったから 静かなのでは ない。わからない ことが あっても、手を あげるのが 恥ずかしいのだ。\n　数年前、私は やり方を 変えて みた。{授業|じゅぎょう}の 終わりに 小さな 紙を 配り、「わからなかった こと」を 一つ、名前を 書かずに 書いて もらう ことに したのだ。すると、{驚|おどろ}く ほど たくさんの 質問が 集まった。しかも、その 多くは 同じ ところで つまずいて いた。手を あげない 子どもたちも、本当は 同じ ことで {悩|なや}んで いたのだ。\n　次の {授業|じゅぎょう}の 最初に、私は 紙に 書かれた 質問を 読み上げて、答える ように した。「この 質問を 書いて くれた 人、ありがとう。たぶん、同じ ことを 思って いた 人が 何人も いるよ」。それを 続けて いるうちに、少しずつ 手を あげる 子が 出て きた。わからない ことを 言うのは 恥ずかしい ことでは なく、みんなの 役に 立つ ことだと 感じて くれたのだろう。\n　大人に なっても、会議で 「わかりません」と 言えない 人は 多い。だからこそ、子どもの うちに、わからないと 言っても だいじょうぶな 場所を 作る ことが 大切だと 思う。教室は、正しい 答えを 言う 場所で ある 前に、わからない ことを 出せる 場所で あって ほしい。', [['質問を 聞くと 教室が 静かに なるのは なぜだと、{筆者|ひっしゃ}は 考えて いるか。', ['わからなくても、手を あげるのが 恥ずかしいから', 'みんな {授業|じゅぎょう}が よく わかったから', '{授業|じゅぎょう}の 時間が 足りないから', '先生に 質問するのが 怖いから'], 'Paragraph 1, last two sentences: わかったから 静かなのでは ない。わからない ことが あっても、手を あげるのが 恥ずかしいのだ.', 'neg over over', ["〜のでは ない denies it: they are NOT quiet because they understood. Read the ない at the end.", "Time is never mentioned. The writer gives one reason, embarrassment.", "Fear of the teacher is not in the text. The children are embarrassed in front of everyone, not scared."]], ['紙に 書いて もらって、わかった ことは 何か。', ['多くの 子どもが 同じ ところで つまずいて いた こと', '名前を 書かせないと、質問は 集まらない こと', '手を あげない 子どもには、質問が ない こと', '質問の 答えは、紙に 書いて 渡す ほうが いい こと'], 'Paragraph 2: たくさんの 質問が 集まった。しかも、その 多くは 同じ ところで つまずいて いた.', 'over polar keyword', ["The writer only tried it without names. They never tested it the other way, so the text can't say this.", "The opposite: 手を あげない 子どもたちも、本当は 同じ ことで {悩|なや}んで いた.", "紙 appears, but the answers were read out in the next class (読み上げて、答える), not written back."]], ['手を あげる 子が 出て きたのは なぜか。', ['わからない ことを 言うのは、みんなの 役に 立つと 感じたから', '先生が 手を あげる ように 言ったから', '紙を 配るのを やめたから', '質問を 書いた 子の 名前が 読まれたから'], 'End of paragraph 3: わからない ことを 言うのは 恥ずかしい ことでは なく、みんなの 役に 立つ ことだと 感じて くれたのだろう.', 'over keyword neg', ["The teacher never told them to raise hands. The change came from hearing the questions answered.", "Nothing says the papers stopped. The text says the teacher kept doing it (それを 続けて いるうちに).", "名前を 書かずに: the papers had no names, so no name could be read."]], ['{筆者|ひっしゃ}の 考えに 合う ものは どれか。', ['子どもの ころから、わからないと 言える 場所が 必要だ。', '教室は、正しい 答えを 言う ための 場所だ。', '大人は 会議で 「わかりません」と 言っては いけない。', '質問は すべて 紙に 書かせる べきだ。'], 'Last paragraph: だからこそ、子どもの うちに、わからないと 言っても だいじょうぶな 場所を 作る ことが 大切だと 思う.', 'detail polar over', ["A で ある 前に B = before being A, it should be B. The writer puts the place for not-knowing first.", "The opposite: the writer is sorry that many adults CAN'T say it.", "The paper was a way to get started. The goal is for children to raise their hands, not to always write."]]], 'long');
passage(3, 'n3p41', 'スマートフォン 料金プランの ご{案内|あんない}（１か月の 料金）\n\n　ライト　　　　データ ３ＧＢ　　　　1,500円\n　スタンダード　データ 20ＧＢ　　　2,900円\n　たっぷり　　　データ 50ＧＢ　　　4,500円\n　{無制限|むせいげん}　　データ いくらでも　6,000円\n\n※ 電話の 料金は べつです（30びょう 22円）。電話オプション（月 1,000円）を つけると、５分以内の 電話が 何回でも かかりません。\n※ 22歳以下の 方は、スタンダード以上の プランが 毎月 500円 安く なります。\n※ 家族 ２人以上で 同じ 会社を 使う 場合、一人 300円 安く なります（22歳以下の 割引と いっしょに 使えます）。', [['20歳の 大学生 リンさんは、毎月 15ＧＢぐらい 使う。家族は 別の 会社を 使って いて、電話は ほとんど しない。いちばん 安い 月の 料金は いくらか。', ['2,400円', '2,900円', '2,100円', '1,500円'], '15 GB needs スタンダード (20 GB): 2,900円. Lin is 22 or under: −500円 = 2,400円. The family discount doesn\'t apply.', 'detail keyword detail', ["2,900円 is the plan before the age discount. Lin is 20, so 22歳以下 takes 500円 off.", "2,100円 also takes the family 300円 off. Lin's family uses a different company, so that discount is out.", "ライト is cheaper but only has 3 GB. Lin uses about 15 GB, so it can't be the plan."]], ['45歳の アンさんは、{奥|おく}さんと 同じ 会社で、毎月 40ＧＢ 使う。短い 電話を よく かけるので、電話オプションも つけたい。アンさんの 月の 料金は いくらか。', ['5,200円', '4,700円', '4,200円', '5,500円'], '40 GB → たっぷり 4,500円. Family of two → −300円. Phone option +1,000円. 4,500 − 300 + 1,000 = 5,200円.', 'over detail detail', ["4,700円 also takes the 500円 age discount, but that is only for 22歳以下. アンさん is 45.", "4,200円 forgets the phone option, which costs 1,000円 a month.", "5,500円 forgets the family discount: アンさん and his wife use the same company, so 300円 comes off."]]], 'info');

/* ───────── N4 reading, batch 1: 7 短文 (1 q), 2 中文 (3 q), 3 情報検索 (2 q). ───────── */
passage(4, 'n4p5', 'ゆうたへ\n\nお母さんは 今日、仕事で 帰りが {遅|おそ}く なります。晩ごはんは {冷蔵庫|れいぞうこ}に 入って います。電子レンジで {温|あたた}めて 食べて ください。でも、食べる 前に、ベランダの {洗濯|せんたく}物を 中に 入れて おいてね。雨が {降|ふ}りそうだから。\n\n母', [['ゆうたさんは 晩ごはんの 前に 何を しますか。', ['{洗濯|せんたく}物を 中に 入れます。', '晩ごはんを 電子レンジで {温|あたた}めます。', 'お母さんが 帰るのを 待ちます。', '{洗濯|せんたく}物を ベランダに 出します。'], 'Sentence 4: でも、食べる 前に、ベランダの {洗濯|せんたく}物を 中に 入れて おいてね. 食べる 前に = before dinner.', 'seq keyword dir', ["Warming dinner is part of eating it. The note says do the washing BEFORE you eat (食べる 前に).", "Mother is coming home late (帰りが {遅|おそ}く なります), and the note tells him to eat by himself. Nothing asks him to wait.", "The opposite: the washing is already outside. 中に 入れて = bring it IN, because it looks like rain (雨が {降|ふ}りそうだから)."]]], 'short');
passage(4, 'n4p6', 'ゆりマンションの みなさんへ\n\n来週の 月曜日は 休みの 日ですが、{燃|も}える ごみは いつもと 同じように 集めに 来ます。朝 ８時までに 出して ください。\nまた、来週だけ、びんと かんの 日が 火曜日から 木曜日に {変|か}わります。', [['来週、びんを 出したい 人は 何曜日に 出しますか。', ['木曜日', '火曜日', '月曜日', '来週は 出せない'], 'The last sentence: 来週だけ、びんと かんの 日が 火曜日から 木曜日に {変|か}わります. 〜から 〜に {変|か}わる = moves from … to ….', 'change keyword over', ["火曜日 is the usual day. Next week only, it moves FROM Tuesday TO Thursday.", "Monday is for {燃|も}える ごみ (burnable rubbish), which is collected even on the holiday.", "Bottles can be put out next week; only the day changes."]]], 'short');
passage(4, 'n4p7', 'わたしは 子どもの とき、自転車に 乗れませんでした。大人に なってからも、乗れなくても {困|こま}らないと 思って いました。でも 去年、会社の 近くに 引っ{越|こ}して、自転車が あれば 会社まで 十分で 行けると 知りました。それで、三十さいで {練習|れんしゅう}を 始めました。友だちが 毎週 日曜日に 教えて くれて、一か月で 乗れるように なりました。今は 毎日 自転車で 会社へ 行って います。', [['「わたし」が 自転車の {練習|れんしゅう}を 始めたのは どうしてですか。', ['会社の 近くに 引っ{越|こ}して、自転車が あれば {便利|べんり}だと 思ったから', '子どもの とき、自転車に 乗れなかったから', '自転車に 乗れなくて {困|こま}って いたから', '友だちが 教えて くれると 言ったから'], 'Sentences 3–4: 去年、会社の 近くに 引っ{越|こ}して、自転車が あれば 会社まで 十分で 行けると 知りました。それで、三十さいで {練習|れんしゅう}を 始めました. それで points back to the move.', 'detail neg seq', ["True, but for years that did not bother the writer. The move is what made them start.", "The opposite: the writer thought 乗れなくても {困|こま}らない. The reason was the ten-minute ride to work.", "The friend helped after the writer decided. それで comes right after the move, so the move is the reason."]]], 'short');
passage(4, 'n4p8', 'リサさん\n\nあしたの 映画ですが、天気が よかったら、駅の 前で １時に 会いましょう。でも、雨の ときは、駅の 前ではなく、映画館の 中の {喫茶店|きっさてん}で 会いましょう。映画は ２時からです。\n\nけん', [['あした 雨が {降|ふ}ったら、リサさんは どこへ 行きますか。', ['映画館の 中の {喫茶店|きっさてん}', '駅の 前', '映画館の 前', '駅の 前の {喫茶店|きっさてん}'], 'Sentence 2: 雨の ときは、駅の 前ではなく、映画館の 中の {喫茶店|きっさてん}で 会いましょう.', 'neg keyword keyword', ["The station is the place for good weather. ではなく means NOT there when it rains.", "Close, but the email says the café INSIDE the cinema (中の), not in front of it.", "This mixes the two places. On a rainy day it is not the station (駅の 前ではなく) but the café inside the cinema."]]], 'short');
passage(4, 'n4p9', 'パンや 「{小麦|こむぎ}」より\n\n今月から ポイントカードを 始めました。３００円 買うと、１ポイント つきます。２０ポイントで、好きな パンを 一つ さしあげます。カードは レジで お{渡|わた}しします。お金は かかりません。', [['この お知らせと 合って いる ものは どれですか。', ['ポイントカードは お金を {払|はら}わなくても もらえる。', '３００円 買うと、好きな パンが 一つ もらえる。', '２０ポイントで、パンが ２０こ もらえる。', 'カードを 作るには、お金が かかる。'], 'The last two sentences: カードは レジで お{渡|わた}しします。お金は かかりません.', 'keyword count neg', ["３００円 gives one POINT (１ポイント つきます). The bread comes at ２０ポイント.", "２０ポイント gets ONE bread (パンを 一つ), not twenty.", "The opposite: お金は かかりません. The card is free."]]], 'short');
passage(4, 'n4p10', 'ホストファミリーの お父さんは、毎朝 ５時に 起きて、犬の {散歩|さんぽ}に 行きます。わたしは はじめ、どうして そんなに 早く 起きるのか わかりませんでした。でも、ある 日 いっしょに 行って みて、わかりました。朝の 町は 静かで、空気が きれいで、とても 気持ちが いいのです。今は わたしも ときどき いっしょに 行きます。', [['お父さんが 早く 起きるのは どうしてだと、「わたし」は 思いましたか。', ['朝の 町は 静かで、気持ちが いいから', '犬の {散歩|さんぽ}に 行かなければ ならないから', '空気を きれいに したいから', '「わたし」と いっしょに {散歩|さんぽ}したいから'], 'Sentences 3–4: ある 日 いっしょに 行って みて、わかりました。朝の 町は 静かで、空気が きれいで、とても 気持ちが いいのです. 〜のです gives the reason the writer found.', 'detail keyword dir', ["The dog walk is WHAT he does at 5. WHY so early is what the writer found out: 朝の 町は 静かで … 気持ちが いい.", "空気が きれい is in the text: the air IS clean in the morning. Nobody is trying to make it clean.", "The father went alone long before the writer joined. Now the WRITER sometimes goes with him."]]], 'short');
passage(4, 'n4p11', 'マリアさん\n\n１１時に 田中さんが 来ます。わたしは その 時間、{会議|かいぎ}で 出られないので、{会議室|かいぎしつ}に {案内|あんない}して、お茶を 出して ください。田中さんに {渡|わた}す {書類|しょるい}は、わたしの {机|つくえ}の 上に あります。{会議|かいぎ}が 終わったら、すぐ 行きます。\n\n山田', [['田中さんが 来たら、マリアさんは 何を しますか。', ['{会議室|かいぎしつ}に {案内|あんない}して、お茶を 出します。', '{会議|かいぎ}に 出て いる 山田さんを {呼|よ}びます。', '{机|つくえ}の 上の {書類|しょるい}を 山田さんに {渡|わた}します。', '田中さんと いっしょに {会議|かいぎ}に 出ます。'], 'Sentence 2: {会議室|かいぎしつ}に {案内|あんない}して、お茶を 出して ください. 山田さん comes himself when the meeting ends.', 'neg dir over', ["山田さん can't leave the meeting ({会議|かいぎ}で 出られない) and will come when it ends (すぐ 行きます). Don't call him out.", "The papers are FOR 田中さん (田中さんに {渡|わた}す {書類|しょるい}), not for 山田さん.", "Nothing says マリアさん joins any meeting. Her job is to show the guest in and serve tea."]]], 'short');
passage(4, 'n4p12', 'わたしは 日本に 来て 三か月目に、コンビニで アルバイトを 始めました。はじめは、お{客|きゃく}さんの 日本語が {速|はや}くて、よく わかりませんでした。「おはし、おつけしますか」と 聞かれても、何の ことか わかりませんでした。\n　店長は 「わからない ときは、『もう 一度 おねがいします』と 言えば いいよ」と 教えて くれました。それから、わからない ときは、そう 言う ように しました。お{客|きゃく}さんは みんな、もう 一度 ゆっくり 言って くれました。\n　今は、アルバイトを 始めて 一年です。新しく 入った {留学生|りゅうがくせい}に、店長に 習った ことを 教えて います。', [['はじめ、「わたし」は 何に {困|こま}りましたか。', ['お{客|きゃく}さんの 日本語が {速|はや}くて、わからなかった。', '店長の 日本語が {速|はや}くて、わからなかった。', 'おはしが どこに あるか わからなかった。', '新しく 入った {留学生|りゅうがくせい}に 教えるのが むずかしかった。'], 'Paragraph 1: はじめは、お{客|きゃく}さんの 日本語が {速|はや}くて、よく わかりませんでした.', 'dir keyword change', ["It was the CUSTOMERS' Japanese that was fast. The manager helped by teaching a phrase.", "The writer didn't understand the QUESTION 「おはし、おつけしますか」, not where the chopsticks were.", "Teaching new students is what the writer does NOW, a year later (今は …). The first trouble was the customers' fast Japanese."]], ['店長は 何を 教えて くれましたか。', ['わからない ときは 「もう 一度 おねがいします」と 言う こと', 'お{客|きゃく}さんに ゆっくり 話して もらう こと', '新しく 入った {留学生|りゅうがくせい}に 教える こと', 'おはしを つける こと'], 'Paragraph 2: 店長は 「わからない ときは、『もう 一度 おねがいします』と 言えば いいよ」と 教えて くれました.', 'detail change keyword', ["Customers speaking slowly was the RESULT of asking again (もう 一度 ゆっくり 言って くれました). The manager taught what to say.", "Teaching new students is what the writer does now. The manager taught one sentence to use when you don't understand.", "おはし is from the customer's question, not from the manager's advice."]], ['今、「わたし」は 何を して いますか。', ['新しく 入った {留学生|りゅうがくせい}に、店長に 習った ことを 教えて いる。', '店長に 日本語を 習って いる。', 'アルバイトを やめて、学校で 勉強して いる。', '新しい 店で アルバイトを して いる。'], 'Paragraph 3: 今は、アルバイトを 始めて 一年です。新しく 入った {留学生|りゅうがくせい}に、店長に 習った ことを 教えて います.', 'change over keyword', ["Learning from the manager was at the START. Now the writer passes it on to new students.", "Nothing says the writer quit. 始めて 一年 = a year since starting, and they still teach the new staff.", "新しく describes the students (新しく 入った {留学生|りゅうがくせい}), not a new shop."]]], 'mid');
passage(4, 'n4p13', 'わたしの 国は 一年中 暑いので、日本のような 四つの {季節|きせつ}が ありません。日本に 来て、スーパーの {果物|くだもの}を 見て、{季節|きせつ}が わかるように なりました。春は いちご、夏は すいか、秋は かきや なし、冬は みかんです。国では いつも 同じ {果物|くだもの}が 売られて いるので、とても {面白|おもしろ}いと 思いました。\n　はじめの ころ、わたしは {季節|きせつ}の {果物|くだもの}は 高いと 思って いました。でも、友だちが 「いちばん おいしい ときに 買うと、安くて おいしいよ」と 教えて くれました。{確|たし}かに、夏の 終わりの すいかは、夏の はじめより ずっと 安かったです。', [['日本で、「わたし」は 何で {季節|きせつ}が わかるように なりましたか。', ['スーパーの {果物|くだもの}', '国の 天気', '友だちの 話', 'すいかの {値段|ねだん}'], 'Paragraph 1: 日本に 来て、スーパーの {果物|くだもの}を 見て、{季節|きせつ}が わかるように なりました.', 'keyword detail detail', ["The home country's weather is hot all year, so it has no seasons to show.", "The friend taught them about prices, not about the seasons.", "The watermelon price is the last detail. The seasons came from seeing which fruit is in the shop."]], ['秋の {果物|くだもの}は どれですか。', ['かき', 'いちご', 'すいか', 'みかん'], 'Paragraph 1: 春は いちご、夏は すいか、秋は かきや なし、冬は みかんです.', 'detail detail detail', ["いちご is spring (春). Match each fruit to the season word right before it.", "すいか is summer (夏).", "みかん is winter (冬)."]], ['友だちは 何を 教えて くれましたか。', ['いちばん おいしい ときに 買うと、安くて おいしい こと', 'いちばん おいしい ときの {果物|くだもの}は 高い こと', 'スーパーの {果物|くだもの}を 見れば、{季節|きせつ}が わかる こと', '夏の はじめに すいかを 買った ほうが いい こと'], 'Paragraph 2: 友だちが 「いちばん おいしい ときに 買うと、安くて おいしいよ」と 教えて くれました.', 'change detail dir', ["That is what the writer believed BEFORE (高いと 思って いました). The friend said the opposite.", "The writer found that out alone, by looking at the fruit (見て、… わかるように なりました). The friend talked about prices.", "The opposite: the end-of-summer watermelon was much cheaper (夏の 終わりの すいかは … ずっと 安かった)."]]], 'mid');
passage(4, 'n4p14', 'さくら駅 → みどり大学　バスの 時間\n\n【月〜金】 ７:１０　７:４０　８:１０　８:３０　９:００（この あとは ３０分に １本）\n【土・日】 ８:００　９:００（この あとは １時間に １本）\n\n※ さくら駅から みどり大学まで、バスで ２０分ぐらいです。\n※ 大学が 休みの 間（夏休みなど）は、毎日 【土・日】の 時間に なります。', [['月曜日、９時の {授業|じゅぎょう}に {遅|おく}れないように 行きたい。いちばん {遅|おそ}い バスは 何時ですか。', ['８:３０', '９:００', '８:１０', '８:４０'], 'The 【月〜金】 row and the first note (バスで ２０分ぐらい): 8:30 + 20 = 8:50, in time. The 9:00 bus arrives at about 9:20.', 'detail detail keyword', ["The 9:00 bus is in the table, but it reaches the university at about 9:20. Add the 20-minute ride.", "8:10 is in time too, but the question asks for the LATEST bus (いちばん {遅|おそ}い).", "There is no 8:40 bus on weekdays. Read the table, not the pattern of 7:10, 7:40."]], ['夏休みの 水曜日、朝 ８時１５分に 駅に 着いた。{次|つぎ}の バスは 何時ですか。', ['９:００', '８:３０', '８:４５', '１０:００'], 'The second note: 大学が 休みの 間（夏休みなど）は、毎日 【土・日】の 時間に なります. That row has 8:00, 9:00, so after 8:15 the next bus is 9:00.', 'detail keyword keyword', ["8:30 is the weekday table. During 夏休み every day follows 【土・日】.", "8:45 is not in either table. Weekends are once an hour.", "10:00 is the bus after next. 9:00 comes first."]]], 'info');
passage(4, 'n4p15', 'ひがし町 夏{祭|まつ}り\n\n日にち：８月１０日（土）　※ 雨の 場合は、１１日（日）に します。\n時間：午後４時〜９時\n場所：ひがし小学校\n\n・{踊|おど}り：午後６時から（だれでも 入れます。{申|もう}し{込|こ}みは いりません）\n・子ども ゲーム：午後４時〜５時半（小学生まで。一回 １００円）\n・ごみは 持って 帰って ください。\n・車では 来ないで ください。', [['８月１０日は 雨でした。{祭|まつ}りは いつ ありますか。', ['１１日の 午後４時から', '１０日の 午後４時から', 'ありません', '１１日の 午後６時から'], 'The 日にち line: ※ 雨の 場合は、１１日（日）に します. The time stays 午後４時〜９時.', 'neg over keyword', ["It rained on the 10th, so the festival does NOT happen that day. It moves to the 11th.", "Rain moves the festival; it is not cancelled.", "６時 is when the dancing starts. The festival itself starts at 4."]], ['中学生の 兄と 小学生の 妹が {祭|まつ}りに 行きます。正しい ものは どれですか。', ['妹は １００円で 子ども ゲームが できる。', '兄も 子ども ゲームが できる。', '{踊|おど}りに 出るには、{申|もう}し{込|こ}みが いる。', '車で 行っても いい。'], 'The 子ども ゲーム line: 小学生まで。一回 １００円. The sister is in primary school, so she can play.', 'detail neg neg', ["小学生まで = up to primary school. A junior-high student is too old for the kids' games.", "{申|もう}し{込|こ}みは いりません: no sign-up for the dancing. Anyone can join.", "The opposite: 車では 来ないで ください."]]], 'info');
passage(4, 'n4p16', 'レストラン 「ひまわり」　ランチ（１１時〜２時）\n\nＡ　ハンバーグ セット　９５０円\nＢ　魚の セット　　８５０円\nＣ　カレー　　　　　　 ７００円\n\n※ セットには ごはんと スープが つきます。\n※ ごはんの 大{盛|も}りは ５０円です。\n※ どの ランチも、２００円で コーヒーか こうちゃが つけられます。\n※ ２時から ５時までは、カレーだけ 食べられます。', [['カレーと こうちゃを 注文します。いくらですか。', ['９００円', '７００円', '７５０円', '１，１５０円'], 'The menu and the third note (どの ランチも、２００円で コーヒーか こうちゃが つけられます): カレー ７００円 + こうちゃ ２００円 = ９００円.', 'detail keyword keyword', ["700円 is the curry alone. The tea is 200円 more.", "50円 is for a large rice (大{盛|も}り), not for a drink.", "1,150円 is the hamburger set plus tea. The order is curry."]], ['午後３時に 店に 行きました。何が 食べられますか。', ['カレー', 'ハンバーグ セット', '魚の セット', '何も 食べられない'], 'The title says ランチ（１１時〜２時）, and the last note: ２時から ５時までは、カレーだけ 食べられます.', 'detail detail over', ["The sets are lunch only (11時〜2時). At 3 o'clock only curry is served.", "Same as the hamburger set: lunch ends at 2.", "The shop still serves food: カレーだけ 食べられます from 2 to 5."]]], 'info');

/* ───────── N5 reading, batch 1: 4 短文 (1 q), 2 中文 (2 q), 2 情報検索 (1 q). ───────── */
passage(5, 'n5p4', 'アンナさん\n\nわたしは 今日 ７時に かえります。ばんごはんは いっしょに 食べましょう。にくは わたしが かって かえりますから、アンナさんは やさいを かって ください。こめは まだ あります。\n\nゆき', [['アンナさんは 何を かいますか。', ['やさい', 'にく', 'こめ', 'にくと やさい'], 'Sentences 3–4: にくは わたしが かって かえりますから、アンナさんは やさいを かって ください。こめは まだ あります.', 'dir neg over', ["ゆきさん is buying the meat (わたしが かって かえります). Check who buys what.", "こめは まだ あります = there is still rice. Nobody needs to buy it.", "Only half is right: the meat is ゆきさん's job. アンナさん buys just the vegetables."]]], 'short');
passage(5, 'n5p5', '学生の みなさんへ\n\nあしたは テストです。９時に はじまります。８時５０分までに きょうしつに 来て ください。えんぴつと けしゴムを もって 来て ください。じしょは つかっては いけません。', [['あした 何を もって 行きますか。', ['えんぴつと けしゴム', 'じしょ', 'えんぴつだけ', 'えんぴつと じしょ'], 'Sentences 4–5: えんぴつと けしゴムを もって 来て ください。じしょは つかっては いけません.', 'neg keyword neg', ["じしょは つかっては いけません: dictionaries are NOT allowed in the test.", "Only half: the notice asks for えんぴつと けしゴム, the pencil AND the eraser.", "The pencil is right, but the dictionary is not allowed (つかっては いけません)."]]], 'short');
passage(5, 'n5p6', 'わたしは まいあさ コーヒーを 飲みます。でも、きのうは うちに コーヒーが ありませんでしたから、こうちゃを 飲みました。今日 スーパーで コーヒーを かいました。あしたの あさは コーヒーを 飲みます。', [['「わたし」は きのうの あさ、何を 飲みましたか。', ['こうちゃ', 'コーヒー', '何も 飲みませんでした', 'スーパーで かった コーヒー'], 'Sentence 2: でも、きのうは うちに コーヒーが ありませんでしたから、こうちゃを 飲みました.', 'change neg seq', ["Coffee is the usual drink (まいあさ), but でも、きのうは there was none at home.", "ありませんでした is about the coffee. The writer still drank something: こうちゃを 飲みました.", "The coffee was bought TODAY (今日 スーパーで かいました), after yesterday. The writer drinks it tomorrow morning."]]], 'short');
passage(5, 'n5p7', 'たなかさんの へやには ベッドと つくえが あります。つくえの 上には パソコンが あります。本だなは ありません。ですから、本は ベッドの 下に あります。', [['たなかさんの 本は どこに ありますか。', ['ベッドの 下', 'つくえの 上', '本だな', 'ベッドの 上'], 'The last two sentences: 本だなは ありません。ですから、本は ベッドの 下に あります.', 'keyword neg keyword', ["The computer is on the desk (つくえの 上), not the books.", "本だなは ありません: there is no bookshelf in the room.", "上 (on top) or 下 (under)? The books are under the bed."]]], 'short');
passage(5, 'n5p8', 'わたしの かぞくは ４人です。父と 母と あにと わたしです。父は ぎんこうで はたらいて います。母は 日本語の 先生です。あには 大学生で、とうきょうの 大学で えいごを べんきょうして います。今は とうきょうに すんで いますから、なつ休みに うちへ かえって きます。わたしは 高校生です。なつ休みに あにと あそぶのが たのしみです。', [['おにいさんは 何を べんきょうして いますか。', ['えいご', '日本語', 'ぎんこうの しごと', '高校の べんきょう'], 'Sentence 5: あには 大学生で、とうきょうの 大学で えいごを べんきょうして います.', 'detail detail dir', ["日本語 is the mother's: she is a Japanese teacher (母は 日本語の 先生です).", "ぎんこう is where the father works (父は ぎんこうで はたらいて います).", "The high-school student is the writer (わたしは 高校生です). おにいさん is at university (大学生)."]], ['おにいさんは いつ うちへ かえって きますか。', ['なつ休み', '毎日', '今', 'ふゆ休み'], 'Sentence 6: 今は とうきょうに すんで いますから、なつ休みに うちへ かえって きます.', 'over keyword field', ["He lives in Tokyo now (今は とうきょうに すんで います), so he comes home only for the summer holiday.", "今 is in the sentence, but it says where he lives NOW: Tokyo. He comes home なつ休みに.", "The text says なつ休み (summer holiday), not ふゆ休み (winter)."]]], 'mid');
passage(5, 'n5p9', 'きのう 友だちと 山へ 行きました。あさ ８時に 駅で 会って、電車で 行きました。山の 上は 少し さむかったですが、とても きれいでした。ひるごはんに おにぎりを 食べました。かえりに 雨が ふりましたが、友だちが かさを もって いましたから、だいじょうぶでした。', [['二人は 何時に どこで 会いましたか。', ['８時に 駅で', '８時に 山で', 'ひるに 駅で', 'ひるに 山の 上で'], 'Sentence 2: あさ ８時に 駅で 会って、電車で 行きました.', 'keyword keyword keyword', ["The mountain is where they went together by train. They met at the station (駅で 会って).", "ひる is from ひるごはん: they ate rice balls at lunch. They met at 8 in the morning.", "Both are from later in the day: on the mountain they had lunch (ひるごはん). They met at 8 at the station."]], ['かえりに 雨が ふりました。どう でしたか。', ['友だちの かさが あったから、だいじょうぶだった。', 'かさが なかったから、ぬれた。', '「わたし」の かさを 二人で つかった。', '山の 上は さむかったから、はやく かえった。'], 'The last sentence: かえりに 雨が ふりましたが、友だちが かさを もって いましたから、だいじょうぶでした.', 'neg dir detail', ["The opposite: there WAS an umbrella, so they were fine (だいじょうぶでした).", "The umbrella was the FRIEND's (友だちが かさを もって いました), not the writer's.", "さむかった is about the mountain top, and nothing says they went home early. The question is about the rain."]]], 'mid');
passage(5, 'n5p10', 'みどり きっさてん\n\nあいて いる 時間：あさ ８時〜よる ８時\n休み：水よう日\n\nコーヒー　３００円\nこうちゃ　２８０円\nケーキ　　４００円\n※ あさ ８時〜１０時は、コーヒーが ２５０円です。', [['土よう日の あさ ９時に、コーヒーと ケーキを たのみます。いくらですか。', ['６５０円', '７００円', '６８０円', '２５０円'], 'The note under the menu: ※ あさ ８時〜１０時は、コーヒーが ２５０円です. At 9 a.m.: 250 + 400 = 650円.', 'detail keyword detail', ["700円 uses the normal coffee price. Between 8 and 10 in the morning coffee is 250円.", "680円 is TEA (280円) plus cake. The order is coffee.", "250円 is the coffee alone. Add the cake, 400円."]]], 'info');
passage(5, 'n5p11', '日本語 クラスの 時間わり\n\n月よう日：会話（午前 １０時〜１２時）\n火よう日：休み\n水よう日：かんじ（午前 １０時〜１１時）\n木よう日：会話（午後 ２時〜４時）\n金よう日：テスト（午前 １０時〜１１時）\n\n※ 午前の クラスは きょうしつ １、午後の クラスは きょうしつ ３です。', [['午後に 会話の クラスに 出たいです。何よう日に どの きょうしつへ 行きますか。', ['木よう日に きょうしつ ３', '月よう日に きょうしつ ３', '木よう日に きょうしつ １', '火よう日に きょうしつ ３'], 'The timetable: 木よう日：会話（午後 ２時〜４時）, and the note: 午後の クラスは きょうしつ ３.', 'detail keyword neg', ["Monday's 会話 is in the MORNING (午前), so it is in room 1, and it's the wrong time.", "Thursday is right, but afternoon classes are in room 3. Room 1 is for the morning.", "火よう日は 休み: there is no class on Tuesday."]]], 'info');

/* ───────── 文章の文法: one passage per mock at each level, 4 blanks at N5 and N4, 5 at N3. ───────── */
textGrammar(5, 'n5t1', 'わたしの しゅうまつ\n\nマリア\n\nわたしは まいしゅう 土よう日に いぬの ハナと こうえんへ 行きます。こうえんは うちの ちかく（１）あります。大きい 木が たくさん あって、休みの 日は 子どもが 多いです。こうえんで ハナと 一時間ぐらい さんぽを します。（２）、こうえんの 前の きっさてんで コーヒーを 飲みます。きっさてんの コーヒーは とても おいしいです。でも、少し（３）。一ぱい ７００円です。\n日よう日は どこへも（４）、うちで 本を 読みます。先月は 日本語の 本を 一さつ 読みました。あまり 長くない 本でしたが、わからない ことばが たくさん ありました。来月も 日本語の 本を 読みたいです。', [['1', ['に', 'で', 'を', 'へ'], 'ちかくに あります: a place where something IS takes に. で is for where you DO something.', 'particle particle particle', ['で marks where you DO something. Where something IS takes に.', 'を marks an object. A place of existence takes に.', 'へ marks direction. A place of existence takes に.']], ['2', ['それから', 'でも', 'だから', 'では'], 'さんぽを します。それから、コーヒーを 飲みます = after that. Nothing contrasts, so not でも.', 'seq nuance nuance', ['でも = but. Nothing contrasts: after the walk, she has coffee.', 'だから = so. The walk is not the reason for the coffee; it comes after it.', 'では = well then, used to move on in talk. Here one action follows another: それから.']], ['3', ['高いです', '安いです', 'おいしくないです', '新しいです'], 'でも turns to a minus point: 少し 高いです (a bit expensive), and 一ぱい ７００円 backs it up. おいしくない contradicts とても おいしい.', 'dir detail field', ['安い = cheap, the opposite. ７００円 for one cup backs up 高い.', 'おいしくない contradicts とても おいしいです in the sentence before.', '新しい = new. ７００円 is about the price, not age.']], ['4', ['行かないで', '行って', '行かなくて', '行きたくて'], 'どこへも needs a negative. 〜ないで、〜 = instead of going, I read at home.', 'polar form form', ['行って means she goes. どこへも needs a negative.', 'なくて gives a reason. "Instead of going" is ないで.', '行きたくて = wanting to go. どこへも needs a negative.']]]);
textGrammar(5, 'n5t2', 'やまださん\n\nきのうは ありがとう ございました。やまださんの うちで 食べた りょうりは とても おいしかったです。お母さんが つくった てんぷらが いちばん すきでした。わたしも 日本の りょうりを（１）。こんど おしえて ください。\n\nらいしゅうの 金よう日は ひまですか。いっしょに えいがを（２）。駅の 前（３）新しい えいがかんが できました。日本の えいがも 外国の えいがも 見る ことが できます。６時（４）駅で 会いましょう。えいがの 後で、駅の ちかくの レストランで ばんごはんを 食べませんか。お金は わたしが はらいます。きのうの おれいです。\n\nリー', [['1', ['つくりたいです', 'つくって ください', 'つくりませんか', 'つくりました'], 'わたしも … つくりたいです = I want to make it too, so please teach me. つくりました can\'t be: she still needs lessons.', 'nuance nuance detail', ['つくって ください asks Yamada to make it. わたしも shows she wants to make it herself.', 'つくりませんか invites Yamada to cook. わたしも … こんど おしえて shows she wants to learn.', 'つくりました = she already made it. Then she wouldn\'t ask to be taught.']], ['2', ['見ませんか', '見ましたか', '見て いますか', '見ないで ください'], 'いっしょに 〜ませんか = an invitation (shall we …?). It is about next Friday, so not past.', 'form form situ', ['見ましたか asks about the past. The film is next Friday.', '見て いますか asks what someone is doing now. いっしょに shows an invitation.', '見ないで ください = please don\'t watch. That\'s the opposite of inviting.']], ['3', ['に', 'で', 'を', 'が'], '駅の 前に … できました: a new building appears AT a place, so に.', 'particle particle particle', ['で marks where an action happens. A new building appears AT a place: に.', 'を marks an object. できる takes に for the place.', 'が marks what appeared (えいがかんが). The place takes に.']], ['4', ['に', 'を', 'が', 'の'], '６時に = at 6 o\'clock. A clock time takes に.', 'particle particle particle', ['を marks an object. A clock time takes に.', 'が marks a subject. A clock time takes に.', '６時の 駅 = "the 6 o\'clock station". A meeting time takes に.']]]);
textGrammar(4, 'n4t1', 'わたしの {趣味|しゅみ}\n\nアン\n\nわたしの {趣味|しゅみ}は 写真を {撮|と}る ことです。国に いた ときは、家族や 友だちの 写真ばかり {撮|と}って いました。日本に 来て から、毎週 いろいろな ところへ 写真を {撮|と}りに 行きます。町の 古い 店や {季節|きせつ}の 花など、{撮|と}りたい ものが たくさん あります。\n先月は 京都へ 行きました。古い お{寺|てら}が たくさん あって、とても きれいでした。（１）、人が 多くて、なかなか いい 写真が {撮|と}れませんでした。お{寺|てら}の 前で 一時間 待っても、人が 入らない 写真は 一まいも {撮|と}れなかったのです。\n今は、朝 早く 出かける（２）して います。朝は 人が 少ないし、空気も きれいだ（３）です。それに、朝の 光で {撮|と}った 写真は、色が とても やさしく 見えます。\n来年 国へ 帰る 前に、日本で {撮|と}った 写真を 家族に（４）と 思って います。家族は きっと {喜|よろこ}んで くれるでしょう。', [['1', ['でも', 'それで', 'だから', 'それに'], 'きれいでした → でも → couldn\'t take good photos: a contrast. それに only adds another plus.', 'nuance nuance nuance', ['それで = so. Pretty temples don\'t lead to bad photos; it\'s a contrast.', 'だから = so. The next sentence goes against the first: でも.', 'それに adds another plus. The next sentence is a minus: でも.']], ['2', ['ように', 'ために', 'そうに', 'ばかり'], '〜ように して います = I make a point of doing it (a habit I try to keep).', 'nuance nuance form', ['ために follows a choice you make, not ように する. "Make a point of" is ように する.', 'そうに takes the stem (出かけそう) and means "looks like".', 'ばかり follows the た-form or a noun.']], ['3', ['から', 'ので', 'けど', 'し'], 'This sentence gives the reason: 〜からです. ので can\'t come before です.', 'form form nuance', ['ので can\'t come before です.', 'けど = but. The sentence gives a reason.', 'し lists reasons but can\'t come before です.']], ['4', ['見せよう', '見せて ほしい', '見せた', '見せましょう'], '〜(よ)うと 思って います = I intend to. 見せて ほしい would mean she wants someone else to show.', 'dir form form', ['見せて ほしい = want someone else to show. She is the one showing.', '見せた と 思って います = thinks she showed. 来年 is the future.', 'ましょう can\'t take と 思って います. Use the volitional 見せよう.']]]);
textGrammar(4, 'n4t2', 'アルバイト\n\nワン\n\nわたしは 先月から 駅の 前の コンビニで アルバイトを して います。はじめは 日本語が よく わからなくて、お{客|きゃく}さんに 何か 聞かれても、すぐに 答える こと（１）できませんでした。「おはしは いりますか」や 「{温|あたた}めますか」など、店で よく 使う {言葉|ことば}を 知らなかったのです。店長は「ゆっくりで いいですよ」と 言って くれましたが、とても {恥|は}ずかしかったです。\n（２）、毎日 店で 使う {言葉|ことば}を ノートに 書いて、家で 何回も 声に 出して {練習|れんしゅう}しました。一か月ぐらい たつと、お{客|きゃく}さんの 言う ことが だんだん わかるように なりました。今は お{客|きゃく}さんと 話すのが 楽しく（３）。よく 来る おばあさんは、いつも 「{頑張|がんば}ってね」と 声を かけて くれます。\n来月からは 夜の 時間も 働く（４）なりました。夜は 店員が 少ないので、一人で 仕事を する 時間も あります。少し {心配|しんぱい}ですが、もっと {頑張|がんば}りたいです。', [['1', ['が', 'を', 'に', 'で'], '〜ことが できる = can do. The particle is always が.', 'particle particle particle', ['ことが できる always takes が, not を.', 'に doesn\'t go before できる here.', 'で doesn\'t go before できる here.']], ['2', ['それで', 'それに', 'でも', 'たとえば'], 'She was embarrassed → それで (so) she practised. It is a result, not a contrast or an example.', 'nuance nuance nuance', ['それに adds another point. Practising is the result of being embarrassed: それで.', 'でも = but. Practising follows from the feeling; nothing contrasts.', 'たとえば = for example. Practising isn\'t an example.']], ['3', ['なりました', 'しました', 'いました', 'ありました'], 'い-adjective → 〜く なりました = has become (楽しく なりました).', 'form form form', ['しました needs a doer (楽しく する = make it fun). A change in feeling is なりました.', 'いました can\'t follow 楽しく.', 'ありました can\'t follow 楽しく.']], ['4', ['ことに', 'ために', 'そうに', 'までに'], '〜ことに なりました = it has been decided (by the shop) that she works nights too.', 'nuance nuance form', ['ために = in order to. It can\'t take なりました.', 'そうに takes the stem and means "looks like".', 'までに = by (a deadline).']]]);
textGrammar(3, 'n3t1', '料理と 私\n\n私は 大学に 入る（１）、料理を した ことが ほとんど なかった。料理は 母が する もので、自分は 食べる だけだったのだ。大学に 入って 一人で 暮らし始め、毎日 コンビニの お{弁当|べんとう}ばかり 食べて いたら、だんだん 体の 調子が 悪く なって きた。お金も 思って いたより ずっと かかって いた。（２）、自分で 作って みる ことに した。\n最初は たまごを {焼|や}く（３）失敗して いたが、インターネットで 調べながら 続けて いる うちに、少しずつ 上手に なった。{材料|ざいりょう}を むだに しないように、一週間分の メニューを 考えてから かい物に 行く ことも 覚えた。今では 友人を 家に 招いて、料理を（４）ことも ある。みんなが 「おいしい」と 言って くれると、本当に うれしい。\n料理を 始めて わかったのは、毎日 ごはんを 作って くれて いた 母の 大変さだ。仕事から 帰って 疲れて いても、母は ほとんど 休まずに 台所に 立って いた。今度 実家に 帰ったら、母に 何か 作って（５）と 思う。', [['1', ['までは', 'までに', 'うちに', 'あとで'], '〜までは = up until then (a state that lasted). までに is a deadline for one action.', 'nuance nuance nuance', ['までに is a deadline for one action. "Until I entered university (I had hardly cooked)" is までは.', 'うちに means "while it lasts" and needs 〜て いる or 〜ない. A state up until then is までは.', 'あとで follows the た-form (入った あとで) and means "after". The text is about before university: までは.']], ['2', ['そこで', 'ところが', 'それとも', 'つまり'], 'そこで = so, to deal with that, he decided to cook. ところが would bring an unexpected turn.', 'nuance nuance nuance', ['ところが brings a surprise turn. Deciding to cook is his answer to the problem: そこで.', 'それとも offers a choice in a question. Use そこで.', 'つまり sums up ("in other words"). Deciding to cook is an action he took: そこで.']], ['3', ['ことさえ', 'ことしか', 'ことだけで', 'ほどに'], '〜さえ = even. Even frying an egg went wrong: the simplest thing.', 'polar nuance form', ['しか needs a negative verb. 失敗して いた is positive. "Even" is さえ.', 'ことだけで would mean "with only that". The point is that even the easiest thing went wrong: さえ.', 'ほどに shows degree and doesn\'t follow {焼|や}く like this. Use ことさえ.']], ['4', ['ごちそうする', 'ごちそうに なる', 'ごちそうさせられる', 'ごちそうして もらう'], 'He invites friends (招いて), so he is the one who treats them: ごちそうする.', 'dir pcv dir', ['ごちそうに なる means friends treat HIM. He invites them to his home: ごちそうする.', 'させられる means he is forced to. He is happy to cook for friends: ごちそうする.', 'して もらう means friends treat him. He is the host: ごちそうする.']], ['5', ['あげたい', 'もらいたい', 'くれたい', 'いただきたい'], '母に 作って あげたい = I want to cook for my mother. もらいたい / いただきたい would have her cook again.', 'dir form dir', ['作って もらいたい means he wants his mother to cook again. After seeing how hard it was for her, he wants to cook for her: あげたい.', 'くれる is for someone giving to you. It can\'t take たい for your own act. Use あげたい.', 'いただきたい is a polite もらいたい: his mother would cook. He wants to cook for her: あげたい.']]]);
textGrammar(3, 'n3t2', '歩く ことの よさ\n\n最近、駅まで バスに 乗らずに 歩く ように して いる。家から 駅までは 歩いて 二十分ぐらいだ。きっかけは、医者に 運動不足だと 言われた ことだ。毎日 家と 会社の 間を 電車と バスで 行き来する だけで、ほとんど 歩いて いなかったのだ。\n歩いて みると、バスの 窓から 見て いた 町が まったく 違って 見えた。小さな 花屋や 古い 本屋など、今まで 気が（１）店が たくさん あったのだ。先週は その 本屋で、子どもの ころに 好きだった 本を 見つけた。\n（２）、歩く ことには 考える 時間が できる という よさも ある。仕事の 問題も、歩いて いる（３）ふと よい 考えが 浮かぶ ことが ある。{机|つくえ}の 前で いくら 考えても 出なかった 答えが、急に 見つかる ことも あるのだ。\nもちろん、雨の 日は 大変だ。でも、だからと いって バスに 乗って（４）、また 歩かなく なって しまう かもしれない。だから、雨の 日も {傘|かさ}を さして 歩く ことに して いる。\n歩き始めて 三か月、体が 少し 軽く なった ような 気が する。これからも、{無理|むり}を しない（５）、続けて いきたい。', [['1', ['つかなかった', 'ついた', 'つけなかった', 'つけた'], '気が つく = notice (intransitive). The shops were there, but he had never noticed: つかなかった.', 'polar form form', ['ついた would mean he had noticed them. The shops looked new to him: 気が つかなかった.', 'つける makes it 気を つける (be careful). "Notice" is 気が つく.', '気が つけた is not natural. "Notice" is 気が つく, and he didn\'t: つかなかった.']], ['2', ['また', 'しかし', 'たとえば', 'つまり'], 'また = also, another good point. Nothing is contrasted or summed up.', 'nuance nuance nuance', ['しかし brings a contrast. Another good point is added: また.', 'たとえば gives an example. A new point follows: また.', 'つまり sums up. A new point follows: また.']], ['3', ['うちに', 'までに', 'ために', 'ように'], '〜て いる うちに = while doing it, (something happens on its own).', 'nuance nuance nuance', ['までに is a deadline. An idea coming while walking is うちに.', 'ために is a purpose. He doesn\'t walk to get an idea by chance: うちに.', 'ように is "so that". An idea that comes on its own while walking is うちに.']], ['4', ['しまうと', 'しまったのに', 'しまうために', 'しまうように'], '〜と = if/when that happens, the result follows: take the bus once, and you may stop walking.', 'nuance nuance nuance', ['しまったのに is "even though I did". The text says what might happen if he does: しまうと.', 'しまうために is a purpose. Nobody takes the bus in order to stop walking: しまうと.', 'しまうように is "so that". The result that may follow is しまうと.']], ['5', ['ように', 'ために', 'ことに', 'そうに'], '〜ない ように = so as not to. ために needs a goal you choose, so it doesn\'t go with しない here.', 'nuance nuance form', ['ために needs a purpose. He doesn\'t keep walking in order to not overdo it. "Being careful not to" is ように.', 'ことに after しない would be a decision (ことに する). Before 続けて, use ように.', 'そうに means "looking like". "So as not to overdo it" is ように.']]]);

/* Typing versions of every kanji-reading item: you recall the reading instead of recognizing it. */
BANK.filter(q => q.t === 'kr').forEach(q => BANK.push({
    id: q.id + '-ty',
    lv: q.lv,
    s: 'typing',
    t: 'ty',
    q: q.q,
    ans: [q.o[0]],
    e: q.e
}));

/* Every JLPT word: a reading and a spelling question for every JLPT word with kanji (data/jlpt/*.csv), generated by
   tools/gen-words.mjs. Part of the Kanji section (same kind of question), marked drill: true so mock exams keep
   their hand-written and per-kanji items. IDs are keyed by the word, so regenerating keeps progress. */
{
    const seen = {};
    WORDS.trim().split('\n').filter(Boolean).forEach(line => {
        const [lv,t,w,rd,mean,a,b,c,traps,shown,right] = line.split('|');
        const base = `w${lv}-${t}-${w}`
          , id = seen[base] ? `${base}-${++seen[base]}` : (seen[base] = 1,
        base);
        const e = `${w} = ${rd} (${mean}).`;
        // vm: what does the word mean? (Vocabulary). Shown in kana when its kanji are above the level.
        if (t === 'vm') {
            BANK.push({
                id,
                lv: +lv,
                s: 'vocab',
                drill: true,
                t,
                q: shown === rd || shown === w && w === rd ? `<u>${shown}</u>` : `<u>${shown}</u>（${rd}）`,
                o: [right, a, b, c],
                e: `${shown === w ? w + ' = ' + rd : rd} means: ${mean}.`,
                d: traps.split(' '),
                w,
                rd,
                sh: shown === rd ? rd : `${shown}（${rd}）`
            });
            return;
        }
        BANK.push(t === 'kr' ? {
            id,
            lv: +lv,
            s: 'kanji',
            drill: true,
            t,
            q: `<u>${w}</u>（${mean}）`,
            o: [rd, a, b, c],
            e,
            d: traps.split(' '),
            w
        } : {
            id,
            lv: +lv,
            s: 'kanji',
            drill: true,
            t,
            q: `<u>${rd}</u>（${mean}）`,
            o: [w, a, b, c],
            e,
            d: traps.split(' '),
            w
        });
    }
    );
    // vm options are English, so a mistake note needs the Japanese word behind each one (おばさん "aunt" vs おばあさん
    // "grandmother"): ro = readings, ow = shown words of [right, a, b, c], looked up by option label at the same level, else the nearest easier one.
    const vms = BANK.filter(q => q.t === 'vm')
      , byLabel = {};
    vms.forEach(q => {
        const k = q.lv + '|' + q.o[0];
        if (!(k in byLabel))
            byLabel[k] = q;
    }
    );
    const readingOf = (lv, o) => {
        for (let l = lv; l <= 5; l++)
            if ((l + '|' + o) in byLabel)
                return byLabel[l + '|' + o];
        return null;
    }
    ;
    vms.forEach(q => {
        const hits = q.o.map(o => readingOf(q.lv, o));
        q.ro = hits.map(h => h && h.rd);
        q.ow = hits.map(h => h && h.sh);
    }
    );
    vms.forEach(q => {
        delete q.rd;
        delete q.sh;
    }
    );
}
