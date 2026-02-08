/**
 * K12 题目导入工具
 * 从 k12_md 文件夹中解析题目并生成题库数据
 *
 * 使用方法：
 * 1. 确保所有 markdown 文件都在 k12_md 文件夹中
 * 2. 运行此脚本生成题目数据
 * 3. 将生成的数据复制到 src/data/k12Questions.js
 */

const fs = require('fs');
const path = require('path');

const K12_MD_FOLDER = path.join(__dirname, '../k12_md');
const OUTPUT_FILE = path.join(__dirname, '../src/data/k12Questions-imported.js');

/**
 * 解析单个 markdown 文件
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const questions = {
    pinyin: [],
    vocabulary: [],
    idiom: [],
    correction: [],
    literature: [],
    reading: [],
    ancient: []
  };

  let currentQuestion = null;
  let questionNumber = 0;
  let inReadingSection = false;
  let inAncientSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 跳过空行和标题
    if (!line || line.startsWith('#') || line.startsWith('##')) {
      // 检测阅读部分
      if (line.includes('现代文阅读') || line.includes('阅读材料')) {
        inReadingSection = true;
        inAncientSection = false;
      } else if (line.includes('古文') || line.includes('文言文') || line.includes('古诗')) {
        inAncientSection = true;
        inReadingSection = false;
      }
      continue;
    }

    // 检测题目开始 (如 "1. " 或 "11. ")
    const questionMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (questionMatch) {
      questionNumber = parseInt(questionMatch[1]);
      const questionText = questionMatch[2];

      // 判断题型
      if (questionText.includes('读音') || questionText.includes('拼音')) {
        currentQuestion = {
          type: 'pinyin',
          number: questionNumber,
          question: questionText,
          options: [],
          correctAnswer: null
        };
      } else if (questionText.includes('书写') || questionText.includes('错别字') || questionText.includes('填入')) {
        currentQuestion = {
          type: 'vocabulary',
          number: questionNumber,
          question: questionText,
          options: [],
          correctAnswer: null
        };
      } else if (questionText.includes('成语') || questionText.includes('熟语')) {
        currentQuestion = {
          type: 'idiom',
          number: questionNumber,
          question: questionText,
          options: [],
          correctAnswer: null
        };
      } else if (questionText.includes('语病') || questionText.includes('病句')) {
        currentQuestion = {
          type: 'correction',
          number: questionNumber,
          question: questionText,
          options: [],
          correctAnswer: null
        };
      } else if (questionText.includes('修辞') || questionText.includes('标点') || questionText.includes('作家') || questionText.includes('作品')) {
        currentQuestion = {
          type: 'literature',
          number: questionNumber,
          question: questionText,
          options: [],
          correctAnswer: null
        };
      }

      if (currentQuestion) {
        questions[currentQuestion.type].push(currentQuestion);
      }
      continue;
    }

    // 解析选项 (A. B. C. D.)
    const optionMatch = line.match(/^([A-D])\.\s+(.+)/);
    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1];
      const optionText = optionMatch[2];

      // 检查是否标注了答案 (如 "A. xxxxx **D**" 表示答案是D)
      const answerMatch = line.match(/\*\*([A-D])\*\*/);
      if (answerMatch) {
        const answerLetter = answerMatch[1];
        currentQuestion.correctAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      }

      currentQuestion.options.push(`${optionLetter}. ${optionText}`);
      continue;
    }
  }

  return questions;
}

/**
 * 扫描文件夹并解析所有文件
 */
function scanAndParseFolder() {
  const files = fs.readdirSync(K12_MD_FOLDER);
  const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('answers'));

  console.log(`找到 ${mdFiles.length} 个 markdown 文件`);

  const allQuestions = {
    pinyin: [],
    vocabulary: [],
    idiom: [],
    correction: [],
    literature: [],
    reading: [],
    ancient: []
  };

  mdFiles.forEach((filename, index) => {
    const filePath = path.join(K12_MD_FOLDER, filename);
    console.log(`正在解析: ${filename} (${index + 1}/${mdFiles.length})`);

    try {
      const fileQuestions = parseMarkdownFile(filePath);

      // 合并题目
      Object.keys(fileQuestions).forEach(type => {
        allQuestions[type].push(...fileQuestions[type]);
      });
    } catch (err) {
      console.error(`解析 ${filename} 失败:`, err.message);
    }
  });

  return allQuestions;
}

/**
 * 生成题库代码
 */
function generateQuestionCode(questions) {
  const stats = {
    pinyin: questions.pinyin.length,
    vocabulary: questions.vocabulary.length,
    idiom: questions.idiom.length,
    correction: questions.correction.length,
    literature: questions.literature.length,
    reading: questions.reading.length,
    ancient: questions.ancient.length,
    total: Object.values(questions).reduce((sum, arr) => sum + arr.length, 0)
  };

  console.log('\n题目统计:');
  console.log(`  拼音: ${stats.pinyin} 题`);
  console.log(`  词汇: ${stats.vocabulary} 题`);
  console.log(`  成语: ${stats.idiom} 题`);
  console.log(`  病句: ${stats.correction} 题`);
  console.log(`  文学: ${stats.literature} 题`);
  console.log(`  现代文阅读: ${stats.reading} 题`);
  console.log(`  古文阅读: ${stats.ancient} 题`);
  console.log(`  总计: ${stats.total} 题`);

  return `
/**
 * 自动生成的 K12 题库数据
 * 生成时间: ${new Date().toISOString()}
 *
 * 题目统计:
 *  - 拼音: ${stats.pinyin} 题
 *  - 词汇: ${stats.vocabulary} 题
 *  - 成语: ${stats.idiom} 题
 *  - 病句: ${stats.correction} 题
 *  - 文学: ${stats.literature} 题
 *  - 现代文阅读: ${stats.reading} 题
 *  - 古文阅读: ${stats.ancient} 题
 *  - 总计: ${stats.total} 题
 */

export const IMPORTED_QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;
}

/**
 * 主函数
 */
function main() {
  console.log('K12 题目导入工具');
  console.log('==================\n');
  console.log(`源文件夹: ${K12_MD_FOLDER}`);
  console.log(`输出文件: ${OUTPUT_FILE}\n`);

  if (!fs.existsSync(K12_MD_FOLDER)) {
    console.error(`错误: 文件夹不存在 ${K12_MD_FOLDER}`);
    process.exit(1);
  }

  // 扫描并解析
  const questions = scanAndParseFolder();

  // 生成代码
  const code = generateQuestionCode(questions);

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, code, 'utf-8');
  console.log(`\n✓ 已生成题库文件: ${OUTPUT_FILE}`);
  console.log('\n下一步:');
  console.log('1. 检查生成的文件');
  console.log('2. 根据需要添加答案和解析');
  console.log('3. 将数据合并到 src/data/k12Questions.js');
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { parseMarkdownFile, scanAndParseFolder };
