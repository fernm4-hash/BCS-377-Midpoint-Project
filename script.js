// all these variables are html elements
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const importance = document.getElementById("importance");
const errorMessage = document.getElementById("errorMessage");
const taskList = document.getElementById("taskList");
const doingNowTask = document.getElementById("doingNowTask");
const startTimer = document.getElementById("startTimer");
const timerDisplay = document.getElementById("timerDisplay");
const timeDropDown = document.getElementById("duration");
const resetTimer = document.getElementById("resetTimer");
const popup = document.getElementById("popup");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

let nextTaskId = 1;
let editingTaskId = null;
let timeRemaining = 0;
let timerInterval = null;
let isTimerRunning = false;
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
        id: nextTaskId++,
        title: title,
        importance: priority,
        completed: false
    }

    tasks.push(newTask); // every time form submits a new task gets added to array
    
    displayTasks();

    taskForm.reset(); // clears form
})

function sortTasks(){
    let activeTasks = tasks.filter(task =>{ //get all tasks that are not completed
        return task.completed === false
    })

     let completedTasks = tasks.filter(task =>{ //get all tasks that are completed
        return task.completed === true
    })

    const importanceOrder = { //assign a value to each importance for sorting
        High: 1,
        Medium: 2,
        Low: 3
    }

    activeTasks.sort((a,b) =>{ // sort each importance from high to low
        return importanceOrder[a.importance] - importanceOrder[b.importance];
    })

    let sortedTasks = activeTasks.concat(completedTasks)

    return sortedTasks

}

function deleteTask(task){

    if(task.id === doingNowTaskId ){ //if the deleted task is marked as doing now
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
                resetInterval()
            }
           let taskIndex = tasks.findIndex(item => { //find the task that is getting deleted
                return item.id === task.id
            })
            if( taskIndex !== -1){ // make sure the task exists
                tasks.splice(taskIndex,1) // removes task from array
                if (editingTaskId === task.id) { // if the delted task was being edited this allows other task to be edited
                        editingTaskId = null;
                }
                displayTasks()
            }

}

function toggleTaskCompleted(task){

    task.completed = !task.completed; // switches tasks compleation status
            if (editingTaskId === task.id) { // stops editing if compleation status changes
                        editingTaskId = null;
                }
            if(task.completed && task.id === doingNowTaskId ){ // if the task was marked as doing now, rested timer and clears the selection
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
                resetInterval()
            }
            let taskIndex = tasks.findIndex(item => item.id === task.id) //find the task

                if (taskIndex !== -1) { // make sure task exists
                    tasks.splice(taskIndex, 1); // takes out task
                    tasks.push(task);// put the task back into the array and at the end of it
                } 
                displayTasks()
}

function toggleDoingNow(task){
    if(task.id === doingNowTaskId ){ // deselect task is it marked as doing now
                doingNowTaskId = null
                doingNowTask.textContent = "None";
                startTimer.disabled = true;
            }
            else{// otherwise, mark as doing now
                doingNowTaskId = task.id
                doingNowTask.textContent = task.title;
                startTimer.disabled = false;
            }
            displayTasks()
            resetInterval() // reset timer when doing now selection changes
}

function changeImportance(task, newImportance){

    if(newImportance !== task.importance){ // if the importance changes
                task.importance = newImportance; // set to new importance
                let taskIndex = tasks.findIndex(item => item.id === task.id)//find the task
                if (taskIndex !== -1) { // if task exists
                    tasks.splice(taskIndex, 1); //take task out of array
                    tasks.push(task);//put task at the end of the array so that it appears at the end of its importance group
                }  
            }
            
}

function saveTask(task, updatedTitle){
    task.title = updatedTitle //changes the tasks title

    if(task.id === doingNowTaskId){ //if task was mared as doing now, adjusts the selected task in the focus timer section
        doingNowTask.textContent = task.title
    }
        
}

function editTask(task, spanTaskInfo, editButton){
    //prevent editing mutiple tasks at once
    if(editingTaskId !== null){
        return
    }
    else{
        editingTaskId = task.id
    }

    //create a input box containing the task title
    let editInput = document.createElement("input")
    editInput.type = "text"
    editInput.value = task.title
    editInput.classList.add("editInput")

    //create a div for the input box and error message
    let editContainer = document.createElement("div")
    editContainer.classList.add("editContainer")

    //replace the title with the edit box
    editContainer.appendChild(editInput)
    spanTaskInfo.replaceWith(editContainer)

    //replace the edit button with the save button
    let saveButton = document.createElement("button")
    saveButton.textContent = "Save"
    saveButton.classList.add("saveButton")
    editButton.replaceWith(saveButton)

    //create the error message
    let editErrorMessage = document.createElement("p")
    editErrorMessage.classList.add("editErrorMessage");

    //save the task title when the save button is clicked
    saveButton.addEventListener("click", (event) =>{

        let updatedTask = editInput.value.trim()//remove extra spaces
        if(updatedTask === ""){//if the input box is empty
            editErrorMessage.textContent = "Please enter a task name!"
            editContainer.appendChild(editErrorMessage);
            return
         }
        else{//otherwise update the task title
            saveTask(task, updatedTask)
            editingTaskId = null //allows another task to be edited
            displayTasks()
        }
    })

    //creates a cancel button
    let cancelButton = document.createElement("button")
    cancelButton.textContent = "Cancel"
    cancelButton.classList.add("cancelButton")
    saveButton.after(cancelButton)

    //cancels changes without saveing changes
    cancelButton.addEventListener("click", (event) => {
        editingTaskId = null
        displayTasks()
    })

}

function createTaskElement(task){
    let listItem = document.createElement("li");

        if(task.id === doingNowTaskId){ //addes highlight to task is its marked as doing now
            listItem.classList.add("doingNow")
        }
        //creates importance label and apply its color
        let importanceSpan = document.createElement("span");
        importanceSpan.textContent= task.importance;
        importanceSpan.classList.add("importanceLabel", task.importance.toLowerCase())

        //allows user to change importance
        importanceSpan.addEventListener("click", (event) =>{
            //prevents editing task if other task is being edited
            if(editingTaskId !== null){ 
                return
            }
            else{
                editingTaskId = task.id
            }

            //create importance dropdown
            let importanceSelected = document.createElement("select")
            importanceSelected.classList.add("importanceSelect")
            let optionHigh = document.createElement("option")
            optionHigh.textContent = "High"
            let optionMedium = document.createElement("option")
            optionMedium.textContent = "Medium"
            let optionLow = document.createElement("option")
            optionLow.textContent = "Low"
            
            //adds the options and selected the tasks importance
            importanceSelected.append(optionHigh,optionMedium,optionLow)
            importanceSelected.value = task.importance

            //replaces importance tag with the dropdown
            importanceSpan.replaceWith(importanceSelected)
            importanceSelected.focus()
            
            //update task importance when a new option is selected
            importanceSelected.addEventListener("change", (event)=>{

                changeImportance(task, importanceSelected.value)
                editingTaskId = null
                displayTasks()
                
            })
            //if user clicks out of dropdown
            importanceSelected.addEventListener("blur", () => {
                editingTaskId = null
                displayTasks();
            });
        
        })

        //creates containers to organize buttons and task info
        let taskInfo = document.createElement("div");
        taskInfo.classList.add("taskInfo");

        let taskContent = document.createElement("div");
        taskContent.classList.add("taskContent");

        let taskButtons = document.createElement("div");
        taskButtons.classList.add("taskButtons");

        //create span to display task title
        let spanTaskInfo = document.createElement("span");
        spanTaskInfo.textContent = task.title

        // add completion css if marked as complete
         if(task.completed){
                spanTaskInfo.classList.add("completed")
            }

        //creates a check box
        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.checked = task.completed;

        checkBox.addEventListener("change", (event) =>{
            toggleTaskCompleted(task)
        })

        //create a delete button
        let remove = document.createElement("button")
        remove.textContent = "Delete"
        remove.classList.add("deleteButton")

        //delete task if button is clicked
        remove.addEventListener("click", (event) => {
            deleteTask(task)
        })
        //creates edit button
        let editButton = document.createElement("button")
        editButton.textContent = "Edit"
        editButton.classList.add("editButton")
        //allows user to edit task title is button is clicked
        editButton.addEventListener("click", (event) => {
            editTask(task, spanTaskInfo, editButton);
        })
        //adds button to mark a task as doing now
        let doingNowButton = document.createElement("button")
        doingNowButton.textContent = "Doing Now"
        doingNowButton.classList.add("doingNowButton")

        doingNowButton.addEventListener("click",(event) =>{
            toggleDoingNow(task)
        })
        //add edit and delete button to container
        taskButtons.appendChild(editButton);
        taskButtons.appendChild(remove);

        //only show doing now button if task is imcomplete
        if (!task.completed) {
            taskButtons.prepend(doingNowButton);
        }  
        //place task title above buttons
        taskContent.appendChild(spanTaskInfo);
        taskContent.appendChild(taskButtons);
        //place checkbox next to task content
        taskInfo.appendChild(checkBox);
        taskInfo.appendChild(taskContent);
        // Add the task information and importance label to the list item
        listItem.appendChild(taskInfo);
        listItem.appendChild(importanceSpan);

        return listItem;
}

/*
    HTML structure that is created using js
    <li class="doingNow"> (only if the task is selected as Doing Now)
        <div class="taskInfo">
            <input type="checkbox">
            <div class="taskContent">
                <span>Task Title</span>
                <div class="taskButtons">
                    <button class="doingNowButton">Doing Now</button>
                    <button class="editButton">Edit</button>
                    <button class="deleteButton">Delete</button>
                </div>
            </div>
        </div>
        <span class="importanceLabel high">High</span>
    </li>
*/

function displayTasks(){

    taskList.innerHTML = ""; //clear current task list

    let sortedTasks = sortTasks() //get sorted task list

    sortedTasks.forEach(task =>{ //loop through each task and display them
        let listItem = createTaskElement(task);
        taskList.appendChild(listItem);
    })
}

function setTimerDuration(){
    timeRemaining = Number(timeDropDown.value) * 60 //converts mins to seconds
}

function updateTimerDisplay(){ //updates timer display to show mins and seconds
    let remainingMin = Math.floor(timeRemaining / 60) //calc remaining mins
    let remainingSec = timeRemaining % 60 // calc remaining seconds
    //turn them into strings
    let minutes = remainingMin.toString()
    let seconds = remainingSec.toString()

    //add leading 0 if its a single digit
    minutes = minutes.padStart(2,"0")
    seconds = seconds.padStart(2,"0")

    timerDisplay.textContent = minutes + ":" + seconds //display time in MM:SS format
}

timeDropDown.addEventListener("change", (event) =>{ //updates timer is user selectes a different duration
    setTimerDuration()
    updateTimerDisplay()
})

function startCountdown(){
    //prevents starting timer if timer is already running, no task is selected, or time has run out
    if(isTimerRunning || doingNowTaskId === null || timeRemaining <= 0){
        return
    }
    else{
        isTimerRunning = true //mark timer as running
        timerInterval = setInterval(() =>{ //start timer
            timeRemaining -= 1 //countsdown timer
            //checks to see if timer has reached 0
            if(timeRemaining <= 0){
                timeRemaining = 0
                clearInterval(timerInterval) //stop timer
                timerInterval = null
                isTimerRunning = false
                timeDropDown.disabled = false //allows user to change duration
                popup.showModal()//shows compleation popup
                
            }
            updateTimerDisplay()
            
        },1000)
        timeDropDown.disabled = true // Prevent changing the duration while the timer is running
    }

}

// Starts, pauses, or resumes the timer when the button is clicked
startTimer.addEventListener("click", (event)=>{
    if(isTimerRunning){ //if timer is running, pause it
        pauseInterval()
    }
    else{
        startCountdown() // start or resume timer
        if(isTimerRunning){ //if the time started, change button to pause
            startTimer.textContent = "Pause"
        }
    }
    
})

function pauseInterval(){ 
    clearInterval(timerInterval) // Stop the timer
    timerInterval = null // Clear the interval reference
    isTimerRunning = false // Mark the timer as no longer running
    startTimer.textContent = "Resume" // Change the button text to Resume
    timeDropDown.disabled = false // Allow the user to change the timer duration
}

function resetInterval(){
    clearInterval(timerInterval)
    timerInterval = null 
    isTimerRunning = false 
    setTimerDuration() 
    updateTimerDisplay()
    startTimer.textContent = "Start" //changes button text to start
    timeDropDown.disabled = false // Allow the user to change the timer duration
}

resetTimer.addEventListener("click", (event) =>{
    resetInterval()
})

//for popup
confirmYes.addEventListener("click", (event)=>{
     // Find the task currently selected as Doing Now
    let selectedTask = tasks.find(task =>{return task.id === doingNowTaskId })
    if(selectedTask){
        selectedTask.completed = true //mark task as completed
        let taskIndex = tasks.findIndex(item => item.id === selectedTask.id) //find task in array

                if (taskIndex !== -1) {
                    //move task to end of array
                    tasks.splice(taskIndex, 1);
                    tasks.push(selectedTask);
                    //clear doing now section
                    doingNowTaskId = null
                    doingNowTask.textContent = "None"
                    startTimer.disabled = true

                    resetInterval() 
                } 
                

    }
    displayTasks()
    popup.close() //closes popup
})

confirmNo.addEventListener("click", (event) =>{
    resetInterval()
    popup.close()
})
// Prevent the popup from closing using the Escape key
popup.addEventListener("cancel", (event)=>{
    event.preventDefault()
})

// Set and display the initial timer duration when the page loads
setTimerDuration()
updateTimerDisplay()