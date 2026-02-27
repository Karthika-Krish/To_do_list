// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');

// App State
let todos = [];
let currentFilter = 'all';

// Load todos from localStorage on page load
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }
    updateTaskCount();
    updateClearButton();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateTaskCount();
    updateClearButton();
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    const newTodo = {
        id: Date.now(), // Unique ID using timestamp
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    
    // Clear input and focus
    todoInput.value = '';
    todoInput.focus();
}

// Delete a todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

// Toggle todo completion
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

// Edit todo text
function editTodo(id, newText) {
    if (newText.trim() === '') {
        alert('Task cannot be empty!');
        return false;
    }
    
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: newText };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
    return true;
}

// Filter todos based on current filter
function getFilteredTodos() {
    switch(currentFilter) {
        case 'pending':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos to the DOM
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        todoList.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
        todoList.innerHTML = '';
        
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                >
                <span class="todo-text ${todo.completed ? 'completed-text' : ''}">
                    ${todo.text}
                </span>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add event listeners
            const checkbox = li.querySelector('.todo-checkbox');
            const deleteBtn = li.querySelector('.delete-btn');
            const todoText = li.querySelector('.todo-text');
            
            checkbox.addEventListener('click', () => toggleTodo(todo.id));
            
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            
            // Double-click to edit
            todoText.addEventListener('dblclick', () => {
                const currentText = todoText.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                input.className = 'edit-input';
                
                todoText.replaceWith(input);
                input.focus();
                input.select();
                
                // Save on Enter or blur
                const saveEdit = () => {
                    const success = editTodo(todo.id, input.value);
                    if (success) {
                        renderTodos();
                    } else {
                        input.replaceWith(todoText);
                    }
                };
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit();
                    }
                });
                
                input.addEventListener('blur', saveEdit);
            });
            
            todoList.appendChild(li);
        });
    }
}

// Update task counter
function updateTaskCount() {
    const pendingCount = todos.filter(todo => !todo.completed).length;
    const totalCount = todos.length;
    
    if (totalCount === 0) {
        taskCount.textContent = 'No tasks';
    } else if (pendingCount === 0) {
        taskCount.textContent = 'All tasks completed!';
    } else {
        taskCount.textContent = `${pendingCount} of ${totalCount} tasks remaining`;
    }
}

// Update clear completed button
function updateClearButton() {
    const completedCount = todos.filter(todo => todo.completed).length;
    clearCompletedBtn.disabled = completedCount === 0;
}

// Clear all completed todos
function clearCompleted() {
    if (confirm('Clear all completed tasks?')) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

// Set filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// Event Listeners
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Initialize the app
loadTodos();

// Make functions available in console for debugging
window.todoApp = {
    todos,
    addTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    setFilter,
    saveTodos
};

console.log('Todo App Loaded! Type todoApp in console to debug.');