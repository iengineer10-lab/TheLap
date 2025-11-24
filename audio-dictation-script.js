let words = [];
let currentWordIndex = 0;
let currentWord = "";

function isArabic(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
}

function normalizeWord(word) {
    return word.normalize("NFD").replace(/[\u064B-\u0652]/g, "").toLowerCase().trim();
}

function startAudioGame() {
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
    const isArabicWord = isArabic(currentWord);

    document.getElementById("wordTitle").textContent = isArabicWord ? "استمع للكلمة" : "Listen to the word";
    document.getElementById("progressText").textContent = `${isArabicWord ? "الكلمة" : "Word"} ${currentWordIndex + 1} ${isArabicWord ? "من" : "of"} ${words.length}`;
    document.getElementById("answerInput").placeholder = isArabicWord ? "اكتب هنا" : "Type here";
    document.getElementById("answerInput").value = "";
    document.getElementById("feedbackMessage").innerHTML = "";
    document.getElementById("feedbackMessage").classList.remove("show", "correct", "incorrect");
    document.getElementById("completionMessage").classList.remove("show");
    document.getElementById("answerInput").focus();
}

function playAudio() {
    const word = currentWord;
    const isArabicWord = isArabic(word);
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(word);
        
        if (isArabicWord) {
            utterance.lang = 'ar-SA';
            utterance.rate = 0.7; // Slower for clarity
        } else {
            utterance.lang = 'en-US';
            utterance.rate = 0.3;
        }
        
        utterance.pitch = 2;
        utterance.volume = 1;
        
        // Disable button while playing
        const playBtn = document.getElementById("playBtn");
        playBtn.disabled = true;
        
        utterance.onend = () => {
            playBtn.disabled = false;
        };
        
        utterance.onerror = () => {
            playBtn.disabled = false;
            alert(isArabicWord ? "حدث خطأ في تشغيل الصوت" : "Error playing audio");
        };
        
        speechSynthesis.speak(utterance);
    } else {
        alert(isArabicWord ? "متصفحك لا يدعم هذه الميزة" : "Your browser doesn't support audio playback");
    }
}

function checkAnswer() {
    const answer = document.getElementById("answerInput").value.trim();
    const isArabicWord = isArabic(currentWord);
    
    if (!answer) {
        alert(isArabicWord ? "الرجاء اكتب إجابة" : "Please type an answer");
        return;
    }

    const answerNormalized = normalizeWord(answer);
    const currentWordNormalized = normalizeWord(currentWord);

    const feedbackEl = document.getElementById("feedbackMessage");
    
    if (answerNormalized === currentWordNormalized) {
        feedbackEl.innerHTML = `✓ ${isArabicWord ? "إجابة صحيحة!" : "Correct!"}`;
        feedbackEl.classList.add("show", "correct");
        
        document.getElementById("completionMessage").classList.add("show");
        document.getElementById("completionText").textContent = `${isArabicWord ? "رائع! الكلمة" : "Great! The word"} "${currentWord}" ${isArabicWord ? "صحيحة ✓" : "is correct ✓"}`;
    } else {
        feedbackEl.innerHTML = `❌ ${isArabicWord ? `خطأ! الإجابة الصحيحة: ${currentWord}` : `Error! The correct answer: ${currentWord}`}`;
        feedbackEl.classList.add("show", "incorrect");
    }
}

function clearAnswer() {
    document.getElementById("answerInput").value = "";
    document.getElementById("feedbackMessage").innerHTML = "";
    document.getElementById("feedbackMessage").classList.remove("show", "correct", "incorrect");
    document.getElementById("answerInput").focus();
}

function nextWord() {
    currentWordIndex++;
    showWord();
}

function restartGame() {
    currentWordIndex = 0;
    words = [];
    document.getElementById("inputPhase").style.display = "block";
    document.getElementById("gamePhase").classList.remove("active");
    document.getElementById("finalMessage").classList.remove("show");
    document.getElementById("wordsInput").value = "";
}

// Allow Enter key to check answer
document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.getElementById("answerInput");
    if (answerInput) {
        answerInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        });
    }
});
