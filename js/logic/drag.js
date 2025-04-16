// js/logic/drag.js
import { state } from '../state.js';
import { renderTasks } from '../renderTasks.js';
import { getTaskDuration, addDays } from '../helpers.js';

export function makeTaskDraggable(element, task) {
  element.onmousedown = (e) => {
    if (e.button !== 0) return; // left-click only

    const startX = e.clientX;
    const originalStart = new Date(task.start);
    const duration = getTaskDuration(task);

    const onMouseMove = (moveEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const deltaDays = Math.round(deltaPx / state.zoomLevel);

      const newStart = addDays(originalStart.toISOString().split("T")[0], deltaDays);
      task.start = newStart;
      task.end = addDays(task.start, duration);

      renderTasks(); // Live update task visually
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
}

