/* =========================================
   STUDYHUB — JAVASCRIPT
========================================= */


/* =========================================
   DATA
========================================= */

let tasks = JSON.parse(
    localStorage.getItem("studyhub-tasks")
) || [];

let studyMinutes = Number(
    localStorage.getItem("studyhub-minutes")
) || 0;

let studyDays = JSON.parse(
    localStorage.getItem("studyhub-days")
) || [];

let currentFilter = "all";


/* =========================================
   ELEMENTS
========================================= */

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

const currentDate = document.getElementById("currentDate");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const studyTime = document.getElementById("studyTime");
const studyStreak = document.getElementById("studyStreak");

const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

const dashboardTasks = document.getElementById("dashboardTasks");
const allTasks = document.getElementById("allTasks");

const emptyTasks = document.getElementById("emptyTasks");
const emptyAllTasks = document.getElementById("emptyAllTasks");

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const taskName = document.getElementById("taskName");
const taskSubject = document.getElementById("taskSubject");
const taskPriority = document.getElementById("taskPriority");

const searchTask = document.getElementById("searchTask");
const taskFilter = document.getElementById("taskFilter");

const themeToggle = document.getElementById("themeToggle");

const timerDisplay = document.getElementById("timerDisplay");

const startTimer = document.getElementById("startTimer");
const pauseTimer = document.getElementById("pauseTimer");
const resetTimer = document.getElementById("resetTimer");


/* =========================================
   DATE
========================================= */

function getToday() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function displayDate() {

    const date = new Date();

    currentDate.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}

displayDate();


/* =========================================
   NAVIGATION
========================================= */

navItems.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId =
            button.dataset.section;

        navItems.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        sections.forEach(section => {
            section.classList.remove(
                "active-section"
            );
        });

        const selectedSection =
            document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.classList.add(
                "active-section"
            );
        }

    });

});


/* =========================================
   MODAL
========================================= */

function openModal() {

    taskModal.classList.add("show");

    taskName.focus();
}


function closeModal() {

    taskModal.classList.remove("show");

    taskForm.reset();
}


document
    .getElementById("addTaskBtn")
    .addEventListener("click", openModal);


document
    .getElementById("tasksAddBtn")
    .addEventListener("click", openModal);


document
    .getElementById("quickAddTask")
    .addEventListener("click", openModal);


document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);


taskModal.addEventListener("click", event => {

    if (event.target === taskModal) {
        closeModal();
    }

});


/* =========================================
   CREATE TASK
========================================= */

taskForm.addEventListener("submit", event => {

    event.preventDefault();

    const name =
        taskName.value.trim();

    if (!name) return;

    const newTask = {

        id: Date.now(),

        name: name,

        subject: taskSubject.value,

        priority: taskPriority.value,

        completed: false,

        createdAt: getToday()

    };

    tasks.push(newTask);

    saveTasks();

    taskForm.reset();

    closeModal();

    renderTasks();

});


/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {

    localStorage.setItem(
        "studyhub-tasks",
        JSON.stringify(tasks)
    );

}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();

    if (task.completed) {

        recordStudyDay();

    }

    renderTasks();

}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    tasks = tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    renderTasks();

}


/* =========================================
   TASK DISPLAY
========================================= */

function createTaskHTML(task) {

    return `
        <div class="task-item">

            <div
                class="task-check ${
                    task.completed ? "completed" : ""
                }"
                onclick="toggleTask(${task.id})"
            >
                ${
                    task.completed
                        ? "✓"
                        : ""
                }
            </div>

            <div class="task-info">

                <div
                    class="task-title ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                >
                    ${escapeHTML(task.name)}
                </div>

                <div class="task-meta">

                    <span class="task-subject">
                        ${escapeHTML(task.subject)}
                    </span>

                    <span
                        class="priority ${task.priority}"
                    >
                        ${task.priority}
                    </span>

                </div>

            </div>

            <button
                class="delete-task"
                onclick="deleteTask(${task.id})"
                title="Delete task"
            >
                🗑️
            </button>

        </div>
    `;
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    const search =
        searchTask
            ? searchTask.value
                .toLowerCase()
                .trim()
            : "";

    let filteredTasks = [...tasks];


    /* Search */

    if (search) {

        filteredTasks =
            filteredTasks.filter(task =>
                task.name
                    .toLowerCase()
                    .includes(search)
            );

    }


    /* Filter */

    if (currentFilter === "completed") {

        filteredTasks =
            filteredTasks.filter(
                task => task.completed
            );

    }

    if (currentFilter === "pending") {

        filteredTasks =
            filteredTasks.filter(
                task => !task.completed
            );

    }


    /* Dashboard */

    dashboardTasks.innerHTML = "";

    const todayTasks =
        tasks.filter(
            task => task.createdAt === getToday()
        );


    if (todayTasks.length === 0) {

        emptyTasks.style.display = "block";

    } else {

        emptyTasks.style.display = "none";

        dashboardTasks.innerHTML =
            todayTasks
                .map(createTaskHTML)
                .join("");

    }


    /* All Tasks */

    allTasks.innerHTML = "";

    if (filteredTasks.length === 0) {

        emptyAllTasks.style.display =
            "block";

    } else {

        emptyAllTasks.style.display =
            "none";

        allTasks.innerHTML =
            filteredTasks
                .map(createTaskHTML)
                .join("");

    }


    updateStats();

}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    totalTasks.textContent = total;

    completedTasks.textContent =
        completed;


    studyTime.textContent =
        formatStudyTime(studyMinutes);


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    progressPercent.textContent =
        `${percentage}%`;

    progressFill.style.width =
        `${percentage}%`;


    studyStreak.textContent =
        `${calculateStreak()} days`;

}


/* =========================================
   STUDY TIME
========================================= */

function formatStudyTime(minutes) {

    if (minutes < 60) {

        return `${minutes}m`;

    }

    const hours =
        Math.floor(minutes / 60);

    const remaining =
        minutes % 60;

    return `${hours}h ${remaining}m`;

}


/* =========================================
   STUDY DAY / STREAK
========================================= */

function recordStudyDay() {

    const today = getToday();

    if (!studyDays.includes(today)) {

        studyDays.push(today);

        localStorage.setItem(
            "studyhub-days",
            JSON.stringify(studyDays)
        );

    }

}


function calculateStreak() {

    if (studyDays.length === 0) {
        return 0;
    }

    const uniqueDays =
        [...new Set(studyDays)]
            .sort()
            .reverse();

    let streak = 0;

    let currentDate =
        new Date();


    for (let i = 0; i < uniqueDays.length; i++) {

        const expectedDate =
            new Date(currentDate);

        expectedDate.setDate(
            expectedDate.getDate() - i
        );


        const year =
            expectedDate.getFullYear();

        const month =
            String(
                expectedDate.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                expectedDate.getDate()
            ).padStart(2, "0");

        const expected =
            `${year}-${month}-${day}`;


        if (uniqueDays[i] === expected) {

            streak++;

        } else {

            break;

        }

    }

    return streak;

}


/* =========================================
   SEARCH
========================================= */

if (searchTask) {

    searchTask.addEventListener(
        "input",
        renderTasks
    );

}


/* =========================================
   FILTER
========================================= */

if (taskFilter) {

    taskFilter.addEventListener(
        "change",
        () => {

            currentFilter =
                taskFilter.value;

            renderTasks();

        }
    );

}


/* =========================================
   POMODORO TIMER
========================================= */

let timerSeconds = 25 * 60;

let timerInterval = null;

let timerRunning = false;


function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


function startStudyTimer() {

    if (timerRunning) return;

    timerRunning = true;

    timerInterval =
        setInterval(() => {

            if (timerSeconds > 0) {

                timerSeconds--;

                updateTimerDisplay();

            } else {

                stopTimer();

                studyMinutes += 25;

                localStorage.setItem(
                    "studyhub-minutes",
                    studyMinutes
                );

                recordStudyDay();

                alert(
                    "🎉 Study session completed! Take a short break."
                );

                updateStats();

            }

        }, 1000);

}


function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    timerRunning = false;

}


function resetStudyTimer() {

    stopTimer();

    timerSeconds = 25 * 60;

    updateTimerDisplay();

}


startTimer.addEventListener(
    "click",
    startStudyTimer
);


pauseTimer.addEventListener(
    "click",
    stopTimer
);


resetTimer.addEventListener(
    "click",
    resetStudyTimer
);


/* Quick timer button */

document
    .getElementById("quickTimer")
    .addEventListener("click", () => {

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove("active");

            });


        const timerNav =
            document.querySelector(
                '[data-section="timer"]'
            );

        timerNav.classList.add("active");


        sections.forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


        document
            .getElementById("timer")
            .classList.add(
                "active-section"
            );

        startStudyTimer();

    });


/* =========================================
   DARK / LIGHT MODE
========================================= */

function applyTheme() {

    const theme =
        localStorage.getItem(
            "studyhub-theme"
        );

    if (theme === "light") {

        document.body.classList.add(
            "light-mode"
        );

        themeToggle.textContent =
            "☀️ Light Mode";

    } else {

        document.body.classList.remove(
            "light-mode"
        );

        themeToggle.textContent =
            "🌙 Dark Mode";

    }

}


themeToggle.addEventListener(
    "click",
    () => {

        const isLight =
            document.body.classList.toggle(
                "light-mode"
            );


        localStorage.setItem(
            "studyhub-theme",
            isLight
                ? "light"
                : "dark"
        );


        applyTheme();

    }
);


/* =========================================
   HTML SAFETY
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   INITIALIZE
========================================= */

applyTheme();

updateTimerDisplay();

renderTasks();