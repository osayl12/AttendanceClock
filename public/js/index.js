function onInit() {
    getWorkers();
    getDateToday();
    setInterval(getHourNow, 1000);
}

document.addEventListener("DOMContentLoaded", function () {
    let tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.tab01').style.display = 'none';
            document.querySelector('.tab02').style.display = 'none';
            document.querySelector('.tab03').style.display = 'none';
            let contentId = this.getAttribute('data-tab');
            document.querySelector('.' + contentId).style.display = 'block';
        });
    });
});


// workers

var workers = [];
var workersToShow = workers;

function getWorkers() {
    fetch('/workers')
        .then(response => response.json())
        .then(data => {
            workers = data.data;
            workersToShow = workers;
            renderWorkers();
            renderWorkersSelect();
            getPresences();
        })
        .catch(error => {
            console.error('Error fetching workers:', error);
        });
}

var currWorker = {};

function renderWorkers() {
    workersToShow = workers;
    const eWorkersRows = document.getElementById("workersRows");
    let html = "";
    workersToShow.forEach(function (worker, index) {
        html += `<tr>
                    <td>${index + 1}</td>
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

function addWorker() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const identityNum = document.getElementById("identityNum").value.trim();
    if (!firstName || !lastName || !identityNum) {
        alert("יש למלא את כל השדות");
        return;
    }
    const newWorker = {
        id: makeId(),
        firstName,
        lastName,
        identityNum
    };
    fetch('/add-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorker),
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to add the worker.");
            return response.json();
        })
        .then(() => {
            document.getElementById("firstName").value = "";
            document.getElementById("lastName").value = "";
            document.getElementById("identityNum").value = "";
            getWorkers();
        })
        .catch(error => {
            console.error('Error adding worker:', error);
        });
}

function makeId() {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

function toDeleteWorker(id) {
    currWorker = workersToShow.find(w => w.id == id) || {};
    document.getElementById("fullNameWorker").innerHTML = currWorker.firstName + " " + currWorker.lastName;
}

function toEditWorker(id) {
    currWorker = workersToShow.find(w => w.id == id) || {};
    document.getElementById("firstNameE").value = currWorker.firstName;
    document.getElementById("lastNameE").value = currWorker.lastName;
    document.getElementById("identityNumE").value = currWorker.identityNum;
}

function deleteWorker() {
    fetch(`/worker/${currWorker.id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                getWorkers();
            } else {
                console.error("Error deleting worker:", data.message);
            }
        });
}

function editWorker() {
    const firstName = document.getElementById("firstNameE").value.trim();
    const lastName = document.getElementById("lastNameE").value.trim();
    const identityNum = document.getElementById("identityNumE").value.trim();
    if (!firstName || !lastName || !identityNum) {
        alert("יש למלא את כל השדות");
        return;
    }
    fetch(`/worker/${currWorker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currWorker.id, firstName, lastName, identityNum })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                getWorkers();
            } else {
                console.error('Failed to update worker:', data.message);
            }
        })
        .catch(error => {
            console.error('Error updating worker:', error);
        });
}


// presence

var presences = [];
var presenceToShow = presences;
var workerSelected = {};

function getPresences() {
    fetch('/presences')
        .then(response => response.json())
        .then(data => {
            presences = data.data;
            presenceToShow = presences;
            renderPresences();
        })
        .catch(error => {
            console.error('Error fetching presences:', error);
        });
}

function renderWorkersSelect() {
    workersToShow = workers;
    const eFloatingSelect = document.getElementById("floatingSelect");
    const eWorkersToSelect = document.getElementById("workersToSelect");
    let html = '<option value="">בחר עובד</option>';
    workersToShow.forEach(function (worker) {
        html += `<option value="${worker.id}">${worker.firstName} ${worker.lastName}</option>`;
    });
    eFloatingSelect.innerHTML = html;
    eWorkersToSelect.innerHTML = html;
}

function onSelectWorker() {
    const id = document.getElementById("floatingSelect").value;
    workerSelected = workersToShow.find(w => w.id == id) || {};
}

function padNumber(number) {
    return number < 10 ? '0' + number : number;
}

function getDateToday() {
    const date = new Date();
    const day = padNumber(date.getDate());
    const month = padNumber(date.getMonth() + 1);
    const year = date.getFullYear();
    document.getElementById("dateToday").innerHTML = day + "/" + month + "/" + year;
}

function getHourNow() {
    const date = new Date();
    const hour = padNumber(date.getHours());
    const minutes = padNumber(date.getMinutes());
    const seconds = padNumber(date.getSeconds());
    document.getElementById("timeNow").innerHTML = hour + ":" + minutes + ":" + seconds;
}

function onStart() {
    if (!workerSelected.id) {
        alert("יש לבחור עובד תחילה");
        return;
    }
    for (let i = 0; i < presences.length; i++) {
        if (presences[i].workerId == workerSelected.id && presences[i].end == 0) {
            alert("העובד כבר נמצא במשמרת");
            return;
        }
    }
    const newPresence = {
        id: makeId(),
        workerId: workerSelected.id,
        date: new Date().getTime(),
        start: new Date().getTime(),
        end: 0
    };
    fetch('/add-presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPresence),
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to add the presence.");
            return response.json();
        })
        .then(() => {
            alert("העובד נכנס למשמרת בהצלחה");
            getPresences();
        })
        .catch(error => {
            console.error('Error adding presence:', error);
        });
}

function onEnd() {
    if (!workerSelected.id) {
        alert("יש לבחור עובד תחילה");
        return;
    }
    const openShift = presences.find(p => p.workerId == workerSelected.id && p.end == 0);
    if (!openShift) {
        alert("לא ניתן לרשום יציאה עבור העובד מכיוון שלא נרשמה כניסה עבורו היום");
        return;
    }
    const updated = { ...openShift, end: new Date().getTime() };
    fetch(`/presence/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("העובד יצא מהמשמרת בהצלחה");
                getPresences();
            } else {
                console.error('Failed to update presence:', data.message);
            }
        })
        .catch(error => {
            console.error('Error updating presence:', error);
        });
}


// reports

function renderPresences() {
    const ePresences = document.getElementById("presences");
    let html = "";
    presenceToShow.forEach(function (presence, index) {
        const endDisplay = presence.end ? getHour(presence.end) : "במשמרת";
        const totalDisplay = presence.end ? getTotalHours(presence.start, presence.end) : "-";
        html += `<tr>
                    <td>${index + 1}</td>
                    <td>${getFullName(presence.workerId)}</td>
                    <td>${getDate(presence.date)}</td>
                    <td>${getHour(presence.start)}</td>
                    <td>${endDisplay}</td>
                    <td>${totalDisplay}</td>
                </tr>`;
    });
    ePresences.innerHTML = html;
}

function getFullName(workerId) {
    const worker = workers.find(w => w.id == workerId);
    return worker ? worker.firstName + " " + worker.lastName : "-";
}

function getDate(timeStamp) {
    const date = new Date(timeStamp);
    return padNumber(date.getDate()) + "/" + padNumber(date.getMonth() + 1) + "/" + date.getFullYear();
}

function getHour(timeStamp) {
    const date = new Date(timeStamp);
    return padNumber(date.getHours()) + ":" + padNumber(date.getMinutes()) + ":" + padNumber(date.getSeconds());
}

function getTotalHours(start, end) {
    return ((end - start) / 1000 / 60 / 60).toFixed(2);
}

function filterWorkers() {
    const id = document.getElementById("workersToSelect").value;
    presenceToShow = id ? presences.filter(a => a.workerId == id) : presences;
    renderPresences();
}
