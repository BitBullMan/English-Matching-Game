// 100 个旅游/日常常用短句 —— 适用人群：
//   - 境外入华旅游的老外（学旅游中文）
//   - 境内学习英语日常会话的中国人
//
// 按 10 个场景各 10 句，覆盖见面/吃住行/紧急等高频需求。
// 字段同 words.js（type:'phrase'），scenario 用于细分场景过滤。

const P = (o) => ({ type: 'phrase', category: 'phrase', ...o })

export const PHRASES = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👋 问候 Greetings (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_hello',       emoji:'👋', english:'Hello!',                   chinese:'你好！', pinyin:'nǐ hǎo ！',         scenario:'greeting' }),
  P({ id:'p_goodmorning', emoji:'🌅', english:'Good morning!',            chinese:'早上好！', pinyin:'zǎo shàng hǎo ！',       scenario:'greeting' }),
  P({ id:'p_goodevening', emoji:'🌆', english:'Good evening!',            chinese:'晚上好！', pinyin:'wǎn shàng hǎo ！',       scenario:'greeting' }),
  P({ id:'p_goodnight',   emoji:'🌙', english:'Good night!',              chinese:'晚安！', pinyin:'wǎn ān ！',         scenario:'greeting' }),
  P({ id:'p_goodbye',     emoji:'👋', english:'Goodbye!',                 chinese:'再见！', pinyin:'zài jiàn ！',         scenario:'greeting' }),
  P({ id:'p_seeyou',      emoji:'😊', english:'See you tomorrow!',        chinese:'明天见！', pinyin:'míng tiān jiàn ！',       scenario:'greeting' }),
  P({ id:'p_howareyou',   emoji:'🤔', english:'How are you?',             chinese:'你好吗？', pinyin:'nǐ hǎo ma ？',       scenario:'greeting' }),
  P({ id:'p_imfine',      emoji:'😊', english:"I'm fine, thank you.",     chinese:'我很好，谢谢。', pinyin:'wǒ hěn hǎo ， xiè xiè 。', scenario:'greeting' }),
  P({ id:'p_longtime',    emoji:'🤗', english:'Long time no see!',        chinese:'好久不见！', pinyin:'hǎo jiǔ bú jiàn ！',     scenario:'greeting' }),
  P({ id:'p_welcome',     emoji:'🎉', english:'Welcome!',                 chinese:'欢迎！', pinyin:'huān yíng ！',         scenario:'greeting' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🙋 自我介绍 Self-introduction (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_myname',      emoji:'🙋', english:'My name is...',            chinese:'我叫……', pinyin:'wǒ jiào ……',         scenario:'intro' }),
  P({ id:'p_whatname',    emoji:'❓', english:'What is your name?',       chinese:'你叫什么名字？', pinyin:'nǐ jiào shén me míng zì ？', scenario:'intro' }),
  P({ id:'p_nicemeet',    emoji:'🤝', english:'Nice to meet you.',        chinese:'很高兴认识你。', pinyin:'hěn gāo xìng rèn shí nǐ 。', scenario:'intro' }),
  P({ id:'p_fromamerica', emoji:'🇺🇸', english:"I'm from America.",         chinese:'我来自美国。', pinyin:'wǒ lái zì měi guó 。',   scenario:'intro' }),
  P({ id:'p_wherefrom',   emoji:'🌍', english:'Where are you from?',      chinese:'你来自哪里？', pinyin:'nǐ lái zì nǎ lǐ ？',   scenario:'intro' }),
  P({ id:'p_tourist',     emoji:'🎒', english:"I'm a tourist.",           chinese:'我是游客。', pinyin:'wǒ shì yóu kè 。',     scenario:'intro' }),
  P({ id:'p_speakchinese', emoji:'💬', english:"I don't speak Chinese.",   chinese:'我不会说中文。', pinyin:'wǒ bú huì shuō zhōng wén 。', scenario:'intro' }),
  P({ id:'p_speakenglish', emoji:'💬', english:'Do you speak English?',    chinese:'你会说英语吗？', pinyin:'nǐ huì shuō yīng yǔ ma ？', scenario:'intro' }),
  P({ id:'p_alittle',     emoji:'🤏', english:'A little bit.',            chinese:'一点点。', pinyin:'yì diǎn diǎn 。',       scenario:'intro' }),
  P({ id:'p_dontunderstand', emoji:'🤷', english:"I don't understand.",   chinese:'我听不懂。', pinyin:'wǒ tīng bù dǒng 。',     scenario:'intro' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔢 数字与时间 Numbers & Time (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_whattime',    emoji:'⏰', english:'What time is it?',         chinese:'现在几点？', pinyin:'xiàn zài jǐ diǎn ？',     scenario:'time' }),
  P({ id:'p_threeoclock', emoji:'🕒', english:"It's three o'clock.",      chinese:'现在三点。', pinyin:'xiàn zài sān diǎn 。',     scenario:'time' }),
  P({ id:'p_today',       emoji:'📅', english:'Today',                    chinese:'今天', pinyin:'jīn tiān',           scenario:'time' }),
  P({ id:'p_tomorrow',    emoji:'📆', english:'Tomorrow',                 chinese:'明天', pinyin:'míng tiān',           scenario:'time' }),
  P({ id:'p_yesterday',   emoji:'🗓️', english:'Yesterday',                chinese:'昨天', pinyin:'zuó tiān',           scenario:'time' }),
  P({ id:'p_now',         emoji:'⏱️', english:'Now',                      chinese:'现在', pinyin:'xiàn zài',           scenario:'time' }),
  P({ id:'p_later',       emoji:'⏳', english:'Later',                    chinese:'等会儿', pinyin:'děng huì er',         scenario:'time' }),
  P({ id:'p_onehour',     emoji:'🕐', english:'One hour',                 chinese:'一个小时', pinyin:'yí gè xiǎo shí',       scenario:'time' }),
  P({ id:'p_morning',     emoji:'☀️', english:'Morning',                  chinese:'上午', pinyin:'shàng wǔ',           scenario:'time' }),
  P({ id:'p_evening',     emoji:'🌃', english:'Evening',                  chinese:'晚上', pinyin:'wǎn shàng',           scenario:'time' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧭 方向问路 Directions (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_where',       emoji:'❓', english:'Where is...?',             chinese:'……在哪里？', pinyin:'…… zài nǎ lǐ ？',     scenario:'direction' }),
  P({ id:'p_howfar',      emoji:'📏', english:'How far is it?',           chinese:'有多远？', pinyin:'yǒu duō yuǎn ？',       scenario:'direction' }),
  P({ id:'p_straight',    emoji:'⬆️', english:'Go straight.',             chinese:'一直走。', pinyin:'yì zhí zǒu 。',       scenario:'direction' }),
  P({ id:'p_turnleft',    emoji:'⬅️', english:'Turn left.',               chinese:'左转。', pinyin:'zuǒ zhuǎn 。',         scenario:'direction' }),
  P({ id:'p_turnright',   emoji:'➡️', english:'Turn right.',              chinese:'右转。', pinyin:'yòu zhuǎn 。',         scenario:'direction' }),
  P({ id:'p_nearby',      emoji:'📍', english:"It's nearby.",             chinese:'就在附近。', pinyin:'jiù zài fù jìn 。',     scenario:'direction' }),
  P({ id:'p_lost',        emoji:'🗺️', english:"I'm lost.",                chinese:'我迷路了。', pinyin:'wǒ mí lù le 。',     scenario:'direction' }),
  P({ id:'p_walkthere',   emoji:'🚶', english:'Can I walk there?',        chinese:'走路能到吗？', pinyin:'zǒu lù néng dào ma ？',   scenario:'direction' }),
  P({ id:'p_showmap',     emoji:'📱', english:'Can you show me on the map?', chinese:'能在地图上指给我看吗？', pinyin:'néng zài dì tú shàng zhǐ gěi wǒ kàn ma ？', scenario:'direction' }),
  P({ id:'p_toilethere',  emoji:'🚻', english:'Where is the toilet?',     chinese:'洗手间在哪里？', pinyin:'xǐ shǒu jiān zài nǎ lǐ ？', scenario:'direction' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚕 交通 Transportation (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_taxi',        emoji:'🚕', english:'Taxi!',                    chinese:'出租车！', pinyin:'chū zū chē ！',       scenario:'transport' }),
  P({ id:'p_takemeto',    emoji:'📍', english:'Take me to this address.', chinese:'请带我去这个地址。', pinyin:'qǐng dài wǒ qù zhè ge dì zhǐ 。', scenario:'transport' }),
  P({ id:'p_howmuchfare', emoji:'💰', english:'How much is the fare?',    chinese:'车费多少钱？', pinyin:'chē fèi duō shǎo qián ？',   scenario:'transport' }),
  P({ id:'p_stophere',    emoji:'🛑', english:'Stop here, please.',       chinese:'请在这里停。', pinyin:'qǐng zài zhè lǐ tíng 。',   scenario:'transport' }),
  P({ id:'p_airport',     emoji:'✈️', english:'To the airport, please.', chinese:'请去机场。', pinyin:'qǐng qù jī chǎng 。',     scenario:'transport' }),
  P({ id:'p_trainstation', emoji:'🚉', english:'To the train station.',    chinese:'去火车站。', pinyin:'qù huǒ chē zhàn 。',     scenario:'transport' }),
  P({ id:'p_subwayhere',  emoji:'🚇', english:'Where is the subway?',     chinese:'地铁站在哪里？', pinyin:'dì tiě zhàn zài nǎ lǐ ？', scenario:'transport' }),
  P({ id:'p_bushere',     emoji:'🚌', english:'Which bus goes to...?',    chinese:'哪路公交车去……？', pinyin:'nǎ lù gōng jiāo chē qù ……？', scenario:'transport' }),
  P({ id:'p_didicar',     emoji:'📱', english:'I called a Didi.',         chinese:'我叫了滴滴。', pinyin:'wǒ jiào le dī dī 。',   scenario:'transport' }),
  P({ id:'p_traffic',     emoji:'🚦', english:'The traffic is heavy.',    chinese:'交通很堵。', pinyin:'jiāo tōng hěn dǔ 。',     scenario:'transport' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🍽️ 餐厅 Restaurant (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_menuplease',  emoji:'📋', english:'Menu, please.',            chinese:'请给我菜单。', pinyin:'qǐng gěi wǒ cài dān 。',   scenario:'restaurant' }),
  P({ id:'p_recommend',   emoji:'👍', english:'What do you recommend?',   chinese:'你推荐什么？', pinyin:'nǐ tuī jiàn shén me ？',   scenario:'restaurant' }),
  P({ id:'p_thisplease',  emoji:'👇', english:'This one, please.',        chinese:'我要这个。', pinyin:'wǒ yào zhè ge 。',     scenario:'restaurant' }),
  P({ id:'p_notspicy',    emoji:'🌶️', english:'Not spicy, please.',      chinese:'不要辣，谢谢。', pinyin:'bú yào là ， xiè xiè 。', scenario:'restaurant' }),
  P({ id:'p_imallergic',  emoji:'🤧', english:"I'm allergic to peanuts.", chinese:'我对花生过敏。', pinyin:'wǒ duì huā shēng guò mǐn 。', scenario:'restaurant' }),
  P({ id:'p_water',       emoji:'💧', english:'A glass of water, please.', chinese:'请来一杯水。', pinyin:'qǐng lái yī bēi shuǐ 。',   scenario:'restaurant' }),
  P({ id:'p_delicious',   emoji:'😋', english:'Very delicious!',          chinese:'很好吃！', pinyin:'hěn hǎo chī ！',       scenario:'restaurant' }),
  P({ id:'p_billplease',  emoji:'🧾', english:'The bill, please.',        chinese:'请买单。', pinyin:'qǐng mǎi dān 。',       scenario:'restaurant' }),
  P({ id:'p_takeaway',    emoji:'🥡', english:'Can I take this away?',    chinese:'这个能打包吗？', pinyin:'zhè ge néng dǎ bāo ma ？', scenario:'restaurant' }),
  P({ id:'p_vegetarian',  emoji:'🥗', english:"I'm a vegetarian.",        chinese:'我是素食者。', pinyin:'wǒ shì sù shí zhě 。',   scenario:'restaurant' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛍️ 购物 Shopping (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_howmuch',     emoji:'💵', english:'How much is this?',        chinese:'这个多少钱？', pinyin:'zhè ge duō shǎo qián ？',   scenario:'shopping' }),
  P({ id:'p_tooexpensive', emoji:'😱', english:"It's too expensive.",      chinese:'太贵了。', pinyin:'tài guì le 。',       scenario:'shopping' }),
  P({ id:'p_cheaper',     emoji:'🙏', english:'Can it be cheaper?',       chinese:'能便宜点吗？', pinyin:'néng pián yi diǎn ma ？',   scenario:'shopping' }),
  P({ id:'p_tryon',       emoji:'👕', english:'Can I try it on?',         chinese:'我能试一下吗？', pinyin:'wǒ néng shì yī xià ma ？', scenario:'shopping' }),
  P({ id:'p_otherscolor', emoji:'🎨', english:'Other colors?',            chinese:'有别的颜色吗？', pinyin:'yǒu bié de yán sè ma ？', scenario:'shopping' }),
  P({ id:'p_sizesmall',   emoji:'📏', english:"Do you have a smaller size?", chinese:'有小一号的吗？', pinyin:'yǒu xiǎo yī hào de ma ？', scenario:'shopping' }),
  P({ id:'p_paycard',     emoji:'💳', english:'Can I pay by card?',       chinese:'能刷卡吗？', pinyin:'néng shuā kǎ ma ？',     scenario:'shopping' }),
  P({ id:'p_wechatpay',   emoji:'📲', english:'Do you accept WeChat Pay?', chinese:'可以用微信支付吗？', pinyin:'kě yǐ yòng wēi xìn zhī fù ma ？', scenario:'shopping' }),
  P({ id:'p_receipt',     emoji:'🧾', english:'Receipt, please.',         chinese:'请给我收据。', pinyin:'qǐng gěi wǒ shōu jù 。',   scenario:'shopping' }),
  P({ id:'p_justlooking', emoji:'👀', english:"I'm just looking.",        chinese:'我只是看看。', pinyin:'wǒ zhǐ shì kàn kàn 。',   scenario:'shopping' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏨 酒店 Hotel (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_checkin',     emoji:'🛎️', english:"I'd like to check in.",   chinese:'我要办理入住。', pinyin:'wǒ yào bàn lǐ rù zhù 。', scenario:'hotel' }),
  P({ id:'p_checkout',    emoji:'🧳', english:"I'd like to check out.",  chinese:'我要退房。', pinyin:'wǒ yào tuì fáng 。',     scenario:'hotel' }),
  P({ id:'p_reservation', emoji:'📝', english:'I have a reservation.',    chinese:'我有预订。', pinyin:'wǒ yǒu yù dìng 。',     scenario:'hotel' }),
  P({ id:'p_wifipass',    emoji:'📶', english:"What's the WiFi password?", chinese:'WiFi 密码是什么？', pinyin:'WiFi  mì mǎ shì shén me ？', scenario:'hotel' }),
  P({ id:'p_extratowel',  emoji:'🛁', english:'Extra towels, please.',    chinese:'请多给几条毛巾。', pinyin:'qǐng duō gěi jǐ tiáo máo jīn 。', scenario:'hotel' }),
  P({ id:'p_aircon',      emoji:'❄️', english:'The air conditioner is broken.', chinese:'空调坏了。', pinyin:'kōng tiáo huài le 。',     scenario:'hotel' }),
  P({ id:'p_breakfast',   emoji:'🍳', english:'Is breakfast included?',   chinese:'含早餐吗？', pinyin:'hán zǎo cān ma ？',     scenario:'hotel' }),
  P({ id:'p_latecheckout', emoji:'⏰', english:'Can I check out late?',    chinese:'能晚点退房吗？', pinyin:'néng wǎn diǎn tuì fáng ma ？', scenario:'hotel' }),
  P({ id:'p_storeluggage', emoji:'🧳', english:'Can I store my luggage?',  chinese:'能寄存行李吗？', pinyin:'néng jì cún xíng lǐ ma ？', scenario:'hotel' }),
  P({ id:'p_morning',     emoji:'🔔', english:'A wake-up call at 7 a.m.', chinese:'请 7 点叫醒我。', pinyin:'qǐng  7  diǎn jiào xǐng wǒ 。', scenario:'hotel' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏥 医疗紧急 Medical & Emergency (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_help',        emoji:'🆘', english:'Help!',                    chinese:'救命！', pinyin:'jiù mìng ！',         scenario:'emergency' }),
  P({ id:'p_callpolice',  emoji:'👮', english:'Call the police!',         chinese:'报警！', pinyin:'bào jǐng ！',         scenario:'emergency' }),
  P({ id:'p_callambulance', emoji:'🚑', english:'Call an ambulance!',     chinese:'叫救护车！', pinyin:'jiào jiù hù chē ！',     scenario:'emergency' }),
  P({ id:'p_emergency',   emoji:'⚠️', english:"It's an emergency.",       chinese:'这是紧急情况。', pinyin:'zhè shì jǐn jí qíng kuàng 。', scenario:'emergency' }),
  P({ id:'p_imsick',      emoji:'🤒', english:"I'm not feeling well.",    chinese:'我身体不舒服。', pinyin:'wǒ shēn tǐ bù shū fú 。', scenario:'emergency' }),
  P({ id:'p_hospital',    emoji:'🏥', english:'Where is the hospital?',   chinese:'医院在哪里？', pinyin:'yī yuàn zài nǎ lǐ ？',   scenario:'emergency' }),
  P({ id:'p_pharmacy',    emoji:'💊', english:'Where is the pharmacy?',   chinese:'药店在哪里？', pinyin:'yào diàn zài nǎ lǐ ？',   scenario:'emergency' }),
  P({ id:'p_headache',    emoji:'🤕', english:'I have a headache.',       chinese:'我头疼。', pinyin:'wǒ tóu téng 。',       scenario:'emergency' }),
  P({ id:'p_lostpassport', emoji:'📕', english:'I lost my passport.',     chinese:'我的护照丢了。', pinyin:'wǒ de hù zhào diū le 。', scenario:'emergency' }),
  P({ id:'p_embassy',     emoji:'🏛️', english:'Where is the US embassy?', chinese:'美国大使馆在哪里？', pinyin:'měi guó dà shǐ guǎn zài nǎ lǐ ？', scenario:'emergency' }),

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🙏 礼貌常用 Polite phrases (10)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  P({ id:'p_pleasepol',   emoji:'🙏', english:'Please.',                  chinese:'请。', pinyin:'qǐng 。',           scenario:'polite' }),
  P({ id:'p_thankyou',    emoji:'🙇', english:'Thank you!',               chinese:'谢谢！', pinyin:'xiè xiè ！',         scenario:'polite' }),
  P({ id:'p_youwelcome',  emoji:'😊', english:"You're welcome.",          chinese:'不客气。', pinyin:'bú kè qì 。',       scenario:'polite' }),
  P({ id:'p_sorrypol',    emoji:'😅', english:'Sorry!',                   chinese:'对不起！', pinyin:'duì bù qǐ ！',       scenario:'polite' }),
  P({ id:'p_nevermind',   emoji:'👌', english:'Never mind.',              chinese:'没关系。', pinyin:'méi guān xì 。',       scenario:'polite' }),
  P({ id:'p_excuseme',    emoji:'🙋', english:'Excuse me.',               chinese:'打扰一下。', pinyin:'dǎ rǎo yī xià 。',     scenario:'polite' }),
  P({ id:'p_canyouhelp',  emoji:'🤝', english:'Can you help me?',         chinese:'你能帮我吗？', pinyin:'nǐ néng bāng wǒ ma ？',   scenario:'polite' }),
  P({ id:'p_ofcourse',    emoji:'👍', english:'Of course.',               chinese:'当然。', pinyin:'dāng rán 。',         scenario:'polite' }),
  P({ id:'p_yespol',      emoji:'✅', english:'Yes.',                     chinese:'是的。', pinyin:'shì de 。',         scenario:'polite' }),
  P({ id:'p_nopol',       emoji:'❌', english:'No.',                      chinese:'不是。', pinyin:'bú shì 。',         scenario:'polite' })
]

// 场景元数据（用于复习页/筛选）
export const SCENARIOS = [
  { id: 'greeting',    label: '👋 问候',     labelEn: 'Greetings' },
  { id: 'intro',       label: '🙋 自我介绍', labelEn: 'Self-intro' },
  { id: 'time',        label: '⏰ 时间',     labelEn: 'Time' },
  { id: 'direction',   label: '🧭 问路',     labelEn: 'Directions' },
  { id: 'transport',   label: '🚕 交通',     labelEn: 'Transport' },
  { id: 'restaurant',  label: '🍽️ 餐厅',    labelEn: 'Restaurant' },
  { id: 'shopping',    label: '🛍️ 购物',    labelEn: 'Shopping' },
  { id: 'hotel',       label: '🏨 酒店',     labelEn: 'Hotel' },
  { id: 'emergency',   label: '🏥 紧急',     labelEn: 'Emergency' },
  { id: 'polite',      label: '🙏 礼貌',     labelEn: 'Polite' }
]
