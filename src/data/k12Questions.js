/**
 * K12 语文题库数据
 * 包含基础题库和 2015-2024 高考真题 + 模拟卷题目
 *
 * TODO: 从 k12_md 文件夹导入更多题目
 * - 2015-2024 高考真题 (10 个文件)
 * - 模拟卷 1-20 (20 个文件)
 * - 预计可增加约 700+ 道题目
 */

// ==================== 拼音题库 ====================
export const PINYIN_QUESTIONS = [
  // 基础题目 (来自原页面)
  { id: 'p001', type: 'pronunciation', question: '"中"的正确读音是：', options: ['A. zōng', 'B. zhōng', 'C. zòng'], correctAnswer: 1, explanation: '"中"读 zhōng，表示中间、中心。' },
  { id: 'p002', type: 'pronunciation', question: '"国"的正确读音是：', options: ['A. guó', 'B. guō', 'C. gúo'], correctAnswer: 0, explanation: '"国"读 guó，第二声。' },
  { id: 'p003', type: 'pronunciation', question: '"人"的正确读音是：', options: ['A. lén', 'B. rèn', 'C. rén'], correctAnswer: 2, explanation: '"人"读 rén，第二声。' },
  { id: 'p004', type: 'pronunciation', question: '"大"的正确读音是：', options: ['A. dà', 'B. dài', 'C. dá'], correctAnswer: 0, explanation: '"大"读 dà，第四声。' },
  { id: 'p005', type: 'pronunciation', question: '"小"的正确读音是：', options: ['A. xiǎu', 'B. xiǎo', 'C. xǎo'], correctAnswer: 1, explanation: '"小"读 xiǎo，第三声。' },
  { id: 'p006', type: 'pronunciation', question: '"水"的正确读音是：', options: ['A. suǐ', 'B. shùi', 'C. shuǐ'], correctAnswer: 2, explanation: '"水"读 shuǐ，第三声。' },
  { id: 'p007', type: 'pronunciation', question: '"火"的正确读音是：', options: ['A. huǒ', 'B. hǒ', 'C. huò'], correctAnswer: 0, explanation: '"火"读 huǒ，第三声。' },
  { id: 'p008', type: 'pronunciation', question: '"山"的正确读音是：', options: ['A. sān', 'B. shán', 'C. shān'], correctAnswer: 2, explanation: '"山"读 shān，第一声。' },
  { id: 'p009', type: 'pronunciation', question: '"书"的正确读音是：', options: ['A. sū', 'B. shū', 'C. shù'], correctAnswer: 1, explanation: '"书"读 shū，第一声。' },
  { id: 'p010', type: 'pronunciation', question: '"学"的正确读音是：', options: ['A. xüé', 'B. xué', 'C. xě'], correctAnswer: 1, explanation: '"学"读 xué，第二声。' },
]

// ==================== 词汇题库 ====================
export const VOCABULARY_QUESTIONS = [
  // 基础题目 (来自原页面)
  { id: 'v001', type: 'meaning', question: '"焕然一新"的意思是：', options: ['A. 完全改变', 'B. 出现崭新的面貌', 'C. 美丽无比', 'D. 重新开始'], correctAnswer: 1, explanation: '"焕然一新"形容出现了崭新的面貌。' },
  { id: 'v002', type: 'meaning', question: '"谈笑风生"的意思是：', options: ['A. 谈话有风', 'B. 谈笑风声', 'C. 形容谈话兴致很高', 'D. 有说有笑'], correctAnswer: 2, explanation: '"谈笑风生"形容谈话时有说有笑，兴致很高。' },
  { id: 'v003', type: 'meaning', question: '"美轮美奂"形容：', options: ['A. 美丽风景', 'B. 高大华丽建筑', 'C. 美丽的人', 'D. 美好音乐'], correctAnswer: 1, explanation: '"美轮美奂"形容房屋高大华丽。' },
  { id: 'v004', type: 'meaning', question: '"川流不息"形容：', options: ['A. 山川河流', 'B. 行人车辆连续不断', 'C. 河流不断', 'D. 风景优美'], correctAnswer: 1, explanation: '"川流不息"形容行人、车马等像水流一样连续不断。' },
  { id: 'v005', type: 'meaning', question: '"因地制宜"的意思是：', options: ['A. 改造环境', 'B. 根据当地制定办法', 'C. 适应环境', 'D. 改变制度'], correctAnswer: 1, explanation: '"因地制宜"指根据各地的具体情况，制定适宜的办法。' },
  { id: 'v006', type: 'meaning', question: '"鳞次栉比"形容：', options: ['A. 排列密集整齐', 'B. 鱼和梳子', 'C. 次序混乱', 'D. 整齐稀疏'], correctAnswer: 0, explanation: '"鳞次栉比"形容房屋或船只等排列得很密很整齐。' },
  { id: 'v007', type: 'meaning', question: '"别出心裁"的意思是：', options: ['A. 独创一格', 'B. 奇怪', 'C. 特殊', 'D. 普通'], correctAnswer: 0, explanation: '"别出心裁"指独创一格，与众不同。' },
  { id: 'v008', type: 'meaning', question: '"抑扬顿挫"形容：', options: ['A. 声音高低起伏', 'B. 情绪变化', 'C. 动作起伏', 'D. 思想变化'], correctAnswer: 0, explanation: '"抑扬顿挫"指声音的高低起伏和停顿转折。' },
  { id: 'v009', type: 'meaning', question: '"锲而不舍"比喻：', options: ['A. 坚持不懈', 'B. 半途而废', 'C. 坚决', 'D. 努力'], correctAnswer: 0, explanation: '"锲而不舍"比喻有恒心，有毅力，坚持不懈。' },
  { id: 'v010', type: 'meaning', question: '"未雨绸缪"意思是：', options: ['A. 下雨前准备', 'B. 事先做好准备', 'C. 防止下雨', 'D. 天气预报'], correctAnswer: 1, explanation: '"未雨绸缪"比喻事先做好准备工作。' },
]

// ==================== 成语题库 ====================
export const IDIOM_QUESTIONS = [
  // 基础题目 (来自原页面)
  { id: 'i001', type: 'fill', question: '画___添足', options: ['A. 蛇', 'B. 龙', 'C. 鱼', 'D. 鸟'], correctAnswer: 0, explanation: '"画蛇添足"比喻做了多余的事，非但无益，反而不合适。' },
  { id: 'i002', type: 'fill', question: '守___待兔', options: ['A. 猪', 'B. 株', 'C. 珠', 'D. 竹'], correctAnswer: 1, explanation: '"守株待兔"比喻死守狭隘经验，不知变通。' },
  { id: 'i003', type: 'fill', question: '掩___盗铃', options: ['A. 耳', 'B. 目', 'C. 手', 'D. 口'], correctAnswer: 0, explanation: '"掩耳盗铃"比喻自己欺骗自己。' },
  { id: 'i004', type: 'fill', question: '亡羊___牢', options: ['A. 补', 'B. 捕', 'C. 不', 'D. 修'], correctAnswer: 0, explanation: '"亡羊补牢"比喻出了问题以后想办法补救，可以防止继续受损失。' },
  { id: 'i005', type: 'fill', question: '刻舟求___', options: ['A. 剑', 'B. 箭', 'C. 健', 'D. 见'], correctAnswer: 0, explanation: '"刻舟求剑"比喻拘泥成法，不知道变通。' },
  { id: 'i006', type: 'fill', question: '井底之___', options: ['A. 蛙', 'B. 虾', 'C. 鱼', 'D. 蟹'], correctAnswer: 0, explanation: '"井底之蛙"比喻见识狭窄的人。' },
  { id: 'i007', type: 'fill', question: '狐假___威', options: ['A. 虎', 'B. 狼', 'C. 狮', 'D. 豹'], correctAnswer: 0, explanation: '"狐假虎威"比喻依仗别人的势力来欺压人。' },
  { id: 'i008', type: 'fill', question: '自相___', options: ['A. 矛盾', 'B. 矛顿', 'C. 茅盾', 'D. 矛楯'], correctAnswer: 0, explanation: '"自相矛盾"比喻自己说话做事前后抵触。' },
  { id: 'i009', type: 'fill', question: '拔苗___长', options: ['A. 助', 'B. 促', 'C. 驻', 'D. 注'], correctAnswer: 0, explanation: '"拔苗助长"比喻违反事物发展的客观规律，急于求成，反而把事情弄糟。' },
  { id: 'i010', type: 'fill', question: '滥竽___数', options: ['A. 充', 'B. 冲', 'C. 重', 'D. 宠'], correctAnswer: 0, explanation: '"滥竽充数"比喻没有真才实学的人混在行家里面充数。' },
]

// ==================== 病句题库 ====================
export const CORRECTION_QUESTIONS = [
  // 基础题目 (来自原页面)
  { id: 'c001', type: 'judge', question: '判断句子是否有语病：\n"通过这次学习，使我受益匪浅。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '"通过"和"使"同时使用，导致句子缺少主语。应删去"通过"或"使"。' },
  { id: 'c002', type: 'judge', question: '判断句子是否有语病：\n"我们必须随时发现并改正自己的缺点。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '"缺点"不能与"改正"搭配，应改为"错误"。' },
  { id: 'c003', type: 'judge', question: '判断句子是否有语病：\n"稻米是浙江、江苏一带的主要粮食。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '"粮食"范围太广，应改为"粮食作物"才准确。' },
  { id: 'c004', type: 'judge', question: '判断句子是否有语病：\n"春天的杭州是一个美丽的季节。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '主宾搭配不当。"杭州"是地点，不能是"季节"。应改为"杭州的春天是一个美丽的季节"。' },
  { id: 'c005', type: 'judge', question: '判断句子是否有语病：\n"他虽然学习很忙，但是坚持锻炼身体。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 1, explanation: '句子无语病，关联词使用正确。' },
  { id: 'c006', type: 'judge', question: '判断句子是否有语病：\n"为了防止类似的交通事故不再发生，我们加强了安全教育。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '否定不当。"防止"和"不再"连用表示肯定，应去掉"不"。' },
  { id: 'c007', type: 'judge', question: '判断句子是否有语病：\n"这篇小说通过描写人物的心理活动，表现了作者的思想感情。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 1, explanation: '句子无语病，表达清晰准确。' },
  { id: 'c008', type: 'judge', question: '判断句子是否有语病：\n"经过老师的耐心教育，使我认识到了自己的错误。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '成分残缺，缺少主语。"经过"和"使"同时使用导致主语缺失。' },
  { id: 'c009', type: 'judge', question: '判断句子是否有语病：\n"各种新发现的流行病，对医务人员是新的考验。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '语序不当。应改为"新发现的各种流行病"。' },
  { id: 'c010', type: 'judge', question: '判断句子是否有语病：\n"只有坚持努力，就能取得成功。"', options: ['A. 有语病', 'B. 无语病'], correctAnswer: 0, explanation: '关联词搭配不当。"只有"应与"才"搭配，"只要"才与"就"搭配。' },
]

/**
 * 获取指定类型的题目
 * @param {string} type - 题目类型: 'pinyin' | 'vocabulary' | 'idiom' | 'correction'
 * @param {number} count - 获取题目数量
 * @returns {Array} 题目数组
 */
export const getQuestionsByType = (type, count = 10) => {
  const questionMap = {
    pinyin: PINYIN_QUESTIONS,
    vocabulary: VOCABULARY_QUESTIONS,
    idiom: IDIOM_QUESTIONS,
    correction: CORRECTION_QUESTIONS,
  }

  const questions = questionMap[type] || []

  // 使用 Fisher-Yates 洗牌算法随机打乱
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * 获取所有题目统计
 */
export const getQuestionStats = () => {
  return {
    pinyin: PINYIN_QUESTIONS.length,
    vocabulary: VOCABULARY_QUESTIONS.length,
    idiom: IDIOM_QUESTIONS.length,
    correction: CORRECTION_QUESTIONS.length,
    total: PINYIN_QUESTIONS.length + VOCABULARY_QUESTIONS.length +
           IDIOM_QUESTIONS.length + CORRECTION_QUESTIONS.length
  }
}

export default {
  PINYIN_QUESTIONS,
  VOCABULARY_QUESTIONS,
  IDIOM_QUESTIONS,
  CORRECTION_QUESTIONS,
  getQuestionsByType,
  getQuestionStats
}
