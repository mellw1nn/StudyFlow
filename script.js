
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const emptyMessage = document.getElementById("emptyMessage");

const STORAGE_KEY = "studyflow_tasks";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(task =>
      task !== null &&
      typeof task === "object" &&
      Number.isInteger(task.id) &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean"
    );
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

let tasks = loadTasks();

let nextId = tasks.reduce(
  (maximum, task) => Math.max(maximum, task.id),
  0
) + 1;
function updateStats() {
  const completed = tasks.filter(task => task.completed).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;
}

function renderTasks() {
  taskList.replaceChildren();

  if (tasks.length === 0) {
    taskList.appendChild(emptyMessage);
  } else {
    tasks.forEach(task => {
      const item = document.createElement("li");
      item.className = "task-item";

      if (task.completed) {
        item.classList.add("done");
      }

      const name = document.createElement("span");
      name.textContent = task.title;

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const toggleButton = document.createElement("button");
      toggleButton.textContent = task.completed ? "Undo" : "Complete";
      toggleButton.type = "button";

      toggleButton.addEventListener("click", () => {
        task.completed = !task.completed;
        renderTasks();
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.type = "button";
      deleteButton.className = "delete-btn";

      deleteButton.addEventListener("click", () => {
        tasks = tasks.filter(item => item.id !== task.id);
        renderTasks();
      });

      actions.append(toggleButton, deleteButton);
      item.append(name, actions);
      taskList.appendChild(item);
    });
  }

   updateStats();
   saveTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (title === "") {
    return;
  }

  tasks.push({
    id: nextId++,
    title: title,
    completed: false
  });

  taskInput.value = "";
  renderTasks();
  taskInput.focus();
});

renderTasks();
