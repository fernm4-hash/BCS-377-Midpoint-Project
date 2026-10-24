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

    let activeTasks = tasks.filter(task =>{
        return task.completed === false
    })

     let completedTasks = tasks.filter(task =>{
        return task.completed === true
    })

    let sortedTasks = activeTasks.concat(completedTasks)
    
    

    sortedTasks.forEach(task =>{

        let listItem = document.createElement("li");

        let importanceSpan = document.createElement("span");
        importanceSpan.textContent= task.importance;
        importanceSpan.classList.add("importanceLabel", task.importance.toLowerCase())

        let taskInfo = document.createElement("div");
        taskInfo.classList.add("taskInfo");

        let spanTaskInfo = document.createElement("span");
        spanTaskInfo.textContent = task.title
         if(task.completed){
                spanTaskInfo.classList.add("completed")
            }

        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = task.completed;

        checkBox.addEventListener("change", (event) =>{
            task.completed = checkBox.checked;
            if(task.completed){
                spanTaskInfo.classList.add("completed")
            }
            else{
                spanTaskInfo.classList.remove("completed")
            }
        })

        taskInfo.appendChild(checkBox)
        taskInfo.appendChild(spanTaskInfo)
        listItem.prepend(taskInfo)
        listItem.appendChild(importanceSpan);
        taskList.appendChild(listItem);

        /* This is what I am creating in html
        <li>
            <div class="taskInfo">
                <input type="checkbox">
                <span>Finish homework</span>
            </div>

            <span class="importanceLabel high">High</span>
        </li>
        */

    })
}