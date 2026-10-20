/* ============================================================
   来宾 · 桂中旅行手册  —  数据层
   资料来源：来宾市人民政府门户网站、来宾市文化广电和旅游局、
   广西壮族自治区文化和旅游厅公开信息，以及主流旅行平台公开介绍。
   门票、开放时间会变动，页面统一提示「以景区当日公示为准」。
   ============================================================ */

const THEMES = [
  { id: 'shan',  name: '山水',   en: 'MOUNTAIN', desc: '峰丛、峡谷、云海，把肺洗干净', icon: 'mountain' },
  { id: 'renwen',name: '人文',   en: 'HERITAGE', desc: '土司衙门、古钟与庙会，还有一台在用的织机', icon: 'hall' },
  { id: 'yao',   name: '瑶乡',   en: 'YAO',      desc: '五个支系，一面黄泥鼓', icon: 'drum' },
  { id: 'kangyang', name: '康养', en: 'WELLNESS', desc: '86℃ 的泉，和瑶山上的草药', icon: 'spring' },
  { id: 'qinzi', name: '亲子',   en: 'FAMILY',   desc: '能下井、能看猴、能下田', icon: 'kite' },
  { id: 'yeshe', name: '夜色',   en: 'NIGHT',    desc: '灯一亮，桂中就换了张脸', icon: 'lantern' }
];

const COUNTIES = [
  {
    id: 'xincheng', name: '忻城县', short: '忻城', cx: 190, cy: 196, rx: 112, ry: 88, seed: 12,
    tagline: '土司五百年，壮锦在织',
    intro: '莫氏土司在这里世袭数百年，留下亚洲现存最完整的土司建筑群。老街上还能听见织机声。',
    color: 'clay'
  },
  {
    id: 'heshan', name: '合山市', short: '合山', cx: 300, cy: 118, rx: 70, ry: 58, seed: 27,
    tagline: '煤都转身，工业变展品',
    intro: '广西煤都。矿井、选煤楼、蒸汽机车被保留下来，成了可以走下去看的矿山公园。',
    color: 'ink'
  },
  {
    id: 'xingbin', name: '兴宾区', short: '兴宾', cx: 322, cy: 322, rx: 126, ry: 110, seed: 41,
    tagline: '红水河穿城，盘古故里',
    intro: '市府所在地，红水河穿城而过。来宾被称作「盘古文化之都」，盘古庙、盘古钟与一年一度的庙会就在这一带。',
    color: 'jade'
  },
  {
    id: 'xiangzhou', name: '象州县', short: '象州', cx: 474, cy: 176, rx: 106, ry: 84, seed: 58,
    tagline: '桂中粮仓，一泉一街',
    intro: '甘蔗与沙糖桔的主产区，也是"中南第一泉"所在。白天泡温泉，晚上逛七百米长的梦幻夜。',
    color: 'gold'
  },
  {
    id: 'jinxiu', name: '金秀瑶族自治县', short: '金秀', cx: 566, cy: 322, rx: 102, ry: 102, seed: 73,
    tagline: '世界瑶都，桂中屋脊',
    intro: '全国最早成立的瑶族自治县，五个瑶族支系聚居，森林覆盖率 87% 以上。圣堂山 1979 米，是桂中最高处。',
    color: 'jade'
  },
  {
    id: 'wuxuan', name: '武宣县', short: '武宣', cx: 444, cy: 444, rx: 106, ry: 82, seed: 89,
    tagline: '百崖峡谷，黔江五马',
    intro: '丹霞峡谷、临江老村与春天的油菜花田。武宣的红糟，是整座城市的味觉底色。',
    color: 'river'
  }
];

/* price: 参考成人首道门票（元），0 表示免费；仅用于行程估算 */
const SPOTS = [
  {
    id: 'shengtang', name: '圣堂山', county: 'jinxiu', themes: ['shan'],
    scene: 'peak', seed: 3, price: 60, ticket: '约 58–65 元', duration: '5–7 小时', hours: 6,
    best: '4–5 月杜鹃 · 10–11 月云海', months: [4, 5, 10, 11], rating: 4.5,
    tags: ['云海日出', '万亩杜鹃', '悬臂栈道'],
    oneLiner: '1979 米，桂中最高的一口气。',
    desc: '大瑶山主峰，国家级自然保护区、国家森林公园、4A 景区。山体常年罩在雾雨里，峰丛像笋，栈道贴着崖壁修。五月万亩变色杜鹃从山腰开到山顶，十月以后云海最稳。山顶那棵千年南方铁杉，是很多人爬完全程的理由。',
    highlights: ['悬臂栈道贴崖而过', '万亩变色杜鹃（4–5 月）', '云海与日出', '千年南方铁杉'],
    transport: '金秀县城出发约 60 公里山路，自驾 1.5 小时；盘山弯多，易晕车者备药。',
    tips: '山顶温差大，夏天也带件外套；雨后石阶滑，穿防滑鞋。登顶往返约 3 小时，别穿新鞋。'
  },
  {
    id: 'baitai', name: '百崖大峡谷', county: 'wuxuan', themes: ['shan'],
    scene: 'gorge', seed: 7, price: 40, ticket: '40 元', duration: '3–4 小时', hours: 3.5,
    best: '5–9 月避暑溯溪', months: [5, 6, 7, 8, 9], rating: 4.3,
    tags: ['丹霞峡谷', '百米飞瀑', '溯溪'],
    oneLiner: '十公里峡谷，三十七道弯，十处瀑布。',
    desc: '典型的丹霞地貌，主谷两侧挂着数以百计的侧崖，"百崖"由此得名。谷里林木密、石头怪、溪水常年不断，百米飞瀑落下来时整条谷都是水雾。香港《大公报》给过一句"世界罕见的峡谷风光"。',
    highlights: ['主谷全长 10 公里', '37 道弯、10 处瀑布', '负氧离子极高的原始林', '夏季溯溪'],
    transport: '武宣县城往东乡镇，自驾约 40 分钟；景区门口有停车场。',
    tips: '谷里比外面低好几度，带薄外套；水边石面滑，别穿凉拖。'
  },
  {
    id: 'panwangjie', name: '大瑶山盘王界', county: 'jinxiu', themes: ['shan', 'qinzi', 'yao'],
    scene: 'ridge', seed: 23, price: 0, ticket: '索道另计', duration: '3–4 小时', hours: 3.5,
    best: '全年，秋冬云海概率高', months: [1, 2, 3, 10, 11, 12], rating: 4.2,
    tags: ['无障碍登顶', '高山云海', '瑶族风情'],
    oneLiner: '索道加垂直电梯，全家都能"无痛"登顶。',
    desc: '全国山岳型无障碍示范景区：索道、垂直观光电梯、平坦步道接起来，老人和小孩也能上到高山看云海。对不想硬爬圣堂山的人来说，这是更聪明的一站。',
    highlights: ['索道 + 垂直电梯', '高山云海', '瑶族风情演艺'],
    transport: '金秀县城约 25 公里。',
    tips: '带长辈出行优先选这里；山顶风大，外套别省。'
  },
  {
    id: 'guzhan', name: '古占瑶寨', county: 'jinxiu', themes: ['yao'],
    scene: 'village', seed: 31, price: 0, ticket: '体验项目另计', duration: '半天', hours: 3,
    best: '农历十月十六盘王节前后', months: [10, 11, 12], rating: 4.3,
    tags: ['黄泥鼓舞', '打油茶', '瑶浴', '吊脚楼'],
    oneLiner: '吊脚楼、青石板，还有一锅打油茶。',
    desc: '保存较好的瑶族村落。国家级非遗黄泥鼓舞就出自坳瑶支系，舞者把黄泥浆抹在羊皮鼓面上调音，鼓点沉，动作硬。村里能学打油茶、泡瑶浴，也能住吊脚楼。',
    highlights: ['黄泥鼓舞（国家级非遗）', '亲手打一锅油茶', '瑶浴与瑶医药', '吊脚楼民宿'],
    transport: '金秀县城约 10 公里。',
    tips: '进寨拍照先打招呼，别怼脸拍老人；油茶第一口是苦的，第二口才回甘。'
  },
  {
    id: 'motusi', name: '莫土司衙署', county: 'xincheng', themes: ['renwen'],
    scene: 'hall', seed: 37, price: 50, ticket: '约 50 元', duration: '2–3 小时', hours: 2.5,
    best: '全年，上午光线最好', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rating: 4.5,
    tags: ['壮乡故宫', '明代建筑', '土司升堂'],
    oneLiner: '四百多年的"壮乡故宫"，亚洲现存最完整的土司建筑群。',
    desc: '始建于明万历十年（1582），莫氏土司在此世袭数百年。衙门、祠堂、官邸、大夫第连成一片，飞檐挑脊、镂花雕窗，中原官式做法和壮族匠法混在一起。1996 年列为全国重点文物保护单位，2021 年评上 4A。《刘三姐》《石达开》等二十多部影视剧在此取景。',
    highlights: ['土司升堂表演', '大夫第壁画', '壮族织锦展示', '明清建筑群'],
    transport: '忻城县城关镇西宁街，县城内步行或打车可达。',
    tips: '上午去，光从天井打下来最好看；升堂表演有固定场次，进门先问时间。'
  },
  {
    id: 'zhuangjin', name: '忻城壮锦传承基地', county: 'xincheng', themes: ['renwen', 'yao'],
    scene: 'weave', seed: 43, price: 0, ticket: '体验价另计', duration: '1–2 小时', hours: 1.5,
    best: '全年', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rating: 4.2,
    tags: ['木织机', '壮锦纹样', '手作体验'],
    oneLiner: '一台木织机，织出"穿在身上的史诗"。',
    desc: '忻城壮族织锦技艺是自治区级非遗，红、黄、蓝为主色，几何纹里夹着花鸟。老街上机杼声不断，可以上手试织一小段，比在博物馆隔着玻璃看有意思得多。',
    highlights: ['传统木织机', '壮锦纹样解读', '亲手织一段'],
    transport: '忻城县东门老街"大夫第"。',
    tips: '小件壮锦杯垫、书签比大件好带，也更适合送人。'
  },
  {
    id: 'pangu', name: '盘古庙', county: 'xingbin', themes: ['renwen', 'qinzi'],
    scene: 'waterfront', seed: 61, price: 0, ticket: '免费', duration: '1 小时', hours: 1,
    best: '农历六月十八盘古诞辰', months: [7, 8], rating: 4.0,
    tags: ['盘古信仰', '庙会', '古钟'],
    oneLiner: '来宾被称作"盘古文化之都"，庙在这里，钟也在这里。',
    desc: '来宾民间保存着成体系的盘古文化遗存：盘古庙、盘古钟，以及一年一度的祭祀。每年农历六月十八盘古诞辰，周边村屯会抬着盘古像游村、敲钟祈福。这里不是景区式的布景，而是仍在使用的信仰空间。',
    highlights: ['盘古庙山门与正殿', '古钟', '农历六月十八庙会'],
    transport: '位于兴宾区，建议自驾前往，导航"盘古庙"，具体位置以当地指引为准。',
    tips: '庙会是民俗场合，拍照前先问一声；不踩门槛，不喧哗。'
  },
  {
    id: 'mine', name: '合山国家矿山公园', county: 'heshan', themes: ['qinzi', 'renwen'],
    scene: 'mine', seed: 67, price: 60, ticket: '约 60 元（体验另计）', duration: '半天', hours: 3.5,
    best: '全年，雨天也能玩', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rating: 4.3,
    tags: ['井下体验', '蒸汽机车', '研学'],
    oneLiner: '广西煤都的工业记忆，能真的下井。',
    desc: '依托合山矿务局东矿建成，选煤楼、蒸汽机车头、矿山设备都原地保留，还有博物馆和井下采煤体验区。2021 年评上 4A，同年成为自治区级中小学生研学实践教育基地。孩子对"矿工一天怎么过"的理解，在这里比课本快。',
    highlights: ['井下采煤体验区', '蒸汽机车与选煤楼遗址', '矿山博物馆', '卡丁车、七彩滑道'],
    transport: '合山市东矿，来宾市区自驾约 1 小时。',
    tips: '井下温度低，加件外套；部分体验项目周一检修。'
  },
  {
    id: 'guxiang', name: '古象温泉', county: 'xiangzhou', themes: ['kangyang'],
    scene: 'spring', seed: 79, price: 128, ticket: '约 128 元', duration: '半天至一天', hours: 4,
    best: '11–3 月', months: [11, 12, 1, 2, 3], rating: 4.4,
    tags: ['86℃ 高热泉', '露天泡池', '私汤'],
    oneLiner: '泉口最高 86℃，"中南第一泉"。',
    desc: '国家 4A 古象旅游区的核心。泉水来自地下几百米的热岩，属高热矿泉水，清澈无色无味，含偏硅酸等矿物质。三十多个露天泡池散在园林里，也有独栋小院私汤。',
    highlights: ['泉口最高 86℃', '三十多个露天泡池', '园林式环境', '独栋私汤小院'],
    transport: '象州县城约 10 公里，自驾 20 分钟。',
    tips: '一次别泡超过 15 分钟，中间起来喝水；空腹和酒后不要下水。'
  },
  {
    id: 'menghuan', name: '象州梦幻夜', county: 'xiangzhou', themes: ['yeshe'],
    scene: 'night', seed: 83, price: 0, ticket: '免费入场', duration: '2–3 小时', hours: 2.5,
    best: '全年，19:00 之后', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rating: 4.2,
    tags: ['国潮灯架', '街头演艺', '小吃'],
    oneLiner: '七百米长街，十三处戏台，一步一景。',
    desc: '国风科技文旅街区，全长 700 米，13 处主题演艺舞台、60 个国潮灯架、24 处美陈、120 间商铺。灯一亮，整条街换了个城市。',
    highlights: ['700 米国潮长街', '13 处演艺舞台', '各地小吃与游乐场'],
    transport: '象州县城内，步行或打车可达。',
    tips: '周末人挤，工作日去更从容；演出时间表在街口牌子上。'
  },
  {
    id: 'nalu', name: '纳禄村', county: 'xiangzhou', themes: ['qinzi', 'renwen'],
    scene: 'field', seed: 97, price: 0, ticket: '免费', duration: '半天', hours: 3,
    best: '6–7 月荷花 · 9–10 月稻黄', months: [6, 7, 9, 10], rating: 3.9,
    tags: ['明清民居', '田园', '采摘'],
    oneLiner: '明清老宅排成排，夏天荷花，秋天稻子。',
    desc: '罗秀镇的传统村落，古建筑保存较好，门口就是成片田园。带孩子骑车、看稻子、摘果子，是半天起步的节奏。',
    highlights: ['明清民居群', '田园骑行', '季节性采摘'],
    transport: '象州县罗秀镇。',
    tips: '村里吃饭要提前订，临时去常常没菜。'
  },
  {
    id: 'wuma', name: '五马拦江', county: 'wuxuan', themes: ['shan', 'qinzi'],
    scene: 'river', seed: 101, price: 0, ticket: '免费', duration: '半天', hours: 3,
    best: '10–4 月', months: [1, 2, 3, 4, 10, 11, 12], rating: 4.0,
    tags: ['五马山形', '永通峡石刻', '七星风雨桥'],
    oneLiner: '五座山像五匹马，拦在江面上。',
    desc: '黔江边的一段山水，因五座山峦形似骏马拦江而得名。沿线串起明代"敕赐永通峡"石刻、七星风雨桥、大藤峡阳明文化公园和汽车营地，可以自驾、骑行或徒步。',
    highlights: ['五马山形', '明代"敕赐永通峡"石刻', '七星风雨桥', '沿江骑行'],
    transport: '武宣县城往东，沿江公路。',
    tips: '骑行注意大车，靠边慢行；日落时江面颜色最好。'
  },
  {
    id: 'xialiantang', name: '下莲塘村', county: 'wuxuan', themes: ['renwen', 'qinzi'],
    scene: 'field', seed: 103, price: 0, ticket: '免费', duration: '半天', hours: 3,
    best: '2–3 月油菜花', months: [2, 3, 4], rating: 4.1,
    tags: ['将军第', '刘炳宇庄园', '油菜花'],
    oneLiner: '将军第、刘炳宇庄园，还有一片油菜花。',
    desc: '东乡镇的老村子，保存有清代将军第和民国刘炳宇庄园，两种时代的建筑挨在一起。春天油菜花开成片，是武宣最上镜的半个月。',
    highlights: ['清代将军第', '民国刘炳宇庄园', '油菜花海'],
    transport: '武宣县东乡镇，县城自驾约 30 分钟。',
    tips: '庄园内部开放时间不固定，到村口先问一声。'
  },
];

const FOODS = [
  {
    id: 'dawan', name: '大湾米粉', county: 'xingbin', scene: 'bowl', seed: 2,
    kind: '早餐 · 非遗技艺', price: '8–15 元',
    oneLiner: '细如发丝，久煮不烂，红烧猪脚是招牌。',
    desc: '用红水河畔的小粒油粘米，浸泡、磨浆、蒸制、晾晒，全靠手工。柔韧滑爽，煮、炒、凉拌都行。来宾人的一天，多半从这碗粉开始。',
    where: '兴宾区大湾镇老店、市区老街粉店'
  },
  {
    id: 'qianjiang', name: '迁江扣肉', county: 'xingbin', scene: 'bowl', seed: 4,
    kind: '宴席 · 硬菜', price: '48–68 元/份',
    oneLiner: '芋头垫底，吸满肉汁，比肉还好吃。',
    desc: '土猪五花肉经煮、炸、蒸多道工序，肉皮油亮、肥瘦相间。碗底铺芋头，蒸到最后粉糯香甜。"无扣肉不成席"说的就是它。',
    where: '兴宾区迁江镇、市区宴席馆'
  },
  {
    id: 'hongzao', name: '武宣红糟酸', county: 'wuxuan', scene: 'jar', seed: 6,
    kind: '腌品 · 自治区级非遗', price: '10–25 元/罐',
    oneLiner: '酸里带酒香，武宣"无菜不糟"。',
    desc: '以酿酒红糟发酵，腌姜、刀豆、萝卜、笋，甚至猪大肠。酸、甜、辣、香、脆五味齐上，直接当小菜，或炒肉、焖鱼都成立。制作技艺是自治区级非遗。',
    where: '武宣县城红糟作坊、菜市场'
  },
  {
    id: 'yuyuan', name: '三里鱼圆', county: 'wuxuan', scene: 'bowl', seed: 8,
    kind: '小吃 · 手工', price: '15–25 元/碗',
    oneLiner: '手打出来的弹，机器学不会。',
    desc: '鲜鱼去刺打成茸，反复摔打上劲，挤成丸子下锅。汤清、丸弹，咬开有鱼的本味。制作技艺列入市级非遗。',
    where: '武宣县三里镇'
  },
  {
    id: 'youcha', name: '瑶族油茶', county: 'jinxiu', scene: 'tea', seed: 10,
    kind: '待客 · 非遗', price: '10–20 元/位',
    oneLiner: '初尝微苦，细品回甘，配米花和油果。',
    desc: '茶叶、生姜、蒜、芝麻入锅捶打熬煮，滤出浓汤，泡上米花、油果、花生、葱花。咸香暖胃，是瑶寨的早餐标配，也是待客第一件事。',
    where: '金秀各瑶寨、县城油茶店'
  },
  {
    id: 'zhazha', name: '瑶家鲊肉', county: 'jinxiu', scene: 'jar', seed: 12,
    kind: '待客 · 非遗技艺', price: '按份计',
    oneLiner: '"瑶不离鲊"，一坛要等六个月。',
    desc: '炒焦的大米粉裹住猪肉，装坛腌制，六个月后开坛，油亮鲜香。瑶族人待客的尊贵礼数，就藏在这口坛子里。',
    where: '金秀瑶寨、县城瑶家菜馆'
  },
  {
    id: 'zhutongji', name: '瑶族竹筒鸡', county: 'jinxiu', scene: 'bowl', seed: 14,
    kind: '瑶寨招牌', price: '68–98 元/份',
    oneLiner: '竹香渗进肉里，鸡肉自带清甜。',
    desc: '本地土鸡切块塞进竹筒，炭火慢烤。竹膜锁住汁水，鸡肉嫩而不柴，端上桌时还有一股青竹味。',
    where: '金秀瑶寨农家乐'
  },
  {
    id: 'nuoyumi', name: '忻城糯玉米', county: 'xincheng', scene: 'bowl', seed: 16,
    kind: '主食 · 国家地理标志', price: '5–10 元',
    oneLiner: '颗粒饱满，软糯到有点粘牙。',
    desc: '忻城糯玉米是国家地理标志产品，煮着吃、磨粉做粥都行。本地人早餐常来一碗糯玉米粥，配点小菜就是一餐。',
    where: '忻城县城早餐店、农贸市场'
  },
  {
    id: 'rouzong', name: '忻城肉粽', county: 'xincheng', scene: 'bowl', seed: 18,
    kind: '节庆 · 地标美食', price: '8–15 元/个',
    oneLiner: '大糯米包五花肉、板栗、绿豆，一个管饱。',
    desc: '竹叶捆成枕形，文火慢蒸。外层糯米吸饱肉汁呈琥珀色，切开层次分明。切片煎一下更香。',
    where: '忻城县城老街'
  },
  {
    id: 'yumeng', name: '合山芋檬鸭脚', county: 'heshan', scene: 'bowl', seed: 20,
    kind: '夜市 · 爆款', price: '35–55 元/份',
    oneLiner: '鸭脚软糯，芋檬酸爽，追剧下酒神器。',
    desc: '腌过的芋头梗配炸定型的鸭脚，加姜蒜香料慢焖。鸭脚胶质饱满，芋檬解腻开胃，是合山夜宵摊的常驻选手。',
    where: '合山市夜市、来宾市区夜宵店'
  },
  {
    id: 'wuse', name: '五色糯米饭', county: 'xincheng', scene: 'bowl', seed: 22,
    kind: '节庆 · 壮族', price: '10–18 元',
    oneLiner: '枫叶染黑，红蓝草染紫，黄栀子染黄。',
    desc: '四种植物染出五种颜色，蒸出来色彩斑斓，寓意五谷丰登。"三月三"前后在忻城、金秀最容易吃到。',
    where: '忻城、金秀节庆市集'
  },
  {
    id: 'juantong', name: '华侨卷筒粉', county: 'xingbin', scene: 'bowl', seed: 24,
    kind: '街头 · 跨界', price: '3–5 元/条',
    oneLiner: '越南华侨的手艺，薄皮裹肉末木耳。',
    desc: '米浆摊成薄皮，裹猪肉末、木耳、香菇，淋酸甜酱汁。清爽、便宜，是来宾街头最日常的一条。',
    where: '兴宾区老街早餐摊'
  }
];

const MONTHS = [
  { m: 1,  title: '泡汤与年集', text: '古象温泉进入最好的季节，泉口 86℃。年前的老街开始卖米饼、红糟和腊味。', picks: ['guxiang', 'menghuan', 'nalu'] },
  { m: 2,  title: '油菜花开', text: '武宣下莲塘的油菜花开了，将军第的老墙配黄花。金秀桐木镇元宵有迓圣节。', picks: ['xialiantang', 'guxiang', 'nalu'] },
  { m: 3,  title: '春山上路', text: '雨开始多，山开始绿。百崖大峡谷的雾最好看，人还不多，水也还清。', picks: ['baitai', 'guzhan', 'nalu'] },
  { m: 4,  title: '杜鹃初上', text: '圣堂山低海拔的杜鹃先开，三月三歌圩在忻城、武宣一带最热闹。', picks: ['shengtang', 'motusi', 'zhuangjin'] },
  { m: 5,  title: '万亩花海', text: '圣堂山杜鹃开到最盛，云海也还有。百崖大峡谷开始适合溯溪。', picks: ['shengtang', 'baitai', 'wuma'] },
  { m: 6,  title: '进谷避暑', text: '城里热起来，峡谷里还是凉的。纳禄村的荷花开，适合带孩子下田。', picks: ['baitai', 'nalu', 'wuma'] },
  { m: 7,  title: '山里过夏', text: '金秀年均 17℃，森林覆盖率 87% 以上，是天然的避暑地。', picks: ['panwangjie', 'shengtang', 'guzhan'] },
  { m: 8,  title: '水边消暑', text: '五马拦江沿江骑行、古占瑶寨里喝油茶，都是不费体力的凉快。', picks: ['wuma', 'guzhan', 'nalu'] },
  { m: 9,  title: '稻子黄了', text: '象州、武宣的稻田开始转色，村子的照片这个月最好看。', picks: ['nalu', 'xialiantang', 'wuma'] },
  { m: 10, title: '云海回归', text: '秋高气爽，圣堂山的云海概率回升，百崖的水量还没退，徒步最舒服。', picks: ['shengtang', 'baitai', 'motusi'] },
  { m: 11, title: '盘王节', text: '农历十月十六，金秀过盘王节：黄泥鼓舞、瑶王宴、长桌宴，一年里最值得赶的一次。', picks: ['guzhan', 'zhuangjin', 'motusi'] },
  { m: 12, title: '温泉与瑶浴', text: '天冷，泡温泉、泡瑶浴。象州古象温泉和瑶寨药浴都到了最舒服的时候。', picks: ['guxiang', 'menghuan', 'guzhan'] }
];

const TRIP_TIPS = [
  {
    k: '怎么到',
    v: '高铁到「来宾北站」，南宁约 1 小时、柳州约 20 分钟；远途可飞柳州白莲机场再转高铁。',
    note: '县域景点分散，落地后建议自驾或包车。'
  },
  {
    k: '怎么走',
    v: '一条顺路的环线：兴宾 → 合山 → 忻城 → 象州 → 武宣 → 金秀。',
    note: '反向也成立；金秀盘山路多，放在行程后段更稳。'
  },
  {
    k: '住哪儿',
    v: '市区住兴宾（百元级快捷酒店多，出门就是夜市）；金秀住县城或山脚民宿；象州住温泉度假村。',
    note: '想第二天一早登圣堂山，前一晚住山脚最省力。'
  },
  {
    k: '花多少',
    v: '人均每天 300–450 元可以走得比较舒服：住宿 150–250，吃饭 80–120，门票按行程另计。',
    note: '多数山水景点门票在 40–65 元区间。'
  },
  {
    k: '注意什么',
    v: '山路多弯，易晕车者备药；峡谷水边石面滑；瑶寨拍照先打招呼；进寨不踩门槛。',
    note: '农历十月十六盘王节期间住宿紧张，需提前订。'
  }
];

const STATS = [
  { num: '1979', unit: 'm', label: '圣堂山，桂中第一高峰' },
  { num: '87', unit: '%', label: '金秀森林覆盖率' },
  { num: '5', unit: '个', label: '瑶族支系同居一县' },
  { num: '3', unit: '万年', label: '麒麟山人的时间深度' }
];


/* ============================================================
   实拍照片、开放时间与票价
   票价于 2026-10-18 核对：景区公示价与线上渠道价常不一致，
   这里给出区间，并在明细里写明来源差异。
   photo 为空表示暂未取得可用的实拍图，页面不会用示意图冒充。
   ============================================================ */
const SRC_GOV = '来宾市人民政府门户网站';
const SRC_WL = '来宾市文化广电和旅游局';

const DETAILS = {
  shengtang: {
    photo: 'assets/img/shengtang.jpg', credit: '金秀县人民政府门户网站《图说金秀》',
    hours: '08:00–18:00（15:00 停止入园）', price: 65, priceLine: '¥65',
    priceNote: '摆渡车往返 ¥40 · 线上约 ¥58 起'
  },
  baitai: {
    photo: 'assets/img/baitai.jpg', credit: '来宾市文化广电和旅游局，2026 国庆',
    hours: '08:00–17:00', price: 40, priceLine: '¥40–60',
    priceNote: '线上 ¥40，现场 ¥60'
  },
  motusi: {
    photo: 'assets/img/motusi.jpg', credit: '来宾市人民政府门户网站《土司文化之乡》',
    gallery: ['assets/img/motusi.jpg', 'assets/img/motusi-2.jpg'],
    hours: '08:30–17:30', price: 40, priceLine: '¥40–50',
    priceNote: '线上约 ¥40，现场 ¥50'
  },
  zhuangjin: {
    photo: 'assets/img/zhuangjin.jpg', credit: '来宾市文化广电和旅游局，2026 忻城壮锦文化周',
    hours: '09:00–17:00', price: 0, priceLine: '体验另计', priceNote: '手作 30–80 元'
  },
  panwangjie: {
    photo: 'assets/img/panwangjie.jpg', credit: '来宾市文化广电和旅游局，2026 国庆',
    hours: '08:30–17:30', price: 80, priceLine: '¥80',
    priceNote: '观光车 ¥15，索道含在门票内'
  },
  menghuan: {
    photo: 'assets/img/night.jpg', credit: '来宾市文化广电和旅游局，2026 国庆',
    hours: '18:00–23:00', price: 0, priceLine: '免费入场', priceNote: ''
  },
  xialiantang: {
    photo: 'assets/img/xialiantang.jpg', credit: '武宣县人民政府门户网站《图说武宣》',
    hours: '全天', price: 0, priceLine: '免费', priceNote: '油菜花 2–3 月'
  },
  wuma: {
    photo: 'assets/img/wuma.jpg', credit: '武宣县人民政府门户网站《图说武宣》',
    hours: '全天', price: 0, priceLine: '免费', priceNote: ''
  },
  mine: {
    photo: 'assets/img/mine.jpg', credit: '来宾市人民政府门户网站《百年煤都》',
    gallery: ['assets/img/mine.jpg', 'assets/img/mine-2.jpg'],
    hours: '09:00–17:00', price: 0, priceLine: '免费入园', priceNote: '蒸汽火车体验约 ¥50'
  },
  guxiang: {
    photo: 'assets/img/guxiang.jpg', credit: '来宾市人民政府门户网站《中国泉都》',
    hours: '10:00–23:00', price: 108, priceLine: '¥98–128', priceNote: '线上 ¥98 起，住店有优惠'
  },
  nalu: {
    photo: 'assets/img/nalu.jpg', credit: '来宾市人民政府门户网站《象州之旅》',
    hours: '全天', price: 0, priceLine: '免费', priceNote: ''
  },
  guzhan: {
    photo: 'assets/img/guzhan.jpg', credit: '来宾市人民政府门户网站《世界瑶都》',
    hours: '全天', price: 0, priceLine: '免费', priceNote: '村寨体验 30–60 元'
  },
  pangu: {
    photo: 'assets/img/pangu.jpg', credit: '来宾市人民政府门户网站《盘古文化之都》',
    hours: '全天', price: 0, priceLine: '免费', priceNote: '香火随缘'
  }
};

SPOTS.forEach(s => {
  const d = DETAILS[s.id] || {};
  s.photo = d.photo || null;
  s.credit = d.credit || '';
  s.gallery = d.gallery || (d.photo ? [d.photo] : []);
  s.hours = d.hours || '—';
  s.priceLine = d.priceLine || '';
  s.priceNote = d.priceNote || '';
  if (typeof d.price === 'number') s.price = d.price;
});

const PHOTO_COUNT = SPOTS.filter(s => s.photo).length;

window.LAIBIN = { THEMES, COUNTIES, SPOTS, FOODS, MONTHS, TRIP_TIPS, STATS, PHOTO_COUNT };
