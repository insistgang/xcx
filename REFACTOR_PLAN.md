# AI语文助手小程序 - 重构计划

> 基于架构审计、UI/UX分析和代码重构分析生成的综合重构方案
>
> 生成时间: 2025-02-07

---

## 一、项目现状总结

### 1.1 技术栈
- **前端**: Taro 3.6.x + React 18
- **后端**: 微信云开发 (云函数 + 云数据库)
- **AI**: DeepSeek API

### 1.2 主要问题
| 问题类型 | 严重程度 | 具体描述 |
|---------|---------|---------|
| 代码冗余 | 高 | 4个练习页面代码重复度90% |
| 样式混乱 | 中 | 颜色值硬编码，rpx/px混用 |
| 未使用文件 | 中 | 2个扩展服务文件、2个初始化云函数 |
| 错误处理 | 低 | 缺乏统一的错误处理机制 |

---

## 二、架构审计报告摘要

### 2.1 待删除文件
```
src/services/question_extended.js      # 未被引用
src/services/question_extensions.js    # 未被引用
cloudfunctions/init-database/          # 初始化完成，可删除
cloudfunctions/init-questions/         # 初始化完成，可删除
```

### 2.2 代码重复识别
- **generateQuestions 函数**: 在 question.js 和 question_extensions.js 中重复
- **扩展数据格式**: EXTENDED_PINYIN、EXTENDED_VOCABULARY 等多处定义
- **admin 变量**: admin/styles/variables.less 与全局 variables.less 重复

### 2.3 依赖分析
- **缺失依赖**: deepseek-api (需添加)
- **现有依赖**: 均为必要依赖，无需移除

---

## 三、UI/UX 优化方案摘要

### 3.1 设计 Token 系统

#### 颜色系统 (colors.js)
```javascript
{
  // 主色调 - 统一为天蓝色
  primary: '#5B9BD5',

  // 功能模块色
  vocabulary: '#5B9BD5',    // 词汇
  literature: '#6C5CE7',     // 诗词
  idiom: '#FB923C',         // 成语
  pinyin: '#14B8A6',        // 拼音
  correction: '#EC4899',     // 病句

  // 状态色
  success: '#6FCF97',
  warning: '#FFB84D',
  danger: '#FF6B6B',
}
```

#### 间距系统 (spacing.js)
```javascript
{
  xs: 4,   sm: 8,   md: 16,   lg: 24,   xl: 32,   xxl: 48
}
```

#### 圆角系统 (borders.js)
```javascript
{
  sm: 4,   md: 8,   lg: 12,   xl: 16
}
```

### 3.2 通用组件封装计划

| 组件 | 优先级 | 描述 |
|-----|-------|------|
| Loading | P0 | 统一加载状态 |
| Empty | P0 | 统一空状态 |
| Button | P0 | 统一按钮样式 |
| QuestionCard | P1 | 统一题目卡片 |
| Tag | P1 | 统一标签样式 |

### 3.3 页面优化优先级

#### P0 (立即优化)
1. 统一颜色系统 - 移除硬编码颜色值
2. 修复首页样式冲突
3. 创建基础组件

#### P1 (短期优化)
1. 统一练习页面样式
2. 优化错题本颜色主题
3. 封装 QuestionCard 组件

---

## 四、代码重构方案摘要

### 4.1 自定义 Hooks 提取

#### usePractice Hook (核心)
```javascript
// src/hooks/usePractice.js
export const usePractice = (questionsData, practiceType) => {
  // 统一的练习状态管理
  // 答题逻辑
  // 收藏功能
  // 答题历史保存
}
```

**预期收益**: 代码重复率从 90% 降至 20%，单页面代码量从 400+ 行降至 50 行

#### useFavorites Hook
```javascript
// src/hooks/useFavorites.js
export const useFavorites = () => {
  // 收藏缓存管理
  // 加载收藏列表
  // 切换收藏状态
}
```

### 4.2 错误处理优化

```javascript
// src/utils/errorHandler.js
export class ErrorHandler {
  static handleCloudFunctionError(err, functionName)
  static showToast(message, type = 'error')
}
```

---

## 五、实施计划

### 第一阶段: 清理冗余 (1-2天)
**负责人**: Agent 2 (代码清理师)

| 任务 | 操作 | 风险 |
|-----|------|-----|
| 删除未使用的服务文件 | 删除 question_extended.js, question_extensions.js | 低 |
| 删除初始化云函数 | 删除 init-database, init-questions | 低 |
| 合并样式变量 | 合并 admin/styles/variables.less | 低 |

### 第二阶段: UI 统一 (3-5天)
**负责人**: Agent 3 (UI/UX 优化师)

| 任务 | 操作 | 风险 |
|-----|------|-----|
| 创建设计 Token | 新建 colors.js, spacing.js, borders.js | 低 |
| 创建基础组件 | Loading, Empty, Button 组件 | 中 |
| 修复颜色冲突 | 统一主色调为 #5B9BD5 | 低 |
| 优化首页样式 | 移除硬编码颜色 | 中 |

### 第三阶段: 代码重构 (5-7天)
**负责人**: Agent 4 (代码重构师)

| 任务 | 操作 | 风险 |
|-----|------|-----|
| 提取 usePractice Hook | 封装通用练习逻辑 | 高 |
| 重构 vocabulary 页面 | 使用新 Hook | 中 |
| 重构其他练习页面 | idiom, pinyin, correction | 中 |
| 统一错误处理 | ErrorHandler 类 | 中 |

### 第四阶段: 质量检测 (1-2天)
**负责人**: Agent 5 (质量检测师)

| 任务 | 检查项 |
|-----|-------|
| 功能完整性 | 所有页面路由正常 |
| 云函数验证 | 所有 action 正常 |
| 安全检查 | openid 验证 |
| 性能验证 | 无性能退化 |

---

## 六、执行规则

1. **分阶段执行**: 每阶段完成后提交 git commit
2. **功能优先**: 保证所有业务功能可用
3. **API 兼容**: 云函数入参出参格式不变
4. **可回滚**: 每个阶段独立分支，便于回滚

---

## 七、预期收益

### 代码质量
- 代码重复率: 90% → 20%
- 单页面代码量: 400+ 行 → 50 行
- 代码可维护性: 显著提升

### 开发效率
- 新增练习类型: 只需提供题库数据
- Bug 修复: 范围缩小，定位精准
- 开发效率: 提升 60%

### 用户体验
- UI 一致性: 显著改善
- 错误提示: 更友好
- 交互反馈: 更统一

---

## 八、风险与缓解

| 风险 | 级别 | 缓解措施 |
|-----|------|---------|
| 功能回归 | 中 | 每阶段充分测试 |
| 性能退化 | 低 | 性能基准对比 |
| 样式冲突 | 中 | 统一设计 Token |
| 云函数错误 | 低 | 保持 API 兼容 |

---

**下一步行动**: 请确认是否开始执行重构计划？
