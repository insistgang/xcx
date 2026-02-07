/**
 * 通用空状态组件
 */
import { View, Text, Image } from '@tarojs/components'
import './index.less'

export default function Empty({
  icon = '',
  text = '暂无数据',
  description = '',
  action = null,
}) {
  return (
    <View className='empty-container'>
      {icon && (
        icon.startsWith('/') || icon.startsWith('http') ? (
          <Image src={icon} className='empty-image' mode='aspectFit' />
        ) : (
          <Text className='empty-icon'>{icon}</Text>
        )
      )}
      <Text className='empty-text'>{text}</Text>
      {description && <Text className='empty-desc'>{description}</Text>}
      {action && <View className='empty-action'>{action}</View>}
    </View>
  )
}
