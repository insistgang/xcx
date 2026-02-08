const fs = require('fs');
const path = require('path');

// Question classification keywords
const classification = {
  pinyin: {
    keywords: ['读音', '音', '念', '注音'],
    priority: 1
  },
  vocabulary: {
    keywords: ['书写', '错别字', '词语', '选词填空', '词话'],
    priority: 2
  },
  idiom: {
    keywords: ['成语', '熟语'],
    priority: 3
  },
  correction: {
    keywords: ['语病', '病句', '修改病句'],
    priority: 4
  },
  literature: {
    keywords: ['作家作品', '古诗词', '文学常识', '诗词', '作者', '《', '》'],
    priority: 5
  }
};

function classifyQuestion(question) {
  const text = question.question || question;

  for (const [type, data] of Object.entries(classification)) {
    for (const keyword of data.keywords) {
      if (text.includes(keyword)) {
        return type;
      }
    }
  }

  // Default: if mentions options A/B/C/D, it's likely a multiple choice question
  if (text.includes('A.') || text.includes('B.') || text.includes('C.') || text.includes('D.')) {
    return 'vocabulary'; // Default fallback
  }

  return 'vocabulary'; // Final fallback
}

function extractOptions(questionText) {
  const options = [];
  const optionPattern = /([A-D])[.、\s]+([^A-D]+?)(?=[A-D][.、\s]|$)/g;
  let match;

  while ((match = optionPattern.exec(questionText)) !== null) {
    const optionText = match[2].trim();
    if (optionText) {
      options.push(`${match[1]}. ${optionText}`);
    }
  }

  // If pattern didn't work, try alternative extraction
  if (options.length === 0) {
    const lines = questionText.split('\n');
    let currentOption = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (/^[A-D][.、]/.test(trimmedLine)) {
        if (currentOption) options.push(currentOption);
        currentOption = trimmedLine;
      } else if (currentOption && trimmedLine) {
        currentOption += ' ' + trimmedLine;
      }
    }
    if (currentOption) options.push(currentOption);
  }

  return options.length > 0 ? options : ['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4'];
}

function detectCorrectAnswer(questionText, options) {
  // Check for explicit answer markers like **D** or (D)
  const explicitAnswer = questionText.match(/\*\*([A-D])\*\*|\(([A-D])\)|【([A-D])】/);
  if (explicitAnswer) {
    const answer = explicitAnswer[1] || explicitAnswer[2] || explicitAnswer[3];
    return ['A', 'B', 'C', 'D'].indexOf(answer);
  }

  // Try to find answer in the text
  const answerMatch = questionText.match(/答案[：:]\s*([A-D])/i);
  if (answerMatch) {
    return ['A', 'B', 'C', 'D'].indexOf(answerMatch[1]);
  }

  // For negative questions (不正确/错误/不恰当), we need analysis
  // Return -1 to indicate answer needs manual determination
  return -1;
}

function generateId(year, type, questionNum) {
  const typePrefix = {
    pinyin: 'py',
    vocabulary: 'voc',
    idiom: 'id',
    correction: 'cor',
    literature: 'lit'
  };
  const prefix = typePrefix[type] || 'q';
  return `${prefix}${year}_${String(questionNum).padStart(3, '0')}`;
}

function parseQuestions(content, year) {
  const questions = {
    pinyin: [],
    vocabulary: [],
    idiom: [],
    correction: [],
    literature: []
  };

  // Split into sections
  const sections = content.split(/^##\s+/m);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Extract question blocks
    const questionBlocks = section.split(/^\d+\.\s+/m).filter(q => q.trim());

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (!block || block.length < 20) continue;

      const questionText = `${i + 1}. ${block}`;
      const type = classifyQuestion(questionText);
      const options = extractOptions(block);
      const correctAnswer = detectCorrectAnswer(block, options);

      const question = {
        id: generateId(year, type, questions[type].length + 1),
        question: questionText.substring(0, 500), // Limit length
        options: options.slice(0, 4),
        correctAnswer: correctAnswer,
        analysis: '请根据题目内容分析' // Placeholder
      };

      questions[type].push(question);
    }
  }

  return questions;
}

function main() {
  const years = [2015, 2016, 2017, 2018, 2019];
  const allQuestions = {
    pinyin: [],
    vocabulary: [],
    idiom: [],
    correction: [],
    literature: []
  };

  for (const year of years) {
    const filePath = path.join(__dirname, `${year}_chinese.md`);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const yearQuestions = parseQuestions(content, year);

    // Merge questions
    for (const type of Object.keys(allQuestions)) {
      allQuestions[type].push(...yearQuestions[type]);
    }

    console.log(`\n${year} - Question counts:`);
    console.log('  Pinyin:', yearQuestions.pinyin.length);
    console.log('  Vocabulary:', yearQuestions.vocabulary.length);
    console.log('  Idiom:', yearQuestions.idiom.length);
    console.log('  Correction:', yearQuestions.correction.length);
    console.log('  Literature:', yearQuestions.literature.length);
  }

  // Write output
  const outputPath = path.join(__dirname, 'parsed_questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');

  console.log('\n=== Total Question Counts ===');
  console.log('Pinyin:', allQuestions.pinyin.length);
  console.log('Vocabulary:', allQuestions.vocabulary.length);
  console.log('Idiom:', allQuestions.idiom.length);
  console.log('Correction:', allQuestions.correction.length);
  console.log('Literature:', allQuestions.literature.length);
  console.log(`\nOutput written to: ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseQuestions, classifyQuestion };
