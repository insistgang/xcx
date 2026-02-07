/**
 * 统一错误处理工具
 * 提供一致的错误处理和用户提示
 */
import Taro from '@tarojs/taro'

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  NETWORK: 'network',           // 网络错误
  CLOUD_FUNCTION: 'cloud',      // 云函数错误
  VALIDATION: 'validation',     // 验证错误
  AUTH: 'auth',                 // 认证错误
  UNKNOWN: 'unknown'            // 未知错误
}

/**
 * 错误消息映射
 */
const ErrorMessages = {
  [ErrorTypes.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorTypes.CLOUD_FUNCTION]: '服务异常，请稍后重试',
  [ErrorTypes.VALIDATION]: '输入数据有误，请检查后重试',
  [ErrorTypes.AUTH]: '登录已过期，请重新登录',
  [ErrorTypes.UNKNOWN]: '操作失败，请重试'
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理错误并显示提示
   * @param {Error|string} error - 错误对象或消息
   * @param {string} context - 错误上下文（用于日志）
   * @param {string} type - 错误类型
   * @param {Object} options - 额外选项
   */
  static handle(error, context = '操作', type = ErrorTypes.UNKNOWN, options = {}) {
    const { showTip = true, log = true, duration = 2000 } = options

    // 获取错误消息
    const message = this.getErrorMessage(error, type)

    // 记录日志
    if (log) {
      this.logError(error, context, type)
    }

    // 显示提示
    if (showTip) {
      this.showToast(message, duration)
    }

    return message
  }

  /**
   * 处理云函数错误
   * @param {Error} error - 错误对象
   * @param {string} functionName - 云函数名称
   */
  static handleCloudFunctionError(error, functionName = '云函数') {
    return this.handle(
      error,
      `${functionName}调用失败`,
      ErrorTypes.CLOUD_FUNCTION,
      { log: true }
    )
  }

  /**
   * 处理网络错误
   * @param {Error} error - 错误对象
   * @param {string} context - 请求上下文
   */
  static handleNetworkError(error, context = '网络请求') {
    return this.handle(
      error,
      context,
      ErrorTypes.NETWORK,
      { log: true }
    )
  }

  /**
   * 获取错误消息
   * @param {Error|string} error - 错误对象或消息
   * @param {string} type - 错误类型
   * @returns {string} 错误消息
   */
  static getErrorMessage(error, type) {
    if (typeof error === 'string') {
      return error
    }

    if (error?.message) {
      return error.message
    }

    if (error?.errMsg) {
      return error.errMsg
    }

    return ErrorMessages[type] || ErrorMessages.UNKNOWN
  }

  /**
   * 记录错误日志
   * @param {Error|string} error - 错误对象或消息
   * @param {string} context - 错误上下文
   * @param {string} type - 错误类型
   */
  static logError(error, context, type) {
    const errorMsg = typeof error === 'string' ? error : error?.message || error?.errMsg || String(error)
    console.error(`[${context.toUpperCase()}]`, {
      type,
      message: errorMsg,
      timestamp: new Date().toISOString(),
      error
    })
  }

  /**
   * 显示错误提示
   * @param {string} message - 提示消息
   * @param {number} duration - 持续时间（毫秒）
   */
  static showToast(message, duration = 2000) {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration
    })
  }

  /**
   * 显示成功提示
   * @param {string} message - 提示消息
   * @param {number} duration - 持续时间（毫秒）
   */
  static showSuccess(message, duration = 1500) {
    Taro.showToast({
      title: message,
      icon: 'success',
      duration
    })
  }

  /**
   * 显示加载提示
   * @param {string} message - 提示消息
   */
  static showLoading(message = '加载中...') {
    Taro.showLoading({
      title: message,
      mask: true
    })
  }

  /**
   * 隐藏加载提示
   */
  static hideLoading() {
    Taro.hideLoading()
  }
}

/**
 * 快捷函数：处理错误
 */
export const handleError = (error, context, type) => {
  return ErrorHandler.handle(error, context, type)
}

/**
 * 快捷函数：处理云函数错误
 */
export const handleCloudError = (error, functionName) => {
  return ErrorHandler.handleCloudFunctionError(error, functionName)
}

/**
 * 快捷函数：显示成功提示
 */
export const showSuccess = (message) => {
  return ErrorHandler.showSuccess(message)
}

/**
 * 快捷函数：显示加载中
 */
export const showLoading = (message) => {
  return ErrorHandler.showLoading(message)
}

/**
 * 快捷函数：隐藏加载中
 */
export const hideLoading = () => {
  return ErrorHandler.hideLoading()
}

export default ErrorHandler
