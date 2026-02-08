/**
 * 统一日志系统
 * 生产环境可以禁用日志输出
 */
import Taro from '@tarojs/taro'

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

// 当前日志级别 - 可通过环境变量配置
const CURRENT_LEVEL = LogLevel.WARN

/**
 * 日志工具类
 */
class Logger {
  /**
   * 获取当前环境
   */
  static get isDev() {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * 获取调用堆栈信息
   */
  static getCallerInfo() {
    const stack = new Error().stack
    const callerLine = stack?.split('\n')[3]?.trim()
    return callerLine || ''
  }

  /**
   * 格式化日志消息
   */
  static format(level, tag, message, ...args) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
    const prefix = `[${timestamp}] [${level}] [${tag}]`
    return { prefix, message, args }
  }

  /**
   * 输出日志
   */
  static log(level, levelName, tag, message, ...args) {
    if (level < CURRENT_LEVEL) return

    const { prefix } = this.format(levelName, tag, message)

    // 开发环境使用 console，生产环境可上报
    if (this.isDev) {
      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(prefix, message, ...args)
          break
        case LogLevel.WARN:
          console.warn(prefix, message, ...args)
          break
        case LogLevel.ERROR:
          console.error(prefix, message, ...args)
          break
      }
    }
  }

  /**
   * 调试日志 - 仅开发环境
   */
  static debug(tag, message, ...args) {
    this.log(LogLevel.DEBUG, 'DEBUG', tag, message, ...args)
  }

  /**
   * 信息日志
   */
  static info(tag, message, ...args) {
    this.log(LogLevel.INFO, 'INFO', tag, message, ...args)
  }

  /**
   * �告日志
   */
  static warn(tag, message, ...args) {
    this.log(LogLevel.WARN, 'WARN', tag, message, ...args)
  }

  /**
   * 错误日志
   */
  static error(tag, message, ...args) {
    this.log(LogLevel.ERROR, 'ERROR', tag, message, ...args)
  }

  /**
   * 云函数调用日志
   */
  static cloudFunction(name, action, data = {}) {
    this.debug('CloudFunction', `${name}/${action}`, data)
  }

  /**
   * 云函数调用失败日志
   */
  static cloudFunctionError(name, action, error) {
    this.warn('CloudFunction', `${name}/${action} failed:`, error?.message || error)
  }

  /**
   * 数据库操作日志
   */
  static db(operation, collection, data = {}) {
    this.debug('DB', `${operation} ${collection}`, data)
  }

  /**
   * 用户行为日志
   */
  static userAction(action, detail = {}) {
    this.info('UserAction', action, detail)
  }

  /**
   * 页面生命周期日志
   */
  static lifecycle(page, event, data = {}) {
    this.debug('Lifecycle', `${page}.${event}`, data)
  }

  /**
   * 性能日志
   */
  static performance(metric, value) {
    this.debug('Performance', `${metric}: ${value}ms`)
  }

  /**
   * 设置日志级别
   */
  static setLevel(level) {
    if (typeof level === 'string') {
      CURRENT_LEVEL = LogLevel[level.toUpperCase()] || LogLevel.WARN
    } else {
      CURRENT_LEVEL = level
    }
  }
}

// 导出便捷函数
export const logger = Logger

export default Logger
