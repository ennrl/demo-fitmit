function getAllRecords(db, storeName) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getRecord(db, storeName, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
function addRecord(db, storeName, record, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(record, key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function updateRecord(db, storeName, record) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function deleteRecord(db, storeName, key) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function openDBAsync (name) {
    return new Promise((resolve, reject) => {
        const db = window.indexedDB.open(name);
        db.onsuccess = resolve;
        db.onerror = reject;
    })
}

async function getAllTrain () {
    let db = await openDBAsync('Trains');
    let tr = await getAllRecords(db.srcElement.result, 'trains');
    return tr;
}
async function getAllTrainDay () {
    let allTrains = await getAllTrain();
    let tr = []
    let dd = new Date();
    allTrains.forEach((train) => {
        if (train[1] == dd.getDate() && train[2] == dd.getMonth() && train[3] == dd.getFullYear()) {
            tr.push(train);
        }
    })
    return tr;
}

window.train = {};
window.train.functions = {};
window.train.functions.getAllTrain = getAllTrain;
window.train.functions.getAllTrainDay = getAllTrainDay;



window.addEventListener("DOMContentLoaded", (e) => {

    window.train.started = false;
    window.train.trains = []
    window.train.last = 0;
    window.train.all = 0;
    window.train.timer = {
        last: 0,
        all: 40,
        setTimer: (sec) => {
            window.train.timer.last = 0;
            window.train.timer.all = Number(sec);
        },
        updateTimer: () => {
            window.train.timer.last += 0.010
            if (window.train.timer.last > window.train.timer.all) {
                window.train.timer.stopUpdating();
            }
            let ls = (100 / window.train.timer.all * window.train.timer.last);
            document.querySelector('.screen.train .buttonT.yellow').style.background = 'linear-gradient(to right, rgba(255, 141, 40, 0.6) ' + ls +'%, rgba(255, 141, 40, 0.2) ' + ls +'%)'
        },
        clearTimer: () => {
            window.train.timer.last = 0;
            document.querySelector('.screen.train .buttonT.yellow').style.background = 'linear-gradient(to right, rgba(255, 141, 40, 1) 0%, rgba(255, 141, 40, 0.2) 0%)'
        },
        startUpdating: () => {
            window.train.timer.eventer = setInterval(window.train.timer.updateTimer, 10)
        },
        stopUpdating: () => {
            clearInterval(window.train.timer.eventer);
        },
        start: () => {
            window.train.timer.clearTimer();
            window.train.timer.startUpdating();
        }
    }

    window.train.db = window.indexedDB.open("Trains", 1);

    window.train.db.onupgradeneeded = (e) => {
        let db = e.target.result;

        let trains = db.createObjectStore('trains');
    }



    window.train.getData = async () => {
        let a = await fetch("/tr/train.json");
        let json = await a.json();
        window.train.data = json;
    }

    window.train.start = async (typeT, ln) => {
        await window.train.getData()
        console.log(`Starting train: ${typeT}`);
        let trains = window.train.data.difficulty_levels[typeT];
        window.train.trains = [];
        window.train.data.exercises.forEach(e => {
            if (trains.includes(e.id) ) {
                window.train.trains.push(e);
            }
        })
        window.train.all = ln;
        window.train.last = 0;
        document.querySelector(".screen.home").classList.add("display-none");
        document.querySelector(".screen.train").classList.toggle("display-none");

        let tr = []
        for (var i = 0; i < ln; i++) {
            let ind = Math.floor(Math.random() * window.train.trains.length);
            tr.push(window.train.trains[ind]);
            window.train.trains.splice(ind, 1);
        }
        window.train.trains = tr;

        // ! добавить изменение заголовка
        if (typeT == 'easy') {
            document.querySelector(".screen.train .titleBar .title").innerText = "Простая";
        }
        if (typeT == 'moderate') {
            document.querySelector(".screen.train .titleBar .title").innerText = "Умеренная";
        }
        if (typeT == 'hard') {
            document.querySelector(".screen.train .titleBar .title").innerText = "Сложная";
        }

        window.train.gotoNextTrain()
    }
    window.train.gotoNextTrain = async () => {
        window.train.last += 1;
        if (window.train.last != 1) {
            let db = await openDBAsync('Trains');
            let dt = new Date();
            let dd = dt.getDate().toString() + dt.getMonth().toString() +  dt.getFullYear().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString() + (Math.floor(Math.random() * (999999999-111111111) + 111111111)).toString();

            let record = [
                window.train.trains[window.train.last-2], dt.getDate(), dt.getMonth(), dt.getFullYear(), dt.getHours(), dt.getMinutes()
            ]
            await addRecord(db.srcElement.result, 'trains', record, dd);
        }
        if (window.train.last > window.train.all) {
            document.querySelector(".screen.home").classList.remove("display-none");
            document.querySelector(".screen.train").classList.toggle("display-none");
            setDataHome()
            return;
        }

        window.train.updateProgress()
        window.train.updateProgress()
        let t = window.train.trains[window.train.last-1];
        console.log(t);
        document.querySelector(".screen.train .info .name").innerHTML = t.name
        document.querySelector(".screen.train .info .description").innerHTML = t.description;

        if (t.reps_type == 'time') {
            document.querySelector(".screen.train .buttonT.yellow").style.display = 'flex';
            window.train.timer.clearTimer();
            window.train.timer.stopUpdating();
            window.train.timer.setTimer(t.reps_value.replace(/\D/g,''));
            document.querySelector('.screen.train .info .data').innerHTML = 'Время (секунды): ' + t.reps_value;
        } else {
            document.querySelector(".screen.train .buttonT.yellow").style.display = 'none'
            document.querySelector('.screen.train .info .data').innerHTML = 'Количество: ' + t.reps_value;
        }


    }

    window.train.updateProgress = () => {
        document.querySelector(".screen.train .progressBox .text").innerHTML = window.train.last + "/" + window.train.all;
        let width = 100 / window.train.all * window.train.last;
        document.querySelector(".screen.train .progressBox .bar").style.width = width + "%";
    }

    // добавление событий
    document.querySelector(".screen.train .buttonT.yellow").addEventListener('click', (e) => {
        window.train.timer.clearTimer();
        window.train.timer.start();
    })
    document.querySelector(".screen.train .buttonT.green").addEventListener('click', (e) => {
        window.train.gotoNextTrain();
    })

    document.querySelector(".screen.train .buttonT.red").addEventListener('click', (e) => {
        document.querySelector(".screen.home").classList.remove("display-none");
        document.querySelector(".screen.train").classList.toggle("display-none");
        setDataHome();
    })

    //window.train.start('moderate', 8)



})