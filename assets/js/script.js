const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let tasks = [];

const saved = localStorage.getItem("tasks");
if (saved) {
  tasks = JSON.parse(saved);
}

renderTasks();

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = taskInput.ariaValueMax.trim();
  const due = dueInput.value || null;

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
