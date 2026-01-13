// 题目管理云函数
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 题库集合名称
const QUESTIONS_COLLECTION = 'questions_bank'

// Action 白名单
const ALLOWED_ACTIONS = ['random', 'list', 'detail', 'submit', 'submitBatch', 'stats', 'types', 'favorite', 'favorites', 'wrong', 'practice', 'achievements']

exports.main = async (event, context) => {
  const { action, _openid, ...params } = event

  // 验证 action 参数
  if (!action || !ALLOWED_ACTIONS.includes(action)) {
    return { success: false, message: 'Invalid action' }
  }

  // 从微信上下文获取真实的 openid（不可伪造）
  const wxContext = cloud.getWXContext()
  const realOpenid = wxContext.OPENID

  if (!realOpenid) {
    return { success: false, message: '无法获取用户身份信息' }
  }

  // 如果请求中包含 _openid 字段，必须与 realOpenid 完全一致，否则拒绝
  if (typeof _openid !== 'undefined' && _openid !== realOpenid) {
    return { success: false, message: '身份验证失败' }
  }

  // 需要身份的 action 始终使用服务端获取的真实 openid
  const effectiveOpenid = realOpenid

  switch (action) {
    case 'random':
      return await getRandomQuestions(params.count, params.type, params.difficulty)
    case 'list':
      return await getQuestionsByType(params.type, params.page, params.pageSize, params.difficulty)
    case 'detail':
      return await getQuestionDetail(params.id)
    case 'submit':
      return await submitAnswer(effectiveOpenid, params.questionId, params.answer)
    case 'submitBatch':
      return await submitBatchAnswers(effectiveOpenid, params.answers)
    case 'stats':
      return await getStatistics(effectiveOpenid)
    case 'types':
      return await getQuestionTypes()
    case 'favorite':
      return await toggleFavorite(effectiveOpenid, params.questionId)
    case 'favorites':
      return await getFavorites(effectiveOpenid, params.page, params.pageSize)
    case 'wrong':
      return await getWrongQuestions(effectiveOpenid, params.page, params.pageSize)
    case 'practice':
      return await generatePractice(params.type, params.count, params.difficulty)
    case 'achievements':
      return await getAchievements(effectiveOpenid)
    default:
      return { success: false, message: '未知操作' }
  }
}

/**
 * Fisher-Yates 洗牌算法 - 真随机打乱数组
 * @param {Array} array - 待打乱的数组
 * @returns {Array} 打乱后的新数组
 */
function fisherYatesShuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 分批获取所有匹配的题目
 * @param {Object} query - 数据库查询对象
 * @param {number} total - 总数
 * @returns {Array} 所有题目数组
 */
async function fetchAllQuestions(query, total) {
  const BATCH_SIZE = 100
  const allQuestions = []
  const batches = Math.ceil(total / BATCH_SIZE)

  for (let i = 0; i < batches; i++) {
    const res = await query.skip(i * BATCH_SIZE).limit(BATCH_SIZE).get()
    allQuestions.push(...res.data)
  }

  return allQuestions
}

/**
 * 获取随机题目（使用 Fisher-Yates 洗牌算法保证真随机）
 * @param {number} count - 题目数量
 * @param {string} type - 题目类型 (可选)
 * @param {string} difficulty - 难度级别 (可选: easy/medium/hard)
 */
async function getRandomQuestions(count = 10, type = null, difficulty = null) {
  try {
    const collection = db.collection(QUESTIONS_COLLECTION)
    let query = collection

    const whereConditions = {}
    if (type) {
      whereConditions.type = type
    }
    if (difficulty) {
      whereConditions.difficulty = difficulty
    }

    if (Object.keys(whereConditions).length > 0) {
      query = query.where(whereConditions)
    }

    // 先获取总数
    const countRes = await query.count()
    const total = countRes.total

    if (total === 0) {
      return { success: true, data: [], total: 0 }
    }

    // 请求数量不能超过总数
    const actualCount = Math.min(count, total)

    // 全量获取匹配的题目
    const allQuestions = await fetchAllQuestions(query, total)

    // 使用 Fisher-Yates 洗牌算法打乱
    const shuffled = fisherYatesShuffle(allQuestions)

    // 取前 N 个
    const selected = shuffled.slice(0, actualCount)

    return { success: true, data: selected, total }
  } catch (err) {
    return { success: false, message: err.message, data: [] }
  }
}

/**
 * 按类型获取题目列表
 * @param {string} type - 题目类型
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} difficulty - 难度级别 (可选)
 */
async function getQuestionsByType(type, page = 1, pageSize = 20, difficulty = null) {
  try {
    const skip = (page - 1) * pageSize
    const whereConditions = { type }

    if (difficulty) {
      whereConditions.difficulty = difficulty
    }

    const res = await db.collection(QUESTIONS_COLLECTION)
      .where(whereConditions)
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取总数
    const countRes = await db.collection(QUESTIONS_COLLECTION)
      .where(whereConditions)
      .count()

    return {
      success: true,
      data: res.data,
      total: countRes.total,
      page,
      pageSize
    }
  } catch (err) {
    return { success: false, message: err.message, data: [], total: 0 }
  }
}

/**
 * 获取题目详情
 * @param {string} id - 题目ID
 */
async function getQuestionDetail(id) {
  try {
    const res = await db.collection(QUESTIONS_COLLECTION).doc(id).get()
    return { success: true, data: res.data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * 提交单题答案
 * @param {string} openid - 用户openid
 * @param {string} questionId - 题目ID
 * @param {string} answer - 用户答案
 */
async function submitAnswer(openid, questionId, answer) {
  try {
    const questionRes = await db.collection(QUESTIONS_COLLECTION).doc(questionId).get()
    const question = questionRes.data

    // 检查题目是否存在
    if (!question) {
      return { success: false, message: '题目不存在' }
    }

    const isCorrect = String(answer) === String(question.correctAnswer)

    // 记录答题历史
    await db.collection('answer_history').add({
      data: {
        _openid: openid,
        questionId,
        answer,
        isCorrect,
        questionType: question.type,
        createdAt: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * 批量提交答案
 * @param {string} openid - 用户openid
 * @param {Array} answers - 答案数组 [{questionId, answer, isCorrect, questionType}]
 *
 * 注意：对于练习页面（词汇、成语、拼音、病句），题目可能不在数据库中。
 * 此时 answers 数组应包含 isCorrect 和 questionType 字段。
 */
async function submitBatchAnswers(openid, answers) {
  console.log('=== submitBatchAnswers 被调用 ===')
  console.log('openid:', openid)
  console.log('answers 数量:', answers.length)

  try {
    const results = []
    let correctCount = 0

    for (const item of answers) {
      // 先尝试从数据库获取题目
      const questionRes = await db.collection(QUESTIONS_COLLECTION).doc(item.questionId).get()
      const question = questionRes.data

      let isCorrect
      let questionType

      if (question) {
        // 题目在数据库中，使用数据库的数据
        isCorrect = String(item.answer) === String(question.correctAnswer)
        questionType = question.type
      } else {
        // 题目不在数据库中（如练习页面的题目），使用传入的数据
        isCorrect = item.isCorrect ?? false
        questionType = item.questionType ?? 'practice'
      }

      if (isCorrect) correctCount++

      // 无论题目是否在数据库中，都保存答题历史
      await db.collection('answer_history').add({
        data: {
          _openid: openid,
          questionId: item.questionId,
          answer: item.answer,
          isCorrect,
          questionType,
          createdAt: db.serverDate()
        }
      })

      results.push({
        questionId: item.questionId,
        isCorrect,
        correctAnswer: question?.correctAnswer,
        explanation: question?.explanation
      })
    }

    console.log('submitBatch 完成: 保存了', answers.length, '条答题记录到 answer_history')

    return {
      success: true,
      data: {
        results,
        correctCount,
        totalCount: answers.length,
        score: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0
      }
    }
  } catch (err) {
    console.error('submitBatch 出错:', err)
    return { success: false, message: err.message }
  }
}

/**
 * 获取题目统计
 * @param {string} openid - 用户openid
 */
async function getStatistics(openid) {
  try {
    // 题库总数
    const totalRes = await db.collection(QUESTIONS_COLLECTION).count()
    const total = totalRes.total

    // 各类型题目数量
    const types = ['pinyin', 'literature', 'idiom', 'correction', 'vocabulary', 'comprehension', 'grammar', 'reading']
    const typeStats = {}

    for (const type of types) {
      const res = await db.collection(QUESTIONS_COLLECTION)
        .where({ type })
        .count()
      typeStats[type] = res.total
    }

    // 用户答题数
    const answeredRes = await db.collection('answer_history')
      .where({ _openid: openid })
      .count()
    const answered = answeredRes.total

    // 正确题数
    const correctRes = await db.collection('answer_history')
      .where({ _openid: openid, isCorrect: true })
      .count()
    const correct = correctRes.total

    // 今日答题数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayRes = await db.collection('answer_history')
      .where({
        _openid: openid,
        createdAt: _.gte(today)
      })
      .count()
    const todayAnswered = todayRes.total

    return {
      success: true,
      data: {
        total,
        answered,
        correct,
        todayAnswered,
        accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
        typeStats
      }
    }
  } catch (err) {
    return { success: false, message: err.message, data: {} }
  }
}

/**
 * 获取题目类型列表
 */
async function getQuestionTypes() {
  try {
    const types = [
      { value: 'pinyin', label: '拼音', count: 0 },
      { value: 'literature', label: '古诗词', count: 0 },
      { value: 'idiom', label: '成语', count: 0 },
      { value: 'correction', label: '病句修改', count: 0 },
      { value: 'vocabulary', label: '词汇', count: 0 },
      { value: 'comprehension', label: '阅读理解', count: 0 },
      { value: 'grammar', label: '语法', count: 0 },
      { value: 'reading', label: '阅读', count: 0 }
    ]

    // 获取各类型实际数量
    for (const type of types) {
      const res = await db.collection(QUESTIONS_COLLECTION)
        .where({ type: type.value })
        .count()
      type.count = res.total
    }

    return { success: true, data: types }
  } catch (err) {
    return { success: false, message: err.message, data: [] }
  }
}

/**
 * 生成练习题
 * @param {string} type - 题目类型
 * @param {number} count - 题目数量
 * @param {string} difficulty - 难度
 */
async function generatePractice(type = null, count = 10, difficulty = null) {
  try {
    const result = await getRandomQuestions(count, type, difficulty)
    return result
  } catch (err) {
    return { success: false, message: err.message, data: [] }
  }
}

/**
 * 收藏/取消收藏题目
 */
async function toggleFavorite(openid, questionId) {
  try {
    const existingRes = await db.collection('favorites')
      .where({ _openid: openid, questionId })
      .get()

    if (existingRes.data.length > 0) {
      // 取消收藏
      await db.collection('favorites')
        .doc(existingRes.data[0]._id)
        .remove()
      return { success: true, data: { favorited: false } }
    } else {
      // 添加收藏
      await db.collection('favorites').add({
        data: {
          _openid: openid,
          questionId,
          createdAt: db.serverDate()
        }
      })
      return { success: true, data: { favorited: true } }
    }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * 获取收藏列表（包含完整题目详情）
 */
async function getFavorites(openid, page = 1, pageSize = 20) {
  try {
    const skip = (page - 1) * pageSize
    const favRes = await db.collection('favorites')
      .where({ _openid: openid })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取题目详情
    const questions = []
    for (const fav of favRes.data) {
      try {
        const qRes = await db.collection(QUESTIONS_COLLECTION).doc(fav.questionId).get()
        if (qRes.data) {
          questions.push({
            ...qRes.data,
            _id: qRes.data._id || fav.questionId,
            id: qRes.data.id || fav.questionId,
            favoriteId: fav._id,
            favoriteCreatedAt: fav.createdAt
          })
        }
      } catch (e) {
        // 题目可能不存在，跳过
        console.log('题目不存在:', fav.questionId)
      }
    }

    return { success: true, data: questions }
  } catch (err) {
    return { success: false, message: err.message, data: [] }
  }
}

/**
 * 获取错题集（包含完整题目详情）
 */
async function getWrongQuestions(openid, page = 1, pageSize = 20) {
  try {
    const skip = (page - 1) * pageSize
    const wrongRes = await db.collection('answer_history')
      .where({ _openid: openid, isCorrect: false })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    // 获取题目详情，去重（同一错题只保留最新一次）
    const questionMap = new Map()
    for (const record of wrongRes.data) {
      if (!questionMap.has(record.questionId)) {
        try {
          const qRes = await db.collection(QUESTIONS_COLLECTION).doc(record.questionId).get()
          if (qRes.data) {
            questionMap.set(record.questionId, {
              ...qRes.data,
              _id: qRes.data._id || record.questionId,
              id: qRes.data.id || record.questionId,
              wrongAnswer: record.answer,
              wrongAt: record.createdAt
            })
          }
        } catch (e) {
          // 题目可能不存在，跳过
          console.log('题目不存在:', record.questionId)
        }
      }
    }

    return { success: true, data: Array.from(questionMap.values()) }
  } catch (err) {
    return { success: false, message: err.message, data: [] }
  }
}

/**
 * 获取用户成就数据
 * 基于 answer_history 和 study_records 集合实时计算
 * @param {string} openid - 用户openid
 */
async function getAchievements(openid) {
  try {
    // 获取用户总答题数
    const answeredRes = await db.collection('answer_history')
      .where({ _openid: openid })
      .count()
    const totalQuestions = answeredRes.total

    // 获取用户正确答题数
    const correctRes = await db.collection('answer_history')
      .where({ _openid: openid, isCorrect: true })
      .count()
    const correctCount = correctRes.total

    // 计算正确率
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    // 获取学习记录
    const recordsRes = await db.collection('study_records')
      .where({ _openid: openid })
      .get()

    const records = recordsRes.data

    // 计算总得分
    const totalScore = records.reduce((sum, r) => sum + (r.score || 0), 0)

    // 满分次数
    const perfectCount = records.filter(r => r.score === 100).length

    // 计算连续学习天数
    const studyDays = calculateStudyDays(records)

    // 成就判断
    const achievements = {
      beginner: {
        unlocked: totalQuestions > 0,
        progress: totalQuestions > 0 ? '已解锁' : '0/1题'
      },
      week: {
        unlocked: studyDays >= 7,
        progress: `${Math.min(studyDays, 7)}/7天`
      },
      perfect: {
        unlocked: perfectCount >= 10,
        progress: `${perfectCount}/10次`
      },
      master: {
        unlocked: totalQuestions >= 500,
        progress: `${totalQuestions}/500题`
      },
      speed: {
        unlocked: totalQuestions >= 100,
        progress: `${Math.min(totalQuestions, 100)}/100题`
      },
      bookworm: {
        unlocked: totalScore >= 1000,
        progress: `${totalScore}/1000分`
      },
      scholar: {
        unlocked: accuracy >= 90 && totalQuestions >= 50,
        progress: `${accuracy}%`
      }
    }

    return { success: true, data: achievements }
  } catch (err) {
    return { success: false, message: err.message, data: {} }
  }
}

/**
 * 计算连续学习天数
 * @param {Array} records - 学习记录数组
 * @returns {number} 连续学习天数
 */
function calculateStudyDays(records) {
  if (records.length === 0) return 0

  // 获取所有不重复的日期
  const dates = records
    .map(r => {
      const date = new Date(r.createdAt || r.timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort()
    .reverse()

  if (dates.length === 0) return 0

  // 今天是否学习
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 昨天是否学习
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

  let streak = 0
  let checkDate = null

  if (dates[0] === todayStr) {
    streak = 1
    checkDate = yesterday
  } else if (dates[0] === yesterdayStr) {
    streak = 1
    checkDate = yesterday
  } else {
    return 0
  }

  // 向前检查连续天数
  for (let i = 1; i < dates.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1)
    const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`

    if (dates.includes(checkStr)) {
      streak++
    } else {
      break
    }
  }

  return streak
}
