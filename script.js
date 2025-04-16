// GANTT2 v0.3.0 — COMPLETE script.js
// Patches: zoom, rename, subtask contrast + full original logic

// STATE
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

const taskColors = ["#F8961E","#577590","#43AA8B","#9A5AFF","#F94144","#F3722C","#43A047","#6A1B9A"];

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("editor").style.display = "block";
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

// PATCH: Zoom + Rename
document.getElementById("zoomIn").onclick = ()=>{ 
  zoomLevel = Math.min(zoomLevel+50,1000);
  renderTasks();
};
document.getElementById("zoomOut").onclick = ()=>{
  zoomLevel = Math.max(zoomLevel-50,50);
  renderTasks();
};
document.getElementById("applyProjectName").onclick = ()=>{
  const f = document.getElementById("projectNameField");
  if(f && f.value.trim()){
    projectName = f.value.trim();
    document.getElementById("projectTitle").textContent = projectName;
    showToast("📁 Project renamed");
  }
};

// PATCH: Subtask Contrast
const subtaskStyles = document.createElement("style");
subtaskStyles.textContent = `
  .subtask {
    background-color: #e2e8f0 !important;
    color: #1e293b !important;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    margin-top: 0.2rem;
    font-size: 0.85em;
  }
`;
document.head.appendChild(subtaskStyles);

// TAB CONTROLS
function setupTabControls(){
  ["project","task","subtask","timeline"].forEach(tab=>{
    const btn = document.getElementById("tab"+capitalize(tab));
    btn.onclick = ()=>{
      if(btn.classList.contains("disabled")) return;
      editorTab = tab;
      renderTabs();
    };
  });
}
function renderTabs(){
  const map = {
    project:"panelProject",
    task:"panelTask",
    subtask:"panelSubtask",
    timeline:"panelTimeline"
  };
  for(let key in map){
    const panel = document.getElementById(map[key]);
    const btn = document.getElementById("tab"+capitalize(key));
    const active = editorTab===key;
    panel.classList.toggle("hidden",!active);
    btn.classList.toggle("active",active);
    btn.classList.toggle("disabled",!canAccessTab(key));
  }
  if(editorTab==="task") renderTaskEditor();
  if(editorTab==="subtask") renderSubtaskEditor();
}
function canAccessTab(tab){
  switch(tab){
    case "project": return true;
    case "task": return !!selectedTaskId || tasks.length===0;
    case "subtask": return !!selectedTaskId;
    case "timeline": return !!projectName;
    default: return false;
  }
}

// SETTINGS
function setupSettings(){
  const t = document.getElementById("autoColorToggle");
  if(t){ t.checked = true; t.onchange=e=>autoColorEnabled=e.target.checked; }
  const d = document.getElementById("defaultDuration");
  if(d){ d.onchange=e=>{
    const v=parseInt(e.target.value);
    if(!isNaN(v)) defaultDuration=v;
  };}
  const g = document.getElementById("gridToggle");
  if(g){ g.checked = true; g.onchange=()=>renderTasks(); }
  document.querySelectorAll('input[name="alignMode"]').forEach(r=>r.onchange=e=>alignMode=e.target.value);
}

// BUTTON SETUP
function setupButtons(){
  document.getElementById("newProject").onclick = ()=>{
    if(!confirm("Start new project?")) return;
    projectName="Untitled Project"; tasks=[]; selectedTaskId=null; selectedSubtask=null; colorIndex=0;
    let base = new Date().toISOString().split("T")[0];
    let t = createTask(base); t.name="First Task"; t.end=addDays(t.start,defaultDuration);
    tasks.push(t); selectedTaskId=t.id; editorTab="task"; renderTabs(); renderTasks();
    document.getElementById("projectTitle").textContent=projectName;
  };
  document.getElementById("importBtn").onclick = ()=>document.getElementById("fileInput").click();
  document.getElementById("fileInput").onchange = e=>{
    let file=e.target.files[0]; if(!file) return;
    let r=new FileReader(); r.onload=ev=>{
      let d=JSON.parse(ev.target.result);
      tasks=d.tasks||[]; projectName=d.meta?.projectName||"Untitled Project";
      document.getElementById("projectTitle").textContent=projectName;
      selectedTaskId=tasks.length?tasks[0].id:null; selectedSubtask=null; editorTab="task";
      renderTabs(); renderTasks();
    }; r.readAsText(file);
  };
  document.getElementById("exportBtn").onclick = ()=>{
    let blob=new Blob([JSON.stringify({meta:{projectName},tasks},null,2)],{type:"application/json"});
    let link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=`${projectName.replace(/\s+/g,"_")}.json`;
    link.click();
  };
  document.getElementById("toggleEditor").onclick = ()=>{
    let ed=document.getElementById("editor");
    ed.style.display = ed.style.display==="none"?"block":"none";
  };
  document.getElementById("quickAddTask").onclick = () => {
  const today = new Date().toISOString().split("T")[0];
  const task = createTask(today);
  task.name = "Quick Task";
  task.end = addDays(task.start, defaultDuration);
  tasks.push(task);
  selectedTaskId = task.id;
  editorTab = "task";
  renderTabs();
  renderTasks();
  showToast("➕ Task added");
};
// QUICK ADD FIRST TASK
const quickBtn = document.getElementById("quickAddTask");
if (quickBtn) {
  quickBtn.onclick = () => {
    const base = new Date().toISOString().split("T")[0];
    const task = createTask(base);
    task.name = "Quick Task";
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    selectedTaskId = task.id;
    selectedSubtask = null;
    editorTab = "task";
    document.getElementById("projectTitle").textContent = projectName;
    renderTabs();
    renderTasks();
    showToast("➕ Quick task added");
  };
}

}

// RENDERING
function renderTasks(){
  let tl=document.getElementById("timeline");
  tl.innerHTML="";
  if(!tasks.length) return;
  let start0=tasks[0].start;
  let wrap=document.createElement("div");
  wrap.style.position="relative";
  wrap.style.minHeight="600px";
  wrap.style.width=(tasks.length*zoomLevel*defaultDuration+500)+"px";
  let showG=document.getElementById("gridToggle")?.checked;
  wrap.style.backgroundImage= showG
    ?"linear-gradient(to right,#eee 1px,transparent 1px)"
    :"none";
  wrap.style.backgroundSize=`${zoomLevel}px 100%`;

  tasks.forEach((task,i)=>{
    let div=document.createElement("div");
    div.className="task"+(task.id===selectedTaskId?" selected":"");
    div.style.backgroundColor=task.color||"#F8961E";
    div.style.color=getContrastColor(task.color);
    div.style.position="absolute";
    div.style.top=`${i*80}px`;
    div.style.left=`${dateToOffset(task.start,start0)}px`;
    div.style.width=`${zoomLevel*getTaskDuration(task)}px`;
    div.style.padding="0.5rem"; div.style.borderRadius="6px";
    div.style.boxShadow=task.id===selectedTaskId?"0 0 0 3px rgba(0,0,0,0.3)":"none";
    div.innerHTML = `<strong>${task.name}</strong><br><small>🕓 ${task.start} → ${task.end}</small>`;
    div.onclick=()=>{ selectedTaskId=task.id; selectedSubtask=null; editorTab="task"; renderTabs(); renderTasks(); };
    wrap.appendChild(div);
  });
  tl.appendChild(wrap);
}

// TASK HELPERS
function createTask(start=new Date().toISOString().split("T")[0]){
  let col=autoColorEnabled?getNextColor():"#F8961E";
  return { id:Date.now(), name:"New Task", start, end:addDays(start,defaultDuration),
           status:"future", notes:"", assigned:"", color:col, subtasks:[], expanded:true };
}
function getNextColor(){ let c=taskColors[colorIndex%taskColors.length]; colorIndex++; return c;}
function getTaskDuration(t){ if(!t||!t.start||!t.end) return 1; let s=new Date(t.start), e=new Date(t.end);
  return Math.max(1,Math.floor((e-s)/(1000*60*60*24))); }
function addDays(ds,d){ let dt=new Date(ds); dt.setDate(dt.getDate()+d); return dt.toISOString().split("T")[0]; }
function getContrastColor(h){ let r=parseInt(h.substr(1,2),16),g=parseInt(h.substr(3,2),16),b=parseInt(h.substr(5,2),16);
  let bright=(r*299+g*587+b*114)/1000; return bright>128?"#000":"#FFF"; }
function dateToOffset(s,b){ let st=new Date(s), bs=new Date(b);
  let dd=Math.floor((st-bs)/(1000*60*60*24)); return Math.max(0,dd*zoomLevel); }
function showToast(m){ let t=document.createElement("div"); t.textContent=m;
  Object.assign(t.style,{position:"fixed",bottom:"10px",right:"10px",background:"#4caf50",color:"white",
                         padding:"0.5rem 1rem",borderRadius:"6px",zIndex:"9999"});
  document.body.appendChild(t); setTimeout(()=>t.remove(),2000);
}

// UTILITY
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function renderTaskEditor() {
  const task = tasks.find(t => t.id === selectedTaskId);
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
    <label>Notes: <textarea id="taskNotes">${task.notes || ""}</textarea></label>
    <label>Assigned To: <input id="taskAssigned" type="text" value="${task.assigned || ""}" /></label>
  `;

  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskName").oninput = e => task.name = e.target.value;
  document.getElementById("taskStart").onchange = e => task.start = e.target.value;
  document.getElementById("taskEnd").onchange = e => task.end = e.target.value;
  document.getElementById("taskStatus").onchange = e => task.status = e.target.value;
  document.getElementById("taskNotes").oninput = e => task.notes = e.target.value;
  document.getElementById("taskAssigned").oninput = e => task.assigned = e.target.value;

  document.getElementById("applyTaskChanges").onclick = () => {
    renderTasks();
    showToast("✅ Task updated");
  };
}
