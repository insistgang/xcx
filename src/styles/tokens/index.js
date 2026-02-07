/**
 * Design Tokens 统一导出
 * 用于 JS 和 LESS 共享的设计变量
 */

export { default as colors } from './colors'
export { default as spacing } from './spacing'
export { default as borders } from './borders'

// 默认导出所有 tokens
export default {
  colors: require('./colors').default,
  spacing: require('./spacing').default,
  borders: require('./borders').default,
}
