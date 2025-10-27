// === Pierce Spelling Bee — Final Stable v20251028 ===
// Author: 維哲專用版（支援中英單字 + GitHub Pages 優化）
// 功能：登入、商店、週次自動生成、答題系統、煙火特效、語音朗讀

console.log("🐝 Pierce Spelling Bee Main Loaded v20251028");

// === 全域變數 ===
let currentUser = null;
let coins = 0;
let currentWeek = null;
let wordIndex = 0;
let words = [];
let purchased = { fireworks: false, voicepack: false };

// === 頁面載入後執行 ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("📘 DOM 已載入，準備初始化...");
  initLogin();
  initStore();
  waitForWeeks(); // 等待 weeks.js 載入後再生成週次
});

// === 等待 weeks.js 載入完成 ===
function waitForWeeks() {
  const menu = document.getElementById("menu");
  const weeksContainer = document.getElementById("weeks");

  const check = setInterval(() => {
    if (window.WEEK_LISTS && Object.keys(window.WEEK_LISTS).length > 0) {
      clearInterval(check);
      console.log("✅ WEEK_LISTS 已載入，共", Object.keys(window.WEEK_LISTS).length, "週");
      generateWeeks();
      menu.classList.remove("hidden");
      weeksContainer.style.display = "grid";
    }
  }, 400);
}

// === 生成週次按鈕（支援 word/meaning 格式） ===
function generateWeeks() {
  const weeksContainer = document.getElementById("weeks");
  if (!weeksContainer) return;

  weeksContainer.innerHTML = "";

  Object.entries(window.WEEK_LISTS).forEach(([week, list]) => {
    const count = Array.isArray(list) ? list.length : 0;

    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${week} — ${count} words`;

    btn.addEventListener("click", () => {
      if (count === 0) {
        alert(`Week ${week} 還沒有單字喔 🐝`);
        return;
      }
      startWeek(week);
    });

    weeksContainer.appendChild(btn);
  });

  console.log("🎯 已生成所有週次按鈕，共", Object.keys(window.WEEK_LISTS).length, "週。");
}

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
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
    nameDisplay.textContent = currentUser;
    coinDisplay.textContent = coins;
  }

  btnLogin.addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("請輸入名字！");
    currentUser = name;
    coins = 0;
    localStorage.setItem("beeUser", name);
    localStorage.setItem("beeCoins", "0");
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
    nameDisplay.textContent = name;
    coinDisplay.textContent = coins;
  });

  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("beeUser");
    localStorage.removeItem("beeCoins");
    localStorage.removeItem("beeItems");
    location.reload();
  });
}

// === 商店系統 ===
function initStore() {
  const modal = document.getElementById("store-modal");
  const btnStore = document.getElementById("btn-store");
  const storeBalance = document.getElementById("store-balance");

  btnStore.addEventListener("click", () => {
    storeBalance.textContent = coins;
    modal.showModal();
  });

  modal.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.dataset.buy;
      const price = item === "fireworks" ? 50 : 30;
      if (purchased[item]) return alert("已購買過此項！");
      if (coins < price) return alert("單字幣不足！");
      coins -= price;
      purchased[item] = true;
      localStorage.setItem("beeCoins", coins);
      localStorage.setItem("beeItems", JSON.stringify(purchased));
      alert("購買成功！");
      modal.close();
    });
  });
}

// === 開始週次 ===
function startWeek(weekNum) {
  currentWeek = weekNum;
  words = window.WEEK_LISTS[weekNum];
  wordIndex = 0;
  console.log(`🚀 開始 Week ${weekNum} (${words.length} words)`);

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("trainer").classList.remove("hidden");

  const title = document.getElementById("trainer-title");
  const progress = document.getElementById("progress-info");
  const answerInput = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  const hintBox = document.getElementById("hint");

  title.textContent = `Week ${weekNum}`;
  progress.textContent = `1 / ${words.length}`;
  answerInput.value = "";
  feedback.textContent = "";
  hintBox.textContent = "";
  showWord();
}

// === 顯示單字題目 ===
function showWord() {
  const progress = document.getElementById("progress-info");
  const answerInput = document.getElementById("answer");
  const feedback = document.getElementById("feedback");
  const hintBox = document.getElementById("hint");
  const btnNext = document.getElementById("btn-next");
  const currentItem = words[wordIndex];

  progress.textContent = `${wordIndex + 1} / ${words.length}`;
  feedback.textContent = "";
  hintBox.classList.add("hidden");
  answerInput.value = "";
  btnNext.classList.add("hidden");

  // 朗讀單字
  speakWord(currentItem.word);
}

// === 語音朗讀 ===
function speakWord(word) {
  if (!word) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  if (purchased.voicepack) utter.rate = 0.9;
  speechSynthesis.speak(utter);
}

// === 提交答案 ===
document.addEventListener("click", e => {
  if (e.target.id === "btn-submit") {
    const ans = document.getElementById("answer").value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");
    const btnNext = document.getElementById("btn-next");
    const correctWord = words[wordIndex].word.toLowerCase();

    if (ans === correctWord) {
      feedback.textContent = `✅ 正確！(${words[wordIndex].meaning})`;
      feedback.style.color = "#3fa34d";
      coins += 1;
      localStorage.setItem("beeCoins", coins);
      document.getElementById("coin-balance").textContent = coins;
      if (purchased.fireworks) launchFireworks();
    } else {
      feedback.textContent = `❌ 錯誤，正確拼法是 ${correctWord}（${words[wordIndex].meaning}）`;
      feedback.style.color = "#ff5555";
    }
    btnNext.classList.remove("hidden");
  }

  if (e.target.id === "btn-next") {
    wordIndex++;
    if (wordIndex < words.length) showWord();
    else {
      alert(`🎉 恭喜完成 Week ${currentWeek}！`);
      document.getElementById("trainer").classList.add("hidden");
      document.getElementById("menu").classList.remove("hidden");
    }
  }
});

// === 顯示提示 ===
document.getElementById("btn-hint").addEventListener("click", () => {
  const hint = document.getElementById("hint");
  const word = words[wordIndex].word;
  hint.textContent = `提示：開頭是 ${word[0].toUpperCase()}...`;
  hint.classList.remove("hidden");
});

// === 返回主選單 ===
document.getElementById("btn-back").addEventListener("click", () => {
  document.getElementById("trainer").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
});
// === 除錯顯示 ===
setTimeout(() => {
  console.log("🐝 除錯檢查開始");

  if (!window.WEEK_LISTS) {
    alert("❌ WEEK_LISTS 未定義！");
    return;
  }

  const count = Object.keys(window.WEEK_LISTS).length;
  alert(`✅ WEEK_LISTS 已載入，共 ${count} 週`);

  const firstWeek = window.WEEK_LISTS[1];
  console.log("Week 1 sample:", firstWeek);

  const weeksContainer = document.getElementById("weeks");
  console.log("📦 weeksContainer =", weeksContainer);
  console.log("📦 innerHTML =", weeksContainer.innerHTML);

}, 2000);