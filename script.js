// ✅ GANTT2 - COMPLETE CLEAN script.js (with function placeholders)

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

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  editor.style.display = "block";
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

// === TAB SETUP ===
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
    case "subtask": return !!selectedTaskId;
    case "timeline": return !!projectName;
    default: return false;
  }
}

// === SETTINGS ===
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

  document.querySelectorAll('input[name="alignMode"]').forEach(radio => {
    radio.onchange = e => {
      alignMode = e.target.value;
    };
  });
}

// === BUTTON SETUP ===

function setupButtons() {
  document.getElementById("newProject").onclick = () => {
    if (!confirm("Start a new project? Unsaved data will be lost.")) return;
    projectName = "Untitled Project";
    tasks = [];
    selectedTaskId = null;
    selectedSubtask = null;
    colorIndex = 0;
    const base = new Date().toISOString().split("T")[0];
    const task = createTask(base);
    task.name = "First Task";
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    selectedTaskId = task.id;
    selectedSubtask = null;
    editorTab = "task";
    renderTabs();
    renderTasks();
    
    document.getElementById("projectTitle").textContent = projectName;
  };

  document.getElementById("importBtn").onclick = () =>
    document.getElementById("fileInput").click();

  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
reader.onload = event => {
  const data = JSON.parse(event.target.result);
  tasks = data.tasks || [];
  projectName = data.meta?.projectName || "Untitled Project";
  document.getElementById("projectTitle").textContent = projectName;

  selectedTaskId = tasks.length ? tasks[0].id : null;
  selectedSubtask = null;
  editorTab = "task";

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

  document.getElementById("toggleEditor").onclick = () => {
    const editor = document.getElementById("editor");
    editor.style.display = editor.style.display === "none" ? "block" : "none";
  };

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

  if (alignMode === "recent") {
    selectedTaskId = task.id;
    editorTab = "task";
    renderTabs();
  }

  renderTasks();
};

document.getElementById("addSub").onclick = () => {
  if (!selectedTaskId) {
    alert("Please select a primary task first.");
    return;
  }

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
  
document.getElementById("deleteTaskFromEditor").onclick = () => {
  if (!selectedTaskId) return;
  if (!confirm("Delete this task?")) return;

  const deletedId = selectedTaskId;
  const deletedIndex = tasks.findIndex(t => t.id === deletedId);
  tasks = tasks.filter(t => t.id !== deletedId);

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
};

  
  
}

// === RENDERING ===
function renderTasks() {
  const timeline = document.getElementById("timeline");
	
timeline.innerHTML = "";

if (!tasks.length) {
  renderRuler(new Date().toISOString().split("T")[0], 30); // Show something!
  return;
}

const totalDays = Math.max(30, tasks.length * defaultDuration + 5);
renderRuler(tasks[0].start, totalDays);


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
    if (task.id === selectedTaskId) {
  div.classList.add("selected");
}

    div.style.backgroundColor = task.color || "#F8961E";
    div.style.color = getContrastColor(task.color);
    div.style.position = "absolute";
    div.style.top = `${i * 80}px`;
    div.style.left = dateToOffset(task.start, projectStart) + "px";
    div.style.width = (zoomLevel * getTaskDuration(task)) + "px";
    div.style.padding = "0.5rem";
    div.style.borderRadius = "6px";
    div.style.boxShadow = task.id === selectedTaskId
      ? "0 0 0 3px rgba(0,0,0,0.3)"
      : "none";

let subtaskHTML = "";
if (task.expanded !== false && task.subtasks?.length) {
  subtaskHTML = task.subtasks.map(st => {
    const isSelected = selectedSubtask && st.id === selectedSubtask.id;
    return '<div class="subtask' + (isSelected ? ' selected' : '') + '" ' +
           'onclick="editSubtask(' + JSON.stringify(task.id) + ',' + JSON.stringify(st.id) + '); event.stopPropagation();">' +
           '- ' + st.name +
           '</div>';
  }).join("");
}

div.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <strong>${task.name}</strong>
    ${task.subtasks?.length ? `<span style="cursor:pointer;" onclick="toggleSubtasks(${task.id}); event.stopPropagation();">${task.expanded ? "▾" : "▸"}</span>` : ""}
  </div>
  <div style="font-size:0.9em;">🕓 ${task.start} → ${task.end}</div>
  ${subtaskHTML}
`;

div.innerHTML = `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <strong>${task.name}</strong>
    ${task.subtasks?.length ? `<span style="cursor:pointer;" onclick="toggleSubtasks(${task.id}); event.stopPropagation();">${task.expanded ? "▾" : "▸"}</span>` : ""}
  </div>
  <div style="font-size:0.9em;">🕓 ${task.start} → ${task.end}</div>
  ${subtaskHTML}
`;

div.onclick = () => {
      selectedTaskId = task.id;
      selectedSubtask = null;
      editorTab = "task";
      renderTabs();
        renderTasks();
    };

// === DRAG-TO-MOVE LOGIC ===
div.onmousedown = (e) => {
  if (e.button !== 0) return; // left-click only

  const startX = e.clientX;
  const originalStart = new Date(task.start);
  const originalEnd = new Date(task.end);
  const durationDays = getTaskDuration(task);

  const onMouseMove = (moveEvent) => {
    const deltaPx = moveEvent.clientX - startX;
    const deltaDays = Math.round(deltaPx / zoomLevel);

const newStart = addDays(originalStart.toISOString().split("T")[0], deltaDays);

// Prevent moving before project start
if (new Date(newStart) < new Date(tasks[0].start) && task !== tasks[0]) return;

    task.start = newStart;
    task.end = addDays(task.start, durationDays);
    renderTasks();
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    showToast("🟦 Task moved");
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};


    
    // === Subtask bar rendering ===
    if (task.expanded !== false && task.subtasks?.length) {
      task.subtasks.forEach(sub => {
        const subDiv = document.createElement("div");
        subDiv.className = "subtask-bar";
        const taskStart = new Date(task.start);
        const subStart = new Date(sub.start);
        const subEnd = new Date(sub.end);

        const offsetDays = Math.max(0, Math.floor((subStart - taskStart) / (1000 * 60 * 60 * 24)));
        const durationDays = Math.max(1, Math.floor((subEnd - subStart) / (1000 * 60 * 60 * 24)));

        subDiv.style.position = "absolute";
        subDiv.style.left = (offsetDays * zoomLevel) + "px";
        subDiv.style.top = "1.8rem";
        subDiv.style.height = "1rem";
        subDiv.style.width = (durationDays * zoomLevel) + "px";
        subDiv.style.background = "#ccc";
        subDiv.style.borderRadius = "4px";
        subDiv.style.boxShadow = "inset 0 0 0 1px #999";
        subDiv.title = sub.name;
		subDiv.style.background = "#fef08a"; // a soft yellow
subDiv.style.border = "1px solid #999";
subDiv.style.height = "0.75rem";

        div.appendChild(subDiv);
      });
    }

    wrapper.appendChild(div);
  });

  timeline.appendChild(wrapper);
}

function editSubtask(taskId, subId) {
  const task = findTaskById(taskId);
  if (!task) return;

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
    <label>Task Name: <input id="taskName" type="text" value="${task.name}" /></label>
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

  document.getElementById("taskStatus").value = task.status;

  document.getElementById("taskName").oninput = e => task.name = e.target.value;
  document.getElementById("taskStart").onchange = e => task.start = e.target.value;
  document.getElementById("taskEnd").onchange = e => task.end = e.target.value;
  document.getElementById("taskStatus").onchange = e => task.status = e.target.value;
  document.getElementById("taskNotes").oninput = e => task.notes = e.target.value;
  document.getElementById("taskAssigned").oninput = e => task.assigned = e.target.value;

  // Optional color picker placeholder container
  const swatchBox = document.getElementById("taskColorPicker");
  if (swatchBox) swatchBox.innerHTML = "";

  document.getElementById("applyTaskChanges").onclick = () => {
    renderTasks();
    showToast("✅ Task updated");
  };
}

function renderColorSwatches(task) {
  const container = document.getElementById("taskColorPicker");
  if (!container) return;
  container.innerHTML = "";

  taskColors.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;

    if (task.color === color) swatch.classList.add("selected");

    swatch.onclick = () => {
      task.color = color;
      renderColorSwatches(task); // re-render to reflect selection
      renderTasks(); // update timeline visuals
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

  document.getElementById("subStatus").value = sub.status;

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
  if (!selectedTaskId || !selectedSubtask) return;

  const parent = findTaskById(selectedTaskId);
  if (!parent) return;

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
  if (!task || !task.start || !task.end) return 1;
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

function dateToOffset(startDate, baseDate) {
  const start = new Date(startDate);
  const base = new Date(baseDate);
  const diffDays = Math.floor((start - base) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * zoomLevel);
}

// === Edit subtask logic ===
function editSubtask(taskId, subId) {
  const task = findTaskById(taskId);
  if (!task) return;
  const sub = task.subtasks.find(s => s.id === subId);
  if (!sub) return;

  selectedTaskId = taskId;
  selectedSubtask = sub;
  editorTab = "subtask";
  renderTabs();
}

// === Toggle task subtasks open/closed ===
function toggleSubtasks(taskId) {
  const task = findTaskById(taskId);
  if (task) {
    task.expanded = !task.expanded;
    renderTasks();
  }
}

// === timeline ruler ===
function renderRuler(startDate, days) {
  const ruler = document.getElementById("timelineRuler");
  if (!ruler) {
    console.warn("timelineRuler element not found.");
    return;
  }
  
}

const ruler = document.getElementById("timelineRuler");
if (!ruler) {
  console.warn("timelineRuler element not found.");
  return;
}
ruler.innerHTML = "...";

  const zoom = zoomLevel;

  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.width = `${zoom}px`;

 const labelOpts = { month: "short", day: "numeric" };

if (zoom >= 400) {
  tick.textContent = current.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
} else if (zoom >= 150) {
  tick.textContent = current.toLocaleDateString(undefined, labelOpts);
} else if (zoom >= 75) {
  const week = Math.ceil(current.getDate() / 7);
  tick.textContent = `Week ${week}`;
} else {
  tick.textContent = current.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}


    ruler.appendChild(tick);
  }

