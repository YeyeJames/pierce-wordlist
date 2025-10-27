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

    btn.addEventListener("click", () => {
      alert(`開啟 Week ${num}（共 ${words.length} 單字）`);
    });

    weeksContainer.appendChild(btn);
  });

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