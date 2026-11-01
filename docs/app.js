const quotes = [
  ["学而时习之，不亦说乎？", "《论语》"],
  ["读书破万卷，下笔如有神。", "杜甫"],
  ["温故而知新，可以为师矣。", "《论语》"],
  ["千里之行，始于足下。", "《老子》"]
];
const state = {
  tab: "home",
  screen: "home",
  quote: 0,
  cat: "vocabulary",
  queue: [],
  index: 0,
  picked: null,
  nickname: localStorage.getItem("xcx-name") || "同学",
  stats: JSON.parse(localStorage.getItem("xcx-stats") || '{"score":0,"done":0,"right":0,"wrong":[]}'),
  messages: [{ role: "bot", text: "你好！我是你的语文学习助手。\n\n你可以问我：\n• 词语释义\n• 诗词赏析\n• 语法知识\n• 写作技巧" }]
};
const titles = { home: "语文助手", exercise: "练习", chat: "答疑", profile: "我的", practice: "练习", record: "学习记录", report: "学习报告", login: "登录" };
const $ = (id) => document.getElementById(id);

function save() { localStorage.setItem("xcx-stats", JSON.stringify(state.stats)); localStorage.setItem("xcx-name", state.nickname); }
function accuracy() { return state.stats.done ? Math.round(state.stats.right / state.stats.done * 100) : 0; }
function daysLeft() {
  const exam = new Date("2026-03-30T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((exam - today) / 86400000));
}
function greeting() {
  const h = new Date().getHours();
  if (h < 9) return "早上好";
  if (h < 12) return "上午好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}
function show(name, tab) {
  state.screen = name;
  if (tab) state.tab = tab;
  $("nav-title").textContent = titles[name] || "语文助手";
  document.querySelectorAll(".screen").forEach(node => node.classList.toggle("active", node.dataset.screen === name));
  document.querySelectorAll(".tabbar button").forEach(node => node.classList.toggle("active", node.dataset.tab === state.tab));
  if (name === "home") renderHome();
  if (name === "exercise") renderExercise();
  if (name === "profile") renderProfile();
  if (name === "chat") renderChat();
  if (name === "record") renderRecord();
  if (name === "report") renderReport();
}
function counts() {
  return { vocabulary: bank("vocabulary").length, idiom: bank("idiom").length, pinyin: bank("pinyin").length, correction: bank("correction").length };
}
function bank(cat) { return window.QUESTION_BANK.filter(item => !cat || item.cat === cat); }
function startPractice(cat, count) {
  const pool = bank(cat).slice();
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  state.queue = pool.slice(0, count || pool.length || 1);
  state.index = 0;
  state.picked = null;
  show("practice", "exercise");
  renderQuestion();
}
function renderHome() {
  const c = counts();
  $("home").innerHTML = `
    <div class="header">
      <div class="hello"><div class="avatar">${state.nickname.slice(0, 1)}</div><div><h1>${greeting()}，${state.nickname}！</h1><p>今天也要加油学习哦！</p></div></div>
      <div class="banner">📅 距离考试还剩 ${daysLeft()} 天</div>
    </div>
    <div class="stats">
      <div class="stat"><b class="blue">${state.stats.score}</b><span>今日得分</span></div>
      <div class="stat"><b class="orange">${state.stats.done}</b><span>做题数</span></div>
      <div class="stat"><b class="green">${accuracy()}%</b><span>正确率</span></div>
    </div>
    <div class="section"><h2>学习模块 <span>查看全部 ›</span></h2>
      <div class="grid2">
        ${module("vocabulary", "词汇学习", "📖", "词语释义与运用", "#5b9bd5")}
        ${module("idiom", "成语熟语", "🦊", "成语积累与练习", "#fb923c")}
        ${module("pinyin", "拼音练习", "🔤", "拼音声调学习", "#6fcf97")}
        ${module("correction", "病句修改", "✏️", "语法病句分析", "#ffb84d")}
      </div>
    </div>
    <div class="section"><h2>快捷功能</h2>
      <div class="quick">
        <button data-go="mock"><div class="icon">📝</div>模拟考试</button>
        <button data-go="chat"><div class="icon">🤖</div>智能答疑</button>
        <button data-go="record"><div class="icon">📊</div>学习记录</button>
        <button data-go="report"><div class="icon">📈</div>学习报告</button>
      </div>
    </div>
    <div class="quote"><div style="font-size:24px">💭</div><p>“${quotes[state.quote][0]}”</p><p>—— ${quotes[state.quote][1]}</p>
      <div class="dots">${quotes.map((_, i) => `<i class="${i === state.quote ? "on" : ""}"></i>`).join("")}</div>
    </div>`;
  $("home").querySelectorAll("[data-cat]").forEach(node => node.onclick = () => startPractice(node.dataset.cat));
  $("home").querySelectorAll("[data-go]").forEach(node => node.onclick = () => {
    const go = node.dataset.go;
    if (go === "mock") startPractice(null, 10);
    else if (go === "chat") show("chat", "chat");
    else show(go, "profile");
  });
}
function module(cat, name, icon, desc, color) {
  return `<button class="module" data-cat="${cat}"><i style="background:${color}"></i><div class="icon">${icon}</div><strong>${name}</strong><small>${desc}</small></button>`;
}
function renderExercise() {
  const c = counts();
  const types = [["pinyin", "拼音练习", "🔤", "汉语拼音学习", "#10b981"], ["idiom", "成语熟语", "🦊", "成语积累运用", "#f59e0b"], ["vocabulary", "词汇学习", "📖", "词语释义辨析", "#4a90e2"], ["correction", "病句修改", "✏️", "语法病句分析", "#ef4444"]];
  $("exercise").innerHTML = `
    <div class="section"><h2>🎲 碎片化学习</h2><div class="grid2">
      <button class="fragment g1" data-count="3">⚡<strong>极速3题</strong><small>1分钟</small></button>
      <button class="fragment g2" data-count="5">🚀<strong>快速5题</strong><small>2分钟</small></button>
      <button class="fragment g3" data-count="10">🎲<strong>随机10题</strong><small>5分钟</small></button>
      <button class="fragment g4" data-count="10">📊<strong>模拟考试</strong><small>示例10题</small></button>
    </div></div>
    <div class="section"><h2>📚 复习专区</h2><div class="review">
      <button class="card" data-go="wrong">❌<br>错题重做<br><small>${state.stats.wrong.length} 题</small></button>
      <button class="card" data-go="fav">⭐<br>收藏练习<br><small>网页版暂存在本地</small></button>
    </div></div>
    <div class="section"><h2>📋 题型分类</h2>
      ${types.map(([id, name, icon, desc, color]) => `<button class="type" data-cat="${id}"><span class="icon" style="background:${color}22;padding:8px;border-radius:12px">${icon}</span><span><strong>${name}</strong><br><small style="color:#9ca3af">${desc}</small></span><span class="badge" style="background:${color}">${c[id] || 0}</span><span>›</span></button>`).join("")}
    </div>`;
  $("exercise").querySelectorAll("[data-count]").forEach(node => node.onclick = () => startPractice(null, Number(node.dataset.count)));
  $("exercise").querySelectorAll("[data-cat]").forEach(node => node.onclick = () => startPractice(node.dataset.cat));
  $("exercise").querySelector("[data-go=wrong]").onclick = () => startPractice(null, Math.max(1, state.stats.wrong.length));
}
function renderQuestion() {
  const item = state.queue[state.index];
  if (!item) { $("practice").innerHTML = `<div class="q-card"><h2>题库里没有可练习的题目</h2></div>`; return; }
  $("practice").innerHTML = `<div class="q-card"><p>${item.name} · ${state.index + 1} / ${state.queue.length}</p><h2>${item.q}</h2>
    ${item.options.map((option, i) => `<button class="opt" data-i="${i}">${option}</button>`).join("")}
    <p id="msg"></p>
    <div class="row"><button class="ghost" id="back">返回</button><button id="next">${state.index + 1 === state.queue.length ? "完成" : "下一题"}</button></div></div>`;
  $("practice").querySelectorAll(".opt").forEach(node => node.onclick = () => {
    state.picked = Number(node.dataset.i);
    $("practice").querySelectorAll(".opt").forEach(opt => opt.classList.remove("pick"));
    node.classList.add("pick");
    $("msg").textContent = "已选择。公开题库没有标准答案，这题记 1 分练习分。";
  });
  $("back").onclick = () => show("exercise", "exercise");
  $("next").onclick = () => {
    if (state.picked !== null) {
      state.stats.done += 1;
      state.stats.score += 1;
      state.stats.right += 1;
      save();
    }
    if (state.index + 1 >= state.queue.length) show("report", "profile");
    else { state.index += 1; state.picked = null; renderQuestion(); }
  };
}
function renderChat() {
  $("messages").innerHTML = state.messages.map(item => `<div class="bubble ${item.role}">${item.text}</div>`).join("");
  $("messages").scrollTop = $("messages").scrollHeight;
}
function reply(text) {
  const hit = window.QUESTION_BANK.find(item => text && item.q.includes(text.slice(0, 6)));
  if (hit) return `我在题库里找到了相关题：\n${hit.q}\n你可以到「练习」里按${hit.name}继续做。`;
  return "网页版不能连接原来的云端模型。你可以问一个词语或成语，我会在本地题库里帮你找相关题目。";
}
function renderProfile() {
  $("profile").innerHTML = `
    <div class="header"><div class="hello"><div class="avatar">${state.nickname.slice(0, 1)}</div><div><h1>${state.nickname}</h1><p>坚持学习第 1 天</p></div></div></div>
    <div class="stats"><div class="stat"><b>${state.stats.score}</b><span>总得分</span></div><div class="stat"><b>${state.stats.done}</b><span>做题数</span></div><div class="stat"><b>${accuracy()}%</b><span>正确率</span></div></div>
    <div class="section"><h2>我的成就</h2><div class="achieve">
      <div class="${state.stats.done ? "on" : ""}">🏆 初学者<br><small>完成首次答题</small></div>
      <div>🎯 连续7天<br><small>0%</small></div>
      <div class="${state.stats.done >= 10 ? "on" : ""}">⚡ 快手<br><small>${Math.min(100, state.stats.done)}%</small></div>
      <div>🎓 学习大师<br><small>${Math.min(100, Math.round(state.stats.done / 5))}%</small></div>
    </div></div>
    <div class="menu">
      <button data-go="record">📖 学习记录 <span>›</span></button>
      <button data-go="report">📊 学习报告 <span>›</span></button>
      <button data-go="login">⚙️ 修改称呼 <span>›</span></button>
    </div>`;
  $("profile").querySelectorAll("[data-go]").forEach(node => node.onclick = () => show(node.dataset.go, "profile"));
}
function renderRecord() {
  $("record").innerHTML = `<div class="q-card"><h2>学习记录</h2><p>已做 ${state.stats.done} 题，得分 ${state.stats.score}。</p><p>记录保存在这台浏览器里，不会上传。</p><button class="primary" id="back-home">返回首页</button></div>`;
  $("back-home").onclick = () => show("home", "home");
}
function renderReport() {
  $("report").innerHTML = `<div class="q-card"><h2>学习报告</h2><p>正确率 ${accuracy()}%。网页版题库没有标准答案，完成的题目都记为练习分。</p><button class="primary" id="again">再练一组</button></div>`;
  $("again").onclick = () => startPractice(null, 5);
}
function renderLogin() {
  $("login").innerHTML = `<div class="login"><div class="avatar" style="margin:0 auto 12px;background:#5b9bd5;color:#fff">${state.nickname.slice(0,1)}</div><h2>欢迎使用语文助手</h2><p>网页版用称呼代替微信登录。</p><input id="name" value="${state.nickname}" maxlength="12"/><button class="primary" id="save-name">进入首页</button></div>`;
  $("save-name").onclick = () => { state.nickname = $("name").value.trim() || "同学"; save(); show("home", "home"); };
}
document.querySelectorAll(".tabbar button").forEach(button => button.onclick = () => show(button.dataset.tab, button.dataset.tab));
$("send").onclick = () => {
  const text = $("chat-input").value.trim();
  if (!text) return;
  state.messages.push({ role: "me", text });
  state.messages.push({ role: "bot", text: reply(text) });
  $("chat-input").value = "";
  renderChat();
};
$("chat-form").onsubmit = (event) => { event.preventDefault(); $("send").click(); };
setInterval(() => { state.quote = (state.quote + 1) % quotes.length; if (state.screen === "home") renderHome(); }, 5000);
show("home", "home");
