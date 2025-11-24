let sentences = [];
let currentSentenceIndex = 0;
let correctWords = [];
let draggedElement = null;
let completedSentences = [];

function generateGame() {
    const input = document.getElementById("inputSentence").value.trim();
    if (!input) { 
        alert("الرجاء أدخل جملة أو أكثر.");
        return;
    }

    sentences = input.split("\n").filter(s => s.trim() !== "");
    if (sentences.length === 0) {
        alert("الرجاء أدخل جملة أو أكثر.");
        return;
    }

    document.getElementById("inputSentence").style.display = "none";
    document.getElementById("resetBtn").style.display = "inline-block";
    completedSentences = [];
    
    currentSentenceIndex = 0;
    showSentence(currentSentenceIndex);
}

function showSentence(index) {
    if (index >= sentences.length) {
        document.getElementById("wordsContainer").innerHTML = "<h4 style='color: #27ae60; text-align: center;'>🎉 انتهت اللعبة! أجبت على جميع الأسئلة بشكل صحيح!</h4>";
        document.getElementById("checkBtn").style.display = "none";
        return;
    }

    correctWords = sentences[index].split(" ").filter(w => w.trim() !== "");
    const shuffled = [...correctWords].sort(() => Math.random() - 0.5);

    const wordsContainer = document.getElementById("wordsContainer");
    wordsContainer.innerHTML = `<p style="margin-bottom: 15px; color: #4a90e2;"><strong>السؤال ${index + 1} من ${sentences.length}:</strong></p>`;

    const wordsBox = document.createElement("div");
    wordsBox.className = "words-box";
    wordsBox.id = "currentWordsBox";

    shuffled.forEach(word => {
        const span = document.createElement("span");
        span.className = "word";
        span.draggable = true;
        span.textContent = word;
        span.addEventListener("dragstart", dragStart);
        span.addEventListener("dragend", dragEnd);
        wordsBox.appendChild(span);
    });

    wordsBox.addEventListener("dragover", dragOver);
    wordsBox.addEventListener("drop", drop);

    wordsContainer.appendChild(wordsBox);
    document.getElementById("checkBtn").style.display = "inline-block";
    document.getElementById("inputSentence").disabled = true;
}

function dragStart(e) { 
    draggedElement = e.target;
    e.target.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";
}

function dragEnd(e) {
    e.target.style.opacity = "1";
    removeAllIndicators();
}

function dragOver(e) { 
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    const target = e.target;
    if (target.classList.contains("word") && draggedElement !== target) {
        removeAllIndicators();
        
        const wordsBox = document.getElementById("currentWordsBox");
        const allWords = [...wordsBox.querySelectorAll(".word")];
        const draggedIndex = allWords.indexOf(draggedElement);
        const targetIndex = allWords.indexOf(target);
        
        const indicator = document.createElement("div");
        indicator.className = "drop-indicator";
        
        if (draggedIndex < targetIndex) {
            indicator.classList.add("after");
            target.appendChild(indicator);
        } else {
            indicator.classList.add("before");
            target.appendChild(indicator);
        }
    }
}

function removeAllIndicators() {
    document.querySelectorAll(".drop-indicator").forEach(ind => ind.remove());
}

function drop(e) {
    e.preventDefault();
    const target = e.target.closest(".word");
    
    if (target && draggedElement !== target) {
        const wordsBox = document.getElementById("currentWordsBox");
        const allWords = [...wordsBox.querySelectorAll(".word")];
        const draggedIndex = allWords.indexOf(draggedElement);
        const targetIndex = allWords.indexOf(target);
        
        if (draggedIndex < targetIndex) {
            target.parentNode.insertBefore(draggedElement, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedElement, target);
        }
    }
    
    removeAllIndicators();
}

function checkAnswer() {
    const items = [...document.querySelectorAll("#currentWordsBox .word")];
    let allCorrect = true;
    
    items.forEach((el, i) => {
        el.classList.remove("correct", "wrong");
        if (el.textContent === correctWords[i]) {
            el.classList.add("correct");
        } else {
            el.classList.add("wrong");
            allCorrect = false;
        }
    });

    if (allCorrect) {
        completedSentences.push(sentences[currentSentenceIndex]);
        updateCompletedSentencesDisplay();
        
        setTimeout(() => {
            currentSentenceIndex++;
            showSentence(currentSentenceIndex);
        }, 1000);
    } else {
        alert("❌ جرب مرة أخرى! هناك كلمات في الأماكن الخاطئة.");
    }
}

function updateCompletedSentencesDisplay() {
    const display = document.getElementById("correctSentencesDisplay");
    const list = document.getElementById("correctSentencesList");
    
    display.style.display = "block";
    list.innerHTML = completedSentences.map((sent, idx) => `<div style="margin-bottom: 8px;"><span style="color: #27ae60; font-weight: bold;">${idx + 1}.</span> ${sent}</div>`).join("");
}

function resetGame() {
    sentences = [];
    currentSentenceIndex = 0;
    correctWords = [];
    completedSentences = [];
    document.getElementById("inputSentence").style.display = "block";
    document.getElementById("inputSentence").value = "";
    document.getElementById("checkBtn").style.display = "none";
    document.getElementById("resetBtn").style.display = "none";
    document.getElementById("wordsContainer").innerHTML = "";
    document.getElementById("correctSentencesDisplay").style.display = "none";
    document.getElementById("correctSentencesList").innerHTML = "";
}
