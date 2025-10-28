diff --git a/main.js b/main.js
index 24937be481014c04ece65b2d0d78b86f53294588..cabbbeb710fe050c1e5d683b6dd64caebc48fae6 100644
--- a/main.js
+++ b/main.js
@@ -1,46 +1,52 @@
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
-document.addEventListener("DOMContentLoaded", () => {
+function initApp() {
   initLogin();
   initStore();
   safeGenerateWeeks();
   bindTrainerButtons();
   bindRecorderButtons();
-});
+}
+
+if (document.readyState === "loading") {
+  document.addEventListener("DOMContentLoaded", initApp);
+} else {
+  initApp();
+}
 
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
