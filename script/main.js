class Hangman {
    MAX_ERRORS = 11;

    charsFound = [];
    errors = [];
    gameFinished = false;
    word = null;

    buildGame = async () => {
        const words = await this.fetchWord();
        this.selectRandomWord(words);
        this.buildCharInputs();
        this.buildWordOutput();
    };

    fetchWord = async () => {
        const localStorageKey = 'words';
        let words = JSON.parse(localStorage.getItem(localStorageKey));

        if (!words || words.length === 0) {
            const url = 'http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=5&maxLength=7&limit=200&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';

            const response = await fetch(url);
            words = await response.json();
            localStorage.setItem(localStorageKey, JSON.stringify(words));
        }

        return words;
    };

    selectRandomWord = (words) => {
        this.word = words[Math.floor(Math.random() * words.length)]?.word;
    };

    buildCharInputs = () => {
        const inputsContainerEl = document.querySelector('.inputs');
        inputsContainerEl.innerHTML = '';

        for (let i = 97; i <= 122; i++) {
            const charEl = document.createElement('button');
            const value = String.fromCharCode(i);
            const charText = document.createTextNode(value);

            charEl.classList.add('char');
            charEl.setAttribute('value', value);
            charEl.appendChild(charText);

            charEl.addEventListener('click', () => {
                this.disableInput(charEl);
                this.inputClicked(value);
            });

            inputsContainerEl.appendChild(charEl);
        }

        document.addEventListener('keypress', (evt) => {
            const buttonEl = document.querySelector(`button[value="${ evt.key }"]`);
            if (!buttonEl.disabled) {
                this.disableInput(buttonEl);
                this.inputClicked(evt.key);
            }
        });
    };

    buildWordOutput = (chars, show = false) => {
        const letters = this.word.split('');
        const lettersContainerEl = document.querySelector('.letters');
        lettersContainerEl.innerHTML = '';

        let countSuccess = 0;

        for (let i in letters) {
            const letterDivEl = document.createElement('div');

            letterDivEl.classList.add('letter');

            if (chars && chars.length > 0 && chars.includes(letters[i])) {
                const charText = document.createTextNode(letters[i]);
                letterDivEl.appendChild(charText);
                letterDivEl.classList.add('succes');
                countSuccess++;
            } else if (show) {
                const charText = document.createTextNode(letters[i]);
                letterDivEl.appendChild(charText);
                letterDivEl.classList.add('error');
            }

            lettersContainerEl.appendChild(letterDivEl);
        }

        if (countSuccess === this.word.length) {
            this.gameFinished = true;
            this.showRestartButton();
        }
    };

    inputClicked = (char) => {

        if (this.gameFinished) {
            return;
        }

        if (this.word.toLowerCase().includes(char)) {
            this.charsFound.push(char);
            this.buildWordOutput(this.charsFound);
        } else {
            if (this.errors.length < this.MAX_ERRORS) {
                this.errors.push(char);
                this.showOrHideHangmanParts(this.errors.length - 1);
            }

            if (this.errors.length === this.MAX_ERRORS) {
                this.buildWordOutput(this.charsFound, true);
                this.gameFinished = true;
                this.showRestartButton();
            }
        }
    }

    disableInput = (buttonEl) => {
        if (this.gameFinished) {
            return;
        }

        buttonEl.disabled = true;
    }

    showRestartButton = () => {
        const restartButton = document.querySelector('#restartGame');
        restartButton.style.visibility = 'visible';

        restartButton.addEventListener('click', () => {
            this.charsFound = [];
            this.errors = [];
            this.gameFinished = false;
            restartButton.style.visibility = 'hidden';
            this.showOrHideHangmanParts(null, false);
            this.buildGame();
        });
    }

    showOrHideHangmanParts = (partIndex, show = true) => {
        const parts = document.querySelectorAll('.hangman-parts');

        if (!show) {
            parts.forEach(part => part.style.opacity = 0);
        } else {
            parts[partIndex].style.opacity = 1;
        }
    }
}

const hangman = new Hangman();
hangman.buildGame();
