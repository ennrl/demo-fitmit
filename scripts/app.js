window.addEventListener('DOMContentLoaded', () => {
    window.app = {}
    window.app.menuItems = [];
    window.app.menuItems.push(document.querySelector(".bottomBar .FullItem"))
    let items = document.querySelectorAll(".bottomBar .Items .item")
    items.forEach(item => {
        window.app.menuItems.push(item)
    })
    window.app.homeScreens = document.querySelectorAll(".screen .flexOnScreen[data-name]")

    window.app.menuItems.forEach(item => {
        item.addEventListener('click', () => {
            window.app.menuItems.forEach(item1 => {
                item1.classList.remove('active')
            })
            window.app.homeScreens.forEach(item1 => {
                item1.classList.add("display-none")
            })
            item.classList.add('active')
            try {document.querySelector(".screen .flexOnScreen[data-name='X']".replace("X", item.getAttribute("data-click"))).classList.remove('display-none')} catch {}
        })
    })
    window.app.menuItems[0].click()

    // Добавление кнопок для ввода цифр

    setNumberButtonINput()

    // Обработка событий
    document.querySelector(".screen.changeInfo .FullClearButton").addEventListener('click', checkDataInfo)
    document.querySelector(".screen.home .FullClearButton#changeInfo").addEventListener('click', ()=>{
        document.querySelector(".screen.home").classList.add('display-none')
        changeInfoOpen()
    })
    document.querySelector(".screen.home #home-button-change").addEventListener('click', ()=>{
        document.querySelector(".screen.home").classList.add('display-none')
        changeInfoOpen()
    })
    document.querySelector(".screen.home #home-goto-trains").addEventListener('click', ()=>{
        window.app.menuItems[1].click()
    })
    document.querySelector(".screen.home #train-start-light").addEventListener('click', ()=>{
        window.train.start('easy', 4)
    })
    document.querySelector(".screen.home #train-start-medium").addEventListener('click', ()=>{
        window.train.start('moderate', 8)
    })
    document.querySelector(".screen.home #train-start-hard").addEventListener('click', ()=>{
        window.train.start('hard', 16)
    })


    // Проверка данных приложения
    if (localStorage.getItem('started') != null) {
        if (localStorage.getItem('started') == "1") {
            document.querySelector(".screen.changeInfo").classList.remove('display-none')
        }
        if (localStorage.getItem('started') == "2") {
            setDataHome()
            document.querySelector(".screen.home").classList.remove('display-none')

        }
    } else {
        document.querySelector(".screen.firstStart").classList.remove('display-none')
        document.querySelector(".screen.firstStart .FullClearButton").addEventListener('click', () => {
            document.querySelector(".screen.firstStart").classList.add('display-none')
            localStorage.setItem('started', '1')
            document.querySelector(".screen.changeInfo").classList.remove('display-none')
        })
    }
})

async function setDataHome () {
    let blocks = document.querySelectorAll("*[data-home]")
    blocks.forEach(block => {
        block.innerHTML = localStorage.getItem(block.getAttribute("data-home"))
    })
    let trains = await window.train.functions.getAllTrainDay();
    document.querySelector("*[data-func='train-days']").innerHTML = trains.length;
    let alltrains = await window.train.functions.getAllTrain();
    document.querySelector("*[data-func='all-trains']").innerHTML = alltrains.length
}

function changeInfoOpen () {
    document.querySelector(".screen.changeInfo").classList.remove('display-none')

    let blocks = document.querySelectorAll(".screen.changeInfo input")
    blocks.forEach(block => {
        block.value = localStorage.getItem(block.getAttribute("name"))
    })
}

function setNumberButtonINput() {
    let numbers = document.querySelectorAll(".inputBox");
    numbers.forEach(e => {
        if (e.querySelectorAll("input[type='number']").length > 0) {
            let btn1 = document.createElement("div");
            let btn2 = document.createElement("div");

            btn1.classList.add("number-button");
            btn1.classList.add("plus");
            btn2.classList.add("minus");
            btn2.classList.add("number-button");

            btn1.innerHTML = "+";
            btn2.innerHTML = "-";

            btn1.addEventListener("click", () => {
                let el = e.querySelector("input");
                if (!(Number(el.value) + Number(el.getAttribute("step")) > Number(el.getAttribute("max")))) {
                    el.value = Number(el.value) + Number(el.getAttribute("step"));
                } else {
                    el.value = Number(el.getAttribute("max"));
                }
            })
            btn2.addEventListener("click", () => {
                let el = e.querySelector("input");
                if (!(Number(el.value) - Number(el.getAttribute("step")) < Number(el.getAttribute("min")))) {
                    el.value = Number(el.value) - Number(el.getAttribute("step"));
                } else {
                    el.value = Number(el.getAttribute("min"));
                }
            })

            e.appendChild(btn1);
            e.appendChild(btn2);

        }
    })
}

function checkDataInfo () {
    let inputs = document.querySelectorAll(".screen.changeInfo .inputBox input");
    let errors = ""
    inputs.forEach(e => {
        if (e.getAttribute("type") === "text") {
            if (e.value.trim().length < 2) {
                errors += e.getAttribute("data-name") + ": Минимальное кол-во символов 2\n"
            }
        }
        if (e.getAttribute("type") === "number") {
            if (Number(e.value) > Number(e.getAttribute("max"))) {
                errors += e.getAttribute("data-name") + ": Превышен лимит (Макс: " + Number(e.getAttribute("max")) + ")\n"
            }
            if (Number(e.value) < Number(e.getAttribute("min"))) {
                errors += e.getAttribute("data-name") + ": Минимальное значение: " + Number(e.getAttribute("min")) + "\n"
            }
        }
    })

    if (errors != "") {
        alert(errors)
    } else {
        localStorage.setItem('started', '2')
        inputs.forEach(e => {
            localStorage.setItem(e.getAttribute("name"), e.value)
        })
        document.querySelector(".screen.changeInfo").classList.add('display-none')
        document.querySelector(".screen.home").classList.remove('display-none')
        setDataHome()
    }
}