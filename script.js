let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";
let defaultDuration = 1;
let autoColorEnabled = true;
let colorIndex = 0;
let zoomLevel = 300; // px per day
let alignMode = "recent"; // or "selected"


const taskColors = ["#F8961E", "#577590", "#43AA8B", "#9A5AFF", "#F94144", "#F3722C", "#43A047", "#6A1B9A"];

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  editor.style.display = "block";
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

function setupButtons() {
  // Project tab buttons
  document.getElementById("applyProjectName").onclick = () => {
    projectName = document.getElementById("projectNameField").value;
    document.getElementById("projectTitle").textContent = projectName;
  };

document.getElementById("newProject").onclick = () => {
  if (!confirm("Start a new project? Unsaved data will be lost.")) return;

  projectName = "Untitled Project";
  tasks = [];
  selectedTaskId = null;
  selectedSubtask = null;
  colorIndex = 0;

  // Add a default starter task
  const base = new Date().toISOString().split("T")[0];
  const task = createTask(base);
  task.name = "First Task";
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);
  console.log("Added task at:", task.start, "→", task.end);


  selectedTaskId = task.id;
    editorTab = "task";
  renderTabs();
  renderTasks();

  document.getElementById("projectTitle").textContent = projectName;
  editorTab = "task";
  renderTabs();
  renderTasks();
};


  document.getElementById("importBtn").onclick = () => document.getElementById("fileInput").click();

  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      tasks = data.tasks || [];
      projectName = data.meta?.projectName || "Untitled Project";
      document.getElementById("projectTitle").textContent = projectName;
      renderTabs();
      renderTasks();
    };
    reader.readAsText(file);
  };

  document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify({ meta: { projectName }, tasks }, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  // Toggle editor button in header
  document.getElementById("toggleEditor").onclick = () => {
    const editor = document.getElementById("editor");
    editor.style.display = editor.style.display === "none" ? "block" : "none";
  };

  // Task tab buttons
document.getElementById("addPrimaryStart").onclick = () => {
  const last = tasks[tasks.length - 1];
  const selectedTask = selectedTaskId ? findTaskById(selectedTaskId) : null;

  const base = alignMode === "selected" && selectedTask
    ? selectedTask.start
    : last?.start || new Date().toISOString().split("T")[0];

  const task = createTask(base);
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);

  selectedTaskId = task.id;
  editorTab = "task";
  renderTabs();
  renderTasks();
};


document.getElementById("addPrimaryEnd").onclick = () => {
  const last = tasks[tasks.length - 1];
  const selected = selectedTaskId ? findTaskById(selectedTaskId) : null;

  const base = alignMode === "selected" && selected
    ? selected.end
    : last?.end || new Date().toISOString().split("T")[0];

  const task = createTask(base);
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);

  // ✅ Only auto-select the new task if in "recent" mode
  if (alignMode === "recent") {
    selectedTaskId = task.id;
    editorTab = "task";
    renderTabs();
  }

  renderTasks();
};



document.getElementById("deleteTaskFromEditor").onclick = () => {
  if (!selectedTaskId) return;

  if (confirm("Delete this task?")) {
    const deletedId = selectedTaskId;

    // 🔍 Store index before filtering
    const deletedIndex = tasks.findIndex(t => t.id === deletedId);
    tasks = tasks.filter(t => t.id !== deletedId);


    // 🔎 Find where to start reflow
const newIndex = tasks.findIndex((t, i) =>
  i > 0 && tasks[i - 1].id === deletedId
);
const fixedIndex = newIndex === -1 ? 0 : newIndex;

if (fixedIndex < tasks.length) {
  let prevEnd;

  if (fixedIndex > 0 && tasks[fixedIndex - 1]) {
    prevEnd = tasks[fixedIndex - 1].end;
  } else {
    prevEnd = new Date().toISOString().split("T")[0];
  }

  for (let i = fixedIndex; i < tasks.length; i++) {
    const duration = getTaskDuration(tasks[i]);
    tasks[i].start = prevEnd;
    tasks[i].end = addDays(tasks[i].start, duration);
    prevEnd = tasks[i].end;
  }
}

selectedTaskId = null;
renderTabs();
renderTasks();



// Slide remaining tasks forward


tasks = tasks.filter(t => t.id !== deletedId);

// Find the task that should now be treated as the previous one

  i > 0 && tasks[i - 1].id === deletedId
;

let prevEnd = (newIndex > 0) ? tasks[newIndex - 1].end : new Date().toISOString().split("T")[0];

for (let i = newIndex; i < tasks.length; i++) {
  const duration = getTaskDuration(tasks[i]);
  tasks[i].start = prevEnd;
  tasks[i].end = addDays(tasks[i].start, duration);
  prevEnd = tasks[i].end;
}

selectedTaskId = null;
renderTabs();
renderTasks();

  }
  ;



    selectedTaskId = null;
    renderTabs();
    renderTasks();
  
;



  // Subtask tab buttons
  document.getElementById("addSub").onclick = () => {
    if (!selectedTaskId) return alert("Select a task first.");
    const parent = findTaskById(selectedTaskId);
    const sub = {
      id: Date.now(),
      name: "New Subtask",
      start: parent.start,
      end: addDays(parent.start, 2),
      status: "future",
      assigned: ""
    };
    parent.subtasks.push(sub);
    selectedSubtask = sub;
    editorTab = "subtask";
    renderTabs();
    renderTasks();
  };

  document.getElementById("deleteSubtask").onclick = () => {
    const parent = findTaskById(selectedTaskId);
    if (!parent || !selectedSubtask) return;
    parent.subtasks = parent.subtasks.filter(s => s.id !== selectedSubtask.id);
    selectedSubtask = null;
    renderTabs();
    renderTasks();
  };

  // Zoom + collapse
  document.getElementById("zoomIn").onclick = () => {
    zoomLevel = Math.min(zoomLevel * 1.25, 800);
    renderTasks();
  };

  document.getElementById("zoomOut").onclick = () => {
    zoomLevel = Math.max(zoomLevel / 1.25, 50);
    renderTasks();
  };

  document.getElementById("collapseAll").onclick = () => {
    tasks.forEach(t => t.expanded = false);
    renderTasks();
  };

  document.getElementById("expandAll").onclick = () => {
    tasks.forEach(t => t.expanded = true);
    renderTasks();
  };


function setupSettings() {
  const toggle = document.getElementById("autoColorToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = e => autoColorEnabled = e.target.checked;
  }

  const durationField = document.getElementById("defaultDuration");
  if (durationField) {
    durationField.onchange = e => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) defaultDuration = val;
    };
  }

  const gridToggle = document.getElementById("gridToggle");
  if (gridToggle) {
    gridToggle.checked = true;
    gridToggle.onchange = () => renderTasks();
  }
    // 🧭 Alignment Mode Setting (NEW!)
  document.querySelectorAll('input[name="alignMode"]').forEach(radio => {
    radio.onchange = e => {
      alignMode = e.target.value;
    };
  });
}


function setupTabControls() {
  const tabs = ["project", "task", "subtask", "timeline"];
  tabs.forEach(tab => {
    const btn = document.getElementById("tab" + capitalize(tab));
    btn.onclick = () => {
      if (btn.classList.contains("disabled")) return;
      editorTab = tab;
      renderTabs();
    };
  });
}

function renderTabs() {
  const tabMap = {
    project: "panelProject",
    task: "panelTask",
    subtask: "panelSubtask",
    timeline: "panelTimeline"
  };

  for (let key in tabMap) {
    const panel = document.getElementById(tabMap[key]);
    const btn = document.getElementById("tab" + capitalize(key));
    const isActive = editorTab === key;
    panel.classList.toggle("hidden", !isActive);
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("disabled", !canAccessTab(key));
  }

  if (editorTab === "task") renderTaskEditor();
  if (editorTab === "subtask") renderSubtaskEditor();
}

function canAccessTab(tab) {
  switch (tab) {
    case "project": return true;
    case "task": return !!selectedTaskId || tasks.length === 0;
    case "subtask": return !!selectedSubtask;
    case "timeline": return !!projectName;
    default: return false;
  }
}


function renderTasks() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  if (!tasks.length) return;
  const projectStart = tasks[0].start;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.minHeight = "600px";
  wrapper.style.width = (tasks.length * zoomLevel * defaultDuration + 500) + "px";

  const showGrid = document.getElementById("gridToggle")?.checked;
  wrapper.style.backgroundImage = showGrid
    ? "linear-gradient(to right, #eee 1px, transparent 1px)"
    : "none";
  wrapper.style.backgroundSize = `${zoomLevel}px 100%`;

  tasks.forEach((task, i) => {
    const div = document.createElement("div");
    div.className = "task";
    div.style.backgroundColor = task.color || "#F8961E";
    div.style.color = getContrastColor(task.color);
    div.style.padding = "0.5rem";
    div.style.borderRadius = "6px";
    div.style.boxShadow = task.id === selectedTaskId ? "0 0 0 3px rgba(0,0,0,0.3)" : "none";
    div.style.position = "absolute";
    div.style.top = `${i * 80}px`;
    div.style.left = dateToOffset(task.start, projectStart) + "px";
    div.style.width = (zoomLevel * getTaskDuration(task)) + "px";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${task.name}</strong>
        ${task.subtasks?.length ? `<span style="cursor:pointer;" onclick="toggleSubtasks(${task.id}); event.stopPropagation();">${task.expanded ? "▾" : "▸"}</span>` : ""}
      </div>
      <div style="font-size:0.9em;">🕓 ${task.start} → ${task.end}</div>
      ${task.expanded !== false && task.subtasks?.length
        ? task.subtasks.map(st => `<div class="subtask" onclick="editSubtask(${task.id}, ${st.id}); event.stopPropagation();">- ${st.name}</div>`).join("")
        : ""}
    `;

    div.onclick = () => {
      selectedTaskId = task.id;
      selectedSubtask = null;
      editorTab = "task";
      renderTabs();
    };

    wrapper.appendChild(div);
  });

  timeline.appendChild(wrapper);
}

function toggleSubtasks(taskId) {
  const task = findTaskById(taskId);
  task.expanded = !task.expanded;
  renderTasks();
}

function editSubtask(taskId, subId) {
  const task = findTaskById(taskId);
  const sub = task.subtasks.find(s => s.id === subId);
  if (!sub) return;
  selectedTaskId = taskId;
  selectedSubtask = sub;
  editorTab = "subtask";
  renderTabs();
}

function renderTaskEditor() {
  const task = findTaskById(selectedTaskId);
  if (!task) return;
  const container = document.getElementById("taskFields");
  container.innerHTML = `
    <label>Name: <input id="taskName" type="text" value="${task.name}" /></label>
    <label>Start: <input id="taskStart" type="date" value="${task.start}" /></label>
    <label>End: <input id="taskEnd" type="date" value="${task.end}" /></label>
    <label>Status:
      <select id="taskStatus">
        <option value="future">Future</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="complete">Complete</option>
      </select>
    </label>
    <label>Notes: <textarea id="taskNotes">${task.notes}</textarea></label>
    <label>Assigned To: <input id="taskAssigned" type="text" value="${task.assigned}" /></label>
  `;

  document.getElementById("taskName").oninput = e => task.name = e.target.value;
  document.getElementById("taskStart").onchange = e => task.start = e.target.value;
  document.getElementById("taskEnd").onchange = e => task.end = e.target.value;
  document.getElementById("taskStatus").onchange = e => task.status = e.target.value;
  document.getElementById("taskNotes").oninput = e => task.notes = e.target.value;
  document.getElementById("taskAssigned").oninput = e => task.assigned = e.target.value;

  renderColorSwatches(task);
  document.getElementById("applyTaskChanges").onclick = () => {
    renderTasks();
    showToast("✅ Task updated");
  };


  if (confirm("Delete this task?")) {
    const deletedIndex = tasks.findIndex(t => t.id === selectedTaskId);
    const prevTask = tasks[deletedIndex - 1] || null;
    const deletedTaskId = selectedTaskId;

    tasks = tasks.filter(t => t.id !== deletedTaskId);

    let prevEnd = prevTask ? prevTask.end : new Date().toISOString().split("T")[0];

    for (let i = 0; i < tasks.length; i++) {
      if (i >= deletedIndex) {
        tasks[i].start = prevEnd;
        tasks[i].end = addDays(tasks[i].start, getTaskDuration(tasks[i]));
      }
      prevEnd = tasks[i].end;
    }

    selectedTaskId = null;
    renderTabs();
    renderTasks();
  }
};




function renderColorSwatches(task) {
  const container = document.getElementById("taskColorPicker");
  container.innerHTML = "";
  taskColors.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    if (task.color === color) swatch.classList.add("selected");
    swatch.onclick = () => {
      task.color = color;
      renderColorSwatches(task);
      renderTasks();
    };
    container.appendChild(swatch);
  });
}

function renderSubtaskEditor() {
  const sub = selectedSubtask;
  if (!sub) return;
  const container = document.getElementById("subtaskFields");
  container.innerHTML = `
    <label>Name: <input type="text" id="subName" value="${sub.name}" /></label>
    <label>Start: <input type="date" id="subStart" value="${sub.start}" /></label>
    <label>End: <input type="date" id="subEnd" value="${sub.end}" /></label>
    <label>Status: 
      <select id="subStatus">
        <option value="future">Future</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="complete">Complete</option>
      </select>
    </label>
    <label>Assigned To: <input type="text" id="subAssigned" value="${sub.assigned}" /></label>
  `;

  document.getElementById("subName").oninput = e => sub.name = e.target.value;
  document.getElementById("subStart").onchange = e => sub.start = e.target.value;
  document.getElementById("subEnd").onchange = e => sub.end = e.target.value;
  document.getElementById("subStatus").onchange = e => sub.status = e.target.value;
  document.getElementById("subAssigned").oninput = e => sub.assigned = e.target.value;

  document.getElementById("applySubtaskChanges").onclick = () => {
    renderTasks();
    showToast("✅ Subtask updated");
  };

  document.getElementById("deleteSubtask").onclick = () => {
    const parent = findTaskById(selectedTaskId);
    parent.subtasks = parent.subtasks.filter(s => s.id !== selectedSubtask.id);
    selectedSubtask = null;
    renderTabs();
    renderTasks();
    showToast("🗑️ Subtask deleted");
  };
}

// === HELPERS ===
function createTask(start = new Date().toISOString().split("T")[0]) {
  const color = autoColorEnabled ? getNextColor() : "#F8961E";
  return {
    id: Date.now(),
    name: "New Task",
    start: start,
    end: addDays(start, defaultDuration),
    status: "future",
    notes: "",
    assigned: "",
    color,
    subtasks: [],
    expanded: true
  };
}

function getNextColor() {
  const color = taskColors[colorIndex % taskColors.length];
  colorIndex++;
  return color;
}

function getTaskDuration(task) {
  if (!task || !task.start || !task.end) return 1; // fallback
  const start = new Date(task.start);
  const end = new Date(task.end);
  return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}


function findTaskById(id) {
  return tasks.find(t => t.id === id);
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getContrastColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(msg) {
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

    selectedTaskId = null;
    renderTabs();
    renderTasks();
  }
};
// <-- END of setupButtons()

// === HELPERS ===
function createTask(start = new Date().toISOString().split("T")[0]) {
  const color = autoColorEnabled ? getNextColor() : "#F8961E";
  return {
    id: Date.now(),
    name: "New Task",
    start: start,
    end: addDays(start, defaultDuration),
    status: "future",
    notes: "",
    assigned: "",
    color,
    subtasks: [],
    expanded: true
  };
}

// ... other helper functions here ...

function dateToOffset(startDate, baseDate) {
  const start = new Date(startDate);
  const base = new Date(baseDate);
  const diffDays = Math.floor((start - base) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * zoomLevel);
}
); // <-- END of document.addEventListener("DOMContentLoaded", ...)

