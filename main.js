// main.js
const { launchFireworks } = window;
const { Storage } = window;

const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("btn-login");
const logoutBtn = document.getElementById("btn-logout");
const profileName = document.getElementById("profile-name");
const coinDisplay = document.getElementById("coin-balance");
const storeBtn = document.getElementById("btn-store");
const storeModal = document.getElementById("store-modal");
const storeBalance = document.getElementById("store-balance");
const weeksContainer = document.getElementById("weeks");
const trainer = document.getElementById("trainer");
const trainerTitle = document.getElementById("trainer-title");
const answerInput = document.getElementById("answer");
const submitBtn = document.getElementById("btn-submit");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("btn-next");
const backBtn = document.getElementById("btn-back");
const hintBtn = document.getElementById("btn-hint");
const hintBox = document.getElementById("hint");
const progressInfo = document.getElementById("progress-info");
const speakBtn = document.getElementById("btn-speak");

let profile = Storage.loadProfile() || {};
let currentWeek = null;
let currentList = [];
let currentIndex = 0;
let correctCount = 0;

if (profile.name) updateProfileUI();

loginBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("請輸入名字！");
  profile = { name, coins: profile.coins || 0, items: profile.items || {} };
  Storage.saveProfile(profile);
  updateProfileUI();
};

logoutBtn.onclick = () => {
  localStorage.removeItem("profile");
  location.reload();
};

function updateProfileUI() {
  document.getElementById("login-area").classList.add("hidden");
  document.getElementById("profile-area").classList.remove("hidden");
  profileName.textContent = profile.name;
  coinDisplay.textContent = profile.coins ?? 0;
  renderWeeks();
}

function renderWeeks() {
  weeksContainer.innerHTML = "";
  for (const week in window.WEEK_LISTS) {
    const progress = Storage.loadProgress(week);
    const correct = progress.correct || 0;
    const total = window.WEEK_LISTS[week].length;
    const percent = total ? Math.round((correct / total) * 100) : 0;

    const btn = document.createElement("button");
    btn.className = "week-btn";
    btn.innerHTML = `Week ${week}<br><small>${percent}%</small>`;
    btn.onclick = () => startWeek(week);
    weeksContainer.appendChild(btn);
  }
}

function startWeek(week) {
  currentWeek = week;
  currentList = [...window.WEEK_LISTS[week]];
  currentIndex = 0;
  correctCount = Storage.loadProgress(week).correct || 0;

  document.getElementById("menu").classList.add("hidden");
  trainer.classList.remove("hidden");
  trainerTitle.textContent = `Week ${week}`;
  loadQuestion();
}

function loadQuestion() {
  const wordData = currentList[currentIndex];
  answerInput.value = "";
  feedback.textContent = "";
  hintBox.classList.add("hidden");
  hintBox.textContent = wordData.meaning;
  progressInfo.textContent = `${currentIndex + 1}/${currentList.length}`;
}

submitBtn.onclick = () => {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct = currentList[currentIndex].word.toLowerCase();
  if (!userAnswer) return;

  if (userAnswer === correct) {
    handleCorrect();
  } else {
    feedback.textContent = "❌ 再試一次！";
    feedback.style.color = "crimson";
  }
};

function handleCorrect() {
  feedback.textContent = "✅ 答對！+1 單字幣";
  feedback.style.color = "green";

  profile.coins = (profile.coins || 0) + 1;
  coinDisplay.textContent = profile.coins;
  Storage.saveProfile(profile);

  correctCount++;
  Storage.saveProgress(currentWeek, { correct: correctCount });

  const rect = trainer.getBoundingClientRect();
  launchFireworks(rect.width / 2, rect.top + 100);

  nextBtn.classList.remove("hidden");
  submitBtn.disabled = true;
}

nextBtn.onclick = () => {
  currentIndex++;
  submitBtn.disabled = false;
  nextBtn.classList.add("hidden");

  if (currentIndex >= currentList.length) {
    feedback.textContent = "🎉 本週完成！";
    Storage.saveProgress(currentWeek, { correct: correctCount });
    renderWeeks();
  } else {
    loadQuestion();
  }
};

hintBtn.onclick = () => {
  hintBox.classList.toggle("hidden");
};

backBtn.onclick = () => {
  trainer.classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  renderWeeks();
};

speakBtn.onclick = () => {
  const word = currentList[currentIndex].word;
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
};

storeBtn.onclick = () => {
  storeBalance.textContent = profile.coins;
  storeModal.showModal();
};

storeModal.addEventListener("click", (e) => {
  if (e.target.matches("[data-buy]")) {
    const item = e.target.dataset.buy;
    const price = item === "fireworks" ? 50 : 30;
    if (profile.coins < price) return alert("金幣不足！");
    if (!profile.items) profile.items = {};
    profile.items[item] = true;
    profile.coins -= price;
    Storage.saveProfile(profile);
    storeBalance.textContent = profile.coins;
    coinDisplay.textContent = profile.coins;
    alert("購買成功！");
  }
});