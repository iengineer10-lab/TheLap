let words = [];
let currentWordIndex = 0;
let currentWord = "";
let draggedLetter = null;
let droppedLetters = [];

function isArabic(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
}

function normalizeWord(word) {
    // Remove diacritics and normalize for comparison
    return word.normalize("NFD").replace(/[\u064B-\u0652]/g, "").toLowerCase();
}

function startDictationGame() {
    const input = document.getElementById("wordsInput").value.trim();
    if (!input) {
        alert(isArabic(input) ? "الرجاء أدخل كلمة واحدة على الأقل" : "Please enter at least one word");
        return;
    }

    words = input.split("\n")
        .filter(w => w.trim() !== "")
        .map(w => w.trim());
    
    if (words.length === 0) {
        alert(isArabic(input) ? "الرجاء أدخل كلمة واحدة على الأقل" : "Please enter at least one word");
        return;
    }

    document.getElementById("inputPhase").style.display = "none";
    document.getElementById("gamePhase").classList.add("active");
    currentWordIndex = 0;
    showWord();
}

function showWord() {
    if (currentWordIndex >= words.length) {
        document.getElementById("gamePhase").classList.remove("active");
        document.getElementById("finalMessage").classList.add("show");
        return;
    }

    currentWord = words[currentWordIndex];
    droppedLetters = [];

    const isArabicWord = isArabic(currentWord);
    document.getElementById("wordTitle").textContent = `${isArabicWord ? "اكتب الكلمة" : "Type the word"}: ${currentWord}`;
    document.getElementById("progressText").textContent = `${isArabicWord ? "الكلمة" : "Word"} ${currentWordIndex + 1} ${isArabicWord ? "من" : "of"} ${words.length}`;
    document.getElementById("completionMessage").classList.remove("show");

    // Shuffle letters - for Arabic, handle letter combinations properly
    let letters;
    if (isArabicWord) {
        // For Arabic, we need to handle it character by character
        letters = currentWord.split("");
    } else {
        letters = currentWord.split("");
    }
    
    const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);

    // Display letters
    const lettersContainer = document.getElementById("lettersContainer");
    lettersContainer.innerHTML = "";
    lettersContainer.style.direction = isArabicWord ? "rtl" : "ltr";
    
    shuffledLetters.forEach((letter, index) => {
        const letterEl = document.createElement("div");
        letterEl.className = "letter";
        letterEl.textContent = letter;
        letterEl.draggable = true;
        letterEl.dataset.index = index;
        letterEl.dataset.letter = letter;
        letterEl.style.fontSize = isArabicWord ? "22px" : "18px";
        letterEl.addEventListener("dragstart", dragStart);
        letterEl.addEventListener("dragend", dragEnd);
        lettersContainer.appendChild(letterEl);
    });

    // Create drop slots
    const dropZone = document.getElementById("dropZone");
    dropZone.innerHTML = "";
    dropZone.style.direction = isArabicWord ? "rtl" : "ltr";
    
    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement("div");
        slot.className = "drop-slot";
        slot.id = `slot-${i}`;
        slot.style.fontSize = isArabicWord ? "24px" : "18px";
        slot.addEventListener("dragover", dragOver);
        slot.addEventListener("drop", drop);
        dropZone.appendChild(slot);
    }
}

function dragStart(e) {
    draggedLetter = {
        element: e.target,
        letter: e.target.dataset.letter,
        originalIndex: e.target.dataset.index
    };
    e.target.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";
}

function dragEnd(e) {
    e.target.style.opacity = "1";
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.style.background = "rgba(0, 206, 209, 0.3)";
    e.currentTarget.style.borderColor = "#FF1493";
}

function drop(e) {
    e.preventDefault();
    e.currentTarget.style.background = "";
    e.currentTarget.style.borderColor = "#00CED1";

    if (!draggedLetter) return;

    const slot = e.currentTarget;
    const slotIndex = parseInt(slot.id.split("-")[1]);

    // Remove from previous slot if any
    if (droppedLetters[slotIndex]) {
        const prevLetter = droppedLetters[slotIndex].element;
        if (prevLetter && prevLetter.parentElement) {
            prevLetter.style.display = "inline-block";
        }
    }

    // Add to current slot
    const letterEl = document.createElement("div");
    letterEl.className = "letter-in-slot";
    letterEl.textContent = draggedLetter.letter;
    letterEl.draggable = true;
    letterEl.dataset.letter = draggedLetter.letter;
    letterEl.addEventListener("dragstart", dragStart);
    letterEl.addEventListener("dragend", dragEnd);
    letterEl.style.background = "linear-gradient(135deg, #FFB6C1, #FFC0CB)";
    letterEl.style.padding = "8px 14px";
    letterEl.style.borderRadius = "10px";
    letterEl.style.border = "2px solid #FF1493";
    letterEl.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    letterEl.style.fontSize = isArabic(currentWord) ? "22px" : "18px";

    slot.innerHTML = "";
    slot.appendChild(letterEl);
    slot.classList.add("filled");

    droppedLetters[slotIndex] = {
        letter: draggedLetter.letter,
        element: letterEl
    };

    // Hide original letter
    draggedLetter.element.style.display = "none";
}

function checkWord() {
    const formed = droppedLetters.map(d => d ? d.letter : "").join("");
    const isArabicWord = isArabic(currentWord);

    if (formed.length < currentWord.length) {
        alert(isArabicWord ? "❌ أكمل جميع الحروف أولاً" : "❌ Complete all letters first");
        return;
    }

    // Normalize both words for comparison (removes diacritics)
    const formedNormalized = normalizeWord(formed);
    const currentWordNormalized = normalizeWord(currentWord);

    if (formedNormalized === currentWordNormalized) {
        document.getElementById("completionMessage").classList.add("show");
        document.getElementById("completionText").textContent = `${isArabicWord ? "رائع! الكلمة" : "Great! The word"} "${currentWord}" ${isArabicWord ? "صحيحة ✓" : "is correct ✓"}`;
    } else {
        alert(`${isArabicWord ? "❌ خطأ! الكلمة الصحيحة هي: " : "❌ Error! The correct word is: "}${currentWord}`);
    }
}

function clearWord() {
    droppedLetters.forEach(dropped => {
        if (dropped && dropped.element && dropped.element.parentElement) {
            dropped.element.parentElement.innerHTML = "";
            dropped.element.parentElement.classList.remove("filled");
        }
    });

    document.querySelectorAll(".letter").forEach(letter => {
        letter.style.display = "inline-block";
    });

    droppedLetters = [];
}

function nextWord() {
    currentWordIndex++;
    showWord();
}

function restartGame() {
    currentWordIndex = 0;
    words = [];
    droppedLetters = [];
    document.getElementById("inputPhase").style.display = "block";
    document.getElementById("gamePhase").classList.remove("active");
    document.getElementById("finalMessage").classList.remove("show");
    document.getElementById("wordsInput").value = "";
}
