/* Pierce Edition — 完整主程式 (答題 + 中文解釋 + 錄音提示 + 商店 + 煙火) */

const els = {
  loginArea: document.getElementById('login-area'),
  profileArea: document.getElementById('profile-area'),
  username: document.getElementById('username'),
  btnLogin: document.getElementById('btn-login'),
  btnLogout: document.getElementById('btn-logout'),
  profileName: document.getElementById('profile-name'),
  coinBalance: document.getElementById('coin-balance'),
  weeks: document.getElementById('weeks'),
  menu: document.getElementById('menu'),
  trainer: document.getElementById('trainer'),
  trainerTitle: document.getElementById('trainer-title'),
  progressInfo: document.getElementById('progress-info'),
  btnBack: document.getElementById('btn-back'),
  btnSpeak: document.getElementById('btn-speak'),
  btnHint: document.getElementById('btn-hint'),
  hint: document.getElementById('hint'),
  answer: document.getElementById('answer'),
  btnSubmit: document.getElementById('btn-submit'),
  feedback: document.getElementById('feedback'),
  btnNext: document.getElementById('btn-next'),
  storeModal: document.getElementById('store-modal'),
  btnStore: document.getElementById('btn-store'),
  storeBalance: document.getElementById('store-balance'),
  fx: document.getElementById('fx'),
};

const DB_KEY = 'pierce.sb.profile';
const PRICE = { fireworks: 50, voicepack: 30 };

let state = {
  user: null,
  week: null,
  words: [],
  order: [],
  index: 0,
  purchased: {},
  coins: 0,
  voiceRate: 1.0,
};

/* === 基本資料存取 === */
function loadProfile() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e){ return null; }
}
function saveProfile() {
  if (!state.user) return;
  const profile = {
    user: state.user,
    coins: state.coins,
    purchased: state.purchased,
    progress: state.progress || {},
  };
  localStorage.setItem(DB_KEY, JSON.stringify(profile));
}

/* === 登入登出 === */
function login(name) {
  let profile = loadProfile();
  if (!profile || profile.user !== name) {
    profile = { user: name, coins: 0, purchased: {}, progress: {} };
    localStorage.setItem(DB_KEY, JSON.stringify(profile));
  }
  applyProfile(profile);
}
function logout() {
  state = { user:null, week:null, words:[], order:[], index:0, purchased:{}, coins:0, voiceRate:1.0, progress:{} };
  els.profileArea.classList.add('hidden');
  els.loginArea.classList.remove('hidden');
  updateCoins(0);
}
function applyProfile(profile) {
  state.user = profile.user;
  state.coins = profile.coins || 0;
  state.purchased = profile.purchased || {};
  state.progress = profile.progress || {};
  els.profileName.textContent = state.user;
  updateCoins(state.coins);
  els.loginArea.classList.add('hidden');
  els.profileArea.classList.remove('hidden');
}
function updateCoins(v) { els.coinBalance.textContent = v; }

/* === 週次按鈕 === */
function buildWeekButtons() {
  els.weeks.innerHTML = '';
  for (let w=1; w<=18; w++) {
    const count = (window.WEEK_LISTS[w] || []).length;
    const btn = document.createElement('button');
    btn.innerHTML = `Week ${w}${count?`<br><small>${count} words</small>`:''}`;
    btn.disabled = count === 0;
    btn.addEventListener('click', ()=> startWeek(w));
    els.weeks.appendChild(btn);
  }
}
function shuffle(arr) {
  for (let i=arr.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* === 練習主流程 === */
function startWeek(w) {
  state.week = w;
  state.words = (window.WEEK_LISTS[w]||[]).slice();
  state.order = shuffle([...Array(state.words.length).keys()]);
  state.index = 0;
  els.menu.classList.add('hidden');
  els.trainer.classList.remove('hidden');
  els.trainerTitle.textContent = `Week ${w}`;
  updateProgress();
  nextPrompt();
}
function updateProgress() {
  els.progressInfo.textContent = `${Math.min(state.index+1, state.words.length)}/${state.words.length}`;
}
function currentItem() { return state.words[state.order[state.index]]; }

/* === 語音與提示 === */
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = state.voiceRate;
  window.speechSynthesis.speak(u);
}
function showHint() {
  const item = currentItem();
  const w = item.word;
  const hint = w.replace(/[A-Za-z]/g, '•').replace(/\s+/g, '  ');
  els.hint.textContent = hint + `  (${w.length} 個字母)`;
  els.hint.classList.remove('hidden');
}

/* === 煙火特效 === */
function correctFx() {
  if (!state.purchased.fireworks) return;
  const canvas = els.fx;
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random()*innerWidth,
    y: Math.random()*innerHeight*0.6,
    vx: (Math.random()-0.5)*6,
    vy: -Math.random()*8 - 2,
    g: 0.25 + Math.random()*0.1,
    r: 2 + Math.random()*3
  }));
  let t = 0;
  function tick() {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    pieces.forEach(p => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${(p.x+p.y+t)%360},100%,60%)`;
      ctx.fill();
    });
    t++;
    if (t<90) requestAnimationFrame(tick); else canvas.classList.add('hidden');
  }
  tick();
}

/* === 錄音檢測 === */
function setupRecording(buttonEl) {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('瀏覽器不支援錄音功能');
    return;
  }
  buttonEl.disabled = true;
  buttonEl.textContent = '🎙️ 錄音中…';
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 512;
    const data = new Uint8Array(analyser.frequencyBinCount);
    let loud = false;
    const start = Date.now();
    function check() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a,b)=>a+b,0)/data.length;
      if (avg > 15) loud = true;
      if (Date.now()-start < 3000) requestAnimationFrame(check);
      else {
        stream.getTracks().forEach(t=>t.stop());
        buttonEl.textContent = loud ? '✅ 很棒！再試一次' : '🔈 再大聲一點！';
        setTimeout(()=> buttonEl.textContent='🎤 嘗試錄音練習', 2500);
        buttonEl.disabled = false;
      }
    }
    check();
  }).catch(()=> alert('無法啟用麥克風權限'));
}

/* === 答題流程 === */
function nextPrompt() {
  if (state.index >= state.words.length) {
    els.feedback.className = 'feedback good';
    els.feedback.textContent = '恭喜完成本週所有單字 🎉';
    els.btnSubmit.disabled = true;
    els.answer.disabled = true;
    els.btnNext.classList.add('hidden');
    return;
  }
  els.answer.value = '';
  els.hint.classList.add('hidden');
  els.feedback.textContent = '';
  els.btnNext.classList.add('hidden');
  updateProgress();
  const w = currentItem().word;
  setTimeout(()=> speak(w), 250);
}
function submit() {
  const item = currentItem();
  const correct = item.word.trim().toLowerCase();
  const input = (els.answer.value||'').trim().toLowerCase();
  if (!input) return;
  if (input === correct) {
    els.feedback.className = 'feedback good';
    els.feedback.innerHTML = `✅ 答對了！<br>${item.word} (${item.meaning||''})`;
    const recBtn = document.createElement('button');
    recBtn.textContent = '🎤 嘗試錄音練習';
    recBtn.style.marginTop = '8px';
    recBtn.addEventListener('click', ()=> setupRecording(recBtn));
    els.feedback.appendChild(recBtn);
    state.coins += 1;
    updateCoins(state.coins);
    correctFx();
    state.index++;
    saveProfile();
    els.btnNext.classList.remove('hidden');
  } else {
    els.feedback.className = 'feedback bad';
    els.feedback.textContent = '❌ 再試一次！';
  }
}

/* === 商店 === */
function buy(item) {
  const cost = PRICE[item];
  if (state.purchased[item]) return;
  if (state.coins < cost) return alert('單字幣不足');
  state.coins -= cost;
  state.purchased[item] = true;
  if (item === 'voicepack') state.voiceRate = 1.25;
  updateCoins(state.coins);
  saveProfile();
  refreshStore();
}
function refreshStore() {
  els.storeBalance.textContent = state.coins;
  els.storeModal.querySelectorAll('[data-buy]').forEach(btn=>{
    const item = btn.getAttribute('data-buy');
    const owned = !!state.purchased[item];
    const ownedTag = btn.parentElement.querySelector('.owned');
    btn.classList.toggle('hidden', owned);
    ownedTag.classList.toggle('hidden', !owned);
  });
}

/* === 事件 === */
els.btnLogin.addEventListener('click', ()=>{
  const name = (els.username.value||'').trim();
  if (!name) return;
  login(name);
  buildWeekButtons();
});
els.btnLogout.addEventListener('click', logout);
els.btnBack.addEventListener('click', ()=>{
  els.trainer.classList.add('hidden');
  els.menu.classList.remove('hidden');
  buildWeekButtons();
});
els.btnSpeak.addEventListener('click', ()=> speak(currentItem()?.word||''));
els.btnHint.addEventListener('click', showHint);
els.btnSubmit.addEventListener('click', submit);
els.answer.addEventListener('keydown', e=>{
  if (e.key === 'Enter') { e.preventDefault(); submit(); }
});
els.btnNext.addEventListener('click', nextPrompt);
els.btnStore.addEventListener('click', ()=>{ refreshStore(); els.storeModal.showModal(); });

/* === 初始化 === */
(function init(){
  const p = loadProfile();
  if (p) applyProfile(p);
  buildWeekButtons();
})();