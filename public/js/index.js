function onInit(){
    console.log("ready");
    getWorkers()
    getDateToday()
    setInterval(() => {
        getHourNow()
    }, 1000);
    
}

document.addEventListener("DOMContentLoaded", function() {
    let tabs = document.querySelectorAll('.nav-link');
    
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // הסר את ה-active מכל הטאבים
            tabs.forEach(t => t.classList.remove('active'));
            
            // הוסף את ה-active לטאב שנלחץ
            this.classList.add('active');
            
            // הסתר את כל התוכן של הטאבים
            document.querySelector('.tab01').style.display = 'none';
            document.querySelector('.tab02').style.display = 'none';
            document.querySelector('.tab03').style.display = 'none';
            
            // הצג את התוכן המתאים לטאב שנלחץ
            let contentId = this.getAttribute('data-tab');
            document.querySelector('.' + contentId).style.display = 'block';
        });
    });
});

// workers

var workers = [];
var workersToShow = workers;

function getWorkers(){
    fetch('http://localhost:3000/workers')
     .then(response => response.json())
     .then(data => {
         workers = data.data;
        //  console.log(workers); // כאן תוכל לראות את הנתונים שהוחזרו
         workersToShow = workers;
         renderWorkers()
         renderWorkersSelect()
         getPresences()
     
     })
     .catch(error => {
         console.error('There was an error fetching the data', error);
     });
 }

var currWorker = {}

function renderWorkers(){
    workersToShow = workers;
    const eWorkersRows = document.getElementById("workersRows");
    let html = "";
    workersToShow.forEach(function(worker, index){
        html += `<tr>
                    <td>${index+1}</td>                    
                    <td>${worker.firstName}</td>
                    <td>${worker.lastName}</td>
                    <td>${worker.identityNum}</td>
                    <td>
                        <button class="btn btn-info" onclick="toEditWorker(${worker.id})" data-bs-toggle="modal"
                        data-bs-target="#modalEdit">ערוך</button>
                        <button class="btn btn-danger" onclick="toDeleteWorker(${worker.id})" data-bs-toggle="modal"
                        data-bs-target="#modalDelete">מחק</button>
                    </td>
                </tr>`;
    });
    eWorkersRows.innerHTML = html;
}

function addWorker(){    
    let newWorker = {
        id: makeRandomId(9),
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        identityNum: document.getElementById("identityNum").value
    };
    
    addWorkerToServer(newWorker).then(() => {
        
  
        getWorkers(); // לאחר ההוספה, קריאה שוב לרשימת העובדים מהשרת
        renderWorkers()
    });
}

function addWorkerToServer(worker) {
    return fetch('http://localhost:3000/add-worker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(worker),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to add the worker.");
        }
    })
    .then(data => {
        console.log(data);
        getWorkers()
    })
    .catch(error => {
        console.error('There was an error adding the worker:', error);
    });
  }



function makeRandomId(length){
    let text = "";
    let possible = "1234567890";
    for(let i=0; i<length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function toDeleteWorker(id){
    for(let i=0; i<workersToShow.length; i++){
        if(workersToShow[i].id == id){
            currWorker = workersToShow[i];
            break;
        }
    }
    // console.log('currWorker', currWorker);
    let eFullNameWorker = document.getElementById("fullNameWorker");
    eFullNameWorker.innerHTML = currWorker.firstName + " " + currWorker.lastName;
}

function toEditWorker(id){
    for(let i=0; i<workersToShow.length; i++){
        if(workersToShow[i].id == id){
            currWorker = workersToShow[i];
            break;
        }
    }
    // console.log('currWorker', currWorker);
    let eFirstName = document.getElementById("firstNameE");
    eFirstName.value = currWorker.firstName;
    let eLastName = document.getElementById("lastNameE");
    eLastName.value = currWorker.lastName;
    let eIdentityNum = document.getElementById("identityNumE");
    eIdentityNum.value = currWorker.identityNum;
}

function deleteWorker(){
    
    fetch(`http://localhost:3000/worker/${currWorker.id}`, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          getWorkers();
          renderWorkers();
          renderWorkersSelect();          
        } else {
          console.error("Error deleting worker:", data.message);
        }
      });
    
}

function editWorker(){   

    let workerToUpdate = {
        id: currWorker.id,
        firstName: document.getElementById("firstNameE").value,
        lastName: document.getElementById("lastNameE").value,
        identityNum: document.getElementById("identityNumE").value
    };
    updateWorkerByServer(workerToUpdate)
       
    
}

function updateWorkerByServer(workerUpdated) {
    fetch(`http://localhost:3000/worker/${workerUpdated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workerUpdated)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          getWorkers();          
          renderWorkers();
          renderWorkersSelect();
        } else {
          console.error('Failed to update worker:', data.message);
        }
      })
      .catch(error => {
        console.error('Error updating worker:', error);
      });      
    }


// presence
var presences = []
var presenceToShow = presences
function getPresences(){
    fetch('http://localhost:3000/presences')
     .then(response => response.json())
     .then(data => {
        presences = data.data;
        //  console.log(presences); // כאן תוכל לראות את הנתונים שהוחזרו
         presenceToShow = presences;
         renderPresences()
     
     })
     .catch(error => {
         console.error('There was an error fetching the data', error);
     });
 }
var workerSelected = {}
function renderWorkersSelect(){
    workersToShow = workers;
    const eFloatingSelect = document.getElementById("floatingSelect");
    const eWorkersToSelect = document.getElementById("workersToSelect");
    let html = "<option value='בחר עובד' selected>בחר עובד</option>";
    workersToShow.forEach(function(worker, index){
        html += `<option value="${worker.id}">${worker.firstName} ${worker.lastName}</option>`;
    });
    eFloatingSelect.innerHTML = html;
    eWorkersToSelect.innerHTML = html;
}

function onSelectWorker(){
    let eFloatingSelect = document.getElementById("floatingSelect");
    let id = eFloatingSelect.value;
    for(let i=0; i<workersToShow.length; i++){
        if(workersToShow[i].id == id){
            workerSelected = workersToShow[i];
            break;
        }
    }
    // console.log('workerSelected', workerSelected);
    
}

function padNumber(number) {
    return number < 10 ? '0' + number : number;
}

function getDateToday(){
    let eDateToday = document.getElementById("dateToday");
    let date = new Date();
    let day = padNumber(date.getDate());
    let month = padNumber(date.getMonth() + 1);
    let year = date.getFullYear();
    eDateToday.innerHTML = day + "/" + month + "/" + year;
}

function getHourNow(){
    let eTimeNow = document.getElementById("timeNow");
    let date = new Date();
    let hour = padNumber(date.getHours());
    let minutes = padNumber(date.getMinutes());
    let seconds = padNumber(date.getSeconds());
    eTimeNow.innerHTML = hour + ":" + minutes + ":" + seconds;
}

function onStart() {
    let newPresence = {
        id: makeRandomId(9),
        workerId: workerSelected.id,
        date: new Date().getTime(),
        start: new Date().getTime(),
        end: 0
    };

    for (let i = 0; i < presences.length; i++) {
        if (presences[i].workerId == workerSelected.id && presences[i].end == 0) {
            alert("העובד כבר נמצא במשמרת");
            return;
        }
    }

    // אם הגענו לכאן, זה אומר שאין לנו רשומה עם שעת סיום שווה ל-0, אז נוסיף את האובייקט החדש    
    addPresenceToServer(newPresence).then(() => {  
    alert("העובד נכנס למשמרת בהצלחה");
    // console.log('presence', presences);
    renderPresences()
    });
    
}

function addPresenceToServer(presence) {
    return fetch('http://localhost:3000/add-presence', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(presence),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Failed to add the presence.");
        }
    })
    .then(data => {
        console.log(data);
        getPresences()
    })
    .catch(error => {
        console.error('There was an error adding the presence:', error);
    });
  }


function onEnd() {
    let found = false; // משתנה שמתוך לבדוק האם מצאנו אובייקט עבור העובד שכרגע במקום העבודה ולא רשם יציאה

    for (let i = 0; i < presences.length; i++) {
        if (presences[i].workerId == workerSelected.id && presences[i].end == 0) {
            let prepareToUpdate =  presences[i];
            prepareToUpdate.end = new Date().getTime(); // מעדכן את שעת הסיום לזמן הנוכחי
            found = true;
            if(found){
            updatePresenceByServer(prepareToUpdate)
            console.log('Updated presence for worker exit:', prepareToUpdate);
            alert("העובד יצא מהמשמרת בהצלחה");
            renderPresences()
            }
            break; // יוצא מהלולאה לאחר שמצאנו ועדכנו את הרשומה המתאימה
            
        }
    }

    if (!found) {
        alert("לא ניתן לרשום יציאה עבור העובד מכיוון שלא נרשמה הכנסה עבורו היום");
    }
}

function updatePresenceByServer(presenceUpdated) {
    fetch(`http://localhost:3000/presence/${presenceUpdated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(presenceUpdated)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          getPresences();          
          renderPresences();
        } else {
          console.error('Failed to update presence:', data.message);
        }
      })
      .catch(error => {
        console.error('Error updating presence:', error);
      });      
    }


// reports

function renderPresences(){    
    const ePresences = document.getElementById("presences");
    let html = "";
    presenceToShow.forEach(function(presence, index){
        html += `<tr>
                    <td>${index+1}</td>                    
                    <td>${getFullName(presence.workerId)}</td>
                    <td>${getDate(presence.date)}</td>
                    <td>${getHour(presence.start)}</td>
                    <td>${getHour(presence.end)}</td>
                    <td>${getTotalHours(presence.start,presence.end)}</td>
                    
                </tr>`;
    });
    ePresences.innerHTML = html;
}

function getFullName(workerId){
    for(let i=0; i<workers.length; i++){
        if(workers[i].id == workerId){
            return workers[i].firstName + " " + workers[i].lastName;
        }
    }
}

function getDate(timeStamp){
    let date = new Date(timeStamp);
    let day = padNumber(date.getDate());
    let month = padNumber(date.getMonth() + 1);
    let year = date.getFullYear();
    return day + "/" + month + "/" + year;
}

function getHour(timeStamp){
    let date = new Date(timeStamp);
    let hour = padNumber(date.getHours());
    let minutes = padNumber(date.getMinutes());
    let seconds = padNumber(date.getSeconds());
    return hour + ":" + minutes + ":" + seconds;
}

function getTotalHours(start, end){
    let totalHours = 0;
    totalHours = (end - start) / 1000 / 60 / 60;
    return totalHours.toFixed(2);    
}

function filterWorkers(){
    let eWorkerToSelect = document.getElementById("workersToSelect");
    // console.log(eWorkerToSelect.value);
    // console.log('presenceToShow', presenceToShow);
    let id = eWorkerToSelect.value;
    if(id == "בחר עובד"){
        presenceToShow = presences;
    } else {
        presenceToShow = presences.filter(a => a.workerId == id);
    }
    renderPresences()
}