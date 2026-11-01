const QUOTES = [
  ["学而时习之，不亦说乎？", "《论语》"],
  ["读书破万卷，下笔如有神。", "杜甫"],
  ["书山有路勤为径，学海无涯苦作舟。", "韩愈"],
  ["温故而知新，可以为师矣。", "《论语》"],
  ["业精于勤，荒于嬉；行成于思，毁于随。", "韩愈"],
  ["少壮不努力，老大徒伤悲。", "《长歌行》"],
  ["宝剑锋从磨砺出，梅花香自苦寒来。", "佚名"],
  ["千里之行，始于足下。", "《老子》"]
];
const PRESETS = [
  ["什么是比喻？", "比喻是用跟甲事物有相似点的乙事物来描写或说明甲事物。例如“发令枪一响，运动员像离弦的箭一样冲出去”。"],
  ["什么是拟人？", "拟人是把事物当作人来写，让它有人的动作或情感。例如“春风轻轻地叫醒了柳树”。"],
  ["古诗中常用的意象有哪些？", "常见意象有明月、杨柳、鸿雁、梅花、长亭、孤舟。明月多写思乡，杨柳多写离别，梅花多写高洁。"],
  ["如何区分近义词？", "先看词性，再看搭配对象和语意侧重。例如“提高水平”“提升品质”，“考察”偏实地调查，“考查”偏检验衡量。"],
  ["怎样修改病句？", "先找主干，再看搭配、残缺、赘余、语序和逻辑。改的时候尽量保留原意，只动出错的那一处。"],
  ["如何写好作文开头？", "开头宜短。可以用一个具体场景、一句点题的话，或一个和题目有关的问题，把读者拉进文章。"]
];
const CATS = [
  ["vocabulary", "词汇学习", "📖", "词语释义与运用", "#5b9bd5", "词语释义辨析"],
  ["idiom", "成语熟语", "🦊", "成语积累与练习", "#fb923c", "成语积累运用"],
  ["pinyin", "拼音练习", "🔤", "拼音声调学习", "#14b8a6", "汉语拼音学习"],
  ["correction", "病句修改", "✏️", "语法病句分析", "#ec4899", "语法病句分析"]
];
const TITLES = {
  home: "语文助手", exercise: "练习", chat: "答疑", profile: "我的",
  practice: "练习", record: "学习记录", report: "学习报告", analysis: "学习分析",
  login: "登录", mock: "模拟考试", result: "考试解析", wrong: "错题本", favorite: "收藏夹"
};
const TABS = new Set(["home", "exercise", "chat", "profile"]);
const AVATARS = ["📚", "🦊", "✏️", "🎓", "🌟"];
const $ = (id) => document.getElementById(id);

const state = {
  screen: "home",
  tab: "home",
  back: "home",
  quote: 0,
  nickname: localStorage.getItem("xcx-name") || "同学",
  avatar: Number(localStorage.getItem("xcx-avatar") || 0),
  agreed: false,
  loginMode: "login",
  stats: loadStats(),
  messages: loadMessages(),
  practice: null,
  exam: null,
  examResult: null,
  reportRange: "week",
  chatText: ""
};

function loadStats() {
  const empty = { score: 0, done: 0, right: 0, wrong: [], favorites: [], records: [], byCat: {} };
  try {
    const raw = JSON.parse(localStorage.getItem("xcx-stats") || "{}");
    const wrong = Array.isArray(raw.wrong) && raw.wrong.every((item) => item && item.q) ? raw.wrong : [];
    return { ...empty, ...raw, wrong, favorites: raw.favorites || [], records: raw.records || [], byCat: raw.byCat || {} };
  } catch (err) {
    return empty;
  }
}
function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem("xcx-chat") || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (err) { /* keep the welcome message */ }
  return [{ role: "bot", text: "你好！我是你的语文学习助手，可以帮你解答语文学习中的问题。\n\n你可以问我：\n• 词语释义\n• 诗词赏析\n• 语法知识\n• 写作技巧\n\n快来提问吧！" }];
}
function save() {
  localStorage.setItem("xcx-stats", JSON.stringify(state.stats));
  localStorage.setItem("xcx-name", state.nickname);
  localStorage.setItem("xcx-avatar", String(state.avatar));
  localStorage.setItem("xcx-chat", JSON.stringify(state.messages.slice(-40)));
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function qid(item) { return item.id || `${item.cat}:${item.q.slice(0, 32)}`; }
function keyed(cat) {
  return (window.KEYED_BANK || []).filter((item) => !cat || item.cat === cat);
}
function shuffle(list) {
  const pool = list.slice();
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
function accuracy() {
  return state.stats.done ? Math.round(state.stats.right / state.stats.done * 100) : 0;
}
function todayKey() { return new Date().toISOString().slice(0, 10); }
function rollDay() {
  const day = todayKey();
  if (state.stats.todayDay !== day) {
    state.stats.todayDay = day;
    state.stats.todayScore = 0;
    state.stats.todayDone = 0;
    state.stats.todayRight = 0;
  }
}
function todayAccuracy() {
  return state.stats.todayDone ? Math.round(state.stats.todayRight / state.stats.todayDone * 100) : 0;
}
function addResult(ok) {
  rollDay();
  state.stats.done += 1;
  state.stats.todayDone += 1;
  if (ok) {
    state.stats.right += 1;
    state.stats.score += 1;
    state.stats.todayRight += 1;
    state.stats.todayScore += 1;
  }
}
function daysLeft() {
  const exam = new Date("2026-03-30T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((exam - today) / 86400000));
}
function studyDays() {
  if (!localStorage.getItem("xcx-since")) localStorage.setItem("xcx-since", String(Date.now()));
  const since = Number(localStorage.getItem("xcx-since"));
  return Math.max(1, Math.floor((Date.now() - since) / 86400000) + 1);
}
function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}
function toast(text) {
  const node = $("toast");
  node.hidden = false;
  node.textContent = text;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 1700);
}
function catMeta(id) {
  return CATS.find((item) => item[0] === id) || ["mixed", "综合练习", "🎲", "", "#5b9bd5", ""];
}
function optionText(text) { return String(text).replace(/^\s*[A-Da-d][.．、)\]]\s*/, ""); }
function letter(index) { return String.fromCharCode(65 + index); }

function show(screen, back) {
  state.screen = screen;
  if (back) state.back = back;
  if (TABS.has(screen)) state.tab = screen;
  const phone = $("phone");
  phone.classList.toggle("sub", !TABS.has(screen));
  phone.classList.toggle("plain", screen === "login");
  $("nav-title").textContent = TITLES[screen] || "语文助手";
  $("nav-back").hidden = TABS.has(screen) || screen === "login";
  document.querySelectorAll(".tabbar button").forEach((button) => {
    const on = button.dataset.tab === state.tab;
    button.classList.toggle("active", on);
    const img = button.querySelector("img");
    img.src = on ? img.dataset.on : img.dataset.off;
  });
  render();
}
function goBack() {
  if (state.screen === "result") show("mock", state.exam ? "exercise" : "exercise");
  else show(state.back || "home");
}

function render() {
  const views = { home: renderHome, exercise: renderExercise, chat: renderChat, profile: renderProfile, practice: renderPractice, record: renderRecord, report: renderReport, analysis: renderAnalysis, login: renderLogin, mock: renderMock, result: renderResult, wrong: renderWrong, favorite: renderFavorite };
  $("app").innerHTML = (views[state.screen] || renderHome)();
  if (state.screen === "chat") {
    const box = $("messages");
    if (box) box.scrollTop = box.scrollHeight;
    const input = $("chat-input");
    if (input) input.focus();
  }
}

function renderHome() {
  const quote = QUOTES[state.quote];
  return `
    <div class="header">
      <div class="hello">
        <div class="avatar">${esc(state.nickname.slice(0, 1))}</div>
        <div><h2>${greeting()}，${esc(state.nickname)}！</h2><p>今天也要加油学习哦！</p></div>
      </div>
      <div class="banner">${daysLeft() > 0 ? `📅 距离考试还剩 ${daysLeft()} 天` : "📅 2026-03-30 考试日已过"}</div>
    </div>
    <div class="stats">
      <div class="stat"><b class="blue">${state.stats.todayScore || 0}</b><span>今日得分</span></div>
      <div class="stat"><b class="orange">${state.stats.todayDone || 0}</b><span>做题数</span></div>
      <div class="stat"><b class="green">${todayAccuracy()}%</b><span>正确率</span></div>
    </div>
    <div class="section">
      <h2>学习模块 <button data-act="tab" data-tab="exercise" style="border:0;background:none;color:#9ca3af;font-size:14px;font-weight:500">查看全部 ›</button></h2>
      <div class="grid2">
        ${CATS.map(([id, name, icon, desc, color]) => `
          <button class="module" data-act="practice" data-cat="${id}" data-count="20">
            <i style="background:${color}"></i><div class="icon">${icon}</div><strong>${name}</strong><small>${desc}</small>
          </button>`).join("")}
      </div>
    </div>
    <div class="section"><h2>快捷功能</h2>
      <div class="quick">
        <button data-act="mock"><div class="icon">📝</div>模拟考试</button>
        <button data-act="tab" data-tab="chat"><div class="icon">🤖</div>智能答疑</button>
        <button data-act="open" data-screen="record" data-back="home"><div class="icon">📊</div>学习记录</button>
        <button data-act="open" data-screen="report" data-back="home"><div class="icon">📈</div>学习报告</button>
      </div>
    </div>
    <div class="quote">
      <div>💭</div>
      <p id="quote-text">“${esc(quote[0])}”</p>
      <p class="who" id="quote-author">—— ${esc(quote[1])}</p>
      <div class="dots">${QUOTES.map((_, i) => `<i class="${i === state.quote ? "on" : ""}"></i>`).join("")}</div>
    </div>`;
}

function renderExercise() {
  const counts = Object.fromEntries(CATS.map(([id]) => [id, keyed(id).length]));
  return `
    <div class="section">
      <h2>🎲 碎片化学习</h2>
      <div class="grid2">
        <button class="fragment g1" data-act="practice" data-count="3"><span>⚡</span><strong>极速3题</strong><small>1分钟</small></button>
        <button class="fragment g2" data-act="practice" data-count="5"><span>🚀</span><strong>快速5题</strong><small>2分钟</small></button>
        <button class="fragment g3" data-act="practice" data-count="10"><span>🎲</span><strong>随机10题</strong><small>5分钟</small></button>
        <button class="fragment g4" data-act="mock"><span>📊</span><strong>模拟考试</strong><small>120分钟</small></button>
      </div>
    </div>
    <div class="section"><h2>📚 复习专区</h2>
      <div class="review">
        <button data-act="open" data-screen="wrong" data-back="exercise"><span class="emo">❌</span><strong>错题重做</strong></button>
        <button data-act="open" data-screen="favorite" data-back="exercise"><span class="emo">⭐</span><strong>收藏练习</strong></button>
      </div>
    </div>
    <div class="section"><h2>📋 题型分类</h2>
      ${CATS.map(([id, name, icon, , color, desc]) => `
        <button class="type" data-act="practice" data-cat="${id}" data-count="20">
          <span class="bubble" style="background:${color}22">${icon}</span>
          <span><strong>${name}</strong><small>${desc}</small></span>
          <span class="badge" style="background:${color}">${counts[id] || 0}</span>
          <span class="chev">›</span>
        </button>`).join("")}
    </div>
    <div class="section"><h2>⚡ 更多功能</h2>
      <div class="more">
        <button data-act="open" data-screen="record" data-back="exercise"><div class="emo">📋</div><strong>做题记录</strong><small>查看历史记录</small></button>
        <button data-act="open" data-screen="wrong" data-back="exercise"><div class="emo">❌</div><strong>错题集</strong><small>错题重做练习</small></button>
        <button data-act="open" data-screen="favorite" data-back="exercise"><div class="emo">⭐</div><strong>收藏夹</strong><small>收藏题目练习</small></button>
      </div>
    </div>
    <div class="pad"></div>`;
}

function startPractice(cat, count, from) {
  const pool = shuffle(keyed(cat));
  if (!pool.length) { toast("这个模块暂时没有题目"); return; }
  state.practice = {
    from: from || state.tab,
    cat,
    title: cat ? catMeta(cat)[1] : "碎片化学习",
    queue: pool.slice(0, count || 20),
    index: 0,
    picked: null,
    revealed: false,
    sessionRight: 0,
    locked: false
  };
  show("practice", state.practice.from);
}
function currentQuestion() {
  return state.practice && state.practice.queue[state.practice.index];
}
function renderPractice() {
  const session = state.practice;
  if (!session) return `<div class="empty"><div class="emo">📖</div>先从练习里选一组题</div>`;
  if (session.done) {
    const total = session.queue.length;
    const rate = Math.round(session.sessionRight / total * 100);
    const praise = rate >= 80 ? "太棒了！" : rate >= 60 ? "继续加油！" : "再练习一下吧！";
    return `<div class="result"><div class="q-card">
      <div class="emo">🎉</div><h2>练习完成！</h2>
      <div class="score">${session.sessionRight} / ${total}</div>
      <p>${praise}</p><p>正确率：${rate}%</p>
      <div class="row"><button class="ghost" data-act="retry">再练一次</button><button data-act="back">返回</button></div>
    </div></div>`;
  }
  const item = currentQuestion();
  const percent = Math.round(session.index / session.queue.length * 100);
  const favored = state.stats.favorites.some((fav) => fav.id === qid(item));
  return `
    <div class="progress"><b style="width:${percent}%"></b></div>
    <div class="q-card">
      <div class="q-top"><span>第 ${session.index + 1} / ${session.queue.length} 题</span>
        <button class="star ${favored ? "on" : ""}" data-act="fav">${favored ? "★" : "☆"}</button></div>
      <h2>${esc(item.q)}</h2>
      ${item.options.map((option, index) => {
        let cls = "";
        if (session.revealed && index === item.correctAnswer) cls = "ok";
        else if (session.revealed && index === session.picked && index !== item.correctAnswer) cls = "bad";
        else if (!session.revealed && index === session.picked) cls = "pick";
        const mark = session.revealed && index === item.correctAnswer ? "✓" : session.revealed && index === session.picked ? "✗" : letter(index);
        return `<button class="opt ${cls}" data-act="pick" data-i="${index}"><span class="letter">${mark}</span><span>${esc(optionText(option))}</span></button>`;
      }).join("")}
      ${session.revealed ? `<div class="explain"><b>解析：</b>${esc(item.explanation || "这道题来自练习题库。")}</div>` : ""}
      <div class="row">
        <button class="ghost" data-act="back">返回</button>
        <button data-act="next" ${session.revealed ? "" : "disabled"}>${session.revealed ? (session.index + 1 === session.queue.length ? "完成" : "下一题") : "请选择答案"}</button>
      </div>
    </div>`;
}
function gradeCurrent() {
  const session = state.practice;
  const item = currentQuestion();
  if (!session || session.locked || session.picked === null) return;
  session.locked = true;
  session.revealed = true;
  const ok = session.picked === item.correctAnswer;
  addResult(ok);
  if (ok) session.sessionRight += 1;
  else {
    const id = qid(item);
    if (!state.stats.wrong.some((wrong) => wrong.id === id)) {
      state.stats.wrong.unshift({ id, cat: item.cat, name: item.name, q: item.q, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation });
    }
  }
  const bucket = state.stats.byCat[item.cat] || { done: 0, right: 0 };
  bucket.done += 1;
  if (ok) bucket.right += 1;
  state.stats.byCat[item.cat] = bucket;
  save();
}
function finishPractice() {
  const session = state.practice;
  const total = session.queue.length;
  const rate = Math.round(session.sessionRight / total * 100);
  state.stats.records.unshift({
    id: Date.now(),
    title: session.title,
    type: session.cat || "mixed",
    score: rate,
    duration: Math.max(1, Math.round(total / 3)),
    at: Date.now(),
    day: new Date().toISOString().slice(0, 10)
  });
  state.stats.records = state.stats.records.slice(0, 50);
  session.done = true;
  save();
}

function renderChat() {
  const welcomeOnly = state.messages.length === 1;
  return `<div class="chat">
    <div class="msgs" id="messages">
      ${state.messages.map((item) => `
        <div class="msg ${item.role === "me" ? "me" : "bot"}">
          <div class="face">${item.role === "me" ? "👤" : "🤖"}</div>
          <div class="bubble">${esc(item.text)}</div>
        </div>`).join("")}
      ${state.chatLoading ? `<div class="msg bot"><div class="face">🤖</div><div class="bubble">正在想…</div></div>` : ""}
      ${welcomeOnly ? `<div class="presets">${PRESETS.map(([q]) => `<button data-act="preset" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>` : ""}
    </div>
    <form class="composer" id="chat-form">
      <input id="chat-input" name="q" maxlength="200" placeholder="输入你的问题..." value="${esc(state.chatText)}" />
      <button class="${state.chatText.trim() ? "ready" : ""}" type="submit">发送</button>
    </form>
  </div>`;
}
function replyTo(text) {
  const preset = PRESETS.find(([q]) => q === text);
  if (preset) return preset[1];
  const pool = [...(window.KEYED_BANK || []), ...(window.QUESTION_BANK || [])];
  const hit = pool.find((item) => item.q.includes(text)) || (text.length >= 2 ? pool.find((item) => item.q.includes(text.slice(0, 2))) : null);
  if (hit && hit.explanation) return `${hit.explanation}\n\n相关题目：${hit.q}`;
  if (hit) return `我在题库里找到了相关题：\n${hit.q}\n你可以到「练习」里按${hit.name || "这个题型"}继续做。`;
  return "网页版没有接原来的云端模型。你可以问一个词语或成语，我会用本地题库和这 6 个常见问题来回答。";
}
function sendChat(text) {
  const value = (text || "").trim();
  if (!value || state.chatLoading) return;
  state.messages.push({ role: "me", text: value });
  state.chatText = "";
  state.chatLoading = true;
  save();
  render();
  setTimeout(() => {
    state.messages.push({ role: "bot", text: replyTo(value) });
    state.chatLoading = false;
    save();
    if (state.screen === "chat") render();
  }, 350);
}

function achievements() {
  const done = state.stats.done;
  const perfect = state.stats.records.filter((item) => item.score >= 100).length;
  const days = studyDays();
  return [
    ["🏆", "初学者", "完成首次答题", done >= 1, `${Math.min(100, done * 100)}%`],
    ["🎯", "连续7天", "连续学习7天", days >= 7, `${Math.min(100, Math.round(days / 7 * 100))}%`],
    ["⭐", "满分达人", "获得10次满分", perfect >= 10, `${Math.min(100, perfect * 10)}%`],
    ["🎓", "学习大师", "累计答题500题", done >= 500, `${Math.min(100, Math.round(done / 500 * 100))}%`],
    ["⚡", "快手", "累计答题100题", done >= 100, `${Math.min(100, done)}%`],
    ["📚", "学霸", "累计获得1000分", state.stats.score >= 1000, `${Math.min(100, Math.round(state.stats.score / 10))}%`],
    ["📖", "博学者", "正确率90%且答题50题以上", accuracy() >= 90 && done >= 50, done >= 50 ? `${accuracy()}%` : `${Math.min(100, done * 2)}%`]
  ];
}
function renderProfile() {
  return `
    <div class="header"><div class="hello"><div class="avatar">${AVATARS[state.avatar] || "👤"}</div>
      <div><h2>${esc(state.nickname)}</h2><p>坚持学习第 ${studyDays()} 天</p></div></div></div>
    <div class="stats">
      <div class="stat"><b class="blue">${state.stats.score}</b><span>总得分</span></div>
      <div class="stat"><b class="orange">${state.stats.done}</b><span>做题数</span></div>
      <div class="stat"><b class="green">${accuracy()}%</b><span>正确率</span></div>
    </div>
    <div class="section"><h2>我的成就</h2><div class="achieve">
      ${achievements().map(([icon, name, desc, on, progress]) => `
        <div class="ach ${on ? "on" : ""}"><span class="emo">${icon}</span><span><b>${name}</b><small>${desc} · ${progress}</small></span>${on ? `<span class="tick">✓</span>` : ""}</div>`).join("")}
    </div></div>
    <div class="menu">
      <button data-act="open" data-screen="record" data-back="profile"><span class="ico">📖</span>学习记录<span class="chev">›</span></button>
      <button data-act="open" data-screen="report" data-back="profile"><span class="ico">📊</span>学习报告<span class="chev">›</span></button>
      <button data-act="open" data-screen="analysis" data-back="profile"><span class="ico">📈</span>学习分析<span class="chev">›</span></button>
      <button data-act="share"><span class="ico">🔗</span>分享给好友<span class="chev">›</span></button>
      <button data-act="settings"><span class="ico">⚙️</span>设置<span class="chev">›</span></button>
    </div>
    <button class="logout" data-act="logout">退出登录</button>`;
}

function recordsInRange() {
  const days = state.reportRange === "month" ? 30 : 7;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return state.stats.records.filter((item) => new Date(item.day) >= start);
}
function renderReport() {
  const rows = recordsInRange();
  const totalScore = rows.reduce((sum, item) => sum + item.score, 0);
  const minutes = rows.reduce((sum, item) => sum + (item.duration || 0), 0);
  const rate = rows.length ? Math.round(rows.reduce((sum, item) => sum + item.score, 0) / rows.length) : 0;
  const days = state.reportRange === "month" ? 30 : 7;
  const bars = [];
  for (let i = days - 1; i >= 0; i -= state.reportRange === "month" ? 3 : 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const hit = state.stats.records.filter((item) => item.day === key);
    const n = hit.length;
    bars.push(`<div><i style="height:${Math.max(6, Math.min(96, n * 28))}px;background:${n ? "#4A90E2" : "#E5E7EB"}"></i><span>${day.getMonth() + 1}/${day.getDate()}</span></div>`);
  }
  return `
    <div class="tabs">
      <button class="${state.reportRange === "week" ? "on" : ""}" data-act="range" data-range="week">本周</button>
      <button class="${state.reportRange === "month" ? "on" : ""}" data-act="range" data-range="month">本月</button>
    </div>
    <div class="stats">
      <div class="stat"><b>${totalScore}</b><span>总得分</span></div>
      <div class="stat"><b>${minutes}</b><span>学习时长(分)</span></div>
      <div class="stat"><b>${rate}%</b><span>正确率</span></div>
    </div>
    <div class="section"><h2>学习趋势</h2><div class="q-card" style="margin:0"><div class="bars">${bars.join("")}</div></div></div>
    <div class="section"><h2>学习建议</h2>
      ${rows.length ? `<div class="tip">💡 保持每天学习，养成良好的学习习惯</div><div class="tip">📚 继续坚持练习，每天完成 10 道题目</div>` : `<div class="empty">开始学习后，这里会显示你的学习建议</div>`}
    </div>`;
}
function renderRecord() {
  if (!state.stats.records.length) {
    return `<div class="empty"><div class="emo">📖</div><div>暂无学习记录</div><p>完成练习后记录会显示在这里</p></div>`;
  }
  return `<div class="section">${state.stats.records.map((item) => {
    const color = item.score >= 80 ? "#6fcf97" : item.score >= 60 ? "#ffb84d" : "#ff6b6b";
    const when = new Date(item.at);
    const stamp = `${when.getMonth() + 1}/${when.getDate()} ${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
    return `<article class="record"><span><strong>${esc(item.title || "练习")}</strong><small style="display:block;color:#9ca3af">${esc(catMeta(item.type)[1])} · ${stamp} · ${item.duration || 0}分钟</small></span><b style="margin-left:auto;color:${color}">${item.score}分</b></article>`;
  }).join("")}</div>`;
}
function renderAnalysis() {
  const cats = CATS.map(([id, name]) => {
    const bucket = state.stats.byCat[id] || { done: 0, right: 0 };
    return { name, done: bucket.done, rate: bucket.done ? bucket.right / bucket.done : 0 };
  });
  const strong = cats.filter((item) => item.done > 0 && item.rate >= 0.6);
  const weak = cats.filter((item) => item.done >= 3 && item.rate < 0.6);
  const recent = state.stats.records.slice(0, 3);
  const older = state.stats.records.slice(3, 6);
  let trend = "flat";
  if (recent.length && older.length) {
    const a = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const b = older.reduce((sum, item) => sum + item.score, 0) / older.length;
    trend = a > b + 3 ? "up" : a < b - 3 ? "down" : "flat";
  }
  const tips = [
    ["每天固定练习", "先完成一组 10 题，再回头看错题本。"],
    ["优先补弱项", weak.length ? `最近「${weak[0].name}」的正确率偏低，可以单独再练 20 题。` : "四个模块可以轮流练习，避免只做熟悉的题。"],
    ["做完先看解析", "选完选项后先看解析，再进入下一题。"]
  ];
  return `
    <div class="section"><h2>💪 学习优势</h2><div>${strong.length ? strong.map((item) => `<span class="tag">✓ ${item.name} ${Math.round(item.rate * 100)}%</span>`).join("") : `<span class="tag">先完成一组练习</span>`}</div></div>
    <div class="section"><h2>🎯 需要加强</h2><div>${weak.length ? weak.map((item) => `<span class="tag weak">! ${item.name} ${Math.round(item.rate * 100)}%</span>`).join("") : `<span class="tag weak">暂未发现明显薄弱项</span>`}</div></div>
    <div class="section"><h2>📈 学习趋势</h2><div class="trend">${trend === "up" ? "📈 稳步上升" : trend === "down" ? "📉 需要加油" : "➡️ 保持平稳"}</div></div>
    <div class="section"><h2>🌟 个性化建议</h2>${tips.map((item, index) => `<div class="suggest"><div><span class="n">${index + 1}</span><b>${item[0]}</b></div><p style="color:#6b7280">${item[1]}</p></div>`).join("")}</div>`;
}

function renderLogin() {
  const body = state.loginMode === "register" ? `
      <div class="center"><button class="pick-avatar" data-act="avatar">${AVATARS[state.avatar]}</button><div>点击选择头像</div></div>
      <input id="nick" maxlength="12" placeholder="请输入昵称" value="${esc(state.nicknameDraft ?? (state.nickname === "同学" ? "" : state.nickname))}" />
      <button class="primary" data-act="register">完成注册</button>
      ${agreement()}
    ` : `
      <button class="wechat" data-act="wechat">🔐 微信授权登录</button>
      ${agreement()}
      <button class="switch" data-act="mode" data-mode="register">还没有账号？去注册</button>
      <div class="or"><i></i>或<i></i></div>
      <button class="guest" data-act="guest">暂不登录，先浏览看看</button>
    `;
  const back = localStorage.getItem("xcx-login") === "1" ? `<button data-act="back" style="border:0;background:transparent;color:#fff;padding:0 0 8px">‹ 返回</button>` : "";
  return `<div class="login">${back}<div class="logo-wrap"><div class="logo">📚</div><h2>AI 语文助手</h2><p>智能学习，高效提升</p></div>
    <div class="sheet">${body}</div>
    <div class="features"><div><span>📖</span>词汇诗词</div><div><span>✍️</span>练习题库</div><div><span>🤖</span>智能辅导</div><div><span>📊</span>学习分析</div></div>
  </div>`;
}
function agreement() {
  return `<button class="agree" data-act="agree"><span class="box ${state.agreed ? "on" : ""}">${state.agreed ? "✓" : ""}</span><span>我已阅读并同意 <a data-act="policy">《用户协议》</a> 和 <a data-act="policy">《隐私政策》</a>（${state.agreed ? "已同意" : "未同意"}）</span></button>`;
}

function ensureExam() {
  if (state.exam) return;
  const questions = shuffle(window.KEYED_BANK || []).slice(0, 10).map((item, index) => ({ ...item, id: item.id || `exam-${index}` }));
  state.exam = { questions, index: 0, answers: {}, started: false, showCard: false, timeLeft: 120 * 60 };
}
function renderMock() {
  ensureExam();
  const exam = state.exam;
  if (exam.finished && state.examResult) return renderExamSummary(state.examResult, true);
  if (!exam.started) {
    return `<div class="intro"><h2>模拟考试</h2><div class="info">
        <div><span>题目数量</span><b>${exam.questions.length} 题</b></div>
        <div><span>考试时长</span><b>120 分钟</b></div>
        <div><span>总分</span><b>100 分</b></div>
      </div>
      <div class="tips"><b>考试须知：</b><br>• 考试开始后倒计时自动启动<br>• 答题完成后可交卷<br>• 超时自动交卷<br>• 这是网页示例卷，题目来自公开练习题库</div>
      <button class="primary" data-act="exam-start">开始考试</button></div>`;
  }
  const item = exam.questions[exam.index];
  const picked = exam.answers[item.id];
  const mins = String(Math.floor(exam.timeLeft / 60)).padStart(2, "0");
  const secs = String(exam.timeLeft % 60).padStart(2, "0");
  return `
    <div class="exam-top"><span id="time-left">${mins}:${secs}</span><button data-act="exam-card">📋 答题卡</button></div>
    ${exam.showCard ? `<div class="sheet-mask"><div class="q-top"><b>答题卡</b><button class="ghost" data-act="exam-card" style="flex:none">关闭</button></div>
      <div class="card-grid">${exam.questions.map((q, index) => `<button class="${exam.answers[q.id] !== undefined ? "done" : ""} ${index === exam.index ? "here" : ""}" data-act="jump" data-i="${index}">${index + 1}</button>`).join("")}</div></div>` : ""}
    <div class="q-card">
      <div class="q-top"><span>第 ${exam.index + 1} 题</span><span>单选题</span></div>
      <h2>${esc(item.q)}</h2>
      ${item.options.map((option, index) => `<button class="opt ${picked === index ? "pick" : ""}" data-act="exam-pick" data-i="${index}"><span class="radio">${picked === index ? "<i></i>" : ""}</span><span>${esc(optionText(option))}</span></button>`).join("")}
    </div>
    <div class="exam-foot">
      <button data-act="exam-prev" ${exam.index === 0 ? "disabled" : ""}>上一题</button>
      <span>${exam.index + 1} / ${exam.questions.length}</span>
      <button class="${exam.index + 1 === exam.questions.length ? "submit" : ""}" data-act="${exam.index + 1 === exam.questions.length ? "exam-submit" : "exam-next"}">${exam.index + 1 === exam.questions.length ? "交卷" : "下一题"}</button>
    </div>`;
}
function finishExam() {
  const exam = state.exam;
  if (!exam || exam.finished) return;
  exam.finished = true;
  exam.started = false;
  const answers = exam.answers;
  const correct = exam.questions.filter((item) => answers[item.id] === item.correctAnswer).length;
  const wrong = exam.questions.filter((item) => answers[item.id] !== undefined && answers[item.id] !== item.correctAnswer).length;
  const unanswered = exam.questions.length - correct - wrong;
  const score = Math.round(correct / exam.questions.length * 100);
  state.examResult = { questions: exam.questions, answers, score, correct, wrong, unanswered };
  exam.questions.forEach((item) => {
    if (answers[item.id] === undefined) return;
    const ok = answers[item.id] === item.correctAnswer;
    addResult(ok);
    const bucket = state.stats.byCat[item.cat] || { done: 0, right: 0 };
    bucket.done += 1;
    if (ok) bucket.right += 1;
    else if (!state.stats.wrong.some((row) => row.id === qid(item))) {
      state.stats.wrong.unshift({ id: qid(item), cat: item.cat, name: item.name, q: item.q, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation });
    }
    state.stats.byCat[item.cat] = bucket;
  });
  state.stats.records.unshift({ id: Date.now(), title: "模拟考试", type: "mixed", score, duration: Math.max(1, Math.round((7200 - exam.timeLeft) / 60)), at: Date.now(), day: new Date().toISOString().slice(0, 10) });
  save();
  show("mock", "exercise");
}
function renderExamSummary(result, withActions) {
  return `<div class="q-card"><div class="score-hero"><b>${result.score}</b> 分</div>
    <div class="mini-stats"><div><b class="okc">${result.correct}</b><span>答对</span></div><div><b class="badc">${result.wrong}</b><span>答错</span></div><div><b class="mutedc">${result.unanswered}</b><span>未答</span></div></div>
    ${withActions ? `<div class="row"><button class="ghost" data-act="exam-reset">返回</button><button data-act="open" data-screen="result" data-back="mock">查看解析</button></div>` : ""}
  </div>`;
}
function renderResult() {
  const result = state.examResult;
  if (!result) return `<div class="empty">还没有考试结果</div>`;
  return `${renderExamSummary(result, false)}<div class="q-list">${result.questions.map((item, index) => {
    const answer = result.answers[item.id];
    const status = answer === undefined ? "unanswered" : answer === item.correctAnswer ? "correct" : "wrong";
    const label = status === "correct" ? "正确" : status === "wrong" ? "错误" : "未作答";
    return `<article><div class="q-top"><b>第 ${index + 1} 题</b><span class="status ${status}">${label}</span></div>
      <p>${esc(item.q)}</p>
      ${item.options.map((option, opt) => {
        const cls = opt === item.correctAnswer ? "ok" : opt === answer ? "bad" : "";
        return `<div class="opt ${cls}"><span class="letter">${opt === item.correctAnswer ? "✓" : opt === answer ? "✗" : letter(opt)}</span><span>${esc(optionText(option))}</span></div>`;
      }).join("")}
      <p>您的答案：${answer === undefined ? "-" : letter(answer)}　正确答案：${letter(item.correctAnswer)}</p>
      ${item.explanation ? `<div class="explain"><b>【解析】</b>${esc(item.explanation)}</div>` : ""}
      <span class="pill" style="background:${catMeta(item.cat)[4]}">${esc(item.name || "其他")}</span>
    </article>`;
  }).join("")}</div><div class="pad"></div>`;
}

function renderWrong() {
  const list = state.stats.wrong;
  return `<div class="wrong-hero"><div style="font-size:36px">❌</div><h2>错题本</h2><p>攻克薄弱知识点</p>
    <div class="pair"><div><b>${list.length}</b><div>错题总数</div></div><div><b>${list.length}</b><div>待重做</div></div></div>
    ${list.length ? `<button class="hero-btn" data-act="redo-wrong">开始重做</button>` : `<div>🎉 暂无错题，继续努力学习吧！</div>`}
  </div>`;
}
function renderFavorite() {
  const list = state.stats.favorites;
  return `<div class="fav-hero"><div style="font-size:36px">⭐</div><h2>收藏夹</h2><p>重点题目集中练习</p>
      <div class="pair"><div><b>${list.length}</b><div>收藏总数</div></div><div><b>${list.filter((item) => item.practiced).length}</b><div>已练习</div></div></div>
      ${list.length ? `<button class="hero-btn" data-act="redo-fav">开始练习</button>` : ""}
    </div>
    <div class="section"><h2>收藏列表 <span>共 ${list.length} 题</span></h2>
      ${list.length ? list.map((item, index) => `<article class="q-list" style="margin:0 0 10px"><div class="q-top"><span class="pill" style="background:${catMeta(item.cat)[4]}">${esc(item.name || "题目")}</span><span>第 ${index + 1} 题</span></div><p>${esc(item.q)}</p><small>⭐ 已收藏</small></article>`).join("") : `<div class="empty">还没有收藏。做题时点星星即可加入。</div>`}
    </div>`;
}
function startFrom(list, title, from) {
  if (!list.length) return;
  state.practice = { from, cat: null, title, queue: list.slice(0, 20), index: 0, picked: null, revealed: false, sessionRight: 0, locked: false };
  show("practice", from);
}

function ask(title, body, okText, cancelText) {
  return new Promise((resolve) => {
    const modal = $("modal");
    modal.hidden = false;
    modal.innerHTML = `<div class="dialog"><h3>${esc(title)}</h3><p>${esc(body)}</p><div class="row"><button class="ghost" id="modal-cancel">${esc(cancelText)}</button><button id="modal-ok">${esc(okText)}</button></div></div>`;
    $("modal-ok").onclick = () => { modal.hidden = true; resolve(true); };
    $("modal-cancel").onclick = () => { modal.hidden = true; resolve(false); };
  });
}

$("app").addEventListener("click", async (event) => {
  const node = event.target.closest("[data-act]");
  if (!node || !$("app").contains(node)) return;
  const act = node.dataset.act;
  if (act === "tab") show(node.dataset.tab);
  if (act === "open") show(node.dataset.screen, node.dataset.back || state.tab);
  if (act === "back") goBack();
  if (act === "practice") startPractice(node.dataset.cat || null, Number(node.dataset.count || 20), state.screen === "home" ? "home" : "exercise");
  if (act === "mock") { if (!state.exam || state.exam.finished) state.exam = null; show("mock", state.screen === "home" ? "home" : "exercise"); }
  if (act === "pick") {
    const session = state.practice;
    if (!session || session.revealed) return;
    session.picked = Number(node.dataset.i);
    gradeCurrent();
    render();
  }
  if (act === "fav") {
    const item = currentQuestion();
    const id = qid(item);
    const index = state.stats.favorites.findIndex((fav) => fav.id === id);
    if (index >= 0) state.stats.favorites.splice(index, 1);
    else state.stats.favorites.unshift({ id, cat: item.cat, name: item.name, q: item.q, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation, practiced: false });
    save();
    render();
  }
  if (act === "next" && state.practice?.revealed) {
    if (state.practice.index + 1 >= state.practice.queue.length) finishPractice();
    else {
      state.practice.index += 1;
      state.practice.picked = null;
      state.practice.revealed = false;
      state.practice.locked = false;
    }
    render();
  }
  if (act === "retry") startPractice(state.practice.cat, state.practice.queue.length, state.practice.from);
  if (act === "preset") sendChat(node.dataset.q);
  if (act === "range") { state.reportRange = node.dataset.range; render(); }
  if (act === "agree") { keepNick(); state.agreed = !state.agreed; render(); }
  if (act === "policy") { event.preventDefault(); toast("网页版只展示协议入口"); }
  if (act === "mode") { state.loginMode = node.dataset.mode; render(); }
  if (act === "wechat") {
    if (!state.agreed) { toast("请先阅读并同意《用户协议》和《隐私政策》"); return; }
    state.loginMode = "register";
    render();
  }
  if (act === "avatar") { keepNick(); state.avatar = (state.avatar + 1) % AVATARS.length; render(); }
  if (act === "register") {
    if (!state.agreed) { toast("请先阅读并同意《用户协议》和《隐私政策》"); return; }
    const name = (($("nick") && $("nick").value) || state.nicknameDraft || "").trim();
    if (!name) { toast("请输入昵称"); return; }
    state.nickname = name.slice(0, 12);
    localStorage.setItem("xcx-login", "1");
    save();
    show("home");
  }
  if (act === "guest") show("home");
  if (act === "settings") { state.loginMode = "register"; state.agreed = true; show("login", "profile"); }
  if (act === "logout") {
    state.nickname = "同学";
    localStorage.removeItem("xcx-login");
    save();
    state.loginMode = "login";
    show("login", "profile");
  }
  if (act === "share") {
    const url = "https://insistgang.top/xcx/";
    try { await navigator.clipboard.writeText(url); toast("链接已复制"); }
    catch (err) { toast(url); }
  }
  if (act === "redo-wrong") startFrom(state.stats.wrong, "错题重做", "wrong");
  if (act === "redo-fav") startFrom(state.stats.favorites, "收藏练习", "favorite");
  if (act === "exam-start") { state.exam.started = true; state.exam.finished = false; render(); }
  if (act === "exam-card") { state.exam.showCard = !state.exam.showCard; render(); }
  if (act === "jump") { state.exam.index = Number(node.dataset.i); state.exam.showCard = false; render(); }
  if (act === "exam-pick") { state.exam.answers[state.exam.questions[state.exam.index].id] = Number(node.dataset.i); render(); }
  if (act === "exam-prev" && state.exam.index > 0) { state.exam.index -= 1; render(); }
  if (act === "exam-next") { state.exam.index += 1; render(); }
  if (act === "exam-submit") {
    const left = state.exam.questions.length - Object.keys(state.exam.answers).length;
    if (left > 0) {
      const ok = await ask("确认交卷", `你还有 ${left} 道题未作答，确定要交卷吗？`, "仍要交卷", "继续答题");
      if (!ok) return;
    }
    finishExam();
  }
  if (act === "exam-reset") { state.exam = null; state.examResult = null; show("exercise"); }
});
$("app").addEventListener("submit", (event) => {
  if (event.target.id !== "chat-form") return;
  event.preventDefault();
  sendChat(new FormData(event.target).get("q"));
});
$("app").addEventListener("input", (event) => {
  if (event.target.id === "chat-input") {
    state.chatText = event.target.value;
    event.target.nextElementSibling.classList.toggle("ready", Boolean(state.chatText.trim()));
  }
  if (event.target.id === "nick") state.nicknameDraft = event.target.value;
});
function keepNick() {
  const nick = $("nick");
  if (nick) state.nicknameDraft = nick.value;
}
$("nav-back").onclick = goBack;
document.querySelectorAll(".tabbar button").forEach((button) => { button.onclick = () => show(button.dataset.tab); });

setInterval(() => {
  state.quote = (state.quote + 1) % QUOTES.length;
  const text = $("quote-text");
  if (!text) return;
  text.textContent = `“${QUOTES[state.quote][0]}”`;
  $("quote-author").textContent = `—— ${QUOTES[state.quote][1]}`;
  document.querySelectorAll(".dots i").forEach((dot, index) => dot.classList.toggle("on", index === state.quote));
}, 5000);
setInterval(() => {
  const exam = state.exam;
  if (!exam || !exam.started || exam.finished || state.screen !== "mock") return;
  exam.timeLeft = Math.max(0, exam.timeLeft - 1);
  const label = $("time-left");
  if (label) {
    label.textContent = `${String(Math.floor(exam.timeLeft / 60)).padStart(2, "0")}:${String(exam.timeLeft % 60).padStart(2, "0")}`;
  }
  if (exam.timeLeft === 0) finishExam();
}, 1000);

if (!localStorage.getItem("xcx-login") && !sessionStorage.getItem("xcx-seen")) {
  sessionStorage.setItem("xcx-seen", "1");
  show("login");
} else {
  show("home");
}
