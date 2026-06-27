// DOM Elements - Navigation
const navButtons = document.querySelectorAll('.nav-button');
const viewSections = document.querySelectorAll('.view-section');
const yearSelect = document.getElementById('yearSelect');
const yearBadges = document.querySelectorAll('.badge');

// DOM Elements - Dashboard
const dashTaskList = document.getElementById('dashTaskList');
const dashClassList = document.getElementById('dashClassList');

// DOM Elements - Class
const studentListEl = document.getElementById('studentList');
const studentDetailArea = document.getElementById('studentDetailArea');
const emptyStudentSelection = document.getElementById('emptyStudentSelection');
const detailStudentName = document.getElementById('detailStudentName');
const detailStudentStatus = document.getElementById('detailStudentStatus');
const recordForm = document.getElementById('recordForm');
const recordTimeline = document.getElementById('recordTimeline');
const privacyCheck = document.getElementById('privacyCheck');

// DOM Elements - Tasks
const btnAddTask = document.getElementById('btnAddTask');
const btnImportRoutine = document.getElementById('btnImportRoutine');
const taskFormPanel = document.getElementById('taskFormPanel');
const taskForm = document.getElementById('taskForm');
const btnCancelTask = document.getElementById('btnCancelTask');
const listTodo = document.getElementById('listTodo');
const listDone = document.getElementById('listDone');
const countTodo = document.getElementById('countTodo');
const countDone = document.getElementById('countDone');

// --- STATE ---
let state = {
  activeYear: "2026",
  selectedStudentId: null,
  students: [
    { id: "ID-001", name: "학생 1번", status: "안정" },
    { id: "ID-002", name: "학생 2번", status: "관찰요망" },
    { id: "ID-003", name: "학생 3번", status: "상담진행중" },
    { id: "ID-004", name: "학생 4번", status: "안정" },
  ],
  records: [], // { id, year, studentId, date, category, content }
  tasks: [] // { id, year, title, dueDate, status (todo/done) }
};

// --- INITIALIZATION ---
function init() {
  loadData();
  setupEventListeners();
  renderAll();
}

function loadData() {
  const savedData = localStorage.getItem('teacherArchiveState');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    state.records = parsed.records || [];
    state.tasks = parsed.tasks || [];
    // Reset selection on load
    state.selectedStudentId = null; 
  } else {
    // Demo data for fresh start
    state.tasks = [
      { id: "t1", year: "2026", title: "주간 학습안내장 작성", dueDate: getTodayStr(), status: "todo" },
      { id: "t2", year: "2026", title: "학부모 총회 준비", dueDate: getDaysLaterStr(2), status: "todo" },
      { id: "t3", year: "2026", title: "학생 기초조사서 취합", dueDate: getDaysLaterStr(-1), status: "done" }
    ];
    state.records = [
      { id: "r1", year: "2026", studentId: "ID-002", date: getDaysLaterStr(-2), category: "관찰", content: "수업 시간 집중력 저하 및 잦은 자리 이탈 관찰됨." },
      { id: "r2", year: "2026", studentId: "ID-003", date: getTodayStr(), category: "상담", content: "교우 관계 어려움 호소. 자리 배치 조정 약속함." }
    ];
    saveData();
  }
  
  // Set UI year selector
  yearSelect.value = state.activeYear;
}

function saveData() {
  const dataToSave = {
    records: state.records,
    tasks: state.tasks
  };
  localStorage.setItem('teacherArchiveState', JSON.stringify(dataToSave));
}

function setupEventListeners() {
  // Navigation
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      viewSections.forEach(sec => sec.classList.add('hidden'));
      document.getElementById(targetId).classList.remove('hidden');
    });
  });

  // Year Selection
  yearSelect.addEventListener('change', (e) => {
    state.activeYear = e.target.value;
    state.selectedStudentId = null; // Clear selection on year change
    renderAll();
  });

  // Class: Record Submit
  recordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!privacyCheck.checked) {
      alert("개인 식별 정보를 포함하지 않았음에 동의해야 합니다.");
      return;
    }
    
    const newRecord = {
      id: "r_" + Date.now(),
      year: state.activeYear,
      studentId: state.selectedStudentId,
      date: document.getElementById('recordDate').value,
      category: document.getElementById('recordCategory').value,
      content: document.getElementById('recordContent').value
    };
    
    state.records.push(newRecord);
    saveData();
    recordForm.reset();
    renderClassTimeline();
    renderDashboard();
  });

  // Tasks: Toggle Add Form
  btnAddTask.addEventListener('click', () => {
    taskFormPanel.classList.remove('hidden');
    taskForm.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskFormTitle').textContent = "새 업무 추가";
  });
  
  btnCancelTask.addEventListener('click', () => {
    taskFormPanel.classList.add('hidden');
  });

  // Tasks: Form Submit
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const dueDate = document.getElementById('taskDue').value;

    if (idInput) {
      // Edit
      const task = state.tasks.find(t => t.id === idInput);
      if (task) {
        task.title = title;
        task.dueDate = dueDate;
      }
    } else {
      // Add
      state.tasks.push({
        id: "t_" + Date.now(),
        year: state.activeYear,
        title: title,
        dueDate: dueDate,
        status: "todo"
      });
    }
    
    saveData();
    taskFormPanel.classList.add('hidden');
    renderTasks();
    renderDashboard();
  });

  // Tasks: Import Routine Template
  btnImportRoutine.addEventListener('click', () => {
    if (confirm("3월 개학 준비 루틴 템플릿을 업무 목록에 복제하시겠습니까?")) {
      const routineTasks = [
        { id: "tr_" + Date.now() + "1", year: state.activeYear, title: "[루틴] 교실 환경 미화 및 청소", dueDate: "", status: "todo" },
        { id: "tr_" + Date.now() + "2", year: state.activeYear, title: "[루틴] 학생 기초조사서 배부", dueDate: "", status: "todo" },
        { id: "tr_" + Date.now() + "3", year: state.activeYear, title: "[루틴] 학급 규칙 정하기 (첫 주)", dueDate: "", status: "todo" }
      ];
      state.tasks = [...state.tasks, ...routineTasks];
      saveData();
      renderTasks();
      renderDashboard();
    }
  });
}

// --- RENDER LOGIC ---

function renderAll() {
  // Update year badges
  yearBadges.forEach(b => b.textContent = state.activeYear);
  
  renderDashboard();
  renderClassSidebar();
  renderClassTimeline();
  renderTasks();
}

function renderDashboard() {
  // Filter by year
  const yearTasks = state.tasks.filter(t => t.year === state.activeYear && t.status === 'todo');
  const yearRecords = state.records.filter(r => r.year === state.activeYear);
  
  // Sort tasks by due date
  yearTasks.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  // Render Tasks (Max 5)
  dashTaskList.innerHTML = '';
  if (yearTasks.length === 0) {
    dashTaskList.innerHTML = '<p class="dash-item" style="color:var(--text-muted)">대기 중인 업무가 없습니다.</p>';
  } else {
    yearTasks.slice(0, 5).forEach(task => {
      const isOverdue = task.dueDate && task.dueDate < getTodayStr();
      dashTaskList.innerHTML += `
        <div class="dash-item">
          <span>${task.title}</span>
          ${task.dueDate ? `<span class="badge" style="${isOverdue ? 'background-color:var(--danger-bg);color:var(--danger);' : ''}">${isOverdue ? '지연' : task.dueDate}</span>` : ''}
        </div>
      `;
    });
  }

  // Render Class Alerts (Recent records or students needing attention)
  dashClassList.innerHTML = '';
  const studentsNeedingAttention = state.students.filter(s => s.status !== "안정");
  if (studentsNeedingAttention.length === 0) {
    dashClassList.innerHTML = '<p class="dash-item" style="color:var(--text-muted)">특별히 주목할 학생 알림이 없습니다.</p>';
  } else {
    studentsNeedingAttention.forEach(st => {
      const isDanger = st.status === "관찰요망";
      dashClassList.innerHTML += `
        <div class="dash-item">
          <span>${st.name} (${st.id})</span>
          <span class="status-badge ${isDanger ? 'attention' : ''}">${st.status}</span>
        </div>
      `;
    });
  }
}

function renderClassSidebar() {
  studentListEl.innerHTML = '';
  state.students.forEach(st => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.innerHTML = `<span>${st.id}</span> <span class="status-badge">${st.status}</span>`;
    
    if (state.selectedStudentId === st.id) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
      state.selectedStudentId = st.id;
      renderClassSidebar(); // Re-render to update active state
      renderClassTimeline();
    });
    
    li.appendChild(btn);
    studentListEl.appendChild(li);
  });
}

function renderClassTimeline() {
  if (!state.selectedStudentId) {
    studentDetailArea.classList.add('hidden');
    emptyStudentSelection.classList.remove('hidden');
    return;
  }

  studentDetailArea.classList.remove('hidden');
  emptyStudentSelection.classList.add('hidden');

  const student = state.students.find(s => s.id === state.selectedStudentId);
  detailStudentName.textContent = student.name + " (" + student.id + ")";
  detailStudentStatus.textContent = student.status;
  
  // Set default date
  document.getElementById('recordDate').value = getTodayStr();

  // Filter records
  const sRecords = state.records.filter(r => r.year === state.activeYear && r.studentId === state.selectedStudentId);
  
  recordTimeline.innerHTML = '';
  if (sRecords.length === 0) {
    recordTimeline.innerHTML = '<p style="color:var(--text-muted)">이 학년도의 기록이 없습니다.</p>';
    return;
  }
  
  // Sort descending
  sRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  sRecords.forEach(r => {
    const markChar = r.category.charAt(0); // 관, 상, 지
    recordTimeline.innerHTML += `
      <div class="timeline-item">
        <div class="timeline-marker">${markChar}</div>
        <div class="timeline-content">
          <div class="timeline-header">
            <strong>${r.category}</strong>
            <span>${r.date}</span>
          </div>
          <div class="timeline-body">${r.content}</div>
        </div>
      </div>
    `;
  });
}

function renderTasks() {
  const yearTasks = state.tasks.filter(t => t.year === state.activeYear);
  const todos = yearTasks.filter(t => t.status === 'todo');
  const dones = yearTasks.filter(t => t.status === 'done');

  countTodo.textContent = todos.length;
  countDone.textContent = dones.length;

  listTodo.innerHTML = '';
  todos.forEach(t => listTodo.appendChild(createTaskCard(t)));

  listDone.innerHTML = '';
  dones.forEach(t => listDone.appendChild(createTaskCard(t)));
}

function createTaskCard(task) {
  const div = document.createElement('div');
  div.className = 'task-card';
  
  const isOverdue = task.dueDate && task.dueDate < getTodayStr() && task.status !== 'done';
  const dueClass = isOverdue ? '' : 'safe';
  
  div.innerHTML = `
    <div class="task-card-header">
      <span class="task-card-title" style="${task.status === 'done' ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${task.title}</span>
    </div>
    ${task.dueDate ? `<span class="task-card-due ${dueClass}">${task.dueDate}</span>` : '<span class="task-card-due safe">기한 없음</span>'}
    <div class="task-actions">
      ${task.status === 'todo' ? `<button class="text-button" onclick="toggleTask('${task.id}')">완료하기</button>` : `<button class="text-button" onclick="toggleTask('${task.id}')" style="color:var(--text-muted)">되돌리기</button>`}
      <button class="text-button" style="color:var(--danger); margin-left:8px;" onclick="deleteTask('${task.id}')">삭제</button>
    </div>
  `;
  return div;
}

// Global functions for inline onclick handlers
window.toggleTask = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = task.status === 'todo' ? 'done' : 'todo';
    saveData();
    renderTasks();
    renderDashboard();
  }
};

window.deleteTask = function(taskId) {
  if (confirm('이 업무를 삭제하시겠습니까?')) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveData();
    renderTasks();
    renderDashboard();
  }
};

// Helpers
function getTodayStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysLaterStr(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Kickoff
init();
