const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const importance = document.getElementById("importance");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const tasks = [];

taskForm.addEventListener("submit", (event) =>{
    event.preventDefault();
    const title = taskName.value.trim();
    const priority = importance.value;
    if(title === ""){
        errorMessage.textContent= "Please enter a task name!"
        return
    }
    errorMessage.textContent= "";

    const newTask = {
        id: Date.now(),
        title: title,
        importance: priority,
        completed: false
    }

    tasks.push(newTask);
    
    displayTasks();
})

function displayTasks(){
    taskList.innerHTML = "";
    tasks.forEach(task =>{
        let listItem = document.createElement("li");
        listItem.textContent = task.title;
        let importanceSpan = document.createElement("span");
        importanceSpan.textContent= " " + task.importance;
        importanceSpan.classList.add("importanceLable", task.importance.toLowerCase())
        listItem.appendChild(importanceSpan);
        taskList.appendChild(listItem);
    })
}