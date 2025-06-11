document.addEventListener("DOMContentLoaded", function () {
    const easyTexts = [
        "The cat sat on the mat.",
        "A quick brown fox jumps over the lazy dog.",
        "She sells seashells by the seashore.",
    ];
    const mediumTexts = [
        "To be or not to be, that is the question.",
        "All that glitters is not gold.",
        "A journey of a thousand miles begins with a single step.",
    ];
    const hardTexts = [
        "It was the best of times, it was the worst of times.",
        "In the beginning God created the heavens and the earth.",
        "The only thing we have to fear is fear itself.",
    ];

    // DOM elements
    const difficultySelect = document.getElementById("difficulty");
    const sampleTextDiv = document.getElementById("sample-text");
    const timeDisplay = document.getElementById("time");
    const userInput = document.getElementById("user-input");
    const levelDisplay = document.getElementById("level");
    const wpmDisplay = document.getElementById("wpm");
    const retryButton = document.getElementById("retry-btn");
    const accuracyDisplay = document.getElementById("accuracy");
    const mistakesDisplay = document.getElementById("mistakes");

    // State
    let startTime,
        testStarted = false,
        mistakes = 0,
        lastMistakeIndex = -1;
    let easyIndex = 0,
        mediumIndex = 0,
        hardIndex = 0;
    let correctKeystrokes = 0;

    // Utility functions
    function updateSampleText() {
        let selectedDifficulty = difficultySelect.value;
        let selectedText;
        if (selectedDifficulty === "easy") {
            selectedText = easyTexts[easyIndex];
            easyIndex = (easyIndex + 1) % easyTexts.length;
        } else if (selectedDifficulty === "medium") {
            selectedText = mediumTexts[mediumIndex];
            mediumIndex = (mediumIndex + 1) % mediumTexts.length;
        } else {
            selectedText = hardTexts[hardIndex];
            hardIndex = (hardIndex + 1) % hardTexts.length;
        }
        sampleTextDiv.textContent = selectedText;
    }

    function calculateAccuracy(correctKeystrokes, mistakes) {
        const total = correctKeystrokes + mistakes;
        if (total === 0) return 100;
        return Math.round((correctKeystrokes / total) * 100);
    }

    function displayResults(
        timeTaken,
        wpm,
        correctWords,
        totalWords,
        mistakes
    ) {
        timeDisplay.textContent = timeTaken.toFixed(2);
        wpmDisplay.textContent = wpm;
        const selectedDifficulty = difficultySelect.value;
        levelDisplay.textContent =
            selectedDifficulty.charAt(0).toUpperCase() +
            selectedDifficulty.slice(1);
        accuracyDisplay.textContent = calculateAccuracy(
            correctKeystrokes,
            mistakes
        );
        mistakesDisplay.textContent = mistakes;
    }

    // Real-time feedback: blue for correct words, red for wrong letter (on mistake)
    function updateTypingFeedback() {
        const sampleText = sampleTextDiv.textContent.trim();
        const userText = userInput.value;
        const sampleWords = sampleText.split(" ");
        const userWords = userText.split(" ");

        let feedbackHTML = "";
        let charCount = 0;

        for (let w = 0; w < sampleWords.length; w++) {
            const sampleWord = sampleWords[w];
            const userWord = userWords[w] || "";
            let wordHTML = "";

            if (userWord === sampleWord) {
                wordHTML = `<span class="correct-word">${sampleWord}</span>`;
            } else {
                for (let l = 0; l < sampleWord.length; l++) {
                    if (
                        charCount === lastMistakeIndex &&
                        l < userWord.length &&
                        userWord[l] !== sampleWord[l]
                    ) {
                        wordHTML += `<span class="incorrect-letter">${sampleWord[l]}</span>`;
                    } else {
                        wordHTML += `<span>${sampleWord[l]}</span>`;
                    }
                    charCount++;
                }
                // Add space after word (except last word)
                if (w < sampleWords.length - 1) {
                    wordHTML += `<span> </span>`;
                    charCount++;
                }
                feedbackHTML += wordHTML;
                continue;
            }

            feedbackHTML += wordHTML;
            if (w < sampleWords.length - 1) {
                feedbackHTML += `<span> </span>`;
                charCount++;
            }
            charCount += sampleWord.length;
        }
        sampleTextDiv.innerHTML = feedbackHTML;

        // Real-time results update
        let correctWords = 0;
        for (let i = 0; i < sampleWords.length; i++) {
            if (userWords[i] === sampleWords[i]) correctWords++;
        }
        let timeTaken = testStarted ? (new Date() - startTime) / 1000 : 0;
        const wpm =
            timeTaken > 0 ? Math.round((correctWords / timeTaken) * 60) : 0;
        displayResults(
            timeTaken,
            wpm,
            correctWords,
            sampleWords.length,
            mistakes
        );
    }

    // Only allow correct keystrokes, highlight mistake letter on error
    userInput.addEventListener("beforeinput", function (event) {
        if (event.inputType !== "insertText") return;
        const sampleText = sampleTextDiv.textContent;
        const currentValue = userInput.value;
        const nextChar = event.data;
        const nextIndex = currentValue.length;

        if (sampleText[nextIndex] === nextChar) {
            lastMistakeIndex = -1;
            correctKeystrokes++; // increment on correct input
            return;
        } else {
            event.preventDefault();
            mistakes++;
            lastMistakeIndex = nextIndex;
            sampleTextDiv.classList.add("shake");
            setTimeout(() => sampleTextDiv.classList.remove("shake"), 400);
            updateTypingFeedback();
        }
    });

    // Update feedback on every input (for blue words)
    userInput.addEventListener("input", function () {
        if (!testStarted) {
            startTime = new Date();
            testStarted = true;
            retryButton.disabled = true;
            mistakes = 0;
        }
        updateTypingFeedback();
    });

    // Stop test on Enter
    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") stopTest();
    });

    function stopTest() {
        endTime = new Date();
        const timeTaken = (endTime - startTime) / 1000;
        const sampleText = sampleTextDiv.textContent
            .replace(/<[^>]+>/g, "")
            .trim();
        const userText = userInput.value.trim();
        const sampleWords = sampleText.split(" ");
        const userWords = userText.split(" ");
        let correctWords = 0;
        for (let i = 0; i < sampleWords.length; i++) {
            if (userWords[i] === sampleWords[i]) correctWords++;
        }
        const wpm = Math.round((correctWords / timeTaken) * 60);
        displayResults(
            timeTaken,
            wpm,
            correctWords,
            sampleWords.length,
            mistakes
        );
        userInput.disabled = true;
        retryButton.disabled = false;
        testStarted = false;
    }

    function resetTest() {
        userInput.value = "";
        userInput.disabled = false;
        updateSampleText();
        mistakes = 0;
        correctKeystrokes = 0;
        lastMistakeIndex = -1;
        testStarted = false;
        retryButton.disabled = true;
        timeDisplay.textContent = "0";
        wpmDisplay.textContent = "0";
        accuracyDisplay.textContent = "100";
        mistakesDisplay.textContent = "0";
        updateTypingFeedback();
    }

    difficultySelect.addEventListener("change", updateSampleText);
    retryButton.addEventListener("click", resetTest);

    // Initialize
    updateSampleText();
    updateTypingFeedback();
});
