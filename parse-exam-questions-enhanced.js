const fs = require('fs');
const path = require('path');

// 读取所有markdown文件
const files = [
  'k12_md/2020_chinese.md',
  'k12_md/2021_chinese.md',
  'k12_md/2022_chinese.md',
  'k12_md/2023_chinese.md',
  'k12_md/2024_chinese.md'
];

const result = {
  pinyin: [],
  vocabulary: [],
  idiom: [],
  correction: [],
  literature: []
};

// 辅助函数：判断题目类型
function classifyQuestion(text, number) {
  const lowerText = text.toLowerCase();

  // 第一部分：语文知识 (1-10题)
  if (number >= 1 && number <= 10) {
    // 题目1: 读音题
    if (number === 1) {
      return 'pinyin';
    }
    // 题目2: 书写题
    if (number === 2) {
      return 'vocabulary';
    }
    // 题目3: 选词填空
    if (number === 3) {
      return 'vocabulary';
    }
    // 题目4: 熟语使用
    if (number === 4) {
      return 'idiom';
    }
    // 题目5: 成语使用
    if (number === 5) {
      return 'idiom';
    }
    // 题目6: 语病题
    if (number === 6) {
      return 'correction';
    }
    // 题目10: 作家作品 (文学常识)
    if (number === 10) {
      return 'literature';
    }
  }

  // 第二部分：现代文阅读 (11-18题)
  if (number >= 11 && number <= 18) {
    // 题目11: 读音题
    if (number === 11) {
      return 'pinyin';
    }
    // 题目12: 词语解释
    if (number === 12) {
      return 'vocabulary';
    }
  }

  // 第三部分：古诗文阅读 (19-24题)
  if (number >= 19 && number <= 24) {
    // 题目19: 注音题
    if (number === 19) {
      return 'pinyin';
    }
    // 题目20: 词语解释
    if (number === 20) {
      return 'vocabulary';
    }
  }

  // 通过关键词判断
  // pinyin (拼音题): 加点字读音、多音字辨析
  if (lowerText.includes('读音') || lowerText.includes('加点字') ||
      lowerText.includes('注音') || lowerText.includes('拼音')) {
    return 'pinyin';
  }

  // vocabulary (词汇题): 词语书写、错别字辨析、选词填空、词语解释
  if (lowerText.includes('书写') || lowerText.includes('错别字') ||
      lowerText.includes('填入') && lowerText.includes('横线') ||
      lowerText.includes('词语在文中意思') || lowerText.includes('词语解释')) {
    return 'vocabulary';
  }

  // idiom (成语题): 成语使用、熟语使用
  if (lowerText.includes('成语') || lowerText.includes('熟语')) {
    return 'idiom';
  }

  // correction (病句题): 语病判断、修改病句
  if (lowerText.includes('语病') || lowerText.includes('病句')) {
    return 'correction';
  }

  // literature (古诗词/文学): 古诗词填空、作者作品、文学常识
  if (lowerText.includes('作家') || lowerText.includes('作品') ||
      lowerText.includes('诗词') || lowerText.includes('文学') ||
      lowerText.includes('古诗文') || lowerText.includes('古文')) {
    return 'literature';
  }

  return null;
}

// 解析题目内容
function parseQuestions(content) {
  const lines = content.split('\n');
  const questions = [];
  let year = null;

  // 提取年份
  const yearMatch = content.match(/# (\d{4})/);
  if (yearMatch) {
    year = yearMatch[1];
  }

  let currentQuestion = null;
  let optionBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 匹配题目开始（多种格式）
    // 格式1: 1. [cite_start]下列各组词语...
    // 格式2: 1. 下列各组词语...
    // 格式3: 11. 下列加点字...
    const questionMatch1 = line.match(/^(\d+)\.\s*\[cite_start\](.+?)(?:\[cite:\d+\])?\s*$/);
    const questionMatch2 = line.match(/^(\d+)\.\s*(.+[（\(].*?[）\)]$)/);
    const questionMatch3 = line.match(/^(\d+)\.\s*(.+[是不的一项是].+?[（\(].*?[）\)]$)/);

    const questionMatch = questionMatch1 || questionMatch2 || questionMatch3;

    if (questionMatch) {
      // 保存上一个问题
      if (currentQuestion && currentQuestion.type) {
        currentQuestion.options = [...optionBuffer];
        questions.push(currentQuestion);
      }

      const questionNumber = parseInt(questionMatch[1]);
      let questionText = questionMatch[2];

      // 清理题目文本
      questionText = questionText.replace(/\[cite:\d+\]/g, '').trim();

      const type = classifyQuestion(questionText, questionNumber);

      optionBuffer = [];

      if (type) {
        currentQuestion = {
          id: `${type}_${year}_${String(questionNumber).padStart(3, '0')}`,
          question: questionText,
          options: [],
          correctAnswer: null,
          analysis: '',
          questionNumber: questionNumber,
          type: type,
          year: year
        };
      } else {
        currentQuestion = null;
      }

      // 继续读取选项
      let j = i + 1;
      let foundFirstOption = false;
      let emptyLineCount = 0;

      while (j < lines.length && j < i + 15) {
        const optionLine = lines[j].trim();

        // 匹配选项 A. B. C. D.
        const optionMatch = optionLine.match(/^([A-D])\.\s*(.+)$/);
        if (optionMatch && currentQuestion) {
          optionBuffer.push(optionMatch[2].trim());
          foundFirstOption = true;
          j++;
          emptyLineCount = 0;
        } else if (optionLine === '') {
          emptyLineCount++;
          j++;
          // 如果找到过选项，又遇到空行，可能选项结束了
          if (foundFirstOption && emptyLineCount > 1) {
            break;
          }
        } else {
          // 遇到非选项非空行，停止
          if (foundFirstOption) {
            break;
          }
          j++;
        }
      }

      i = j - 1; // 调整循环索引
    }
  }

  // 保存最后一个问题
  if (currentQuestion && currentQuestion.type) {
    currentQuestion.options = [...optionBuffer];
    questions.push(currentQuestion);
  }

  return questions;
}

// 处理所有文件
files.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
  const questions = parseQuestions(content);

  console.log(`\n处理文件: ${file}`);
  console.log(`找到题目: ${questions.length} 题`);

  questions.forEach(q => {
    if (q.type && result[q.type]) {
      result[q.type].push({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        analysis: q.analysis
      });
    }
  });
});

// 输出统计信息
console.log('\n========== 分类统计 ==========');
console.log(`pinyin (拼音题): ${result.pinyin.length} 题`);
console.log(`vocabulary (词汇题): ${result.vocabulary.length} 题`);
console.log(`idiom (成语题): ${result.idiom.length} 题`);
console.log(`correction (病句题): ${result.correction.length} 题`);
console.log(`literature (文学题): ${result.literature.length} 题`);

// 保存结果
fs.writeFileSync(
  path.join(__dirname, 'exam_questions_parsed.json'),
  JSON.stringify(result, null, 2),
  'utf-8'
);

console.log('\n结果已保存到: exam_questions_parsed.json');

// 输出一些示例题目
console.log('\n========== 示例题目 ==========');
console.log('\n【拼音题示例】');
if (result.pinyin.length > 0) {
  console.log(JSON.stringify(result.pinyin[0], null, 2));
}

console.log('\n【词汇题示例】');
if (result.vocabulary.length > 0) {
  console.log(JSON.stringify(result.vocabulary[0], null, 2));
}

console.log('\n【成语题示例】');
if (result.idiom.length > 0) {
  console.log(JSON.stringify(result.idiom[0], null, 2));
}
