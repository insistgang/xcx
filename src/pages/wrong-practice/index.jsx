/**
 * 错题重做页面
 */
import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow, navigateTo } from '@tarojs/taro'
import questionService from '../../services/question'
import './index.less'

function WrongPractice() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    corrected: 0,
    pending: 0
  })

  useDidShow(() => {
    loadWrongQuestions()
  })

  const loadWrongQuestions = async () => {
    setLoading(true)
    try {
      const data = await questionService.getWrongQuestions(1, 100)
      setQuestions(data || [])

      // 计算统计信息
      const total = data?.length || 0
      setStats({
        total,
        corrected: 0, // 从answer_history中获取已做对的
        pending: total
      })
    } catch (err) {
      console.error('加载错题失败:', err)
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
    // 跳转到练习详情页，带上题目ID
    navigateTo({
      url: `/pages/exercise-detail/index?type=${question.type}&questionId=${question.id}`
    })
  }

  const handleStartPractice = () => {
    if (questions.length === 0) return
    // 开始练习，跳转到练习详情页
    navigateTo({
      url: `/pages/exercise-detail/index?mode=wrong&count=${Math.min(10, questions.length)}`
    })
  }

  return (
    <View className="wrong-practice-page">
      <ScrollView scrollY className="content-scroll">
        {/* 统计卡片 */}
        <View className="stats-header">
          <View className="stats-card">
            <View className="stats-icon">❌</View>
            <Text className="stats-title">错题本</Text>
            <Text className="stats-subtitle">攻克薄弱知识点</Text>
            <View className="stats-numbers">
              <View className="stat-item">
                <Text className="stat-value">{stats.total}</Text>
                <Text className="stat-label">错题总数</Text>
              </View>
              <View className="stat-divider" />
              <View className="stat-item">
                <Text className="stat-value">{stats.pending}</Text>
                <Text className="stat-label">待重做</Text>
              </View>
            </View>
            {questions.length > 0 && (
              <View className="practice-btn" onClick={handleStartPractice}>
                <Text className="practice-btn-text">开始重做</Text>
              </View>
            )}
          </View>
        </View>

        {/* 题目列表 */}
        <View className="questions-section">
          <View className="section-header">
            <Text className="section-title">错题列表</Text>
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
                    <Text className="practice-hint">点击重做 {'>'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-state">
              <Text className="empty-icon">🎉</Text>
              <Text className="empty-text">暂无错题</Text>
              <Text className="empty-tip">继续努力学习吧！</Text>
            </View>
          )}
        </View>

        {/* 学习提示 */}
        {questions.length > 0 && (
          <View className="tips-section">
            <View className="tips-card">
              <Text className="tips-icon">💡</Text>
              <Text className="tips-title">学习建议</Text>
              <Text className="tips-content">
                1. 定期复习错题，巩固薄弱知识点{'\n'}
                2. 理解错题原因，避免再犯同样错误{'\n'}
                3. 错题重做正确后可移出错题本
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

export default WrongPractice
