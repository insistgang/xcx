/**
 * 练习页面通用 Hook
 * 封装词汇、成语、拼音、病句等练习页面的共同逻辑
 * 支持从云数据库获取题目
 *
 * @param {Object} options - 配置选项
 * @param {Array} options.questionsData - 题目数据（本地模式）
 * @param {string} options.practiceType - 练习类型 (vocabulary/idiom/pinyin/correction)
 * @param {boolean} options.useCloud - 是否从云数据库获取题目
 * @param {number} options.count - 获取题目数量（云数据库模式）
 * @param {Function} options.onComplete - 完成回调
 * @returns {Object} 练习状态和方法
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import studyService from '../services/study'
import questionService from '../services/question'
import eventBus, { EVENTS } from '../utils/eventBus'
import { ErrorHandler, ErrorTypes } from '../utils/errorHandler'
import { callCloudFunction } from '../services/request'
import { CLOUD_FUNCTIONS } from '../utils/constants'
import logger from '../utils/logger'

// 题目类型映射
const TYPE_MAPPING = {
  vocabulary: 'vocabulary',
  idiom: 'idiom',
  pinyin: 'pinyin',
  correction: 'correction'
}

// 收藏状态缓存（跨实例共享）
let FAVORITES_CACHE = new Set()

export const usePractice = ({
  questionsData,
  practiceType = 'vocabulary',
  useCloud = false,
  count = 10,
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
   * 从云数据库加载题目
   */
  const loadFromCloud = useCallback(async () => {
    try {
      setLoading(true)
      const mappedType = TYPE_MAPPING[practiceType] || practiceType

      logger.cloudFunction('question', 'random', { count, type: mappedType })

      const res = await callCloudFunction(CLOUD_FUNCTIONS.QUESTION, {
        action: 'random',
        count,
        type: mappedType
      })

      if (res.success && res.data && res.data.length > 0) {
        logger.info('usePractice', `从云数据库获取 ${res.data.length} 道题目`)

        // 转换数据格式
        const formattedQuestions = res.data.map(q => ({
          id: q._id || q.id,
          type: q.type || practiceType,
          question: q.question || q.title,
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.answer,
          explanation: q.explanation || q.analysis || ''
        }))

        setQuestions(formattedQuestions)
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setCompleted(false)
        userAnswers.current = {}
        setLoading(false)
      } else {
        throw new Error('云数据库返回数据为空')
      }
    } catch (err) {
      logger.cloudFunctionError('question', 'random', err)
      logger.warn('usePractice', '云数据库获取失败，使用本地题目')
      // 降级到本地题目
      loadFromLocal()
    }
  }, [practiceType, count])

  /**
   * 从本地加载题目（降级方案）
   */
  const loadFromLocal = useCallback(() => {
    // 随机打乱题目
    const shuffled = [...questionsData].sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffled.slice(0, count)

    setQuestions(selectedQuestions)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setCompleted(false)
    userAnswers.current = {}
    setLoading(false)
  }, [questionsData, count])

  /**
   * 启动练习
   */
  const startPractice = useCallback(async () => {
    if (useCloud) {
      await loadFromCloud()
    } else {
      loadFromLocal()
    }
  }, [useCloud, loadFromCloud, loadFromLocal])

  /**
   * 加载收藏列表
   */
  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await questionService.getFavorites(1, 1000)
      FAVORITES_CACHE = new Set(favorites.map(f => f.id || f._id))
      updateFavoriteStatus()
    } catch (err) {
      ErrorHandler.handleCloudFunctionError(err, 'getFavorites', { showTip: false })
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
      ErrorHandler.handleCloudFunctionError(err, '收藏')
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
      // 答题历史已保存，数量: ${saved}/${answerData.length}
    } catch (err) {
      ErrorHandler.handleCloudFunctionError(err, 'question/submitBatch')
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
      ErrorHandler.handleCloudFunctionError(err, 'study/addRecord')
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
