/**
 * 间距系统 Design Tokens
 * 基于 4px 基准的倍数系统
 */

export const spacing = {
  // 基础间距 (4px 基准)
  xs: 4,      // 4px - 极小间距
  sm: 8,      // 8px - 小间距
  md: 16,     // 16px - 中等间距 (1x)
  lg: 24,     // 24px - 大间距 (1.5x)
  xl: 32,     // 32px - 超大间距 (2x)
  xxl: 48,    // 48px - 特大间距 (3x)
  xxxl: 64,   // 64px - 巨大间距 (4x)

  // 组件专用间距
  cardPadding: '24px',        // 卡片内边距
  buttonPadding: '0 24px',    // 按钮内边距
  inputPadding: '0 16px',     // 输入框内边距

  // 布局间距
  pagePadding: '16px',        // 页面边距
  sectionGap: '32px',         // 模块间距
  itemGap: '16px',            // 列表项间距
  rowGap: '12px',             // 行间距

  // 微件间距
  iconTextGap: '8px',         // 图标与文字间距
  textGap: '4px',             // 文字元素间距
}

export default spacing
