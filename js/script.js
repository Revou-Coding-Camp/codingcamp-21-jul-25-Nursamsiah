// js/script.js

// Mengambil elemen-elemen DOM
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');
const noTaskFoundMessage = document.getElementById('no-task-found');
const filterSelect = document.getElementById('filter-select'); // Ganti filterBtn
const deleteAllBtn = document.getElementById('delete-all-btn');

let todos = []; // Array untuk menyimpan semua tugas
let currentFilter = 'all'; // Default filter: 'all', bisa juga 'active' atau 'completed'

// Fungsi untuk menyimpan data ke Local Storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Fungsi untuk memuat data dari Local Storage
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
}

// Fungsi untuk menampilkan tugas dalam format kartu
function renderTodos() {
    todoList.innerHTML = ''; // Kosongkan daftar tugas yang ada

    // 1. Filter Berdasarkan Status
    const filteredAndSortedTodos = todos.filter(todo => {
        if (currentFilter === 'all') {
            return true;
        } else if (currentFilter === 'active') {
            return !todo.completed;
        } else if (currentFilter === 'completed') {
            return todo.completed;
        }
    }).sort((a, b) => { // 2. Urutkan Berdasarkan Tanggal Deadline
        // Tugas tanpa tanggal deadline akan ditaruh di akhir
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Urutkan dari tanggal terlama ke terbaru
    });

    if (filteredAndSortedTodos.length === 0) {
        noTaskFoundMessage.style.display = 'block'; // Tampilkan pesan "No task found"
    } else {
        noTaskFoundMessage.style.display = 'none'; // Sembunyikan pesan
        filteredAndSortedTodos.forEach((todo) => {
            const originalIndex = todos.indexOf(todo); // Dapatkan indeks asli di array todos
            const todoCard = document.createElement('div');
            todoCard.className = `
                bg-medium-light-blue p-5 rounded-lg shadow-md border border-medium-blue
                flex flex-col justify-between relative
                ${todo.completed ? 'opacity-70' : ''}
            `;

            // Hitung sisa hari atau hari terlambat
            let dateInfo = '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (todo.date) {
                const dueDate = new Date(todo.date);
                dueDate.setDate(dueDate.getDate() + 1);
                dueDate.setHours(0, 0, 0, 0);

                const diffTime = dueDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    dateInfo = '<span class="text-dark-blue text-xs font-semibold">Today</span>';
                } else if (diffDays > 0) {
                    dateInfo = `<span class="text-medium-blue text-xs font-semibold">${diffDays} day${diffDays > 1 ? 's' : ''} left</span>`;
                } else {
                    dateInfo = `<span class="text-bright-red text-xs font-semibold">${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue</span>`;
                }
            } else {
                dateInfo = '<span class="text-medium-blue text-xs">No Due Date</span>';
            }


            todoCard.innerHTML = `
                <div class="flex justify-between items-start mb-3 w-full"> 
                    <div class="flex items-start"> 
                        <input type="checkbox" data-index="${originalIndex}" ${todo.completed ? 'checked' : ''}
                               class="complete-checkbox w-5 h-5 mr-3 mt-1 cursor-pointer
                                      rounded-full appearance-none border border-dark-blue
                                      checked:bg-darkest-blue checked:border-transparent
                                      focus:outline-none focus:ring-2 focus:ring-darkest-blue focus:ring-offset-2 focus:ring-offset-medium-light-blue">
                        <div>
                            <p class="text-lg font-semibold ${todo.completed ? 'line-through text-medium-blue' : 'text-darkest-blue'}">${todo.task}</p>
                            ${dateInfo ? `<p class="text-sm text-dark-blue">${todo.date ? todo.date : ''} ${dateInfo}</p>` : ''}
                        </div>
                    </div>
                    <button class="delete-btn text-bright-red hover:text-bright-red-darker transition duration-300 p-1 rounded-full" data-index="${originalIndex}"> 
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="flex justify-end items-end gap-2 mt-4">
                    ${todo.completed ? '<span class="text-dark-blue text-sm font-semibold">Completed</span>' : '<span></span>'} 
                </div>
            `;
            todoList.appendChild(todoCard);
        });
    }
}

// Fungsi untuk menambahkan tugas baru
addTodoBtn.addEventListener('click', () => {
    const taskText = todoInput.value.trim();
    const dueDate = dueDateInput.value;

    // Validasi Input
    if (taskText === '') {
        errorMessage.textContent = 'Task cannot be empty!';
        errorMessage.style.display = 'block';
        return;
    } else {
        errorMessage.style.display = 'none';
    }

    const newTodo = {
        task: taskText,
        date: dueDate,
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos(); 
    todoInput.value = '';
    dueDateInput.value = '';
});

// Event delegation untuk checkbox complete dan tombol delete
todoList.addEventListener('change', (e) => {
    if (e.target.classList.contains('complete-checkbox')) {
        const index = e.target.dataset.index;
        if (index !== undefined && todos[index]) {
            todos[index].completed = e.target.checked;
            saveTodos();
            renderTodos();
        }
    }
});

todoList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.dataset.index;
        if (index !== undefined && todos[index]) {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
    }
});

// --- Fungsionalitas Dropdown FILTER ---
filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value; 
    renderTodos(); 
});

// --- Fungsionalitas Tombol DELETE ALL ---
deleteAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all tasks?')) {
        todos = []; 
        saveTodos(); 
        renderTodos(); 
    }
});


// Initial load and render saat halaman dimuat
loadTodos();
renderTodos();