## 执行启动提示词

```markdown
我确认执行重构计划。请严格按照 REFACTOR_PLAN.md 的四阶段方案执行。

## 当前阶段：第一阶段 - 清理冗余文件

**执行要求：**
1. 先读取当前项目完整结构，确认 REFACTOR_PLAN.md 中标记的待删除文件
2. 执行删除前，列出清单让我确认（截图式确认）
3. 每完成一个步骤，git commit 一次，message 格式："refactor(phase1): [操作描述]"
4. 保持业务代码完整，只删除确认无用的文件

**本阶段具体操作清单：**

### Step 1: 删除未使用的服务文件
目标文件：
- src/services/question_extended.js
- src/services/question_extensions.js

操作：
- [ ] 确认这两个文件未被任何页面 import
- [ ] 确认云函数中未引用这两个文件
- [ ] 删除文件
- [ ] git commit -m "refactor(phase1): remove unused service extensions"

### Step 2: 删除初始化云函数
目标：
- cloudfunctions/init-database/
- cloudfunctions/init-questions/

操作：
- [ ] 确认生产环境已无需初始化（数据已导入）
- [ ] 删除两个云函数目录
- [ ] 检查 project.config.json 中是否引用（如有则移除）
- [ ] git commit -m "refactor(phase1): remove init cloud functions"

### Step 3: 合并样式变量
目标：
- 合并 admin/styles/variables.less 到 src/styles/variables.less

操作：
- [ ] 对比两个文件，提取 admin 特有的变量
- [ ] 合并到全局 variables.less，添加注释标记 admin 区域
- [ ] 修改 admin 页面引用路径指向全局变量文件
- [ ] 删除 admin/styles/variables.less
- [ ] git commit -m "refactor(phase1): merge admin variables to global"

**阶段完成检查点：**
- [ ] 运行 npm run dev:weapp 无报错
- [ ] 首页、练习页、错题本、个人中心能正常打开
- [ ] 云函数列表无缺失（除了删除的 init）

完成本阶段后，输出：
1. 删除的文件清单
2. 剩余项目结构树（src/ 和 cloudfunctions/）
3. 确认进入第二阶段的指令

---

**重要规则：**
1. 每步操作前说"准备执行 [操作]，确认？"，等我回复"确认"再执行
2. 禁止一次性删除多个文件，逐个处理
3. 遇到引用关系复杂的文件，暂停并询问处理方案
4. 保留原始代码备份在 .refactor-backup/ 目录（按日期组织）
```

---

## 第二阶段启动提示词（第一阶段完成后使用）

```markdown
第一阶段完成，确认进入第二阶段：UI 统一与 Design Token 建设。

**本阶段目标：**
建立统一的设计系统，消除硬编码样式，创建可复用组件。

**执行步骤：**

### Step 1: 创建 Design Tokens
创建文件：
- src/styles/tokens/colors.js
- src/styles/tokens/spacing.js  
- src/styles/tokens/borders.js
- src/styles/tokens/index.js（统一导出）

要求：
- 使用 JavaScript 对象导出，方便 JS 和 LESS 共享
- colors.js 包含 REFACTOR_PLAN.md 中定义的主色调 #5B9BD5 及功能色
- spacing.js 使用 4 的倍数系统（4, 8, 16, 24, 32, 48）
- borders.js 定义圆角规范（4, 8, 12, 16）

### Step 2: 创建基础组件（P0）

在 src/components/common/ 下创建：

1. **Loading/index.jsx**
   - Props: size('small'|'default'|'large'), text(string)
   - 使用 Taro 的 Loading 组件封装，统一颜色为 primary

2. **Empty/index.jsx**  
   - Props: description(string), image(string|node)
   - 统一空状态插画和文字

3. **Button/index.jsx**
   - Props: type('primary'|'secondary'|'danger'), size, loading, disabled
   - 基于 Taro Button 封装，统一圆角 8px，主色 #5B9BD5

4. **QuestionCard/index.jsx**
   - Props: question(object), showOptions(bool), onSelect(func)
   - 统一题目展示卡片，选项按钮高度 88px，点击反馈动画

### Step 3: 替换首页硬编码颜色
修改 src/pages/home/index.less：
- 将分散的颜色值替换为引用 tokens/colors.js
- 使用 spacing.js 替换硬编码 margin/padding

### Step 4: 修复练习页样式冲突
修改 src/pages/vocabulary/, idiom/, pinyin/, correction/ 的 index.less：
- 统一使用新的 design tokens
- 统一选项按钮样式
- 统一底部操作栏高度和位置

**检查点：**
每完成一个组件，在 home 或 vocabulary 页面试用并截图给我看。
每完成一个页面，git commit -m "refactor(phase2): [描述]"

**禁止事项：**
- 不要修改云函数逻辑
- 不要修改业务逻辑（答题逻辑、计分逻辑）
- 不要删除旧组件，先新建并替换引用，确认无误后再删除旧文件
```

---

## 第三阶段启动提示词（第二阶段完成后使用）

```markdown
第二阶段完成，确认进入第三阶段：代码重构与 Hooks 提取。

**核心任务：提取 usePractice Hook，重构四个练习页面。**

**执行策略：**

### Step 1: 提取 usePractice Hook

创建 src/hooks/usePractice.js，封装以下逻辑：
- 题目加载（从云函数获取）
- 答题状态管理（currentIndex, answers, score）
- 收藏功能集成
- 答题历史保存（调用 question/submitBatch）
- 练习完成后的统计更新

接口设计：
```javascript
const usePractice = (type, difficulty, count) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  
  const submitAnswer = (questionId, answer) => {...};
  const toggleFavorite = (questionId) => {...};
  const finishPractice = async () => {...};
  const reset = () => {...};
  
  return {
    questions, currentIndex, answers, loading, finished,
    currentQuestion: questions[currentIndex],
    progress: `${currentIndex + 1}/${questions.length}`,
    submitAnswer, toggleFavorite, finishPractice, reset
  };
};
```

### Step 2: 重构 vocabulary 页面（试点）

将 src/pages/vocabulary/index.jsx 重构为使用 usePractice：
- 原 400+ 行代码压缩至 50 行以内
- 只保留 UI 渲染逻辑
- 业务逻辑全部移入 Hook

重构后检查：
- [ ] 能正常加载题目
- [ ] 能正常答题和提交
- [ ] 能正常收藏/取消收藏
- [ ] 完成后正确保存到 answer_history

### Step 3: 批量重构其他练习页面

使用相同的 Hook 重构：
- src/pages/idiom/index.jsx
- src/pages/pinyin/index.jsx  
- src/pages/correction/index.jsx

验证四个页面行为一致。

### Step 4: 统一错误处理

创建 src/utils/errorHandler.js：
```javascript
export const handleError = (error, context) => {
  console.error(`[${context}]`, error);
  Taro.showToast({
    title: error.message || '操作失败，请重试',
    icon: 'none',
    duration: 2000
  });
};
```

替换所有页面的 try-catch 中的错误处理为使用此函数。

**关键检查点：**
- 重构 vocabulary 后必须完全测试通过才能继续其他页面
- 对比重构前后代码行数，确保减少 70% 以上
- 确保云函数调用参数格式不变（保证兼容性）

**Git 提交策略：**
- 重构 vocabulary: "refactor(phase3): extract usePractice hook & rewrite vocabulary page"
- 重构其他页面: "refactor(phase3): apply usePractice to idiom/pinyin/correction"
- 错误处理: "refactor(phase3): unify error handling"
```

---

## 第四阶段启动提示词（第三阶段完成后使用）

```markdown
第三阶段完成，确认进入第四阶段：质量检测与性能验证。

**测试清单：**

### 功能回归测试
逐项验证并输出结果（通过/失败）：

**认证流程：**
- [ ] 登录页正常显示，隐私协议勾选逻辑正常
- [ ] 登录后获取 openid 正确，存储到本地

**学习功能：**
- [ ] 首页显示学习统计（今日学习、连续天数）
- [ ] 词汇学习：加载题目、答题、显示解析、收藏正常
- [ ] 成语学习：同上
- [ ] 拼音学习：同上  
- [ ] 病句纠错：同上

**考试与练习：**
- [ ] 模拟考试：倒计时正常，交卷后评分正确
- [ ] 错题本：显示错题，可重新练习，移除错题正常
- [ ] 收藏夹：显示收藏题目，取消收藏实时更新

**AI 功能：**
- [ ] AI 助手能正常对话，流式输出正常
- [ ] 文本批改功能正常

**数据持久化：**
- [ ] 答题记录在 answer_history 集合中可查
- [ ] 学习记录在 study_records 集合中可查

### 性能检查
- [ ] 首页首屏加载时间 < 2s
- [ ] 练习页切换题目无卡顿
- [ ] 云函数调用成功率 100%（测试 10 次）

### 安全检查
- [ ] 所有云函数验证 openid（防止伪造）
- [ ] 删除的 init 云函数不再出现在部署列表

### 输出报告
生成 REFACTOR_REPORT.md，包含：
1. 重构前后代码量对比（行数、文件数）
2. 删除文件清单
3. 新增文件清单（design tokens、hooks、components）
4. 性能对比数据
5. 遗留问题清单（如有）

最终确认：项目可部署生产环境。
```
