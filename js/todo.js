// TODO 앱 JavaScript

// 상태 관리
let todos = [];
let currentFilter = 'all';

// DOM 요소
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterTabs = document.querySelectorAll('.filter-tab');

// localStorage 키
const STORAGE_KEY = 'my-todos';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
    initEventListeners();
});

// 이벤트 리스너 초기화
function initEventListeners() {
    // 할 일 추가 폼
    todoForm.addEventListener('submit', handleAddTodo);

    // 필터 탭
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            setFilter(filter);
        });
    });

    // 완료 항목 삭제
    clearCompletedBtn.addEventListener('click', handleClearCompleted);
}

// localStorage에서 불러오기
function loadTodos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            todos = JSON.parse(stored);
        }
    } catch (error) {
        console.error('할 일 불러오기 실패:', error);
        todos = [];
    }
}

// localStorage에 저장
function saveTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('할 일 저장 실패:', error);
    }
}

// 새 할 일 추가
function handleAddTodo(e) {
    e.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(newTodo);
    saveTodos();
    renderTodos();

    todoInput.value = '';
    todoInput.focus();
}

// 할 일 삭제
function deleteTodo(id) {
    if (!confirm('이 할 일을 삭제하시겠습니까?')) return;

    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// 완료 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// 수정 모드 진입
function startEdit(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (!todoItem) return;

    const textSpan = todoItem.querySelector('.todo-text');
    const currentText = todo.text;

    // 수정 입력창으로 교체
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText;
    editInput.className = 'edit-input flex-1 px-3 py-1 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm';
    editInput.maxLength = 100;

    textSpan.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // 버튼 숨기기
    const actionBtns = todoItem.querySelector('.action-btns');
    if (actionBtns) actionBtns.style.display = 'none';

    // 저장 함수
    const saveEdit = () => {
        const newText = editInput.value.trim();
        if (newText && newText !== currentText) {
            updateTodo(id, newText);
        } else {
            renderTodos();
        }
    };

    // Enter 키로 저장
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            renderTodos();
        }
    });

    // 포커스 잃으면 저장
    editInput.addEventListener('blur', saveEdit);
}

// 수정 저장
function updateTodo(id, newText) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: newText };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// 필터 설정
function setFilter(filter) {
    currentFilter = filter;

    // 탭 활성화 상태 업데이트
    filterTabs.forEach(tab => {
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderTodos();
}

// 완료 항목 전체 삭제
function handleClearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (!confirm(`완료된 ${completedCount}개의 항목을 삭제하시겠습니까?`)) return;

    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// 필터링된 할 일 목록 반환
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 통계 업데이트
function updateCounts() {
    const allCount = todos.length;
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;

    document.getElementById('count-all').textContent = allCount;
    document.getElementById('count-active').textContent = activeCount;
    document.getElementById('count-completed').textContent = completedCount;
    document.getElementById('remaining-count').textContent = activeCount;

    // 완료 항목 삭제 버튼 상태
    clearCompletedBtn.disabled = completedCount === 0;
}

// 화면 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    // 빈 상태 처리
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        todoList.innerHTML = filteredTodos.map(todo => createTodoHTML(todo)).join('');

        // 이벤트 바인딩
        bindTodoEvents();
    }

    updateCounts();
}

// TODO 항목 HTML 생성
function createTodoHTML(todo) {
    const completedClass = todo.completed ? 'completed' : '';
    const checkedAttr = todo.completed ? 'checked' : '';
    const textClass = todo.completed ? 'line-through text-gray-500' : 'text-white';

    return `
        <div class="todo-item ${completedClass} flex items-center gap-4 px-6 py-4 transition-colors group" data-id="${todo.id}">
            <!-- 체크박스 -->
            <label class="relative flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    class="todo-checkbox sr-only peer"
                    ${checkedAttr}
                >
                <div class="w-6 h-6 border-2 border-gray-500 rounded-full peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                    <i class="fas fa-check text-white text-xs ${todo.completed ? '' : 'hidden'}"></i>
                </div>
            </label>

            <!-- 텍스트 -->
            <span class="todo-text flex-1 ${textClass} cursor-pointer transition-colors">
                ${escapeHTML(todo.text)}
            </span>

            <!-- 액션 버튼 -->
            <div class="action-btns flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    class="edit-btn w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    title="수정"
                >
                    <i class="fas fa-pen text-sm"></i>
                </button>
                <button
                    class="delete-btn w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="삭제"
                >
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `;
}

// TODO 항목 이벤트 바인딩
function bindTodoEvents() {
    // 체크박스 클릭
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            toggleTodo(id);
        });
    });

    // 텍스트 더블클릭 (수정)
    document.querySelectorAll('.todo-text').forEach(text => {
        text.addEventListener('dblclick', (e) => {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            startEdit(id);
        });
    });

    // 수정 버튼
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            startEdit(id);
        });
    });

    // 삭제 버튼
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            deleteTodo(id);
        });
    });
}

// HTML 이스케이프 (XSS 방지)
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
