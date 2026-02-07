/**
 * 成语学习页面 - 选择题模式
 * 使用 usePractice Hook 重构，代码量大幅减少
 */
import { useRef } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { usePractice } from '../../hooks/usePractice'
import eventBus, { EVENTS } from '../../utils/eventBus'
import { pageShareConfigs } from '../../utils/share'
import './index.less'

// 成语选择题库（100题精选）
const IDIOM_QUESTIONS = [
  // 成语填空
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
  { id: 'i011', type: 'fill', question: '杯弓___影', options: ['A. 蛇', 'B. 龙', 'C. 虫', 'D. 鸟'], correctAnswer: 0, explanation: '"杯弓蛇影"比喻因疑神疑鬼而引起恐惧。' },
  { id: 'i012', type: 'fill', question: '对牛弹___', options: ['A. 琴', 'B. 芹', 'C. 勤', 'D. 秦'], correctAnswer: 0, explanation: '"对牛弹琴"比喻对不讲道理的人讲道理。' },
  { id: 'i013', type: 'fill', question: '杞人___天', options: ['A. 忧', 'B. 优', 'C. 幽', 'D. 悠'], correctAnswer: 0, explanation: '"杞人忧天"比喻不必要的或缺乏根据的忧虑和担心。' },
  { id: 'i014', type: 'fill', question: '胸有成___', options: ['A. 竹', 'B. 足', 'C. 筑', 'D. 逐'], correctAnswer: 0, explanation: '"胸有成竹"比喻做事之前已经有通盘的考虑。' },
  { id: 'i015', type: 'fill', question: '望___止渴', options: ['A. 梅', 'B. 煤', 'C. 眉', 'D. 没'], correctAnswer: 0, explanation: '"望梅止渴"比喻用空想安慰自己。' },
  // 成语释义选择
  { id: 'i016', type: 'meaning', question: '"指鹿为马"的意思是：', options: ['A. 故意颠倒黑白', 'B. 分不清动物', 'C. 喜欢动物', 'D. 眼力不好'], correctAnswer: 0, explanation: '"指鹿为马"比喻故意颠倒黑白，混淆是非。' },
  { id: 'i017', type: 'meaning', question: '"草木皆兵"形容：', options: ['A. 植物很多', 'B. 军队强壮', 'C. 惊慌时疑神疑鬼', 'D. 自然环境好'], correctAnswer: 2, explanation: '"草木皆兵"形容人在惊慌时疑神疑鬼。' },
  { id: 'i018', type: 'meaning', question: '"纸上谈兵"比喻：', options: ['A. 纸上画画', 'B. 空谈理论', 'C. 研究军事', 'D. 写字很好'], correctAnswer: 1, explanation: '"纸上谈兵"比喻空谈理论，不能解决实际问题。' },
  { id: 'i019', type: 'meaning', question: '"破釜沉舟"比喻：', options: ['A. 摔坏东西', 'B. 下决心干到底', 'C. 破船沉水', 'D. 失败了'], correctAnswer: 1, explanation: '"破釜沉舟"比喻下决心不顾一切地干到底。' },
  { id: 'i020', type: 'meaning', question: '"卧薪尝胆"形容：', options: ['A. 生活艰苦', 'B. 刻苦自励', 'C. 睡不好觉', 'D. 吃苦胆'], correctAnswer: 1, explanation: '"卧薪尝胆"形容人刻苦自励，发愤图强。' },
  { id: 'i021', type: 'meaning', question: '"三顾茅庐"比喻：', options: ['A. 参观茅屋', 'B. 诚心邀请', 'C. 旅游观光', 'D. 三次出门'], correctAnswer: 1, explanation: '"三顾茅庐"比喻诚心诚意地邀请人家。' },
  { id: 'i022', type: 'meaning', question: '"负荆请罪"表示：', options: ['A. 背着荆条', 'B. 承认错误', 'C. 请人吃饭', 'D. 探望病人'], correctAnswer: 1, explanation: '"负荆请罪"表示向人认错赔罪。' },
  { id: 'i023', type: 'meaning', question: '"完璧归赵"比喻：', options: ['A. 完整的玉', 'B. 物归原主', 'C. 送给别人', 'D. 借东西'], correctAnswer: 1, explanation: '"完璧归赵"比喻把物品完好地归还给物品的主人。' },
  { id: 'i024', type: 'meaning', question: '"程门立雪"形容：', options: ['A. 雪天玩耍', 'B. 尊师重道', 'C. 站着休息', 'D. 冬天寒冷'], correctAnswer: 1, explanation: '"程门立雪"形容尊师重道，虔诚求教。' },
  { id: 'i025', type: 'meaning', question: '"闻鸡起舞"比喻：', options: ['A. 早晨跳舞', 'B. 养鸡为业', 'C. 及时奋起', 'D. 喜欢音乐'], correctAnswer: 2, explanation: '"闻鸡起舞"比喻有志报国的人及时奋起。' },
  { id: 'i026', type: 'meaning', question: '"入木三分"形容：', options: ['A. 木工技术', 'B. 分析深刻', 'C. 雕刻艺术', 'D. 力气很大'], correctAnswer: 1, explanation: '"入木三分"形容书法极有笔力，现多比喻分析问题很深刻。' },
  { id: 'i027', type: 'meaning', question: '"望洋兴叹"比喻：', options: ['A. 看海感叹', 'B. 无可奈何', 'C. 欣赏风景', 'D. 想要游泳'], correctAnswer: 1, explanation: '"望洋兴叹"比喻做事时因力不胜任或没有条件而感到无可奈何。' },
  { id: 'i028', type: 'meaning', question: '"叶公好龙"比喻：', options: ['A. 喜欢动物', 'B. 口头爱好实际不真', 'C. 爱好广泛', 'D. 收藏龙'], correctAnswer: 1, explanation: '"叶公好龙"比喻口头上说爱好某事物，实际上并不真爱好。' },
  { id: 'i029', type: 'meaning', question: '"黔驴技穷"比喻：', options: ['A. 驴子技穷', 'B. 本领用尽', 'C. 动物有趣', 'D. 技能不足'], correctAnswer: 1, explanation: '"黔驴技穷"比喻有限的一点本领也已经用完了。' },
  { id: 'i030', type: 'meaning', question: '"南辕北辙"比喻：', options: ['A. 南北方向', 'B. 行动目的相反', 'C. 路途遥远', 'D. 方向正确'], correctAnswer: 1, explanation: '"南辕北辙"比喻行动和目的正好相反。' },
  { id: 'i031', type: 'meaning', question: '"一鸣惊人"比喻：', options: ['A. 叫声很大', 'B. 突然成功', 'C. 平时不突出一做惊人', 'D. 令人惊讶'], correctAnswer: 2, explanation: '"一鸣惊人"比喻平时没有特殊表现，一做起来就有惊人的成绩。' },
  { id: 'i032', type: 'meaning', question: '"邯郸学步"比喻：', options: ['A. 学习走路', 'B. 模仿别人失本领', 'C. 去邯郸旅游', 'D. 体育训练'], correctAnswer: 1, explanation: '"邯郸学步"比喻模仿别人不到家，反而把自己原有的东西忘了。' },
  { id: 'i033', type: 'meaning', question: '"东施效颦"比喻：', options: ['A. 美女模仿', 'B. 盲目模仿适得其反', 'C. 学习美容', 'D. 喜欢表演'], correctAnswer: 1, explanation: '"东施效颦"比喻盲目模仿，效果适得其反。' },
  { id: 'i034', type: 'meaning', question: '"滥竽充数"的意思是：', options: ['A. 音乐演奏', 'B. 没真才实学混充数', 'C. 人多热闹', 'D. 欺骗行为'], correctAnswer: 1, explanation: '"滥竽充数"比喻没有真才实学的人混在行家里面充数。' },
  { id: 'i035', type: 'meaning', question: '"按部就班"的意思是：', options: ['A. 部分上班', 'B. 按步骤办事', 'C. 等待上班', 'D. 遵守纪律'], correctAnswer: 1, explanation: '"按部就班"指按照一定的条理、步骤做事。' },
  // 成语改错
  { id: 'i036', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 迫不急待', 'B. 迫不及待', 'C. 泊不及待', 'D. 迫不既待'], correctAnswer: 1, explanation: '正确写法是"迫不及待"，意思是急迫得不能等待。' },
  { id: 'i037', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 谈笑风生', 'B. 谈笑风声', 'C. 谈笑风森', 'D. 谈笑锋声'], correctAnswer: 0, explanation: '正确写法是"谈笑风生"，形容谈话时有说有笑，兴致很高。' },
  { id: 'i038', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 美仑美奂', 'B. 美轮美奂', 'C. 美伦美奂', 'D. 美论美奂'], correctAnswer: 1, explanation: '正确写法是"美轮美奂"，形容房屋高大华丽。' },
  { id: 'i039', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 巧夺天功', 'B. 巧夺天工', 'C. 巧夺天工', 'D. 巧夺天攻'], correctAnswer: 1, explanation: '正确写法是"巧夺天工"，形容技艺高超。' },
  { id: 'i040', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 再接再励', 'B. 再接再厉', 'C. 再接再力', 'D. 再接再利'], correctAnswer: 1, explanation: '正确写法是"再接再厉"，比喻继续努力。' },
  { id: 'i041', type: 'correct', question: '下列成语书写正确的是：', options: ['A. 恢心壮志', 'B. 灰心壮志', 'C. 诲人不倦', 'D. 诲人不卷'], correctAnswer: 2, explanation: '"诲人不倦"意思是教导人特别耐心，从不厌倦。' },
  { id: 'i042', type: 'correct', question: '"换然一新"的正确写法是：', options: ['A. 换然一新', 'B. 焕然一新', 'C. 涣然一新', 'D. 幻然一新'], correctAnswer: 1, explanation: '正确写法是"焕然一新"，形容出现了崭新的面貌。' },
  { id: 'i043', type: 'correct', question: '"直接了当"的正确写法是：', options: ['A. 直接了当', 'B. 直截了当', 'C. 直节了当', 'D. 直捷了当'], correctAnswer: 1, explanation: '正确写法是"直截了当"，形容说话做事爽快。' },
  { id: 'i044', type: 'correct', question: '"一愁莫展"的正确写法是：', options: ['A. 一愁莫展', 'B. 一筹莫展', 'C. 一愁莫展', 'D. 一酬莫展'], correctAnswer: 1, explanation: '正确写法是"一筹莫展"，一点计策也施展不出。' },
  { id: 'i045', type: 'correct', question: '"名符其实"的正确写法是：', options: ['A. 名符其实', 'B. 名副其实', 'C. 名付其实', 'D. 名弗其实'], correctAnswer: 1, explanation: '正确写法是"名副其实"，名称或名声与实际相符合。' },
  { id: 'i046', type: 'correct', question: '"不可思意"的正确写法是：', options: ['A. 不可思意', 'B. 不可思议', 'C. 不思意议', 'D. 不可思异'], correctAnswer: 1, explanation: '正确写法是"不可思议"，不可想象，难以理解。' },
  { id: 'i047', type: 'correct', question: '"事倍功半"的反义词是：', options: ['A. 事半工倍', 'B. 事半功倍', 'C. 事半功半', 'D. 事倍功倍'], correctAnswer: 1, explanation: '"事倍功半"的反义词是"事半功倍"，形容效率高。' },
  { id: 'i048', type: 'correct', question: '"守株待兔"的寓意是：', options: ['A. 等待机会', 'B. 死守不知变通', 'C. 耐心等待', 'D. 盼望成功'], correctAnswer: 1, explanation: '"守株待兔"比喻死守狭隘经验，不知变通。' },
  { id: 'i049', type: 'correct', question: '"画蛇添足"告诉我们：', options: ['A. 多做是好的', 'B. 做多余的事反不好', 'C. 画画要细致', 'D. 蛇有脚'], correctAnswer: 1, explanation: '"画蛇添足"比喻做了多余的事，非但无益，反而不合适。' },
  { id: 'i050', type: 'correct', question: '"拔苗助长"告诉我们：', options: ['A. 帮助植物', 'B. 急于求成坏事', 'C. 辛勤劳动', 'D. 爱护庄稼'], correctAnswer: 1, explanation: '"拔苗助长"比喻违反事物发展规律，急于求成反而坏事。' },
  // 成语近义反义
  { id: 'i091', type: 'relation', question: '"事半功倍"的反义词是：', options: ['A. 事倍功半', 'B. 事半功半', 'C. 事半工倍', 'D. 功半事倍'], correctAnswer: 0, explanation: '"事半功倍"的反义词是"事倍功半"。' },
  { id: 'i092', type: 'relation', question: '"深谋远虑"的近义词是：', options: ['A. 深思熟虑', 'B. 老谋深算', 'C. 谋划深远', 'D. 考虑周全'], correctAnswer: 0, explanation: '"深谋远虑"的近义词是"深思熟虑"。' },
  { id: 'i093', type: 'relation', question: '"唯利是图"的反义词是：', options: ['A. 大公无私', 'B. 公而忘私', 'C. 先公后私', 'D. 不谋私利'], correctAnswer: 0, explanation: '"唯利是图"的反义词是"大公无私"。' },
  { id: 'i094', type: 'relation', question: '"粗心大意"的反义词是：', options: ['A. 小心谨慎', 'B. 细心', 'C. 一丝不苟', 'D. 精益求精'], correctAnswer: 0, explanation: '"粗心大意"的反义词是"小心谨慎"。' },
  { id: 'i095', type: 'relation', question: '"举世闻名"的近义词是：', options: ['A. 赫赫有名', 'B. 世界闻名', 'C. 名扬天下', 'D. 大名鼎鼎'], correctAnswer: 0, explanation: '"举世闻名"的近义词是"赫赫有名"。' },
  { id: 'i096', type: 'relation', question: '"微不足道"的反义词是：', options: ['A. 举足轻重', 'B. 举足轻重', 'C. 至关重要', 'D. 非常重要'], correctAnswer: 0, explanation: '"微不足道"的反义词是"举足轻重"。' },
  { id: 'i097', type: 'relation', question: '"斤斤计较"的近义词是：', options: ['A. 锱铢必较', 'B. 睚眦必报', 'C. 斤斤计较', 'D. 计较小事'], correctAnswer: 0, explanation: '"斤斤计较"的近义词是"锱铢必较"。' },
  { id: 'i098', type: 'relation', question: '"漠不关心"的反义词是：', options: ['A. 关怀备至', 'B. 关心体贴', 'C. 体贴入微', 'D. 热情关怀'], correctAnswer: 0, explanation: '"漠不关心"的反义词是"关怀备至"。' },
  { id: 'i099', type: 'relation', question: '"一帆风顺"的反义词是：', options: ['A. 千难万险', 'B. 艰难曲折', 'C. 曲折坎坷', 'D. 风雨飘摇'], correctAnswer: 0, explanation: '"一帆风顺"的反义词是"千难万险"。' },
  { id: 'i100', type: 'relation', question: '"垂头丧气"的近义词是：', options: ['A. 灰心丧气', 'B. 没精打采', 'C. 垂头丧气', 'D. 丧气'], correctAnswer: 1, explanation: '"垂头丧气"的近义词是"没精打采"。' }
]

function Idiom() {
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
    questionsData: IDIOM_QUESTIONS,
    practiceType: 'idiom',
  })

  // 页面生命周期
  useDidShow(() => {
    startPractice()
  })

  // 启用页面分享
  useShareAppMessage(() => {
    return pageShareConfigs.idiom
  })

  useShareTimeline(() => {
    return {
      title: pageShareConfigs.idiom.title,
      query: ''
    }
  })

  if (loading || questions.length === 0) {
    return (
      <View className="idiom-page">
        <View className="practice-loading">加载中...</View>
      </View>
    )
  }

  if (completed) {
    const scorePercent = Math.round((score / questions.length) * 100)
    const praise = scorePercent >= 80 ? '太棒了！' : scorePercent >= 60 ? '继续加油！' : '再练习一下吧！'

    return (
      <View className="idiom-page">
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
    <View className="idiom-page">
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

export default Idiom
