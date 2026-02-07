/**
 * 练习页面通用 Hook
 * 封装词汇、成语、拼音、病句等练习页面的共同逻辑
 *
 * @param {Object} options - 配置选项
 * @param {Array} options.questionsData - 题目数据
 * @param {string} options.practiceType - 练习类型 (vocabulary/idiom/pinyin/correction)
 * @param {Function} options.onComplete - 完成回调
 * @returns {Object} 练习状态和方法
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import studyService from '../services/study'
import questionService from '../question'
import eventBus, { EVENTS } from '../utils/eventBus'

// 收藏状态缓存（跨实例共享）
let FAVORITES_CACHE = new Set()

export const usePractice = ({
  questionsData,
  practiceType = 'vocabulary',
  onComplete = null,
} = {}) => {
  // 状态管理
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // 用户答案记录
  const userAnswers = useRef({})

  // 当前题目
  const currentQuestion = questions[currentIndex]

  // 进度计算
  const progress = {
    current: currentIndex + 1,
    total: questions.length,
    percent: questions.length > 0 ? ((currentIndex + 1) / questions.length * 100) : 0,
  }

  /**
   * 启动练习
   */
  const startPractice = useCallback(() => {
    // 随机打乱题目
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, 10) // 取10题

    setQuestions(selectedQuestions)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted(false)
    userAnswers.current = {}
  }, [questionsData])

  /**
   * 加载收藏列表
   */
  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await questionService.getFavorites(1, 1000)
      FAVORITES_CACHE = new Set(favorites.map(f => f.id || f._id))
      updateFavoriteStatus()
    } catch (err) {
      console.error('加载收藏失败:', err)
    }
  }, [])

  /**
   * 更新当前题目收藏状态
   */
  const updateFavoriteStatus = useCallback(() => {
    if (currentQuestion) {
      setIsFavorited(FAVORITES_CACHE.has(currentQuestion.id))
    }
  }, [currentQuestion])

  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback(async () => {
    if (!currentQuestion || favoriteLoading) return

    setFavoriteLoading(true)

    try {
      const questionData = {
        id: currentQuestion.id,
        type: currentQuestion.type || practiceType,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation || ''
      }

      const success = await questionService.toggleFavorite(currentQuestion.id, questionData)

      if (success) {
        if (isFavorited) {
          FAVORITES_CACHE.delete(currentQuestion.id)
        } else {
          FAVORITES_CACHE.add(currentQuestion.id)
        }
        setIsFavorited(!isFavorited)
        Taro.showToast({
          title: isFavorited ? '已取消收藏' : '已收藏',
          icon: isFavorited ? 'none' : 'success',
          duration: 1500
        })
      }
    } catch (err) {
      console.error('收藏失败:', err)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      setFavoriteLoading(false)
    }
  }, [currentQuestion, favoriteLoading, isFavorited, practiceType])

  /**
   * 选择答案
   */
  const selectAnswer = useCallback((index) => {
    if (selectedAnswer !== null || showResult) return

    setSelectedAnswer(index)

    // 记录答案
    userAnswers.current[currentQuestion.id] = index

    // 判断对错
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }

    setShowResult(true)
  }, [currentQuestion, selectedAnswer, showResult])

  /**
   * 下一题
   */
  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      finishPractice()
    }
  }, [currentIndex, questions.length])

  /**
   * 完成练习
   */
  const finishPractice = useCallback(async () => {
    setCompleted(true)

    // 准备答题数据
    const answerData = questions.map(q => {
      const userAnswer = userAnswers.current[q.id] ?? -1
      const isCorrect = userAnswer === q.correctAnswer
      return {
        questionId: q.id,
        answer: userAnswer,
        isCorrect,
        questionType: practiceType,
        questionText: q.question || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer
      }
    })

    // 保存答题历史到 answer_history
    try {
      const submitResult = await Taro.cloud.callFunction({
        name: 'question',
        data: {
          action: 'submitBatch',
          answers: answerData
        }
      })

      const result = submitResult.result || submitResult || {}
      const saved = result.savedCount ?? result.data?.savedCount ?? 0
      console.log(`答题历史已保存: ${saved}/${answerData.length}`)
    } catch (err) {
      console.error('保存答题历史失败:', err)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none', duration: 2000 })
    }

    // 保存学习记录到 study_records
    const finalScore = Math.round((score / questions.length) * 100)
    try {
      await studyService.addRecord({
        type: practiceType,
        title: getTitleByType(practiceType),
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers: score,
        duration: 5
      })

      eventBus.emit(EVENTS.STUDY_RECORD_UPDATED, {
        type: practiceType,
        score: finalScore,
        correctCount: score,
        totalCount: questions.length
      })

      // 触发完成回调
      if (onComplete) {
        onComplete({
          score: finalScore,
          correctCount: score,
          totalCount: questions.length,
          answerData
        })
      }
    } catch (err) {
      console.error('保存学习记录失败:', err)
    }
  }, [questions, score, practiceType, onComplete])

  /**
   * 重置练习
   */
  const reset = useCallback(() => {
    setCompleted(false)
    startPractice()
  }, [startPractice])

  /**
   * 题目变化时更新收藏状态
   */
  useEffect(() => {
    updateFavoriteStatus()
  }, [currentIndex, questions, updateFavoriteStatus])

  return {
    // 状态
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

    // 进度
    progress,

    // 方法
    startPractice,
    loadFavorites,
    toggleFavorite,
    selectAnswer,
    nextQuestion,
    finishPractice,
    reset,
  }
}

/**
 * 根据练习类型获取标题
 */
function getTitleByType(type) {
  const titles = {
    vocabulary: '词汇学习',
    idiom: '成语学习',
    pinyin: '拼音练习',
    correction: '病句修改',
  }
  return titles[type] || '练习'
}

export default usePractice
