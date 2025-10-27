// storage.js
export const Storage = {
  loadProfile() {
    return JSON.parse(localStorage.getItem("profile") || "{}");
  },

  saveProfile(profile) {
    localStorage.setItem("profile", JSON.stringify(profile));
  },

  loadProgress(week) {
    return JSON.parse(localStorage.getItem(`progress_week_${week}`) || "{}");
  },

  saveProgress(week, data) {
    localStorage.setItem(`progress_week_${week}`, JSON.stringify(data));
  },
};