import './style.css'

const starterTasks = [
  { id: 1, title: "Practice DOM", subject: "JavaScript", priority: "high", status: "todo" },
  { id: 2, title: "Read chapter on arrays", subject: "JavaScript", priority: "medium", status: "todo" },
  { id: 3, title: "Learn 20 new words", subject: "English", priority: "low", status: "inprogress" },
  { id: 4, title: "Write a short essay", subject: "English", priority: "medium", status: "inprogress" },
  { id: 5, title: "Solve algebra worksheet", subject: "Math", priority: "high", status: "done" },
  { id: 6, title: "Review geometry notes", subject: "Math", priority: "low", status: "done" },
];

let tasks = starterTasks.map((task) => ({ ...task }));

const columns = {
  todo: document.getElementById("todo-list"),
  inprogress: document.getElementById("inprogress-list"),
  done: document.getElementById("done-list"),
};

const priorityStyles = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const statusLabels = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};

// ---------- Storage ----------

const STORAGE_KEY = "task4-study-board";

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "number" &&
    typeof task.title === "string" &&
    typeof task.subject === "string" &&
    task.priority in priorityStyles &&
    task.status in statusLabels
  );
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks === null) return; // nothing saved yet: keep starter tasks

    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks) && parsedTasks.every(isValidTask)) {
      tasks = parsedTasks; // an empty saved array stays empty
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Could not load tasks:", error);
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ---------- Filters ----------

const searchInput = document.getElementById("searchInput");
const priorityFilterSelect = document.getElementById("priorityFilter");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const resetBoardBtn = document.getElementById("resetBoardBtn");
let searchQuery = "";
let priorityFilter = "all";

function matchesFilters(task) {
  const query = searchQuery.trim().toLowerCase();

  const matchesSearch =
    query === "" ||
    task.title.toLowerCase().includes(query) ||
    task.subject.toLowerCase().includes(query);

  const matchesPriority =
    priorityFilter === "all" || task.priority === priorityFilter;

  return matchesSearch && matchesPriority;
}

function filtersActive() {
  return searchQuery.trim() !== "" || priorityFilter !== "all";
}

function clearFilters() {
  searchQuery = "";
  priorityFilter = "all";
  searchInput.value = "";
  priorityFilterSelect.value = "all";
  renderBoard();
}

// ---------- Form state ----------

const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("titleInput");
const subjectInput = document.getElementById("subjectInput");
const priorityInput = document.getElementById("priorityInput");
const titleError = document.getElementById("titleError");
const subjectError = document.getElementById("subjectError");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let editingId = null;

// ---------- clearErrors , setError ----------

function clearErrors() {
  titleError.textContent = "";
  subjectError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  subjectInput.removeAttribute("aria-invalid");
}

function setError(input, errorEl, message) {
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

// ---------- Task actions ----------

function moveTask(id, newStatus) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  task.status = newStatus;
  saveTasks();
  renderBoard();
}

function deleteTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  const ok = confirm(`Delete "${task.title}"?`);
  if (!ok) return;

  const index = tasks.findIndex((task) => task.id === id);
  tasks.splice(index, 1);

  if (editingId === id) stopEdit();

  saveTasks();
  renderBoard();
}

function startEdit(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  editingId = id;
  titleInput.value = task.title;
  subjectInput.value = task.subject;
  priorityInput.value = task.priority;

  clearErrors();
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");

  taskForm.scrollIntoView({ behavior: "smooth" });
  titleInput.focus();
}

function stopEdit() {
  editingId = null;
  taskForm.reset();
  clearErrors();
  submitBtn.textContent = "Add Task";
  cancelEditBtn.classList.add("hidden");
}

function resetBoard() {
  const ok = confirm("Reset the board to the starter tasks? All your changes will be lost.");
  if (!ok) return;

  if (editingId !== null) stopEdit();

  tasks = starterTasks.map((task) => ({ ...task }));
  nextId = Math.max(...tasks.map((task) => task.id)) + 1;

  saveTasks();
  clearFilters();
}

// ---------- Rendering ----------

function createCard(task) {
  const card = document.createElement("article");
  card.className = "rounded-lg border border-slate-200 bg-slate-50 p-3";

  const title = document.createElement("h3");
  title.className = "font-semibold break-words";
  title.textContent = task.title;

  const subject = document.createElement("p");
  subject.className = "text-sm text-slate-500 break-words";
  subject.textContent = task.subject;

  const badge = document.createElement("span");
  badge.className = `mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${priorityStyles[task.priority]}`;
  badge.textContent = task.priority;

  const statusSelect = document.createElement("select");
  statusSelect.className = "mt-3 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm";
  statusSelect.setAttribute("aria-label", `Move "${task.title}"`);

  for (const value in statusLabels) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = statusLabels[value];
    option.selected = value === task.status;
    statusSelect.append(option);
  }

  statusSelect.addEventListener("change", () => {
    moveTask(task.id, statusSelect.value);
  });

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEdit(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  const actions = document.createElement("div");
  actions.className = "mt-2 flex flex-wrap gap-2";
  actions.append(editBtn, deleteBtn);

  card.append(title, subject, badge, statusSelect, actions);
  return card;
}

function renderBoard() {
  for (const status in columns) {
    const container = columns[status];
    container.innerHTML = "";

    const allInColumn = tasks.filter((task) => task.status === status);
    const columnTasks = allInColumn.filter(matchesFilters);

    if (columnTasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-sm italic text-slate-400";

      if (allInColumn.length === 0) {
        empty.textContent = "No tasks here yet.";
      } else {
        empty.textContent = `${allInColumn.length} task(s) hidden by current filters.`;
      }

      container.append(empty);
    } else {
      columnTasks.forEach((task) => container.append(createCard(task)));
    }
  }

  clearFiltersBtn.classList.toggle("hidden", !filtersActive());

  renderStats();
}

// ---------- Stats ----------

const statEls = {
  total: document.getElementById("statTotal"),
  todo: document.getElementById("statTodo"),
  inprogress: document.getElementById("statInprogress"),
  done: document.getElementById("statDone"),
};
const statPercent = document.getElementById("statPercent");
const progressTrack = document.getElementById("progressTrack");
const progressFill = document.getElementById("progressFill");

function renderStats() {
  const total = tasks.length;
  const counts = { todo: 0, inprogress: 0, done: 0 };

  tasks.forEach((task) => {
    counts[task.status]++;
  });

  const percent = total === 0 ? 0 : Math.round((counts.done / total) * 100);

  statEls.total.textContent = total;
  statEls.todo.textContent = counts.todo;
  statEls.inprogress.textContent = counts.inprogress;
  statEls.done.textContent = counts.done;

  statPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  progressTrack.setAttribute("aria-valuenow", percent);
}

// ---------- Startup ----------

loadTasks();

let nextId = tasks.length
  ? Math.max(...tasks.map((task) => task.id)) + 1
  : 1;

renderBoard();

// ---------- Event listeners ----------

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const subject = subjectInput.value.trim();
    clearErrors();

  const titleInvalid = title.length < 3;
  const subjectInvalid = subject === "";

  if (titleInvalid) {
    setError(titleInput, titleError, "Title must be at least 3 characters.");
  }
  if (subjectInvalid) {
    setError(subjectInput, subjectError, "Please enter a subject.");
  }

  if (titleInvalid || subjectInvalid) {
    (titleInvalid ? titleInput : subjectInput).focus();
    return;
  }

  if (editingId !== null) {
    const task = tasks.find((task) => task.id === editingId);

    if (task) {
      task.title = title;
      task.subject = subject;
      task.priority = priorityInput.value;
      saveTasks();
    }

    stopEdit();
    renderBoard();
    return;
  }

  const newTask = {
    id: nextId++,
    title: title,
    subject: subject,
    priority: priorityInput.value,
    status: "todo",
  };

  tasks.push(newTask);
  saveTasks();
  renderBoard();
  taskForm.reset();
});

cancelEditBtn.addEventListener("click", stopEdit);

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  renderBoard();
});

priorityFilterSelect.addEventListener("change", () => {
  priorityFilter = priorityFilterSelect.value;
  renderBoard();
});

clearFiltersBtn.addEventListener("click", clearFilters);

resetBoardBtn.addEventListener("click", resetBoard);