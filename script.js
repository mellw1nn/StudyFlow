
// ==================================
// 1. GET HTML ELEMENTS
// ==================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");

const emptyMessage = document.getElementById("emptyMessage");


// ==================================
// 2. LOAD SAVED TASKS
// ==================================

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

    return parsedTasks
      .filter(task =>
        task !== null &&
        typeof task === "object" &&
        Number.isInteger(task.id) &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean"
      )
      .map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        dueDate:
          typeof task.dueDate === "string" ? task.dueDate : "",
        priority:
          ["Low", "Medium", "High"].includes(task.priority)
            ? task.priority
            : "Medium"
      }));

  } catch (error) {
    console.error("Could not load tasks:", error);
    return [];
  }
}

let tasks = loadTasks();

let nextId = tasks.reduce(
  (maximum, task) => Math.max(maximum, task.id),
  0
) + 1;


// ==================================
// 3. SAVE TASKS
// ==================================

function saveTasks() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}


// ==================================
// 4. UPDATE DASHBOARD STATISTICS
// ==================================

function updateStats() {
  const completed = tasks.filter(
    task => task.completed
  ).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;
}


// ==================================
// 5. RENDER TASKS
// ==================================

function renderTasks() {

  taskList.replaceChildren();

  const searchText = searchInput.value
    .trim()
    .toLowerCase();

  const filterValue = filterTasks.value;

  const filteredTasks = tasks.filter(task => {

    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText);

    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "completed" && task.completed) ||
      (filterValue === "pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });

  if (filteredTasks.length === 0) {

    const message = document.createElement("li");
    message.className = "empty";

    message.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task!"
      : "No matching tasks found.";

    taskList.appendChild(message);

  } else {

    filteredTasks.forEach(task => {

      const item = document.createElement("li");
      item.className = "task-item";

      if (task.completed) {
        item.classList.add("done");
      }

      // Task information

      const info = document.createElement("div");
      info.className = "task-info";

      const name = document.createElement("span");
      name.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const priorityBadge = document.createElement("span");
      priorityBadge.className = "priority " + task.priority;
      priorityBadge.textContent = task.priority + " priority";

      meta.appendChild(priorityBadge);

      if (task.dueDate) {
        const date = document.createElement("span");

        date.textContent =
          "Due: " + task.dueDate.split("-").reverse().join("/");

        meta.appendChild(date);
      }

      info.append(name, meta);

      // Action buttons

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.textContent = task.completed
        ? "Undo"
        : "Complete";

      toggleButton.addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-btn";

      deleteButton.addEventListener("click", () => {

        tasks = tasks.filter(
          currentTask => currentTask.id !== task.id
        );

        saveTasks();
        renderTasks();
      });

      actions.append(toggleButton, deleteButton);

      item.append(info, actions);
      taskList.appendChild(item);
    });
  }

  updateStats();
}


// ==================================
// 6. ADD NEW TASKS
// ==================================

taskForm.addEventListener("submit", event => {

  event.preventDefault();

  const title = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (title === "") {
    return;
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    return;
  }

  tasks.push({
    id: nextId++,
    title: title,
    completed: false,
    dueDate: dueDate,
    priority: priority
  });

  saveTasks();

  taskForm.reset();

  renderTasks();

  taskInput.focus();
});


// ==================================
// 7. SEARCH AND FILTER
// ==================================

searchInput.addEventListener("input", renderTasks);

filterTasks.addEventListener("change", renderTasks);


// ==================================
// 8. INITIAL DISPLAY
// ==================================

renderTasks();
