/**
 * 从云数据库获取题目的 Hook
 * 支持降级方案：云数据库失败时使用本地题目
 */
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { callCloudFunction } from '../../services/request'
import { CLOUD_FUNCTIONS } from '../../utils/constants'
import logger from '../../utils/logger'

/**
 * 题目类型映射
 * 将页面类型映射到数据库中的类型
 */
const TYPE_MAPPING = {
  vocabulary: 'vocabulary',    // 词汇
  idiom: 'idiom',             // 成语
  pinyin: 'pinyin',           // 拼音
  correction: 'correction',    // 病句
  literature: 'literature'     // 文学
}

/**
 * 本地降级题目（当云数据库不可用时使用）
 */
import { PINYIN_QUESTIONS, VOCABULARY_QUESTIONS, IDIOM_QUESTIONS, CORRECTION_QUESTIONS } from '../../data/k12Questions'

const FALLBACK_QUESTIONS = {
  pinyin: PINYIN_QUESTIONS,
  vocabulary: VOCABULARY_QUESTIONS,
  idiom: IDIOM_QUESTIONS,
  correction: CORRECTION_QUESTIONS
}

/**
 * Fisher-Yates 洗牌算法
 */
const shuffleArray = (array) => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 从云数据库获取题目的 Hook
 * @param {string} practiceType - 练习类型 (vocabulary/idiom/pinyin/correction)
 * @param {number} count - 获取题目数量
 * @param {Object} options - 配置选项
 * @param {string} options.difficulty - 难度级别 (easy/medium/hard)
 * @param {boolean} options.forceLocal - 强制使用本地题目
 * @param {boolean} options.shuffle - 是否打乱顺序
 */
export const useCloudQuestions = (practiceType, count = 10, options = {}) => {
  const {
    difficulty = null,
    forceLocal = false,
    shuffle = true
  } = options

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingCloud, setUsingCloud] = useState(false)

  // 映射类型
  const mappedType = TYPE_MAPPING[practiceType] || practiceType

  /**
   * 从云数据库加载题目
   */
  const loadFromCloud = useCallback(async () => {
    if (forceLocal) {
      logger.info('useCloudQuestions', '强制使用本地题目')
      return loadFromLocal()
    }

    logger.cloudFunction('question', 'random', { count, type: mappedType, difficulty })
    setLoading(true)

    try {
      const res = await callCloudFunction(CLOUD_FUNCTIONS.QUESTION, {
        action: 'random',
        count,
        type: mappedType,
        difficulty
      })

      if (res.success && res.data && res.data.length > 0) {
        logger.info('useCloudQuestions', `从云数据库获取 ${res.data.length} 道题目`)

        let result = res.data

        // 转换数据格式以匹配本地格式
        result = result.map(q => ({
          id: q._id || q.id,
          type: q.type || mappedType,
          question: q.question || q.title,
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.answer,
          explanation: q.explanation || q.analysis || ''
        }))

        // 打乱顺序
        if (shuffle) {
          result = shuffleArray(result)
        }

        setQuestions(result)
        setUsingCloud(true)
        setError(null)
      } else {
        throw new Error('云数据库返回数据为空')
      }
    } catch (err) {
      logger.cloudFunctionError('question', 'random', err)
      logger.warn('useCloudQuestions', '云数据库获取失败，使用本地题目')

      // 降级到本地题目
      loadFromLocal()
    }
  }, [mappedType, count, difficulty, forceLocal, shuffle])

  /**
   * 从本地加载题目（降级方案）
   */
  const loadFromLocal = useCallback(() => {
    const localQuestions = FALLBACK_QUESTIONS[mappedType] || []

    if (localQuestions.length === 0) {
      setError('本地题库中没有该类型的题目')
      setQuestions([])
      setUsingCloud(false)
      setLoading(false)
      return
    }

    logger.info('useCloudQuestions', `使用本地题目，共 ${localQuestions.length} 道`)

    // 打乱并取指定数量
    let result = shuffle ? shuffleArray(localQuestions) : localQuestions
    result = result.slice(0, Math.min(count, result.length))

    setQuestions(result)
    setUsingCloud(false)
    setError(null)
    setLoading(false)
  }, [mappedType, count, shuffle])

  /**
   * 刷新题目（重新从云数据库获取）
   */
  const refresh = useCallback(() => {
    setUsingCloud(false)
    loadFromCloud()
  }, [loadFromCloud])

  // 组件挂载时加载题目
  useEffect(() => {
    loadFromCloud()
  }, [loadFromCloud])

  return {
    questions,
    loading,
    error,
    usingCloud,
    refresh,
    loadFromCloud,
    loadFromLocal
  }
}

export default useCloudQuestions
