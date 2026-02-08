/**
 * 通用练习页面组件
 * 用于词汇、成语、拼音、病句等练习页面
 */
import React, { useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { usePractice } from '../../../hooks/usePractice'
import { pageShareConfigs } from '../../../utils/share'
import './PracticePage.less'

function PracticePage({
  questionsData,
  practiceType,
  shareConfig,
  pageClassName,
  useCloud = false,
  count = 10
}) {
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
    questionsData,
    practiceType,
    useCloud,
    count
  })

  // 页面生命周期
  useDidShow(() => {
    startPractice()
  })

  // 启用页面分享
  useShareAppMessage(() => {
    return shareConfig
  })

  useShareTimeline(() => {
    return {
      title: shareConfig.title,
      query: ''
    }
  })

  // 处理返回
  const handleGoBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  if (loading || questions.length === 0) {
    return (
      <View className={`practice-page ${pageClassName}`}>
        <View className="practice-loading">加载中...</View>
      </View>
    )
  }

  if (completed) {
    const scorePercent = Math.round((score / questions.length) * 100)
    const praise = scorePercent >= 80 ? '太棒了！' : scorePercent >= 60 ? '继续加油！' : '再练习一下吧！'

    return (
      <View className={`practice-page ${pageClassName}`}>
        <View className="result-page">
          <View className="result-card">
            <Text className="result-title">练习完成！</Text>
            <Text className="result-score">{score} / {questions.length}</Text>
            <Text className="result-desc">{praise}</Text>
            <Text className="result-desc">正确率：{scorePercent}%</Text>
            <View className="result-actions">
              <View className="action-btn secondary" onClick={reset}>再练一次</View>
              <View className="action-btn" onClick={handleGoBack}>返回</View>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={`practice-page ${pageClassName}`}>
      <View className="content-scroll">
        {/* 进度条 */}
        <View className="progress-bar">
          <View
            className="progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
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
                  } ${showResult && isSelected && !isCorrect ? 'wrong' : ''}`}
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
          <View className="practice-btn secondary" onClick={handleGoBack}>返回</View>
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

export default PracticePage
