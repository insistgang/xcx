/**
 * 收藏练习页面
 */
import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow, useShareAppMessage, useShareTimeline, navigateTo } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import questionService from '../../services/question'
import eventBus, { EVENTS } from '../../utils/eventBus'
import { pageShareConfigs } from '../../utils/share'
import './index.less'

// 本地缓存：记录用户已经练习过的收藏题目 ID
let PRACTICED_FAVORITES_CACHE = new Set()

function FavoritePractice() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    practiced: 0
  })

  useDidShow(() => {
    loadFavoriteQuestions()
    // 监听练习完成事件
    eventBus.on(EVENTS.STUDY_RECORD_UPDATED, handleStudyRecordUpdated)
    return () => {
      eventBus.off(EVENTS.STUDY_RECORD_UPDATED, handleStudyRecordUpdated)
    }
  })

  useShareAppMessage(() => pageShareConfigs.exercise)
  useShareTimeline(() => pageShareConfigs.exercise)

  /**
   * 当练习记录更新时，刷新已练习计数
   */
  const handleStudyRecordUpdated = (data) => {
    // 重新加载收藏列表来更新计数
    loadFavoriteQuestions()
  }

  /**
   * 获取用户在 answer_history 中的记录
   */
  const loadPracticedCount = async (favoriteIds) => {
    if (favoriteIds.length === 0) return 0

    try {
      const db = Taro.cloud.database()
      const { data: answerRecords } = await db.collection('answer_history')
        .where({
          questionId: db.RegExp.create(`^(${favoriteIds.join('|')})$`)
        })
        .get()

      // 获取唯一练习过的题目ID
      const practicedIds = new Set(answerRecords.map(r => r.questionId))
      PRACTICED_FAVORITES_CACHE = practicedIds

      return practicedIds.size
    } catch (err) {
      console.error('获取已练习记录失败:', err)
      return 0
    }
  }

  const loadFavoriteQuestions = async () => {
    setLoading(true)
    try {
      const data = await questionService.getFavorites(1, 100)

      const favoriteIds = (data || []).map(q => q.id || q._id)
      const total = favoriteIds.length

      // 获取已练习的题目数量
      const practiced = await loadPracticedCount(favoriteIds)

      setQuestions(data || [])
      setStats({ total, practiced })
    } catch (err) {
      console.error('加载收藏失败:', err)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeName = (type) => {
    const typeMap = {
      'pinyin': '拼音',
      'literature': '诗词',
      'idiom': '成语',
      'vocabulary': '词汇',
      'correction': '病句'
    }
    return typeMap[type] || '未知'
  }

  const getTypeColor = (type) => {
    const colorMap = {
      'pinyin': '#10B981',
      'literature': '#8B5CF6',
      'idiom': '#F59E0B',
      'vocabulary': '#4A90E2',
      'correction': '#EF4444'
    }
    return colorMap[type] || '#6B7280'
  }

  const handleQuestionClick = (question) => {
    // 将题目数据编码为 JSON 字符串传递
    const questionData = encodeURIComponent(JSON.stringify({
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    }))
    navigateTo({
      url: `/pages/exercise-detail/index?mode=single&questionData=${questionData}`
    })
  }

  const handleStartPractice = () => {
    if (questions.length === 0) return
    navigateTo({
      url: `/pages/exercise-detail/index?mode=favorite&count=${Math.min(10, questions.length)}`
    })
  }

  return (
    <View className="favorite-practice-page">
      <ScrollView scrollY className="content-scroll">
        {/* 统计卡片 */}
        <View className="stats-header">
          <View className="stats-card">
            <View className="stats-icon">⭐</View>
            <Text className="stats-title">收藏夹</Text>
            <Text className="stats-subtitle">重点题目集中练习</Text>
            <View className="stats-numbers">
              <View className="stat-item">
                <Text className="stat-value">{stats.total}</Text>
                <Text className="stat-label">收藏总数</Text>
              </View>
              <View className="stat-divider" />
              <View className="stat-item">
                <Text className="stat-value">{stats.practiced}</Text>
                <Text className="stat-label">已练习</Text>
              </View>
            </View>
            {questions.length > 0 && (
              <View className="practice-btn" onClick={handleStartPractice}>
                <Text className="practice-btn-text">开始练习</Text>
              </View>
            )}
          </View>
        </View>

        {/* 题目列表 */}
        <View className="questions-section">
          <View className="section-header">
            <Text className="section-title">收藏列表</Text>
            <Text className="section-count">共 {questions.length} 题</Text>
          </View>

          {loading ? (
            <View className="loading-state">
              <Text>加载中...</Text>
            </View>
          ) : questions.length > 0 ? (
            <View className="question-list">
              {questions.map((question, index) => (
                <View
                  key={question.id || index}
                  className="question-item"
                  onClick={() => handleQuestionClick(question)}
                >
                  <View className="question-header">
                    <View
                      className="type-badge"
                      style={{ backgroundColor: getTypeColor(question.type) }}
                    >
                      <Text className="type-text">{getTypeName(question.type)}</Text>
                    </View>
                    <Text className="question-index">第 {index + 1} 题</Text>
                  </View>
                  <Text className="question-content">{question.question}</Text>
                  <View className="question-footer">
                    <Text className="question-id">ID: {question.id}</Text>
                    <Text className="favorite-icon">⭐ 已收藏</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-state">
              <Text className="empty-icon">⭐</Text>
              <Text className="empty-text">暂无收藏</Text>
              <Text className="empty-tip">做题时点击星号收藏题目</Text>
            </View>
          )}
        </View>

        {/* 学习提示 */}
        {questions.length > 0 && (
          <View className="tips-section">
            <View className="tips-card">
              <Text className="tips-icon">💡</Text>
              <Text className="tips-title">收藏建议</Text>
              <Text className="tips-content">
                1. 收藏经典题型，方便随时复习{'\n'}
                2. 收藏难题错题，针对性练习提升{'\n'}
                3. 定期清理收藏，保持收藏夹精简
              </Text>
            </View>
          </View>
        )}

        {/* 底部留白 */}
        <View style={{ height: '100rpx' }} />
      </ScrollView>
    </View>
  )
}

export default FavoritePractice
