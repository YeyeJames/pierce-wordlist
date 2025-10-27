// === Pierce Spelling Bee — Integrated Final Edition ===
// Author: 維哲專用版 (2025-10-27)

console.log("🟢 Pierce Spelling Bee 主程式載入成功");

let currentUser = null;
let coins = 0;
let currentWeek = null;
let words = [];
let currentIndex = 0;
let purchased = { fireworks: false, voicepack: false };

// === 初始化 ===
// === 初始化 ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 main.js DOMContentLoaded 觸發");
  initLogin();
  initStore();

  // 保護檢查 WEEK_LISTS
  if (window.WEEK_LISTS && Object.keys(window.WEEK_LISTS).length > 0) {
    console.log("✅ 偵測到 WEEK_LISTS，生成週次");
    generateWeeks();
  } else {
    console.warn("⚠️ WEEK_LISTS 尚未載入，將延遲啟動 generateWeeks()");

    // 若一開始沒載到，就每 1 秒檢查一次直到成功
    const timer = setInterval(() => {
      if (window.WEEK_LISTS && Object.keys(window.WEEK_LISTS).length > 0) {
        console.log("✅ WEEK_LISTS 延遲載入成功，生成週次");
        generateWeeks();
        clearInterval(timer);
      }
    }, 1000);
  }
});

// === 登入與使用者資料 ===
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

// === 週次清單 ===
// === 生成週次清單 ===
function generateWeeks() {
  console.log("🔧 開始生成週次按鈕...");

  const weekContainer = document.getElementById("weeks");
  if (!weekContainer) {
    console.error("❌ 找不到 #weeks 容器！");
    return;
  }

  weekContainer.innerHTML = ""; // 清空舊內容

  if (!window.WEEK_LISTS || Object.keys(window.WEEK_LISTS).length === 0) {
    weekContainer.innerHTML = "<p style='color:#ccc;'>❌ 找不到單字資料。</p>";
    console.warn("⚠️ WEEK_LISTS 為空");
    return;
  }

  const weekNumbers = Object.keys(window.WEEK_LISTS)
    .map(Number)
    .sort((a, b) => a - b);

  weekNumbers.forEach((week) => {
    const words = window.WEEK_LISTS[week] || [];
    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.textContent = `Week ${week} — ${words.length} words`;

    btn.addEventListener("click", () => {
      console.log(`▶️ 開啟 Week ${week}`);
      alert(`開啟 Week ${week}（目前僅測試按鈕反應）`);
    });

    weekContainer.appendChild(btn);
  });

console.log(`✅ 已生成 ${weekNumbers.length} 週按鈕`);
console.log("📋 weekContainer 內容：", weekContainer.innerHTML);
}

// === 開啟拼字訓練 ===
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

// === 語音朗讀 ===
function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  if (purchased.voicepack) utterance.rate = 0.9;
  else utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}

// === 檢查答案 ===
function checkAnswer(wordData) {
  const answer = document.getElementById("answer").value.trim().toLowerCase();
  const feedback = document.getElementById("feedback");
  const correctWord = wordData.word.toLowerCase();

  if (answer === correctWord) {
    feedback.innerHTML = `✅ 正確！<br>${wordData.word} — ${wordData.meaning}`;
    coins += 2; // 答對 +2 幣
    localStorage.setItem("beeCoins", coins);
    document.getElementById("coin-balance").textContent = coins;

    if (purchased.fireworks) launchFireworks();

    nextButton(true);
  } else {
    feedback.innerHTML = `❌ 錯誤，正確拼法是 <b>${wordData.word}</b>`;
    nextButton(false);
  }
}

// === 下一題 ===
function nextButton(success) {
  const btnNext = document.getElementById("btn-next");
  btnNext.classList.remove("hidden");
  btnNext.onclick = () => {
    btnNext.classList.add("hidden");
    currentIndex++;
    if (currentIndex >= words.length) {
      alert(`🎉 本週完成！共 ${words.length} 題`);
      document.getElementById("trainer").classList.add("hidden");
      document.getElementById("menu").classList.remove("hidden");
      localStorage.setItem("beeCoins", coins);
      document.getElementById("coin-balance").textContent = coins;
    } else {
      document.getElementById("progress-info").textContent = `${currentIndex + 1} / ${words.length}`;
      showWord();
    }
  };
}

// === 商店 ===
function initStore() {
  const btnStore = document.getElementById("btn-store");
  const storeModal = document.getElementById("store-modal");
  const storeBalance = document.getElementById("store-balance");
  const buttons = storeModal.querySelectorAll("[data-buy]");

  btnStore.addEventListener("click", () => {
    storeBalance.textContent = coins;
    storeModal.showModal();
  });

  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const item = btn.getAttribute("data-buy");
      const cost = item === "fireworks" ? 50 : 30;
      if (coins < cost) {
        alert("💰 單字幣不足！");
        return;
      }
      coins -= cost;
      purchased[item] = true;
      localStorage.setItem("beeCoins", coins);
      localStorage.setItem("beeItems", JSON.stringify(purchased));
      btn.nextElementSibling.classList.remove("hidden");
      btn.remove();
      storeBalance.textContent = coins;
      document.getElementById("coin-balance").textContent = coins;
      alert(`✅ 購買成功：${item === "fireworks" ? "煙火特效" : "語音增強包"}`);
    });
  });
}

// === 煙火特效 ===
function launchFireworks() {
  const fx = document.getElementById("fx");
  fx.classList.remove("hidden");
  const ctx = fx.getContext("2d");
  fx.width = window.innerWidth;
  fx.height = window.innerHeight;

  for (let i = 0; i < 15; i++) {
    const x = Math.random() * fx.width;
    const y = Math.random() * fx.height / 2;
    const r = Math.random() * 4 + 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 60%)`;
    ctx.fill();
  }

  setTimeout(() => ctx.clearRect(0, 0, fx.width, fx.height), 800);
}