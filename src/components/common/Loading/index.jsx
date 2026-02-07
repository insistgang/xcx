/**
 * 通用加载组件
 * 统一的加载状态展示
 */
import { View, Text } from '@tarojs/components'
import { View as TaroView } from '@tarojs/components'
import './index.less'

export default function Loading({
  size = 'default', // small | default | large
  text = '加载中...',
  visible = true,
  fullScreen = false,
}) {
  if (!visible) return null

  return (
    <View className={`loading-container loading-${size} ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <View className='loading-spinner'>
        <View className='spinner-dot'></View>
        <View className='spinner-dot'></View>
        <View className='spinner-dot'></View>
      </View>
      {text && <Text className='loading-text'>{text}</Text>}
    </View>
  )
}
