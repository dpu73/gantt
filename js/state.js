// js/state.js

// Core timeline data
export let tasks = [];
export let selectedTaskId = null;
export let selectedSubtask = null;
export let projectName = "Untitled Project";

// Settings
export let defaultDuration = 1;
export let autoColorEnabled = true;
export let zoomLevel = 300; // px per day
export let alignMode = "recent"; // or "selected"

// Optional: Palette
export const taskColors = [
  "#F8961E", "#577590", "#43AA8B", "#9A5AFF",
  "#F94144", "#F3722C", "#43A047", "#6A1B9A"
];

// 🔧 Basic initializer (can expand later)
export function initState() {
  tasks = [];
  selectedTaskId = null;
  selectedSubtask = null;
  projectName = "Untitled Project";
  defaultDuration = 1;
  autoColorEnabled = true;
  zoomLevel = 300;
  alignMode = "recent";
}
