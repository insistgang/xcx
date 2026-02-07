/**
 * 统一题目卡片组件
 * 用于练习页面展示题目和选项
 */
import { View, Text } from '@tarojs/components'
import './index.less'

export default function QuestionCard({
  question = {},
  currentIndex = 0,
  totalCount = 0,
  showAnswer = false,
  selectedAnswer = null,
  onAnswerSelect = null,
  onToggleFavorite = null,
  isFavorited = false,
}) {
  const {
    id,
    type = '',
    question: questionText = '',
    options = [],
    explanation = '',
  } = question

  // 获取选项字母
  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index) // A, B, C, D...
  }

  // 判断选项状态
  const getOptionClass = (index) => {
    const isSelected = selectedAnswer === index
    const isCorrect = options[index]?.isCorrect || options[index]?.correct

    let classes = ['option-item']

    if (showAnswer) {
      if (isCorrect) {
        classes.push('option-correct')
      } else if (isSelected && !isCorrect) {
        classes.push('option-wrong')
      }
    } else if (isSelected) {
      classes.push('option-selected')
    }

    return classes.join(' ')
  }

  return (
    <View className='question-card'>
      {/* 题目头部 */}
      <View className='question-header'>
        <View className='question-progress'>
          第 {currentIndex + 1} / {totalCount} 题
        </View>
        {onToggleFavorite && (
          <View
            className={`question-favorite ${isFavorited ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(id)}
          >
            <Text className='favorite-icon'>{isFavorited ? '★' : '☆'}</Text>
          </View>
        )}
      </View>

      {/* 题目内容 */}
      <View className='question-content'>
        <Text className='question-text'>{questionText}</Text>
      </View>

      {/* 选项列表 */}
      {options.length > 0 && (
        <View className='options-list'>
          {options.map((option, index) => (
            <View
              key={index}
              className={getOptionClass(index)}
              onClick={() => !showAnswer && onAnswerSelect && onAnswerSelect(index)}
            >
              <View className='option-label'>
                <Text className='option-label-text'>{getOptionLabel(index)}</Text>
              </View>
              <View className='option-content'>
                <Text className='option-text'>{option.text || option.content || option}</Text>
              </View>
              {showAnswer && option.isCorrect && (
                <View className='option-icon'>
                  <Text className='icon-check'>✓</Text>
                </View>
              )}
              {showAnswer && selectedAnswer === index && !option.isCorrect && (
                <View className='option-icon'>
                  <Text className='icon-cross'>✗</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 解析 */}
      {showAnswer && explanation && (
        <View className='question-explanation'>
          <Text className='explanation-label'>解析：</Text>
          <Text className='explanation-text'>{explanation}</Text>
        </View>
      )}
    </View>
  )
}
