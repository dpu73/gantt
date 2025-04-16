// js/helpers.js

// Color utilities
export function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

// Date math
export function getTaskDuration(task) {
  if (!task || !task.start || !task.end) return 1;
  const start = new Date(task.start);
  const end = new Date(task.end);
  return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function dateToOffset(startDate, baseDate, zoomLevel = 300) {
  const start = new Date(startDate);
  const base = new Date(baseDate);
  const diffDays = Math.floor((start - base) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * zoomLevel);
}

export function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "10px";
  toast.style.right = "10px";
  toast.style.background = "#4caf50";
  toast.style.color = "white";
  toast.style.padding = "0.5rem 1rem";
  toast.style.borderRadius = "6px";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 2000);
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

