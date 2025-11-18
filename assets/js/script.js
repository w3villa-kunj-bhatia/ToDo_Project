const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let tasks = [];

const saved = localStorage.getItem("tasks");
if (saved) {
  try {
    tasks = JSON.parse(saved);
  } catch (err) {
    console.error("Failed to parse saved tasks:", err);
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, (s) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

renderTasks();

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = taskInput.value.trim();
  const due = dueInput && dueInput.value ? dueInput.value : null;

  if (!text) {
    alert("Task Cannot Be Empty!");
    return;
  }

  const task = {
    id: Date.now().toString(),
    text,
    due,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskForm.reset();
});

function renderTasks() {
  const q = (searchInput.value || "").trim().toLowerCase();
  const filter = filterSelect.value;

  const filtered = tasks.filter((t) => {
    const matchesQ = t.text.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !t.completed) ||
      (filter === "completed" && t.completed);
    return matchesQ && matchesFilter;
  });

  taskList.innerHTML = "";

  filtered.forEach((t) => {
    const li = document.createElement("li");
    li.className = "task-item" + (t.completed ? " completed" : "");
    li.dataset.id = t.id;

    li.innerHTML = `
      <input type="checkbox" class="toggle" ${t.completed ? "checked" : ""} />
      <div class="label">
        <strong>${escapeHtml(t.text)}</strong>
        ${t.due ? `<div class="due">Due: ${escapeHtml(t.due)}</div>` : ""}
      </div>
      <div class="task-actions">
        <button class="small-btn edit">Edit</button>
        <button class="small-btn delete">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateCounts();
}

taskList.addEventListener("click", function (e) {
  const li = e.target.closest(".task-item");
  if (!li) return;

  const id = li.dataset.id;

  if (e.target.matches(".toggle")) toggleComplete(id);
  else if (e.target.matches(".delete")) deleteTask(id);
  else if (e.target.matches(".edit")) startEditTask(id);
});

function toggleComplete(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEditTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;

  const newText = prompt("Edit task text", t.text);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) return alert("Task cannot be empty");

  t.text = trimmed;
  saveTasks();
  renderTasks();
}

function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks", err);
  }
}

function debounce(fn, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

const debouncedRender = debounce(renderTasks, 200);
searchInput.addEventListener("input", debouncedRender);
filterSelect.addEventListener("change", renderTasks);

function updateCounts() {
  const countsEl = document.getElementById("counts");
  if (!countsEl) return;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  countsEl.textContent = `${total} task${
    total !== 1 ? "s" : ""
  } — ${completed} completed`;
}

renderTasks();
updateCounts();