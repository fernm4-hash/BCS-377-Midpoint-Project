const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const importance = document.getElementById("importance");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const doingNowTask = document.getElementById("doingNowTask");
const startTimer = document.getElementById("startTimer");
const timerDisplay = document.getElementById("timerDisplay")
const timeDropDown = document.getElementById("duration")
const resetTimer = document.getElementById("resetTimer")
const popup = document.getElementById("popup")
const confirmYes = document.getElementById("confirmYes")
const confirmNo = document.getElementById("confirmNo")
let timeRemaining = 0
let timerInterval = null
let isTimerRunning = false

const tasks = [];
let doingNowTaskId = null;

taskForm.addEventListener("submit", (event) =>{
    event.preventDefault(); // prevnts the form from submitting to a server
    const title = taskName.value.trim(); // get rid of whitespace 
    const priority = importance.value;
    if(title === ""){ //give error message if the user does not prvide a task name
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

    const importanceOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    }

    activeTasks.sort((a,b) =>{
        return importanceOrder[a.importance] - importanceOrder[b.importance];
    })

    let sortedTasks = activeTasks.concat(completedTasks)
    
    

    sortedTasks.forEach(task =>{

        let listItem = document.createElement("li");

        if(task.id === doingNowTaskId){
            listItem.classList.add("doingNow")
        }

        let importanceSpan = document.createElement("span");
        importanceSpan.textContent= task.importance;
        importanceSpan.classList.add("importanceLabel", task.importance.toLowerCase())

        importanceSpan.addEventListener("click", (event) =>{

            let importanceSelected = document.createElement("select")
            let optionHigh = document.createElement("option")
            optionHigh.textContent = "High"
            let optionMedium = document.createElement("option")
            optionMedium.textContent = "Medium"
            let optionLow = document.createElement("option")
            optionLow.textContent = "Low"
            
            importanceSelected.append(optionHigh,optionMedium,optionLow)
            importanceSelected.value = task.importance
            importanceSpan.replaceWith(importanceSelected)
            
            importanceSelected.addEventListener("change", (event)=>{
                if(importanceSelected.value !== task.importance){
                task.importance = importanceSelected.value
                let taskIndex = tasks.findIndex(item => item.id === task.id)
                if (taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);
                    tasks.push(task);
                }  
            }
            displayTasks()
            })
            importanceSelected.addEventListener("blur", () => {
                displayTasks();
            });
        

        })

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
            if(task.completed && task.id === doingNowTaskId ){
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
                resetInterval()
            }
            if(task.completed === true){
                spanTaskInfo.classList.add("completed")
            }
            else{
                spanTaskInfo.classList.remove("completed")
            }
            let taskIndex = tasks.findIndex(item => item.id === task.id)

                if (taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);
                    tasks.push(task);
                } 
                displayTasks()
        })

        let remove = document.createElement("button")
        remove.textContent = "Delete"
        remove.classList.add("deleteButton")
        
        remove.addEventListener("click", (event) => {
            if(task.id === doingNowTaskId ){
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
                resetInterval()
            }
           let taskIndex = tasks.findIndex(item => {
                return item.id === task.id
            })
            if( taskIndex !== -1){
                tasks.splice(taskIndex,1)
                displayTasks()
            }
        })

        let editButton = document.createElement("button")
        editButton.textContent = "Edit"
        editButton.classList.add("editButton")

        editButton.addEventListener("click", (event) => {
            let editInput = document.createElement("input")
            editInput.type = "text"
            editInput.value = task.title
            spanTaskInfo.replaceWith(editInput);

            let saveButton = document.createElement("button")
            saveButton.textContent = "Save"
            saveButton.classList.add("saveButton")
            editButton.replaceWith(saveButton)

            let editErrorMessage = document.createElement("p")

            saveButton.addEventListener("click", (event) =>{
                let updatedTask = editInput.value.trim()
                if(updatedTask === ""){
                    editErrorMessage.textContent = "Please enter a task name!"
                    taskInfo.appendChild(editErrorMessage);
                    return
                }
                else{
                    task.title = updatedTask
                    displayTasks()
                }
            })

            

            let cancelButton = document.createElement("button")
            cancelButton.textContent = "Cancel"
            cancelButton.classList.add("cancelButton")
            saveButton.after(cancelButton)

            cancelButton.addEventListener("click", (event) => {
                displayTasks()
            })

        })

        let doingNowButton = document.createElement("button")
        doingNowButton.textContent = "Doing Now"
        doingNowButton.classList.add("doingNowButton")

        doingNowButton.addEventListener("click",(event) =>{

            if(task.id === doingNowTaskId ){
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
                
                
            }
            else{
                doingNowTaskId = task.id
            doingNowTask.textContent = task.title;
            startTimer.disabled = false;
            }
            displayTasks()
            resetInterval()
            
        })
        

        taskInfo.appendChild(checkBox)
        taskInfo.appendChild(spanTaskInfo)
        listItem.prepend(taskInfo)
        listItem.appendChild(importanceSpan);
        if (!task.completed) {
            listItem.appendChild(doingNowButton)
        }
        listItem.appendChild(editButton)
        listItem.appendChild(remove)
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

function setTimerDuration(){
    timeRemaining = Number(timeDropDown.value) * 60
}

function updateTimerDisplay(){
    let remainingMin = Math.floor(timeRemaining / 60)
    let remainingSec = timeRemaining % 60
    let minutes = remainingMin.toString()
    let seconds = remainingSec.toString()
    minutes = minutes.padStart(2,"0")
    seconds = seconds.padStart(2,"0")
    timerDisplay.textContent = minutes + ":" + seconds
}

timeDropDown.addEventListener("change", (event) =>{
    setTimerDuration()
    updateTimerDisplay()
})

function startCountdown(){
    if(isTimerRunning){
        return
    }
    else{
        isTimerRunning = true
        timerInterval = setInterval(() =>{
            timeRemaining -= 1
            if(timeRemaining <= 0){
                timeRemaining = 0
                clearInterval(timerInterval)
                timerInterval = null
                isTimerRunning = false
                timeDropDown.disabled = false
                popup.showModal()
                
            }
            updateTimerDisplay()
            
        },1000)
        timeDropDown.disabled = true
    }

}

startTimer.addEventListener("click", (event)=>{
    if(isTimerRunning){
        pauseInterval()
    }
    else{
        startTimer.textContent = "Pause"
        startCountdown()

    }
    
})

function pauseInterval(){
    clearInterval(timerInterval)
    timerInterval = null
    isTimerRunning = false
    startTimer.textContent = "Resume"
    timeDropDown.disabled = false
}

function resetInterval(){
    clearInterval(timerInterval)
    timerInterval = null
    isTimerRunning = false
    setTimerDuration()
    updateTimerDisplay()
    startTimer.textContent = "Start"
    timeDropDown.disabled = false
}

resetTimer.addEventListener("click", (event) =>{
    resetInterval()
})

confirmYes.addEventListener("click", (event)=>{
    let selectedTask = tasks.find(task =>{return task.id === doingNowTaskId })
    if(selectedTask){
        selectedTask.completed = true
        let taskIndex = tasks.findIndex(item => item.id === selectedTask.id)

                if (taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);
                    tasks.push(selectedTask);
                    doingNowTaskId = null
                    doingNowTask.textContent = "None"
                    startTimer.disabled = true
                    resetInterval()
                } 
                

    }
    displayTasks()
    popup.close()
})

confirmNo.addEventListener("click", (event) =>{
    resetInterval()
    popup.close()
})

popup.addEventListener("cancel", (event)=>{
    event.preventDefault()
})

setTimerDuration()
updateTimerDisplay()