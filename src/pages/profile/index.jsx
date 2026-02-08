/**
 * 个人中心页面
 */
import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useDidShow, navigateTo, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useAuth } from '../../context/AuthContext'
import studyService from '../../services/study'
import adminService from '../../services/admin'
import eventBus, { EVENTS } from '../../utils/eventBus'
import { pageShareConfigs } from '../../utils/share'
import './index.less'

function Profile() {
  const { userInfo, logout, updateUserInfo } = useAuth()
  const [stats, setStats] = useState({
    totalDays: 0,
    totalScore: 0,
    totalQuestions: 0,
    correctRate: 0
  })
  const [achievements, setAchievements] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)

  // 成就配置（元数据）
  const ACHIEVEMENT_CONFIG = {
    beginner: { id: 'beginner', icon: '🏆', name: '初学者', desc: '完成首次答题' },
    week: { id: 'week', icon: '🎯', name: '连续7天', desc: '连续学习7天' },
    perfect: { id: 'perfect', icon: '⭐', name: '满分达人', desc: '获得10次满分' },
    master: { id: 'master', icon: '🎓', name: '学习大师', desc: '累计答题500题' },
    speed: { id: 'speed', icon: '⚡', name: '快手', desc: '累计答题100题' },
    bookworm: { id: 'bookworm', icon: '📚', name: '学霸', desc: '累计获得1000分' },
    scholar: { id: 'scholar', icon: '📖', name: '博学者', desc: '正确率90%且答题50题以上' }
  }

  useEffect(() => {
    loadAchievements()
  }, [stats])

  useDidShow(async () => {
    await loadStatistics()
    // 检查管理员权限
    const adminStatus = await adminService.checkAdmin()
    setIsAdmin(adminStatus)
  })

  // 监听学习记录更新事件（实现实时统计刷新）
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.STUDY_RECORD_UPDATED, () => {
      loadStatistics()
      loadAchievements()
    })

    return unsubscribe
  }, [])

  // 启用页面分享
  useShareAppMessage(() => {
    const title = userInfo?.nickname 
      ? `${userInfo.nickname}邀请你一起学习语文 📚`
      : pageShareConfigs.profile.title
    return {
      title,
      path: '/pages/home/index'
    }
  })

  // 启用朋友圈分享
  useShareTimeline(() => {
    return {
      title: pageShareConfigs.profile.title,
      query: ''
    }
  })

  const loadStatistics = async () => {
    try {
      const data = await studyService.getStatistics()
      setStats({
        totalDays: data.totalDays || 1,
        totalScore: data.totalScore || 0,
        totalQuestions: data.totalQuestions || 0,
        correctRate: data.correctRate || 0
      })
    } catch (err) {
      console.error('加载统计失败:', err)
    }
  }

  const loadAchievements = async () => {
    try {
      const data = await studyService.getAchievements()
      setAchievements(data)
    } catch (err) {
      console.error('加载成就失败:', err)
    }
  }

  // 获取成就列表（带状态）
  const getAchievementList = () => {
    return Object.values(ACHIEVEMENT_CONFIG).map(config => {
      const achievement = achievements[config.id] || {}
      return {
        ...config,
        unlocked: achievement.unlocked || false,
        progress: achievement.progress || '0%'
      }
    })
  }

  // 基础菜单项
  const baseMenuItems = [
    {
      id: 'record',
      title: '学习记录',
      icon: '📖',
      url: '/pages/study-record/index'
    },
    {
      id: 'report',
      title: '学习报告',
      icon: '📊',
      url: '/pages/study-report/index'
    },
    {
      id: 'analysis',
      title: '学习分析',
      icon: '📈',
      url: '/pages/study-analysis/index'
    },
    {
      id: 'share',
      title: '分享给好友',
      icon: '🔗',
      action: 'share'
    }
  ]

  // 管理员菜单项
  const adminMenuItem = {
    id: 'admin',
    title: '管理后台',
    icon: '🔐',
    url: '/pages/admin/index'
  }

  // 设置菜单项
  const settingsMenuItem = {
    id: 'settings',
    title: '设置',
    icon: '⚙️',
    action: 'settings'
  }

  // 动态菜单项（根据管理员状态）
  const menuItems = isAdmin
    ? [...baseMenuItems, adminMenuItem, settingsMenuItem]
    : [...baseMenuItems, settingsMenuItem]

  const handleMenuClick = (item) => {
    if (item.url) {
      navigateTo({ url: item.url })
    } else if (item.action === 'share') {
      // 分享功能 - 显示分享菜单
      Taro.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    } else if (item.action === 'settings') {
      // 设置功能
    }
  }

  const handleEditProfile = () => {
    // 编辑个人资料
  }

  return (
    <View className="profile-page fade-in">
      <ScrollView scrollY className="content-scroll">
        {/* 头部卡片 */}
        <View className="header-card">
          <View className="user-section">
            <View className="avatar">
              {userInfo?.avatar ? (
                <Image src={userInfo.avatar} className="avatar-img" />
              ) : (
                <Text className="avatar-placeholder">👤</Text>
              )}
            </View>
            <View className="user-info">
              <Text className="user-name">{userInfo?.nickname || '同学'}</Text>
              <Text className="user-desc">坚持学习第 {stats.totalDays} 天</Text>
            </View>
          </View>
        </View>

        {/* 统计数据 */}
        <View className="stats-section">
          <View className="stat-card">
            <Text className="stat-value">{stats.totalScore}</Text>
            <Text className="stat-label">总得分</Text>
          </View>
          <View className="stat-card">
            <Text className="stat-value">{stats.totalQuestions}</Text>
            <Text className="stat-label">做题数</Text>
          </View>
          <View className="stat-card">
            <Text className="stat-value">{stats.correctRate}%</Text>
            <Text className="stat-label">正确率</Text>
          </View>
        </View>

        {/* 成就展示 */}
        <View className="achievement-section">
          <View className="section-header">
            <Text className="section-title">我的成就</Text>
          </View>
          <View className="achievement-list">
            {getAchievementList().map((achievement) => (
              <View
                key={achievement.id}
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : ''}`}
              >
                <Text className="achievement-icon">{achievement.icon}</Text>
                <View className="achievement-info">
                  <Text className="achievement-name">{achievement.name}</Text>
                  <Text className="achievement-progress">{achievement.progress}</Text>
                </View>
                {achievement.unlocked && (
                  <View className="achievement-badge">
                    <Text className="badge-text">✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 功能菜单 */}
        <View className="menu-section">
          {menuItems.map((item, index) => (
            <View
              key={item.id}
              className="menu-item"
              onClick={() => handleMenuClick(item)}
            >
              <View className="menu-left">
                <View className="menu-icon">
                  <Text>{item.icon}</Text>
                </View>
                <Text className="menu-title">{item.title}</Text>
              </View>
              <Text className="menu-arrow">›</Text>
            </View>
          ))}
        </View>

        {/* 退出登录 */}
        <View className="logout-section">
          <View className="logout-btn" onClick={logout}>
            退出登录
          </View>
        </View>

        {/* 底部留白 */}
        <View style={{ height: '40px' }} />
      </ScrollView>
    </View>
  )
}

export default Profile
