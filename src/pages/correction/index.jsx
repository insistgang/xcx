/**
 * 病句修改页面 - 选择题模式
 * 使用 usePractice Hook 重构，代码量大幅减少
 */
import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { usePractice } from '../../hooks/usePractice'
import eventBus, { EVENTS } from '../../utils/eventBus'
import { pageShareConfigs } from '../../utils/share'
import './index.less'

// 病句修改选择题库（100题精选）
const CORRECTION_QUESTIONS = [
  // 判断是否有语病
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
  // 选择正确修改
  { id: 'c011', type: 'correct', question: '"这个问题经过大家讨论，已经有了明确的认识。"应修改为：', options: ['A. 这个问题经过大家讨论，已经有了明确的认识', 'B. 经过大家对这个问题的讨论，已经有了明确的认识', 'C. 大家对这个问题的讨论，已经有了明确的认识'], correctAnswer: 1, explanation: '原句缺少主语，应在"经过"前加上主语，或调整语序。' },
  { id: 'c012', type: 'correct', question: '"能否保持艰苦朴素的作风，是接班人的重要条件。"应修改为：', options: ['A. 能否保持艰苦朴素的作风，是成为接班人的重要条件', 'B. 保持艰苦朴素的作风，是接班人的重要条件', 'C. 能否保持艰苦朴素的作风，能否成为接班人的重要条件'], correctAnswer: 1, explanation: '"能否"表示两面，后面也应对应两面，或删去"能否"保持一面。' },
  { id: 'c013', type: 'correct', question: '"我们要不断改进学习方法，增加学习效率。"应修改为：', options: ['A. 我们要不断改进学习方法，提高学习效率', 'B. 我们要不断改善学习方法，增加学习效率', 'C. 我们要不断改进学习方法，加强学习效率'], correctAnswer: 0, explanation: '"效率"应与"提高"搭配，不是"增加"。' },
  { id: 'c014', type: 'correct', question: '"他的作文不但在全校获奖，而且在全国获奖。"应修改为：', options: ['A. 他的作文不但在全国获奖，而且在全校获奖', 'B. 他的作文不但全校获奖，而且全国获奖', 'C. 他的作文不仅在全校获奖，而且在全国获奖'], correctAnswer: 2, explanation: '递进关系语序不当，应从小范围到大范围，"不但...而且..."改为"不仅...而且..."更规范。' },
  { id: 'c015', type: 'correct', question: '"市场上到处都是各种水果，有西瓜、苹果、梨等。"应修改为：', options: ['A. 市场上到处都是水果，有西瓜、苹果、梨等各种', 'B. 市场上有各种水果，到处都是西瓜、苹果、梨等', 'C. 市场上到处都是各种水果，例如西瓜、苹果、梨等'], correctAnswer: 0, explanation: '"到处"与"各种"语序不当，且"等"表示列举未完，应放在"各种"前面。' },
  { id: 'c016', type: 'correct', question: '"这是有趣的一本课外书。"应修改为：', options: ['A. 这是有趣的课外书一本', 'B. 这是一本有趣的课外书', 'C. 一本有趣的课外书这是'], correctAnswer: 1, explanation: '数量短语位置不当，"一本"应放在"有趣"前面。' },
  { id: 'c017', type: 'correct', question: '"博物馆展出了几千年以前刚出土的文物。"应修改为：', options: ['A. 博物馆展出了刚出土的几千年以前的文物', 'B. 博物馆展出了几千年以前的文物刚出土的', 'C. 刚出土的几千年以前的文物在博物馆展出'], correctAnswer: 0, explanation: '"刚出土"应修饰"文物"，而不是"几千年以前"。' },
  { id: 'c018', type: 'correct', question: '"他把作文做了认真修改。"应修改为：', options: ['A. 他把作文认真做了修改', 'B. 他认真地把作文做了修改', 'C. 他把作文认真修改了一遍'], correctAnswer: 2, explanation: '"做了"是多余成分，应删去，使句子更简洁。' },
  { id: 'c019', type: 'correct', question: '"我们班同学基本上都参加了这次活动。"应修改为：', options: ['A. 我们班同学基本上参加了这次活动', 'B. 我们班基本上同学都参加了这次活动', 'C. 我们班同学都基本上参加了这次活动'], correctAnswer: 0, explanation: '"基本上"和"都"矛盾，应删去其中一个。' },
  { id: 'c020', type: 'correct', question: '"这位老科学家的家里，有很多藏书。"应修改为：', options: ['A. 这位老科学家的家里，有大量的藏书', 'B. 这位老科学家有很多藏书', 'C. 这位老科学家的藏书很多'], correctAnswer: 2, explanation: '原句主谓搭配不当，"藏书"属于"老科学家"而非"家里"。' },
  { id: 'c021', type: 'correct', question: '"经过努力，我的学习成绩有了很大的增加。"应修改为：', options: ['A. 经过努力，我的学习成绩有了很大的提高', 'B. 经过努力，我的学习成绩有了很大的增加', 'C. 经过努力，我的学习成绩增加了很多'], correctAnswer: 0, explanation: '"学习成绩"应与"提高"搭配，而不是"增加"。' },
  { id: 'c022', type: 'correct', question: '"我们要发扬和继承中华民族的优良传统。"应修改为：', options: ['A. 我们要继承和发扬中华民族的优良传统', 'B. 我们要发扬中华民族的优良传统', 'C. 我们要继承中华民族的优良传统'], correctAnswer: 0, explanation: '逻辑顺序不当，应先"继承"再"发扬"。' },
  { id: 'c023', type: 'correct', question: '"即使天气很冷，但是我们坚持锻炼。"应修改为：', options: ['A. 虽然天气很冷，但是我们坚持锻炼', 'B. 即使天气很冷，但是我们坚持锻炼', 'C. 即使天气很冷，我们也坚持锻炼'], correctAnswer: 0, explanation: '关联词搭配不当，"虽然...但是..."表示转折，"即使...也..."表示假设让步。' },
  { id: 'c024', type: 'correct', question: '"有没有远大的理想，是一个人能否成功的关键。"应修改为：', options: ['A. 有没有远大的理想，是一个人成功的关键', 'B. 有远大的理想，是一个人能否成功的关键', 'C. 有远大的理想，是一个人成功的关键'], correctAnswer: 2, explanation: '两面与一面不对应，应保持一致，都用肯定或都用否定。' },
  { id: 'c025', type: 'correct', question: '"在老师的帮助下，使我改正了错误。"应修改为：', options: ['A. 在老师的帮助下，我改正了错误', 'B. 在老师的帮助下，使我改正了错误', 'C. 在老师的帮助下，我错误得到了改正'], correctAnswer: 0, explanation: '成分残缺，"在...下"和"使"连用导致缺主语，删去"使"。' },
  { id: 'c026', type: 'correct', question: '"同学们都非常敬佩这位八十岁的健康的老人。"应修改为：', options: ['A. 同学们都非常敬佩这位八十岁的健康老人', 'B. 同学们都非常敬佩这位健康的八十岁老人', 'C. 同学们都非常敬佩这位健康老人，他已经八十岁了'], correctAnswer: 0, explanation: '多重定语语序，年龄在前，特征在后，原句语序正确。' },
  { id: 'c027', type: 'correct', question: '"我们要响应毛主席提出的"向雷锋同志学习"的口号。"应修改为：', options: ['A. 我们要响应毛主席提出的"向雷锋同志学习"', 'B. 我们要响应毛主席提出的"向雷锋同志学习"的号召', 'C. 我们要响应"向雷锋同志学习"的口号'], correctAnswer: 1, explanation: '"响应"应与"号召"搭配，而不是"口号"。' },
  { id: 'c028', type: 'correct', question: '"墨黑的乌云和瓢泼的大雨从天上倾泻下来。"应修改为：', options: ['A. 墨黑的乌云和瓢泼的大雨从天上下下来', 'B. 墨黑的乌云密布，瓢泼的大雨从天上倾泻下来', 'C. 瓢泼的大雨从天上倾泻下来'], correctAnswer: 1, explanation: '主谓搭配不当，"乌云"不能"倾泻下来"。' },
  { id: 'c029', type: 'correct', question: '"这是一幅美丽的风景画，我非常喜欢看。"应修改为：', options: ['A. 这是一幅美丽的风景画，我非常喜欢', 'B. 这是一幅美丽的风景画，我非常喜欢欣赏', 'C. 美丽的风景画是一幅，我非常喜欢看'], correctAnswer: 0, explanation: '"喜欢"已经包含"看"的意思，"看"字多余。' },
  { id: 'c030', type: 'correct', question: '"我们班的人数比他们班多。"应修改为：', options: ['A. 我们班的人数比他们班的人数多', 'B. 我们班的人数比他们班多得多', 'C. 我们班比他们班的人数多'], correctAnswer: 0, explanation: '主宾搭配不当，"人数"应与"人数"比较。' },
  // 成分残缺类型
  { id: 'c041', type: 'correct', question: '"通过这次班会，使我明白了团结的重要性。"应修改为：', options: ['A. 通过这次班会，我明白了团结的重要性', 'B. 这次班会，使我明白了团结的重要性', 'C. 通过班会，使我明白了团结的重要性'], correctAnswer: 0, explanation: '删除"使"或"通过"，使主语明确。' },
  { id: 'c042', type: 'correct', question: '"在老师的帮助下，使我改正了错误。"应修改为：', options: ['A. 在老师的帮助下，我改正了错误', 'B. 在老师的帮助下，使我改正了错误', 'C. 老师帮助下，使我改正了错误'], correctAnswer: 0, explanation: '删除"使"，让"我"作主语。' },
  { id: 'c043', type: 'correct', question: '"听了这个故事，受到了深刻的教育。"应修改为：', options: ['A. 听了这个故事，我受到了深刻的教育', 'B. 听了这个故事，受到了深刻的教育', 'C. 听了故事，受到了深刻教育'], correctAnswer: 0, explanation: '缺少主语，应加上主语"我"。' },
  { id: 'c044', type: 'correct', question: '"经过努力，我的学习态度有了明显的提高。"应修改为：', options: ['A. 经过努力，我的学习态度有了明显的改进', 'B. 经过努力，我的学习态度有了明显的提高', 'C. 努力后，学习态度提高了'], correctAnswer: 0, explanation: '"态度"不能"提高"，应改为"改进"。' },
  { id: 'c045', type: 'correct', question: '"我们要培养和树立良好的道德品质。"应修改为：', options: ['A. 我们要树立和培养良好的道德品质', 'B. 我们要培养良好的道德品质', 'C. 我们要树立良好的道德品质'], correctAnswer: 0, explanation: '逻辑顺序不当，先"树立"后"培养"。' },
  // 搭配不当类型
  { id: 'c046', type: 'correct', question: '"我们要改进学习方法，增加学习效率。"应修改为：', options: ['A. 我们要改进学习方法，提高学习效率', 'B. 我们要改善学习方法，增加学习效率', 'C. 我们要改进学习方法，提高学习效果'], correctAnswer: 0, explanation: '"效率"应与"提高"搭配。' },
  { id: 'c047', type: 'correct', question: '"他的歌声清脆悦耳，受到大家的欢迎。"应修改为：', options: ['A. 他的歌声清脆悦耳，受到大家的喜爱', 'B. 他的歌声清脆悦耳，受到大家的欢迎', 'C. 他歌声清脆，受欢迎'], correctAnswer: 0, explanation: '"歌声"通常与"喜爱"搭配，"欢迎"多用于人或行为。' },
  { id: 'c048', type: 'correct', question: '"我们班同学基本上都参加了活动。"应修改为：', options: ['A. 我们班同学基本上参加了活动', 'B. 我们班同学都参加了活动', 'C. 我们班基本上同学都参加了活动'], correctAnswer: 1, explanation: '"基本上"和"都"矛盾，删除其中一个。' },
  { id: 'c049', type: 'correct', question: '"我们要发扬和继承优良传统。"应修改为：', options: ['A. 我们要继承和发扬优良传统', 'B. 我们要发扬优良传统', 'C. 我们要继承优良传统'], correctAnswer: 0, explanation: '逻辑顺序：先"继承"再"发扬"。' },
  { id: 'c050', type: 'correct', question: '"我的生活水平和过去相比有了很大改善。"应修改为：', options: ['A. 我的生活水平和过去相比有了很大提高', 'B. 我的条件和过去相比有了很大改善', 'C. 我的生活和过去相比有了很大改善'], correctAnswer: 0, explanation: '"生活水平"应与"提高"搭配。' },
  // 语序不当类型
  { id: 'c051', type: 'correct', question: '"博物馆展出了几千年前刚出土的文物。"应修改为：', options: ['A. 博物馆展出了刚出土的几千年前的文物', 'B. 博物馆展出了几千年前的文物刚出土的', 'C. 刚出土的几千年前的文物在博物馆展出'], correctAnswer: 0, explanation: '"刚出土"应修饰"文物"，而非"几千年前"。' },
  { id: 'c052', type: 'correct', question: '"这是有趣的一本书。"应修改为：', options: ['A. 这是一本有趣的书', 'B. 这是有趣的书一本', 'C. 一本有趣的书这是'], correctAnswer: 0, explanation: '数量词"一本"应放在形容词"有趣"之前。' },
  { id: 'c053', type: 'correct', question: '"他把作文做了认真修改。"应修改为：', options: ['A. 他把作文认真做了修改', 'B. 他认真地把作文修改了', 'C. 他把作文认真修改了一遍'], correctAnswer: 2, explanation: '"做了"多余，应删去使句子简洁。' },
  { id: 'c054', type: 'correct', question: '"各种新发现的流行病，对医务人员是新的考验。"应修改为：', options: ['A. 新发现的各种流行病，对医务人员是新的考验', 'B. 各种新发现的流行病，是新的考验', 'C. 新发现的流行病，对医务人员是考验'], correctAnswer: 0, explanation: '"各种"应在"新发现"之前。' },
  { id: 'c055', type: 'correct', question: '"市场上到处都是各种水果。"应修改为：', options: ['A. 市场上到处都是水果，有各种各样的', 'B. 市场上有各种水果，到处都是', 'C. 到处市场上都是各种水果'], correctAnswer: 0, explanation: '"到处"与"各种"语序不当，应调整。' },
  // 关联词使用不当
  { id: 'c056', type: 'correct', question: '"只有坚持努力，就能取得成功。"应修改为：', options: ['A. 只有坚持努力，才能取得成功', 'B. 只要坚持努力，就能取得成功', 'C. 只有坚持努力，就取得成功'], correctAnswer: 1, explanation: '"只要...就..."或"只有...才..."是正确搭配。' },
  { id: 'c057', type: 'correct', question: '"即使天气很冷，但是我们坚持锻炼。"应修改为：', options: ['A. 虽然天气很冷，但是我们坚持锻炼', 'B. 即使天气很冷，我们也坚持锻炼', 'C. 即使天气很冷，但是我们坚持锻炼'], correctAnswer: 0, explanation: '"虽然...但是..."表示转折，"即使...也..."表示假设让步。' },
  { id: 'c058', type: 'correct', question: '"不管困难很大，我们都要完成任务。"应修改为：', options: ['A. 虽然困难很大，我们都要完成任务', 'B. 尽管困难很大，我们都要完成任务', 'C. 不管困难多大，我们都要完成任务'], correctAnswer: 2, explanation: '"不管...都..."中疑问词要对应，或改用"尽管...都..."。' },
  { id: 'c059', type: 'correct', question: '"与其去电影院，不如在家看电影。"应修改为：', options: ['A. 与其去电影院，不如在家看电影', 'B. 宁愿去电影院，不如在家看电影', 'C. 去电影院，不如在家看电影'], correctAnswer: 0, explanation: '句子本身正确，"与其...不如..."是取舍关系。' },
  { id: 'c060', type: 'correct', question: '"因为天下雨，所以我不去学校了。"应修改为：', options: ['A. 因为天下雨，所以我不去学校了', 'B. 因为天下雨，我不去学校了', 'C. 既然天下雨，所以我不去学校了'], correctAnswer: 0, explanation: '"因为...所以..."搭配正确。' },
  // 两面与一面不对应
  { id: 'c061', type: 'correct', question: '"有没有健康的身体，是能否成功的关键。"应修改为：', options: ['A. 有没有健康的身体，是成功的关键', 'B. 有健康的身体，是能否成功的关键', 'C. 有健康的身体，是成功的关键'], correctAnswer: 2, explanation: '两面与一面应对应一致，或都用一面。' },
  { id: 'c062', type: 'correct', question: '"能否培养创新能力，是事业成功的重要条件。"应修改为：', options: ['A. 培养创新能力，是事业成功的重要条件', 'B. 能否培养创新能力，能否事业成功', 'C. 培养创新能力，是能否成功的重要条件'], correctAnswer: 0, explanation: '"能否"是两面，后面也应两面对应，或删去"能否"用一面。' },
  { id: 'c063', type: 'correct', question: '"努力学习，是学生能否取得好成绩的关键。"应修改为：', options: ['A. 是否努力学习，是学生能否取得好成绩的关键', 'B. 努力学习，是学生取得好成绩的关键', 'C. 努力学习，是能否取得好成绩的关键'], correctAnswer: 1, explanation: '两面与一面不一致，应统一。' },
  { id: 'c064', type: 'correct', question: '"态度决定一切，是能否成功的重要因素。"应修改为：', options: ['A. 态度决定一切，是成功的重要因素', 'B. 态度，是能否成功的重要因素', 'C. 态度决定一切，是能否成功的关键'], correctAnswer: 0, explanation: '统一使用一面表达。' },
  { id: 'c065', type: 'correct', question: '"有没有远大理想，是一个人能否成功的关键。"应修改为：', options: ['A. 有没有远大理想，是一个人成功的关键', 'B. 有远大理想，是一个人能否成功的关键', 'C. 有远大理想，是一个人成功的关键'], correctAnswer: 2, explanation: '两面与一面不对应，应保持一致。' },
  // 否定不当
  { id: 'c066', type: 'correct', question: '"为了防止类似的交通事故不再发生，我们加强了安全教育。"应修改为：', options: ['A. 为了防止类似的交通事故不再发生', 'B. 为了防止类似的交通事故再次发生', 'C. 为了防止类似的交通事故不发生'], correctAnswer: 1, explanation: '"防止"和"不再"连用表示肯定，应改为"再次"。' },
  { id: 'c067', type: 'correct', question: '"我们不得不否认这个事实。"应修改为：', options: ['A. 我们不得不承认这个事实', 'B. 我们不得不否认这个事实', 'C. 我们不得不承认不事实'], correctAnswer: 0, explanation: '双重否定导致意思相反，应改为"承认"。' },
  { id: 'c068', type: 'correct', question: '"难道能否认我不是一个中国人吗？"应修改为：', options: ['A. 难道能否认我是一个中国人吗', 'B. 难道能否认我不是中国人吗', 'C. 难道能否认我是一个中国人'], correctAnswer: 0, explanation: '多重否定造成逻辑混乱。' },
  { id: 'c069', type: 'correct', question: '"谁也不能否认优异的成绩不是靠勤奋得来的。"应修改为：', options: ['A. 谁也不能否认优异的成绩是靠勤奋得来的', 'B. 谁也不能否认优异的成绩不是靠勤奋得来的', 'C. 谁也承认优异的成绩不是靠勤奋得来的'], correctAnswer: 0, explanation: '多重否定导致意思相反。' },
  { id: 'c070', type: 'correct', question: '"为了避免不再犯错，我认真检查了作业。"应修改为：', options: ['A. 为了避免不再犯错', 'B. 为了避免再次犯错', 'C. 为了不再犯错'], correctAnswer: 1, explanation: '"避免"和"不再"连用造成意思相反。' },
  // 主宾搭配不当
  { id: 'c071', type: 'correct', question: '"春天的杭州是一个美丽的季节。"应修改为：', options: ['A. 杭州的春天是一个美丽的季节', 'B. 春天的杭州是美丽的', 'C. 春天是一个美丽的季节'], correctAnswer: 0, explanation: '"杭州"是地点，不能是"季节"。' },
  { id: 'c072', type: 'correct', question: '"我们班的人数比他们班多。"应修改为：', options: ['A. 我们班的人数比他们班的人数多', 'B. 我们班比他们班人多', 'C. 我们班比他们班多'], correctAnswer: 0, explanation: '"人数"应与"人数"比较。' },
  { id: 'c073', type: 'correct', question: '"这篇小说通过描写心理活动，表现了作者的思想感情。"应修改为：', options: ['A. 这篇小说通过人物心理活动的描写，表现了作者的思想感情', 'B. 这篇小说描写心理活动，表现作者思想感情', 'C. 小说通过心理描写，表现思想感情'], correctAnswer: 0, explanation: '明确"人物心理活动"更准确。' },
  { id: 'c074', type: 'correct', question: '"墨黑的乌云和瓢泼的大雨从天上倾泻下来。"应修改为：', options: ['A. 墨黑的乌云密布，瓢泼的大雨从天上倾泻下来', 'B. 墨黑的乌云和瓢泼的大雨从天上下下来', 'C. 瓢泼的大雨从天上倾泻下来'], correctAnswer: 0, explanation: '"乌云"不能"倾泻下来"，主谓搭配不当。' },
  { id: 'c075', type: 'correct', question: '"这位老科学家的家里，有很多藏书。"应修改为：', options: ['A. 这位老科学家的家里，有大量的藏书', 'B. 这位老科学家有很多藏书', 'C. 这位老科学家的藏书很多'], correctAnswer: 2, explanation: '原句主谓搭配不当，藏书属于人而非家里。' },
  // 用词不当
  { id: 'c076', type: 'correct', question: '"我们要响应毛主席提出的"向雷锋同志学习"的口号。"应修改为：', options: ['A. 我们要响应毛主席提出的"向雷锋同志学习"', 'B. 我们要响应"向雷锋同志学习"的号召', 'C. 我们要响应"向雷锋同志学习"的口号'], correctAnswer: 1, explanation: '"响应"应与"号召"搭配，"口号"应与"提出"搭配。' },
  { id: 'c077', type: 'correct', question: '"我们班同学基本上都到齐了。"应修改为：', options: ['A. 我们班同学基本上到齐了', 'B. 我们班同学都到齐了', 'C. 我们班基本上同学都到齐了'], correctAnswer: 1, explanation: '"基本上"和"都"矛盾，删除其中一个。' },
  { id: 'c078', type: 'correct', question: '"我们班有将近五十人左右。"应修改为：', options: ['A. 我们班有将近五十人', 'B. 我们班有五十人左右', 'C. 我们班有将近五十人多'], correctAnswer: 0, explanation: '"将近"和"左右"矛盾，应删去一个。' },
  { id: 'c079', type: 'correct', question: '"这是一幅美丽的风景画，我非常喜欢看。"应修改为：', options: ['A. 这是一幅美丽的风景画，我非常喜欢', 'B. 这是一幅美丽的风景画，我非常喜欢欣赏', 'C. 美丽的风景画是一幅，我喜欢看'], correctAnswer: 0, explanation: '"喜欢"已包含"看"的意思，"看"字多余。' },
  { id: 'c080', type: 'correct', question: '"我们必须随时发现并改正自己的缺点。"应修改为：', options: ['A. 我们必须随时发现并改正自己的错误', 'B. 我们必须随时发现并改正缺点', 'C. 我们必须随时发现缺点并改正'], correctAnswer: 0, explanation: '"改正"应与"错误"搭配，"缺点"应用"克服"。' }
]

function Correction() {
  const {
    questions,
    currentIndex,
    selectedAnswer,
    showResult,
    score,
    completed,
    isFavorited,
    favoriteLoading,
    loading,
    currentQuestion,
    progress,
    startPractice,
    toggleFavorite,
    selectAnswer,
    nextQuestion,
    reset,
  } = usePractice({
    questionsData: CORRECTION_QUESTIONS,
    practiceType: 'correction',
  })

  // 页面生命周期
  useDidShow(() => {
    startPractice()
  })

  // 启用页面分享
  useShareAppMessage(() => {
    return pageShareConfigs.correction
  })

  useShareTimeline(() => {
    return {
      title: pageShareConfigs.correction.title,
      query: ''
    }
  })

  if (loading || questions.length === 0) {
    return (
      <View className="correction-page">
        <View className="practice-loading">加载中...</View>
      </View>
    )
  }

  if (completed) {
    const scorePercent = Math.round((score / questions.length) * 100)
    const praise = scorePercent >= 80 ? '太棒了！' : scorePercent >= 60 ? '继续加油！' : '再练习一下吧！'

    return (
      <View className="correction-page">
        <View className="result-page">
          <View className="result-card">
            <Text className="result-title">练习完成！</Text>
            <Text className="result-score">{score} / {questions.length}</Text>
            <Text className="result-desc">{praise}</Text>
            <Text className="result-desc">正确率：{scorePercent}%</Text>
            <View className="result-actions">
              <View className="action-btn secondary" onClick={reset}>再练一次</View>
              <View className="action-btn" onClick={() => Taro.navigateBack()}>返回</View>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="correction-page">
      <View className="content-scroll">
        {/* 进度条 */}
        <View className="progress-bar">
          <View className="practice-progress-fill" style={{ width: `${progress.percent}%` }}></View>
        </View>

        {/* 题目卡片 */}
        <View className="question-card">
          <View className="question-header">
            <View className="question-num">第 {progress.current} / {progress.total} 题</View>
            <View className="question-actions">
              <View
                className={`favorite-btn ${isFavorited ? 'favorited' : ''} ${favoriteLoading ? 'loading' : ''}`}
                onClick={toggleFavorite}
              >
                <Text className="favorite-icon">{isFavorited ? '★' : '☆'}</Text>
              </View>
            </View>
          </View>

          <View className="question-content">
            <Text className="question-text">{currentQuestion?.question}</Text>
          </View>

          {/* 选项列表 */}
          <View className="options-list">
            {currentQuestion?.options?.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = index === currentQuestion.correctAnswer
              const showIcon = showResult && (isCorrect || isSelected)

              return (
                <View
                  key={index}
                  className={`option-item ${isSelected ? 'selected' : ''} ${
                    showResult && isCorrect ? 'correct' : ''
                  } ${showResult && isSelected && !isCorrect ? 'wrong' : ''
                  }`}
                  onClick={() => selectAnswer(index)}
                >
                  <View className="option-label">
                    <Text className="option-label-text">{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <View className="option-content">
                    <Text className="option-text">{option}</Text>
                  </View>
                  {showIcon && isCorrect && (
                    <View className="option-icon">
                      <Text className="icon-check">✓</Text>
                    </View>
                  )}
                  {showIcon && isSelected && !isCorrect && (
                    <View className="option-icon">
                      <Text className="icon-cross">✗</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          {/* 解析 */}
          {showResult && currentQuestion?.explanation && (
            <View className="explanation-box">
              <Text className="explanation-label">解析：</Text>
              <Text className="explanation-text">{currentQuestion.explanation}</Text>
            </View>
          )}
        </View>

        {/* 底部操作栏 */}
        <View className="practice-actions">
          <View className="practice-btn secondary" onClick={() => Taro.navigateBack()}>返回</View>
          {showResult ? (
            <View className="practice-btn" onClick={nextQuestion}>
              {currentIndex < questions.length - 1 ? '下一题' : '完成'}
            </View>
          ) : (
            <View className="practice-btn disabled">请选择答案</View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Correction
