// === 🐝 Pierce Spelling Bee — Never Missing Buttons Edition v20251029 ===
// 維哲專用強化版：週次按鈕保證生成、支援登入/幣值/商店/錄音/煙火
// -------------------------------------------------------

console.log("🐝 Pierce Spelling Bee Loaded (v20251029)");

let currentUser = null;
let coins = 0;
let purchased = { fireworks: false, voicepack: false };
let currentWeek = null;
let currentIndex = 0;
let currentWords = [];

// === 初始化 ===
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initStore();
  safeGenerateWeeks();
  bindTrainerButtons();
  bindRecorderButtons();
});

// === 🧱 永不錯過的週次生成 ===
function safeGenerateWeeks(attempt = 1) {
  const container = document.getElementById("weeks");
  const maxRetry = 10;

  if (!container) {
    console.warn(`⚠️ #weeks 尚未出現，延遲重試 (${attempt}/${maxRetry})`);
    if (attempt < maxRetry) setTimeout(() => safeGenerateWeeks(attempt + 1), 500);
    return;
  }

  // 確保有資料
  if (!window.WEEK_LISTS || Object.keys(window.WEEK_LISTS).length === 0) {
    console.warn("⚠️ WEEK_LISTS 尚未載入，等待中...");
    setTimeout(() => safeGenerateWeeks(attempt + 1), 500);
    return;
  }

  generateWeeks();
}

// === 🧩 生成週次按鈕 ===
function generateWeeks() {
  const container = document.getElementById("weeks");
  container.innerHTML = "";

  const weekKeys = Object.keys(window.WEEK_LISTS || {});
  weekKeys.forEach(num => {
    const words = window.WEEK_LISTS[num] || [];
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${num} — ${words.length} words`;
    btn.addEventListener("click", () => startTraining(num));
    container.appendChild(btn);
  });

  console.log(`✅ 已生成 ${weekKeys.length} 個週次按鈕`);
}

// === 👤 登入系統 ===
function initLogin() {
  const loginArea = document.getElementById("login-area");
  const profileArea = document.getElementById("profile-area");
  const usernameInput = document.getElementById("username");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const nameDisplay = document.getElementById("profile-name");
  const coinDisplay = document.getElementById("coin-balance");

  const savedUser = localStorage.getItem("beeUser");
  const savedCoins = localStorage.getItem("beeCoins");

  if (savedUser) {
    currentUser = savedUser;
    coins = parseInt(savedCoins || "0");
    showProfile();
  }

  btnLogin.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("請輸入名字！");
    currentUser = name;
    coins = 0;
    localStorage.setItem("beeUser", name);
    localStorage.setItem("beeCoins", "0");
    showProfile();
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("beeUser");
    localStorage.removeItem("beeCoins");
    location.reload();
  });

  function showProfile() {
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
    nameDisplay.textContent = currentUser;
    coinDisplay.textContent = coins;
  }
}

// === 🛒 商店 ===
function initStore() {
  const btnStore = document.getElementById("btn-store");
  const dialog = document.getElementById("store-modal");
  const balance = document.getElementById("store-balance");

  if (!btnStore || !dialog) return;

  btnStore.addEventListener("click", () => {
    balance.textContent = coins;
    dialog.showModal();
  });

  dialog.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.buy) {
      const item = e.target.dataset.buy;
      const cost = item === "fireworks" ? 50 : 30;
      if (coins >= cost) {
        coins -= cost;
        purchased[item] = true;
        localStorage.setItem("beeCoins", coins);
        document.getElementById("coin-balance").textContent = coins;
        alert(`✅ 購買成功：${item}`);
        balance.textContent = coins;
      } else {
        alert("💰 餘額不足！");
      }
    }
  });
}

// === 🐝 開始訓練 ===
function startTraining(weekNum) {
  currentWeek = weekNum;
  currentWords = window.WEEK_LISTS[weekNum] || [];
  currentIndex = 0;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("trainer").classList.remove("hidden");

  document.getElementById("trainer-title").textContent = `Week ${weekNum}`;
  updateProgress();
  showWord();
}

// === 顯示題目 ===
function showWord() {
  const feedback = document.getElementById("feedback");
  const hintBox = document.getElementById("hint");
  const answer = document.getElementById("answer");
  const nextBtn = document.getElementById("btn-next");

  feedback.textContent = "";
  hintBox.textContent = "";
  answer.value = "";
  nextBtn.classList.add("hidden");

  const wordObj = currentWords[currentIndex];
  if (!wordObj) return;

  document.getElementById("btn-speak").onclick = () => speakWord(wordObj.word);
  document.getElementById("btn-hint").onclick = () => {
    hintBox.textContent = wordObj.meaning;
    hintBox.classList.remove("hidden");
  };
}

// === 確認答案 ===
function bindTrainerButtons() {
  document.getElementById("btn-submit").addEventListener("click", () => {
    const wordObj = currentWords[currentIndex];
    const input = document.getElementById("answer").value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("btn-next");

    if (!wordObj) return;

    if (input === wordObj.word.toLowerCase()) {
      feedback.innerHTML = `✅ 正確！ (${wordObj.word})<br><span style="color:#ccc;">${wordObj.meaning}</span>`;
      feedback.style.color = "#0f0";

      coins += 1;
      localStorage.setItem("beeCoins", coins);
      document.getElementById("coin-balance").textContent = coins;

      playFireworks();
    } else {
      feedback.innerHTML = `❌ 錯了，正確拼法是：<b>${wordObj.word}</b><br><span style="color:#ccc;">${wordObj.meaning}</span>`;
      feedback.style.color = "#f66";
    }

    nextBtn.classList.remove("hidden");
  });

  document.getElementById("btn-next").addEventListener("click", () => {
    currentIndex++;
    if (currentIndex < currentWords.length) {
      showWord();
      updateProgress();
    } else {
      endTraining();
    }
  });

  document.getElementById("btn-back").addEventListener("click", () => {
    document.getElementById("trainer").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
  });
}

// === 更新進度 ===
function updateProgress() {
  document.getElementById("progress-info").textContent =
    `${currentIndex + 1}/${currentWords.length}`;
}

// === 結束週次 ===
function endTraining() {
  alert(`🎉 恭喜完成 Week ${currentWeek}！`);
  document.getElementById("trainer").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// === 語音朗讀 ===
function speakWord(word) {
  if (!word) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = purchased.voicepack ? 0.9 : 1.1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}

// === 🎆 煙火特效 ===
function playFireworks() {
  const fx = document.getElementById("fx");
  if (!fx) return;

  fx.classList.remove("hidden");
  fx.style.display = "block";
  fx.style.position = "fixed";
  fx.style.top = 0;
  fx.style.left = 0;
  fx.style.width = "100vw";
  fx.style.height = "100vh";
  fx.style.zIndex = 999;
  fx.style.pointerEvents = "none";
  fx.style.background = `radial-gradient(circle at ${Math.random()*100}% ${Math.random()*100}%, hsl(${Math.random()*360},100%,60%) 10%, transparent 70%)`;
  fx.style.transition = "opacity 1s ease";
  fx.style.opacity = 1;

  setTimeout(() => {
    fx.style.opacity = 0;
    setTimeout(() => fx.classList.add("hidden"), 800);
  }, 800);
}

// === 🎤 錄音功能 ===
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

async function startRecording() {
  if (isRecording) return alert("⏺️ 已在錄音中！");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    isRecording = true;

    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = () => {
      isRecording = false;
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      alert("🎧 錄音完成並播放。");
    };

    mediaRecorder.start();
    alert("🎙️ 錄音開始，請說出單字！");
  } catch (err) {
    console.error(err);
    alert("⚠️ 無法啟動錄音，請允許麥克風權限。");
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
  } else {
    alert("ℹ️ 尚未開始錄音");
  }
}

function bindRecorderButtons() {
  const btnRec = document.getElementById("btn-record");
  const btnStop = document.getElementById("btn-stop");
  if (btnRec) btnRec.addEventListener("click", startRecording);
  if (btnStop) btnStop.addEventListener("click", stopRecording);
}

// === ✅ 除錯提示 ===
setTimeout(() => {
  const tag = document.createElement("div");
  tag.style = `
    position: fixed; bottom: 5px; left: 5px;
    background: rgba(0,0,0,0.85); color: #0f0;
    font-family: monospace; font-size: 0.8rem;
    padding: 6px 10px; border-radius: 6px; z-index: 9999;
  `;
  tag.innerHTML = `🟢 main.js 已載入 (${Date.now()})<br>✅ 自動週次生成啟動`;
  document.body.appendChild(tag);
}, 1000);