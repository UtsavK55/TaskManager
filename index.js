const tasksArr = [];
const taskForm = document.getElementById("addTaskForm");
const tasksList = document.querySelector("#taskTable tbody");
const taskInput = document.getElementById("taskInput");
const selectFilter = document.getElementById("selectFilter");
const selectPriorityFilter = document.getElementById("selectPriorityFilter");
const taskDate = document.getElementById("taskDate");
const selectPriority = document.getElementById("selectPriority");
const taskTag = document.getElementById("taskTag");
const loader = document.getElementById("loader");
const searchButton = document.getElementById("searchTask");
const searchTaskInput = document.getElementById("taskSearch");

// Notification-toastify
const showToast = (color, text)=>{
    Toastify({
        text: `${text}`,
        duration: 3000,
        close: true,
        stopOnFocus: true, 
        className: "custom-toast",
        style: {
          background: "rgb(255,255,255)",
          color: "rgb(100,100,100)",
          border: `2px solid ${color}`,
          borderRadius: "5px",
          padding: "10px 15px",
          fontWeight: "bold",
        }
        }).showToast();
}

// Add Task 
const addTask = (event)=>{
    event.preventDefault();
    try {
        const task = taskInput.value.trim();
    if(task){
        tasksArr.push({taskId: tasksArr.length + 1, task: task, completedStatus: false, dueDate:taskDate.value, priority: selectPriority.value, tag: taskTag.value});
        resetForm();
        showToast("rgb(0,200,0)", "Task added successfully")
        saveToLocalStorage();
        displayTasks(tasksArr);
    }   
    } catch (error) {
        console.error("Failed to add task:", error);
        showToast("rgb(225,0,0)", error.message);
    }
    
} 

// Reset Form
const resetForm = ()=>{
    taskInput.value = "";
    taskDate.value = "";
    selectPriority.value = "";
    taskTag.value = "";
}

// Delete Task
const deleteTask = (task) => {
    try {
        if (confirm("Are you sure you want to delete?")) {
            tasksArr.splice(tasksArr.indexOf(task), 1);
            showToast("rgb(225,0,0)", "Task deleted successfully");
            filterTask(selectFilter.value, selectPriorityFilter.value);
            saveToLocalStorage();
        }
    } catch (error) {
        console.error("Failed to delete task:", error);
        showToast("rgb(225,0,0)", "Error deleting task.");
    }
};

// Create Button code
const createButton = (iconClass,id, text, handleClick)=>{
    const button = document.createElement("button");
    button.setAttribute('title', text);
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.id = id;
    button.addEventListener("click", handleClick)
    return button;
;}

// Edit Task
const editTask = (task) => {
    try {
        const newName = prompt("Enter new name for task", task.task);
        if (newName) {
            task.task = newName.trim();
            showToast("rgb(100,100,100)", "Task updated successfully");
            displayTasks(tasksArr);
            saveToLocalStorage();
        }
    } catch (error) {
        console.error("Failed to update task:", error);
        showToast("rgb(225,0,0)", "Error updating task.");
    }
};


// Change Status of Task
const changeStatus = (task) => {
    task.completedStatus =!task.completedStatus;   
    showToast("rgb(0,200,0)", "Task status updated successfully");   
    displayTasks(tasksArr);
    saveToLocalStorage();
}

// Create cell
const createCell = (text)=>{
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

// Display Task
const displayTasks = (Tasks)=>{
    if(Tasks.length === 0) showToast("rgb(225,0,0)", "No tasks found");
    tasksList.innerHTML = "";
    Tasks.forEach((task) => {
        const taskRow = document.createElement("tr");
        taskRow.appendChild(createCell(task.task));
        taskRow.appendChild(createCell(task.completedStatus? "Completed" : "Pending"))
        taskRow.appendChild(createCell(task.dueDate));
        taskRow.appendChild(createCell(task.priority));
        taskRow.appendChild(createCell(task.tag === "" ? "N.A." : task.tag));

        const actionCells = document.createElement("td");

        actionCells.appendChild(createButton("fas fa-trash", "deleteButton", "Delete" ,()=> deleteTask(task)))
        actionCells.appendChild(createButton("fas fa-edit", "editButton", "Edit", ()=> editTask(task)))
        if (task.completedStatus === false) {        
            actionCells.appendChild(createButton("fas fa-check-square",  "changeStatusButton", "Mark as completed", ()=> changeStatus(task)))
        }
        taskRow.appendChild(actionCells);
        
        tasksList.appendChild(taskRow);

    });
}

// Filter Tasks
const filterTask = (status,priority) =>{
       const isCompleted = (status === "completed") ? true : (status === "pending") ? false : null;
       const filteredTasks = tasksArr.filter(task => {
           const statusMatch = (isCompleted === null) || (task.completedStatus === isCompleted);
           const priorityMatch = (priority === "all") || (task.priority === priority);
           return statusMatch && priorityMatch
       });
       displayTasks(filteredTasks);
}

// Search Task
const searchTask = (item)=>{
    const filteredTasks = tasksArr.filter(task => task.task.toLowerCase().includes(item.toLowerCase()));
    displayTasks(filteredTasks);
}

// Load Tasks
const loadTasks = (Tasks) => {
    return new Promise((resolve) => {
        loader.style.display = "block";
        setTimeout(() => {
            displayTasks(Tasks);
            loader.style.display = "none";
            resolve(); 
        }, 2000);
    });
};

// Function for async operations
async function loadTasksAsync() {
    try {
        const tasksJson = localStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : []; 
        if (tasks) tasksArr.push(...tasks);
        await loadTasks(tasksArr);
    } catch (error) {
        console.error("Failed to load tasks:", error);
        showToast("rgb(225,0,0)", "Error loading tasks.");
    }
}

// Save to local storage
const saveToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasksArr));
}

document.addEventListener("DOMContentLoaded", loadTasksAsync);
taskForm.addEventListener("submit", addTask);
selectFilter.addEventListener("change", ()=> filterTask(selectFilter.value, selectPriorityFilter.value));
selectPriorityFilter.addEventListener("change", ()=> filterTask(selectFilter.value, selectPriorityFilter.value));
searchButton.addEventListener("click", ()=> searchTask(searchTaskInput.value));