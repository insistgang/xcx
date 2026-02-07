/**
 * 圆角和边框 Design Tokens
 */

export const borders = {
  // 圆角系统
  radius: {
    none: 0,
    xs: 4,      // 极小圆角
    sm: 8,      // 小圆角
    md: 12,     // 中等圆角
    lg: 16,     // 大圆角
    xl: 20,     // 超大圆角
    full: 999,  // 完全圆角（圆形）
  },

  // 边框宽度
  width: {
    none: 0,
    hairline: 1,  // 极细边框
    thin: 2,       // 细边框
    medium: 3,     // 中等边框
    thick: 4,      // 粗边框
  },

  // 阴影系统 - 更柔和的阴影
  shadow: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.10)',
    xl: '0 12px 40px rgba(0, 0, 0, 0.12)',
    primary: '0 4px 16px rgba(91, 155, 213, 0.25)',
    success: '0 4px 16px rgba(111, 207, 151, 0.25)',
    warning: '0 4px 16px rgba(255, 184, 77, 0.25)',
    danger: '0 4px 16px rgba(255, 107, 107, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
  },
}

export default borders
