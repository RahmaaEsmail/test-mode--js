const viewTestBtn = document.querySelector(".view-test-btn");
const checkAnsBtn = document.querySelector(".check-question");
const nextQuestionBtn = document.querySelector(".next-question");
const prevQuestionBtn = document.querySelector(".prev-question");
const submitBtn = document.querySelector(".submit-btn");
const scoreEle = document.querySelector(".score");
let time,count, setTimer, checked = false, score = 0, currentIndex = 0, dataList = [];

const showHomePage = () => {
    document.querySelector(".quiz-page").classList.add("hide");
    document.querySelector(".leaderboard").classList.add("hide")
    document.querySelector(".home-page").classList.remove("hide")
}

const showQuizPage = () => {
    viewTestBtn.addEventListener("click", () => {
        document.querySelector(".home-page").classList.add("hide")
        document.querySelector(".quiz-page").classList.remove("hide")
        getData()
    })
}
showQuizPage()

const showLeaderBoard = (score) => {
    document.querySelector(".quiz-page").classList.add("hide");
    document.querySelector(".leaderboard").classList.remove("hide")
    document.querySelector(".leader-score").innerHTML = score
    return;
}

const removeCheckBtn = () => {
    document.querySelector(".next-question").classList.remove("hide")
    document.querySelector(".check-question").classList.add("hide")
}

const removeNextBtn = () => {
    document.querySelector(".next-question").classList.add("hide")
    document.querySelector(".check-question").classList.remove("hide")
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
    <li>${result[currentIndex].answer_1}</li>
    <li>${result[currentIndex].answer_2}</li>
    <li>${result[currentIndex].answer_3}</li>
    <li>${result[currentIndex].answer_4}</li>`
    list.innerHTML = htmlList;
    chooseAnswer(list, result[currentIndex].correct_ans)
    removeNextBtn()
}

const checkChoosedAnswer = (ans, correctAns , listItem , score) => {
    if (ans.innerHTML == correctAns) {
                listItem.forEach(item => {
                    item.classList.remove("wrong-answer")
                    item.classList.remove("choosen-answer")
                })
                scoreEle.innerHTML = score;
                ans.classList.add("correct-answer")
                swal("Correct Answer", '', "success")
            }
            else {
                listItem.forEach(item => {
                    item.classList.remove("correct-answer")
                    item.classList.remove("choosen-answer")
                })
                scoreEle.innerHTML = score;
                ans.classList.add("wrong-answer")
                swal("Wrong Answer", '', 'error')
            }
}

const chooseAnswer = (list, correctAns) => {
    const items = list.querySelectorAll('li');
    let ans = '';
    const timerEle = document.querySelector(".timer")
    items.forEach(item => {
        item.addEventListener("click", (e) => {
            items.forEach(item => {
                item.classList.remove("choosen-answer")
            })

            ans = e.target;
            e.target.classList.add("choosen-answer")
            checked = true;
            if (e.target.innerHTML == correctAns) 
                score += 5;
      
            if (e.target.innerHTML == correctAns && timerEle.innerHTML == 0)
                score -= 3;
            checkAnswer(ans, correctAns, items, score)
        })
            checkAnswer(ans, correctAns, items, score)
            checked = false;
    })
}

const checkAnswer = (answer, correctAns , items) => {
    checkAnsBtn.addEventListener('click', () => {
        if(!checked) {
            swal("Choose First", '' ,'info')
        }
        else {
            clearInterval(time)
            checkChoosedAnswer(answer,correctAns , items ,score)
            removeCheckBtn()
        }
    })
}



const timerForQuestion = () => {
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
    let index;
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
    return [];
}

const init = (result, currentIndex, score) => {
    const data = getDataFromStorage();
    displayLeaderboardData(data)
    displayElements(result, currentIndex, score)
    getNextQuestion(result)
    getPrevQuestion(result)
    timerForQuestion()
}



const getNextQuestion = (result) => {
    nextQuestionBtn.addEventListener("click", () => {
        currentIndex++;
        displayElements(result, currentIndex)
        clearInterval(time)
        timerForQuestion(31)
    })
}

const getPrevQuestion = (result) => {
    prevQuestionBtn.addEventListener("click", () => {
        if (currentIndex > 0 && checked) {
            currentIndex--;
            displayElements(result, currentIndex)
            clearInterval(time)
        }
        else if (currentIndex <= 0)
            swal("First Question", "You can't go back", "warning")
        else if (!checked)
            swal("Not Checked", "You need to check the correct answer first", "info")
        else
            swal("Not Checked", "You need to check the correct answer first", "info")
    })
}


submitBtn.addEventListener("click", getUserData)