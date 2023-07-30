const viewTestBtn = document.querySelector(".view-test-btn");
const quizPage = document.querySelector(".quiz-page");
const homePage = document.querySelector(".home-page");
const list = document.querySelector("ul")
const nextQuestion = document.querySelector(".next-question");
const checkAnsBtn = document.querySelector(".check-question");
const submitBtn = document.querySelector(".submit-btn");
const scoreEle = document.querySelector(".score");
let undoStack = [];
let redoStack = [];
let dataList = [];
let ans = '';
let time, count, setTimer, checked = false, score = 0, currentIndex = 0;


const showHomePage = () => {
    quizPage.classList.add("hide");
    document.querySelector(".leaderboard").classList.add("hide")
    homePage.classList.remove("hide")
}

const showQuizPage = () => {
    viewTestBtn.addEventListener("click", () => {
        homePage.classList.add("hide")
        quizPage.classList.remove("hide")
        getData()
    })
}
showQuizPage()

const showLeaderBoard = (score) => {
    quizPage.classList.add("hide");
    document.querySelector(".leaderboard").classList.remove("hide")
    document.querySelector(".leader-score").innerHTML = score
    return;
}

const removeCheckBtn = () => {
    nextQuestion.classList.remove("hide")
    checkAnsBtn.classList.add("hide")
}

const removeNextBtn = () => {
    nextQuestion.classList.add("hide")
    checkAnsBtn.classList.remove("hide")
}

const getData = async () => {
    const data = await fetch('./jsQuestion.json');
    const result = await data.json();
    init(result, currentIndex)
}



const displayElements = (result, currentIndex) => {
    const numOfQuestion = document.querySelector(".num-of-question");
    const quesContainer = document.querySelector(".ques-container p");
    const list = document.querySelector("ul");


    numOfQuestion.innerHTML = `Question number <span class="current-ques">${currentIndex + 1}</span> out of ${result.length}`;
    if (result.length == currentIndex) {
        swal("Test Completed", "You have answered all questions", 'info')
        clearTimeout(setTimer)
        showLeaderBoard(score)
        return;
    }

    quesContainer.innerHTML = result[currentIndex].title;
    let htmlList = `
    <li data-index = "0">${result[currentIndex].answer_1}</li>
    <li data-index = "1">${result[currentIndex].answer_2}</li>
    <li data-index = "2">${result[currentIndex].answer_3}</li>
    <li data-index = "3">${result[currentIndex].answer_4}</li>`
    list.innerHTML = htmlList;
    chooseAnswer(result, list, result[currentIndex].index)
    removeNextBtn()
}


const checkChoosedAnswer = (ans, indexOfAnswer, items, score) => {
    if (ans.dataset.index == indexOfAnswer) {
        items.forEach(item => {
            item.classList.remove("wrong-answer")
            item.classList.remove("choosen-answer")
        })
        scoreEle.innerHTML = score;
        ans.classList.add("correct-answer")
        swal("Correct Answer", '', "success")
    }
    else {
        items.forEach(item => {
            item.classList.remove("choosen-answer")
            if (item.dataset.index == indexOfAnswer) {
                item.classList.add("correct-answer")
            }
        })
        scoreEle.innerHTML = score;
        ans.classList.add("wrong-answer")
        swal("Wrong Answer", '', 'error')
    }
}

const chooseAnswer = (result, list, indexOfAnswer) => {
    const items = list.querySelectorAll('li');
    const timerEle = document.querySelector(".timer")

    items.forEach(item => {
        item.addEventListener("click", function () {
            items.forEach(item => {
                item.classList.remove("choosen-answer")
            })

            ans = this;
            this.classList.add("choosen-answer")
            checked = true;

            if (this.dataset.index == indexOfAnswer)
                score += 5;

            if (this.dataset.index == indexOfAnswer && timerEle.innerHTML == 0)
                score -= 3;
            // checkAnswer(ans, indexOfAnswer, items, score)
        })
        // checkAnswer(ans, indexOfAnswer, items, score)
        checked = false;
    })

    checkAnsBtn.addEventListener('click', () => {
        if (checked) {
            let obj = {
                ans: ans.dataset.index,
                correctAns: result[currentIndex].index,
            }
            undoStack.push(obj);
            redoStack.length = 0;
            clearInterval(time)
            checkChoosedAnswer(ans, indexOfAnswer, items, score)
            removeCheckBtn()
        }
        else
            swal("Choose First", '', 'info')
    })
}

// const checkAnswer = (answer, indexOfAnswer, items , score) => {
//     checkAnsBtn.addEventListener('click', () => {
//         if (checked) {
//             clearInterval(time)
//             checkChoosedAnswer(answer, indexOfAnswer, items, score)
//             removeCheckBtn()   
//         }
//         else 
//           swal("Choose First", '', 'info')
//     })
// }

const startTimerForQuestion = () => {
    count = 31;
    const timer = document.querySelector(".timer");
    time = setInterval(() => {
        setTimer = setTimeout(() => {
            count--;
            timer.innerHTML = count;
            if (count == 0 && currentIndex <= 7) {
                swal("Time Out", 'If you answer this question correctly, you will get only 2 points instead of 5', 'info')
                clearTimeout(setTimer)
                clearInterval(time)
            }
        }, 0)
    }, 700)
}

const getUserData = () => {
    const inputName = document.querySelector("input");
    const obj = {
        name: inputName.value,
        score: score
    }
    setScoreInSortedPosition(obj)
    inputName.value = '';
    submitBtn.disabled = true;
}

const setScoreInSortedPosition = (dataObj) => {
    let index, dataList = [];
    for (let i = dataList.length - 1; i >= 0; i--)
        if (dataList[i].score > dataObj.score) {
            index = dataList.indexOf(dataList[i])
        }
    if (index != undefined) {
        dataList.splice(index, 0, dataObj)
        displayLeaderboardData(dataList)
        storeDataToLocalStorage(dataList)
    }

    else {
        dataList.push(dataObj)
        displayLeaderboardData(dataList)
        storeDataToLocalStorage(dataList)
    }
}

const displayLeaderboardData = (dataList) => {
    const userContainerEle = document.querySelector(".player")
    userContainerEle.innerHTML = ''
    dataList.forEach(data => {
        const userEle = document.createElement("div");
        userEle.className = "player-info"
        userEle.innerHTML = ` <p>${data.name}</p>
                    <p>${data.score}</p>`
        userContainerEle.append(userEle)
    })
}


const storeDataToLocalStorage = (dataList) => {
    localStorage.setItem("data", JSON.stringify(dataList))
}

const getDataFromStorage = () => {
    if (localStorage.getItem("data")) {
        dataList = JSON.parse(localStorage.getItem("data"))
        return dataList
    }
    return []
}

const init = (result) => {
    const data = getDataFromStorage()
    displayLeaderboardData(data)
    displayElements(result, currentIndex, score)
    initEventListeners(result)
    startTimerForQuestion()
}


const getNextQuestion = (result) => {
    currentIndex++;
    displayElements(result, currentIndex)
    clearInterval(time)
    startTimerForQuestion(31)
}

const getPrevQuestion = (result) => {
    if (currentIndex < 1)
        swal("First Question", "You can't go back", "warning")
    else {
        if (!checked)
            swal("Not Checked", "You need to check the correct answer first", "info")
        if (currentIndex > 0) {
            currentIndex--;
            displayElements(result, currentIndex)
            clearInterval(time)
            removeCheckBtn()
            const lastEle = undoStack.pop();
            redoStack.push(lastEle);    
        }
    }
}

const initEventListeners = (result, list) => {
    const nextQuestionBtn = document.querySelector(".next-question");
    const prevQuestionBtn = document.querySelector(".prev-question");
    nextQuestionBtn.addEventListener("click", () => { getNextQuestion(result) })
    prevQuestionBtn.addEventListener("click", () => { getPrevQuestion(result) })
    submitBtn.addEventListener("click", getUserData)
}

