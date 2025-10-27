// === Pierce Spelling Bee — Fixed Visible Build (2025-10-27) ===
// 整合：登入、商店、中文解釋、朗讀、煙火、週次修正
console.log("🟢 main.js loaded");

// === 全域變數 ===
let currentUser = null;
let coins = 0;
let currentWeek = null;
let words = [];
let currentIndex = 0;
let purchased = { fireworks: false, voicepack: false };

// === 初始化 ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM Ready");

  // 保證 menu 顯示
  const menu = document.getElementById("menu");
  if (menu) menu.classList.remove("hidden");
  const weeksContainer = document.getElementById("weeks");
  if (weeksContainer) weeksContainer.style.display = "block";

  initLogin();
  initStore();

  // 等待 WEEK_LISTS 可用
  if (window.WEEK_LISTS && Object.keys(window.WEEK_LISTS).length > 0) {
    console.log("✅ WEEK_LISTS ready");
    generateWeeks();
  } else {
    console.warn("⚠️ WEEK_LISTS not ready, retrying...");
    const timer = setInterval(() => {
      if (window.WEEK_LISTS && Object.keys(window.WEEK_LISTS).length > 0) {
        console.log("✅ WEEK_LISTS detected (delayed)");
        generateWeeks();
        clearInterval(timer);
      }
    }, 800);
  }
});

// === 登入系統 ===
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
  const savedItems = localStorage.getItem("beeItems");

  if (savedUser) {
    currentUser = savedUser;
    coins = parseInt(savedCoins || "0");
    purchased = savedItems ? JSON.parse(savedItems) : purchased;
    nameDisplay.textContent = currentUser;
    coinDisplay.textContent = coins;
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
  }

  btnLogin.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("請輸入名字！");
    currentUser = name;
    localStorage.setItem("beeUser", name);
    localStorage.setItem("beeCoins", coins);
    nameDisplay.textContent = name;
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("beeUser");
    location.reload();
  });
}

// === 生成週次 ===
function generateWeeks() {
  console.log("🔧 Generating week buttons...");

  const weekContainer = document.getElementById("weeks");
  if (!weekContainer) {
    console.error("❌ No #weeks element found");
    return;
  }

  weekContainer.innerHTML = "";
  weekContainer.style.display = "grid";
  weekContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
  weekContainer.style.gap = "12px";

  const weekNumbers = Object.keys(window.WEEK_LISTS || {}).map(Number).sort((a, b) => a - b);
  if (weekNumbers.length === 0) {
    weekContainer.innerHTML = "<p style='color:#ccc;'>❌ 沒有單字資料。</p>";
    return;
  }

  weekNumbers.forEach(week => {
    const list = window.WEEK_LISTS[week];
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${week} — ${list.length} words`;
    btn.style.cssText = `
      background:#2a3b6a;
      color:white;
      border:none;
      border-radius:8px;
      padding:12px;
      font-size:1rem;
      cursor:pointer;
    `;
    btn.addEventListener("click", () => openTrainer(week));
    weekContainer.appendChild(btn);
  });

  console.log(`✅ 已生成 ${weekNumbers.length} 週按鈕`);
}

// === 開啟拼字畫面 ===
function openTrainer(weekNum) {
  currentWeek = weekNum;
  words = WEEK_LISTS[weekNum];
  currentIndex = 0;

  if (!words || words.length === 0) {
    alert(`⚠️ Week ${weekNum} 沒有單字資料`);
    return;
  }

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("trainer").classList.remove("hidden");
  document.getElementById("trainer-title").textContent = `Week ${weekNum}`;
  document.getElementById("progress-info").textContent = `1 / ${words.length}`;

  showWord();
}

// === 顯示單字 ===
function showWord() {
  const feedback = document.getElementById("feedback");
  feedback.textContent = "";
  const hint = document.getElementById("hint");
  hint.textContent = "";
  hint.classList.add("hidden");

  const wordData = words[currentIndex];
  document.getElementById("answer").value = "";

  document.getElementById("btn-speak").onclick = () => speakWord(wordData.word);
  document.getElementById("btn-hint").onclick = () => {
    hint.textContent = `💡 中文提示：${wordData.meaning}`;
    hint.classList.remove("hidden");
  };

  document.getElementById("btn-submit").onclick = () => checkAnswer(wordData);
}

// === 朗讀 ===
function speakWord(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = purchased.voicepack ? 0.9 : 0.8;
  speechSynthesis.speak(utter);
}

// === 判斷對錯 ===
function checkAnswer(wordData) {
  const ans = document.getElementById("answer").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");
  const correct = wordData.word.toLowerCase();

  if (ans === correct) {
    feedback.innerHTML = `✅ 正確！<br>${wordData.word} — ${wordData.meaning}`;
    coins += 2;
    localStorage.setItem("beeCoins", coins);
    document.getElementById("coin-balance").textContent = coins;
    if (purchased.fireworks) launchFireworks();
    nextButton();
  } else {
    feedback.innerHTML = `❌ 錯誤！正確拼法是 <b>${wordData.word}</b>`;
    nextButton();
  }
}

// === 下一題 ===
function nextButton() {
  const btnNext = document.getElementById("btn-next");
  btnNext.classList.remove("hidden");
  btnNext.onclick = () => {
    btnNext.classList.add("hidden");
    currentIndex++;
    if (currentIndex >= words.length) {
      alert(`🎉 本週完成！共 ${words.length} 題`);
      document.getElementById("trainer").classList.add("hidden");
      document.getElementById("menu").classList.remove("hidden");
      generateWeeks();
    } else {
      document.getElementById("progress-info").textContent = `${currentIndex + 1} / ${words.length}`;
      showWord();
    }
  };
}

// === 商店 ===
function initStore() {
  const btnStore = document.getElementById("btn-store");
  const modal = document.getElementById("store-modal");
  const bal = document.getElementById("store-balance");
  const items = modal.querySelectorAll("[data-buy]");

  btnStore.addEventListener("click", () => {
    bal.textContent = coins;
    modal.showModal();
  });

  items.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const item = btn.getAttribute("data-buy");
      const cost = item === "fireworks" ? 50 : 30;
      if (coins < cost) return alert("💰 單字幣不足！");
      coins -= cost;
      purchased[item] = true;
      localStorage.setItem("beeCoins", coins);
      localStorage.setItem("beeItems", JSON.stringify(purchased));
      bal.textContent = coins;
      document.getElementById("coin-balance").textContent = coins;
      btn.nextElementSibling.classList.remove("hidden");
      btn.remove();
      alert(`✅ 購買成功：${item === "fireworks" ? "煙火特效" : "語音增強包"}`);
    });
  });
}

// === 煙火 ===
function launchFireworks() {
  const fx = document.getElementById("fx");
  fx.classList.remove("hidden");
  const ctx = fx.getContext("2d");
  fx.width = window.innerWidth;
  fx.height = window.innerHeight;

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * fx.width;
    const y = Math.random() * fx.height / 2;
    const r = Math.random() * 3 + 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${Math.random() * 360},100%,60%)`;
    ctx.fill();
  }

  setTimeout(() => {
    ctx.clearRect(0, 0, fx.width, fx.height);
    fx.classList.add("hidden");
  }, 800);
}

// === 🧩 診斷顯示 ===
setTimeout(() => {
  const diag = document.createElement("div");
  diag.style.position = "fixed";
  diag.style.bottom = "50px";
  diag.style.left = "10px";
  diag.style.background = "rgba(0,0,0,0.8)";
  diag.style.color = "#0f0";
  diag.style.fontFamily = "monospace";
  diag.style.padding = "8px 10px";
  diag.style.fontSize = "0.85rem";
  diag.style.borderRadius = "6px";
  diag.style.zIndex = 9999;

  let report = "";

  // 檢查 WEEK_LISTS 狀態
  if (window.WEEK_LISTS) {
    const count = Object.keys(window.WEEK_LISTS).length;
    report += `✅ WEEK_LISTS ${count} 週\n`;
  } else {
    report += "❌ WEEK_LISTS 未載入\n";
  }

  // 檢查 DOM
  const menu = document.getElementById("menu");
  const weeks = document.getElementById("weeks");
  report += menu ? "✅ #menu 存在\n" : "❌ #menu 不存在\n";
  report += weeks ? `✅ #weeks 存在 (${weeks.children.length} 子項)\n` : "❌ #weeks 不存在\n";

  // 檢查顯示狀態
  if (weeks) {
    const style = getComputedStyle(weeks);
    report += `顯示狀態：display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}`;
  }

  diag.textContent = report;
  document.body.appendChild(diag);
}, 1500);