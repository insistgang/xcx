/**
 * 颜色系统 Design Tokens
 * AI语文助手 - 统一配色方案
 */

export const colors = {
  // 主色调系统 - 采用更柔和的教育配色
  primary: '#5B9BD5',        // 主色调 - 温柔的天蓝色
  primaryLight: '#E8F4FD',    // 主色浅色背景
  primaryLighter: '#F0F9FF',  // 主色极浅背景
  primaryDark: '#4A7CA7',     // 主色深色
  primaryGradient: 'linear-gradient(135deg, #5B9BD5 0%, #7FA8D9 100%)',

  // 管理后台专用色
  adminPrimary: '#4A90E2',    // 管理后台主色调

  // 功能状态色
  success: '#6FCF97',         // 成功色 - 柔和的绿色
  successLight: '#E8F8EE',
  successGradient: 'linear-gradient(135deg, #6FCF97 0%, #8ED9AB 100%)',

  warning: '#FFB84D',         // 警告色 - 温暖的橙色
  warningLight: '#FFF7E8',
  warningGradient: 'linear-gradient(135deg, #FFB84D 0%, #FFCA70 100%)',

  danger: '#FF6B6B',          // 危险色 - 柔和的红色
  dangerLight: '#FFE8E8',
  dangerGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8A8A 100%)',

  info: '#6C5CE7',            // 信息色 - 紫色（用于诗词）
  infoLight: '#F0EEFF',
  infoGradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',

  // 学习模块色系
  vocabulary: '#5B9BD5',      // 词汇 - 天蓝色
  literature: '#6C5CE7',      // 诗词 - 紫色
  idiom: '#FB923C',           // 成语 - 橙色
  pinyin: '#14B8A6',          // 拼音 - 青色
  correction: '#EC4899',      // 病句 - 粉色

  // 扩展色系
  purple: '#A78BFA',          // 主题紫
  purpleLight: '#F3E8FF',
  orange: '#FB923C',          // 主题橙
  orangeLight: '#FFEDD5',
  teal: '#14B8A6',            // 主题青
  tealLight: '#CCFBF1',
  pink: '#EC4899',            // 主题粉
  pinkLight: '#FCE7F3',

  // 文字颜色系统
  textPrimary: '#1F2937',     // 主要文字 - 深灰（非纯黑）
  textSecondary: '#6B7280',   // 次要文字 - 中灰
  textTertiary: '#9CA3AF',    // 辅助文字 - 浅灰
  textPlaceholder: '#D1D5DB', // 占位符
  textDisabled: '#E5E7EB',    // 禁用状态
  textInverse: '#FFFFFF',     // 反色文字（白色）
  textGradient: 'linear-gradient(135deg, #5B9BD5 0%, #6C5CE7 100%)',

  // 背景色系统
  bgPrimary: '#F8FAFC',       // 页面背景 - 极浅蓝灰
  bgDark: '#F1F5F9',          // 深色背景
  bgSecondary: '#FFFFFF',     // 次级背景
  bgTertiary: '#F3F4F6',      // 三级背景
  bgHover: '#F9FAFB',         // 悬停背景

  // 边框色系统
  border: '#E5E7EB',          // 基础边框
  borderLight: '#F3F4F6',     // 浅色边框
  borderLighter: '#F9FAFB',   // 极浅边框
  divider: '#E5E7EB',         // 分割线

  // 阴影色
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowPrimary: 'rgba(91, 155, 213, 0.25)',
  shadowSuccess: 'rgba(111, 207, 151, 0.25)',
  shadowWarning: 'rgba(255, 184, 77, 0.25)',
  shadowDanger: 'rgba(255, 107, 107, 0.25)',
}

export default colors
