// === Pierce Spelling Bee — Final Stable v20251028 ===
// Author: 維哲專用最終整合版（支援自動生成週次 + 商店 + 登入）
// -----------------------------------------------------

console.log("🐝 Pierce Spelling Bee Loaded (v20251028)");

let currentUser = null;
let coins = 0;
let purchased = { fireworks: false, voicepack: false };

// === 初始化 ===
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  generateWeeks();
  initStore();
});

// === 🧱 產生週次按鈕 ===
// === 🧱 產生週次按鈕 ===
function generateWeeks() {
  const weeksContainer = document.getElementById("weeks");
  if (!weeksContainer) {
    console.log("❌ 找不到 #weeks 元素");
    return;
  }

  weeksContainer.innerHTML = ""; // 清空
  const weekKeys = Object.keys(window.WEEK_LISTS || {});
  if (weekKeys.length === 0) {
    console.log("⚠️ 沒有任何週次資料");
    return;
  }

  weekKeys.forEach(num => {
    const words = window.WEEK_LISTS[num] || [];
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${num} — ${words.length} words`;

    // 綁定週次點擊事件
    btn.addEventListener("click", () => startTraining(num));

    // ✅ 關鍵：一定要加上這行才能真正顯示
    weeksContainer.appendChild(btn);
  });

  // ✅ 這行才是整個 function 的結尾
  console.log(`🎯 已生成所有週次按鈕，共 ${weekKeys.length} 週。`);
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
        alert(`✅ 購買成功：${item}`);
        balance.textContent = coins;
      } else {
        alert("💰 餘額不足！");
      }
    }
  });
}

// === 🎆 測試煙火效果 ===
function playFireworks() {
  if (!purchased.fireworks) return;
  const fx = document.getElementById("fx");
  fx.classList.remove("hidden");
  fx.style.background = "radial-gradient(circle, #ff0, #f00, transparent)";
  setTimeout(() => fx.classList.add("hidden"), 800);
}

// === 🐞 除錯模式（開發用） ===
setTimeout(() => {
  const overlay = document.createElement("div");
  overlay.style = `
    position: fixed; bottom: 5px; left: 5px;
    background: rgba(0,0,0,0.85); color: #0f0;
    font-family: monospace; font-size: 0.8rem;
    padding: 6px 10px; border-radius: 6px; z-index: 9999;
  `;
  overlay.innerHTML = `
  🟢 main.js 已載入（${Date.now()}）<br>
  ✅ WEEK_LISTS = ${Object.keys(window.WEEK_LISTS || {}).length} 週
  `;
  document.body.appendChild(overlay);

  if (typeof generateWeeks === "function") {
    console.log("🟢 generateWeeks 存在，立即執行");
    generateWeeks();
  } else {
    console.log("❌ generateWeeks 未定義");
  }
}, 1000);

// === 🐝 拼字訓練系統 ===
let currentWeek = null;
let currentIndex = 0;
let currentWords = [];

// 點擊週次按鈕 → 進入訓練模式
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

// 顯示目前題目（遮字拼音）
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

// 確認答案
// === 🧠 確認答案 ===
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

// 下一題
document.getElementById("btn-next").addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < currentWords.length) {
    showWord();
    updateProgress();
  } else {
    endTraining();
  }
});

// 返回主選單
document.getElementById("btn-back").addEventListener("click", () => {
  document.getElementById("trainer").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("btn-record").addEventListener("click", startRecording);
document.getElementById("btn-stop").addEventListener("click", stopRecording);
});

// 更新進度條
function updateProgress() {
  const progress = document.getElementById("progress-info");
  progress.textContent = `${currentIndex + 1}/${currentWords.length}`;
}

// 結束週次
function endTraining() {
  alert(`🎉 恭喜完成 Week ${currentWeek}！`);
  document.getElementById("trainer").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// 語音朗讀
function speakWord(word) {
  if (!word) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = purchased.voicepack ? 0.9 : 1.1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}

// === 🎤 錄音比對功能 ===
let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.play(); // 🔊 自動播放剛錄的音
      alert("🎧 錄音完成，可自行聆聽比對發音。");
    };

    mediaRecorder.start();
    alert("🎙️ 開始錄音（再次點擊「停止錄音」即可結束）");
  } catch (err) {
    alert("❌ 無法啟動錄音，請確認已允許麥克風權限。");
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// === 🎤 錄音功能（iOS Safari 相容版） ===
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// 錄音開始
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
      audio.play(); // 🔊 自動播放錄音結果
      alert("🎧 錄音完成！已播放剛剛的錄音。");
    };

    mediaRecorder.start();
    alert("🎙️ 開始錄音中...（請講出單字）");
  } catch (err) {
    console.error("🎤 錄音錯誤：", err);
    alert("⚠️ 無法啟動錄音，請確認：\n1️⃣ 已允許麥克風權限\n2️⃣ 網站是 HTTPS（GitHub Pages 可用）");
  }
}

// 停止錄音
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
  } else {
    alert("ℹ️ 尚未開始錄音");
  }
}
