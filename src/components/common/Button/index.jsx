/**
 * 通用按钮组件
 * 基于 Taro Button 封装，统一样式
 */
import { View, Text } from '@tarojs/components'
import './index.less'

export default function Button({
  children,
  type = 'primary',     // primary | secondary | danger | text
  size = 'default',     // small | default | large
  disabled = false,
  loading = false,
  block = false,
  full = false,
  round = false,
  plain = false,
  onClick,
  className = '',
  style = {},
}) {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  const classes = [
    'btn',
    `btn-${type}`,
    `btn-${size}`,
    disabled ? 'btn-disabled' : '',
    loading ? 'btn-loading' : '',
    block ? 'btn-block' : '',
    full ? 'btn-full' : '',
    round ? 'btn-round' : '',
    plain ? 'btn-plain' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <View className={classes} style={style} onClick={handleClick}>
      {loading && <View className='btn-loading-spinner'></View>}
      <Text className='btn-text'>{children}</Text>
    </View>
  )
}
