/**
 * 登录页面
 */
import { useState } from 'react'
import { View, Button, Input, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useAuth } from '../../context/AuthContext'
import './index.less'

function Login() {
  const { isLogin, login, register } = useAuth()
  const [mode, setMode] = useState('login') // login | register
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    // 如果已登录，跳转到首页（使用 switchTab 因为首页是 tabBar 页面）
    if (isLogin) {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  })

  /**
   * 微信授权登录
   */
  const handleWechatLogin = async () => {
    try {
      setLoading(true)
      const result = await login()

      // 如果需要注册，切换到注册模式
      if (result && result.needRegister) {
        setMode('register')
        setLoading(false)
        return
      }

      // 登录成功，使用 switchTab 跳转（首页是 tabBar 页面）
      Taro.switchTab({ url: '/pages/home/index' })
    } catch (err) {
      console.error('登录失败:', err)
      setLoading(false)
      Taro.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }
  }

  /**
   * 选择头像
   */
  const handleChooseAvatar = (e) => {
    const { avatarUrl } = e.detail
    setAvatarUrl(avatarUrl)
  }

  /**
   * 昵称输入
   */
  const handleNicknameInput = (e) => {
    setNickname(e.detail.value)
  }

  /**
   * 完成注册（设置昵称）
   */
  const handleRegister = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    try {
      setLoading(true)
      await register(nickname.trim(), avatarUrl)
      // 使用 switchTab 跳转（首页是 tabBar 页面）
      Taro.switchTab({ url: '/pages/home/index' })
    } catch (err) {
      console.error('注册失败:', err)
      Taro.showToast({
        title: err.message || '注册失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      {/* Logo 区域 */}
      <View className="logo-section">
        <View className="logo">📚</View>
        <View className="app-name">AI 语文助手</View>
        <View className="app-desc">智能学习，高效提升</View>
      </View>

      {/* 表单区域 */}
      <View className="form-section">
        {mode === 'login' ? (
          <>
            <Button
              className="btn-wechat"
              onClick={handleWechatLogin}
              loading={loading}
              disabled={loading}
            >
              <View className="btn-icon">🔐</View>
              微信授权登录
            </Button>

            <View className="form-tips">
              登录即表示同意《用户协议》和《隐私政策》
            </View>
          </>
        ) : (
          <>
            {/* 头像选择 */}
            <View className="avatar-section">
              <Button
                className="avatar-wrapper"
                openType="chooseAvatar"
                onChooseAvatar={handleChooseAvatar}
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} className="avatar-img" mode="aspectFill" />
                ) : (
                  <View className="avatar-placeholder">📷</View>
                )}
              </Button>
              <View className="avatar-tip">点击选择头像</View>
            </View>

            {/* 昵称输入 */}
            <View className="form-item">
              <Input
                className="form-input"
                type="nickname"
                placeholder="请输入昵称"
                value={nickname}
                onInput={handleNicknameInput}
                maxlength={20}
              />
            </View>

            <Button
              className="btn-primary"
              onClick={handleRegister}
              loading={loading}
              disabled={loading || !nickname.trim()}
            >
              完成注册
            </Button>
          </>
        )}

        {mode === 'login' && (
          <View className="form-switch">
            <View className="switch-link" onClick={() => setMode('register')}>
              还没有账号？去注册
            </View>
          </View>
        )}
      </View>

      {/* 功能介绍 */}
      <View className="features">
        <View className="feature-item">
          <View className="feature-icon">📖</View>
          <View className="feature-text">词汇诗词</View>
        </View>
        <View className="feature-item">
          <View className="feature-icon">✍️</View>
          <View className="feature-text">练习题库</View>
        </View>
        <View className="feature-item">
          <View className="feature-icon">🤖</View>
          <View className="feature-text">AI 辅导</View>
        </View>
        <View className="feature-item">
          <View className="feature-icon">📊</View>
          <View className="feature-text">学习分析</View>
        </View>
      </View>
    </View>
  )
}

export default Login
