// === Pierce Spelling Bee — Final Integrated Edition ===
// Author: 維哲專用版 (2025-10-27)

console.log("🐝 Pierce Spelling Bee 主程式啟動");

let currentUser = null;
let coins = 0;
let currentWeek = null;
let wordIndex = 0;
let words = [];
let purchased = { fireworks: false, voicepack: false };

// ✅ 初始化
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  generateWeeks();
  initStore();
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
    updateUI();
  }

  btnLogin.onclick = () => {
    if (!usernameInput.value.trim()) return alert("請輸入名字！");
    currentUser = usernameInput.value.trim();
    coins = 0;
    localStorage.setItem("beeUser", currentUser);
    localStorage.setItem("beeCoins", "0");
    updateUI();
  };

  btnLogout.onclick = () => {
    localStorage.removeItem("beeUser");
    location.reload();
  };

  function updateUI() {
    loginArea.classList.add("hidden");
    profileArea.classList.remove("hidden");
    nameDisplay.textContent = currentUser;
    coinDisplay.textContent = coins;
  }
}

// === 生成週次 ===
function generateWeeks() {
  const container = document.getElementById("weeks");
  if (!container || !window.WEEK_LISTS) return;
  container.innerHTML = "";

  Object.entries(WEEK_LISTS).forEach(([week, list]) => {
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${week} — ${list.length} words`;
    btn.onclick = () => startTrainer(week);
    container.appendChild(btn);
  });
  console.log("✅ 週次生成完成");
}

// === 開始訓練 ===
function startTrainer(week) {
  currentWeek = week;
  words = WEEK_LISTS[week];
  wordIndex = 0;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("trainer").classList.remove("hidden");
  document.getElementById("trainer-title").textContent = `Week ${week}`;
  nextWord();
}

// === 出題 ===
function nextWord() {
  const progress = document.getElementById("progress-info");
  const feedback = document.getElementById("feedback");
  const hint = document.getElementById("hint");
  const answer = document.getElementById("answer");

  if (wordIndex >= words.length) {
    alert(`恭喜完成 Week ${currentWeek}！🎉`);
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("trainer").classList.add("hidden");
    return;
  }

  const { word, meaning } = words[wordIndex];
  progress.textContent = `${wordIndex + 1}/${words.length}`;
  feedback.textContent = "";
  hint.textContent = "";
  hint.classList.add("hidden");
  answer.value = "";

  const btnHint = document.getElementById("btn-hint");
  btnHint.onclick = () => {
    hint.textContent = meaning;
    hint.classList.remove("hidden");
  };

  document.getElementById("btn-speak").onclick = () => speakWord(word);
  document.getElementById("btn-submit").onclick = () => checkAnswer(word, meaning);
  document.getElementById("btn-next").classList.add("hidden");

  // 自動朗讀
  speakWord(word);
}

// === 檢查答案 ===
function checkAnswer(correctWord, meaning) {
  const input = document.getElementById("answer").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");
  const btnNext = document.getElementById("btn-next");

  if (!input) return;

  if (input === correctWord.toLowerCase()) {
    feedback.innerHTML = `✅ 正確！<br>${correctWord}：${meaning}`;
    coins += 2;
    localStorage.setItem("beeCoins", coins);
    document.getElementById("coin-balance").textContent = coins;

    if (purchased.fireworks) smallFirework();
  } else {
    feedback.innerHTML = `❌ 錯了！<br>正確拼法是：<b>${correctWord}</b><br>${meaning}`;
  }

  btnNext.classList.remove("hidden");
  btnNext.onclick = () => {
    wordIndex++;
    nextWord();
  };
}

// === 語音播放 ===
function speakWord(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = purchased.voicepack ? 0.9 : 0.8;
  speechSynthesis.speak(utter);
}

// === 小型煙火特效 ===
function smallFirework() {
  const fx = document.createElement("div");
  fx.style.position = "fixed";
  fx.style.left = Math.random() * 80 + 10 + "%";
  fx.style.top = Math.random() * 50 + 20 + "%";
  fx.style.width = "6px";
  fx.style.height = "6px";
  fx.style.borderRadius = "50%";
  fx.style.background = `hsl(${Math.random() * 360},100%,60%)`;
  fx.style.boxShadow = "0 0 10px white";
  document.body.appendChild(fx);
  setTimeout(() => fx.remove(), 600);
}

// === 商店 ===
function initStore() {
  const modal = document.getElementById("store-modal");
  const btnStore = document.getElementById("btn-store");
  const balance = document.getElementById("store-balance");
  const items = modal.querySelectorAll("[data-buy]");

  btnStore.onclick = () => {
    balance.textContent = coins;
    modal.showModal();
  };

  items.forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const key = btn.getAttribute("data-buy");
      const price = key === "fireworks" ? 50 : 30;
      if (coins < price) return alert("餘額不足！");
      coins -= price;
      purchased[key] = true;
      localStorage.setItem("beeCoins", coins);
      localStorage.setItem("beeItems", JSON.stringify(purchased));
      alert("購買成功！");
      balance.textContent = coins;
    };
  });
}