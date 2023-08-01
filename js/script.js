'use strict'
const viewTestBtn = document.querySelector(".view-test-btn");
const quizPage = document.querySelector(".quiz-page");
const homePage = document.querySelector(".home-page");
const leaderboardPage = document.querySelector(".leaderboard");
const timerEle = document.querySelector(".timer");
const nextQuestion = document.querySelector(".next-question");
const checkAnsBtn = document.querySelector(".check-question");
const scoreEle = document.querySelector(".score");
const submitBtn = document.querySelector(".submit-btn");
const allUserAnswers = []
let dataList = [];
let time, count, setTimer, isChecked = false, isAnswered = false, lastQuestionReached = 0, score = 0, currentIndex = 0;
let userAnswer = ''

const showHomePage = () => {
    quizPage.classList.add("hide");
    leaderboardPage.classList.add("hide")
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
    leaderboardPage.classList.remove("hide")
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
    const allQuestions = await data.json();
    init(allQuestions, currentIndex)
}



const displayElements = (allQuestions, currentIndex) => {
    const numOfQuestion = document.querySelector(".num-of-question");
    const quesContainer = document.querySelector(".ques-container p");
    const list = document.querySelector("ul");


    numOfQuestion.innerHTML = `Question number <span class="current-ques">${currentIndex + 1}</span> out of ${allQuestions.length}`;
    if (allQuestions.length == currentIndex) {
        swal("Test Completed", "You have answered all questions", 'info')
        clearTimeout(setTimer)
        showLeaderBoard(score)
        return;
    }

    quesContainer.innerHTML = allQuestions[currentIndex].title;
    let htmlList = `
    <li data-index = "0">${allQuestions[currentIndex].answer_1}</li>
    <li data-index = "1">${allQuestions[currentIndex].answer_2}</li>
    <li data-index = "2">${allQuestions[currentIndex].answer_3}</li>
    <li data-index = "3">${allQuestions[currentIndex].answer_4}</li>`
    list.innerHTML = htmlList;
    chooseAnswer(list, allQuestions[currentIndex].index)
    displayChoosedElements(allQuestions,list)
}

const displayChoosedElements = (allQuestions,list) => {
    if (currentIndex < lastQuestionReached) {
        isAnswered = true
        removeCheckBtn()

        const answerItems = list.querySelectorAll("li")
        if (allUserAnswers[currentIndex] === allQuestions[currentIndex].index) {
            answerItems[allUserAnswers[currentIndex]].classList.add("correct-answer")
        } else {
            answerItems[allUserAnswers[currentIndex]].classList.add("wrong-answer")
            answerItems[allQuestions[currentIndex].index].classList.add("correct-answer")
        }

    } else {
        isAnswered = false
        removeNextBtn()
    }
}

const checkChoosedAnswer = (answer, indexOfAnswer, items) => {
    if (answer.dataset.index == indexOfAnswer) {
        items.forEach(item => {
            item.classList.remove("wrong-answer")
            item.classList.remove("choosen-answer")
        })
        scoreEle.innerHTML = score;
        answer.classList.add("correct-answer")
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
        answer.classList.add("wrong-answer")
        swal("Wrong Answer", '', 'error')
    }
}

const chooseAnswer = (list, indexOfAnswer) => {
    const items = list.querySelectorAll('li');

    items.forEach(item => {
        item.onclick = function () {
            items.forEach(item => {
                item.classList.remove("choosen-answer")
            })

            userAnswer = this;
            this.classList.add("choosen-answer")
            isChecked = true;
        }
        isChecked = false;
    })
checkUserAnswer(indexOfAnswer,items)
}

const checkUserAnswer = (indexOfAnswer,items) => {
    checkAnsBtn.onclick = () => {
        if (isChecked) {
            const chosenAnswer = document.querySelector(".choosen-answer")
            if (chosenAnswer.dataset.index == indexOfAnswer) {
                score += 5;
            }
            if (chosenAnswer.dataset.index == indexOfAnswer && timerEle.innerHTML == 0) {
                score -= 3;
            }

            allUserAnswers.push(chosenAnswer.dataset.index)
            clearInterval(time)
            checkChoosedAnswer(chosenAnswer, indexOfAnswer, items)
            removeCheckBtn()
            isAnswered = true

            if (currentIndex >= lastQuestionReached) {
                lastQuestionReached++
            }
        }
        else
            swal("Choose First", '', 'info')
    }
}


const startTimerForQuestion = () => {
    count = 31;
    time = setInterval(() => {
        setTimer = setTimeout(() => {
            count--;
            timerEle.innerHTML = count;
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
    let index;
    for (let i = dataList.length - 1; i >= 0; i--)
        if (dataList[i].score > dataObj.score) {
            index = dataList.indexOf(dataList[i])
        }
    if (index != undefined) {
        dataList.splice(index, 0, dataObj)
        displaySortedUserData(dataList)
    }

    else {
        dataList.push(dataObj)
        displaySortedUserData(dataList)
    }
}

const displaySortedUserData =(dataList) => {
    displayLeaderboardData(dataList)
    storeDataToLocalStorage(dataList)
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

const init = (allQuestions) => {
    const data = getDataFromStorage()
    displayLeaderboardData(data)
    displayElements(allQuestions, currentIndex, score)
    initEventListeners(allQuestions)
    startTimerForQuestion()
}


const getNextQuestion = (allQuestions) => {
    currentIndex++;
    displayElements(allQuestions, currentIndex)
    clearInterval(time)
    startTimerForQuestion(31)
}

const getPrevQuestion = (allQuestions) => {
    if (!isAnswered) {
        swal("Not answered", "You need to answer first", "info")
        return
    }

    if (currentIndex < 1)
        swal("First Question", "You can't go back", "warning")
    else {
        currentIndex--;
        displayElements(allQuestions, currentIndex)
        clearInterval(time)
        removeCheckBtn()
    }
}

const initEventListeners = (allQuestions) => {
    const nextQuestionBtn = document.querySelector(".next-question");
    const prevQuestionBtn = document.querySelector(".prev-question");

    nextQuestionBtn.addEventListener("click", () => { getNextQuestion(allQuestions) })
    prevQuestionBtn.addEventListener("click", () => { getPrevQuestion(allQuestions) })
    submitBtn.addEventListener("click", getUserData)
}

