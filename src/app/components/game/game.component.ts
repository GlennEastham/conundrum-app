import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style, keyframes } from '@angular/animations';
import { Action } from '../../models/Action';
import { Entry } from '../../models/Entry';
import { GameState } from '../../models/GameState';
import { Square } from '../../models/Square';
import { Word } from '../../models/Word';
import letterPaths from "../../../assets/letterPaths.json";
import words from "../../../assets/conundrums_nine.json";
import successWords from "../../../assets/successWords.json";

@Component({
    selector: 'game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    animations: [
        trigger('fadeIn', [
            state("false", style({ opacity: 0 })),
            transition('false=>true', [
                style({ opacity: 0 }),
                animate('2.1s ease', style({ opacity: 1 }))
            ])
        ]),
        trigger('shake', [
            transition('false=>true', animate('1.5s ease', keyframes([
                style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.1 }),
                style({ transform: 'translate3d(2px, 0, 0)', offset: 0.2 }),
                style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.3 }),
                style({ transform: 'translate3d(4px, 0, 0)', offset: 0.4 }),
                style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.5 }),
                style({ transform: 'translate3d(4px, 0, 0)', offset: 0.6 }),
                style({ transform: 'translate3d(-4px, 0, 0)', offset: 0.7 }),
                style({ transform: 'translate3d(2px, 0, 0)', offset: 0.8 }),
                style({ transform: 'translate3d(-1px, 0, 0)', offset: 0.9 }),
            ]))),
        ]),
        trigger('success', [
            transition('false=>true', animate('3s ease-out', keyframes([
                style({ fontSize: 30, opacity: 0, offset: 0.1 }),
                style({ fontSize: 60, opacity: 1, offset: 0.2 }),
                style({ fontSize: 90, opacity: 1, offset: 0.3 }),
                style({ fontSize: 120, opacity: 1, offset: 0.4 }),
                style({ fontSize: 130, opacity: 1, offset: 0.5 }),
                style({ fontSize: 130, opacity: 1, offset: 0.6 }),
                style({ fontSize: 120, opacity: 1, offset: 0.7 }),
                style({ fontSize: 90, opacity: 1, offset: 0.8 }),
                style({ fontSize: 60, opacity: 0.2, offset: 0.9 }),
                style({ fontSize: 0, opacity: 0, offset: 1 }),
            ]))),
        ]),
       
        trigger('timeUp', [
            state("true", style({ opacity: 1 })),
            state("false", style({ opacity: 0 })),
            transition('false=>true', [
                style({ opacity: 0 }),
                animate('1.1s ease', style({ opacity: 1 }))
            ])
        ]),
        trigger('gameBoardFade', [
            state("true", style({ opacity: 1 })),
            state("false", style({ opacity: 0 })),
            transition('true=>false', [
                animate('0.4s ease', style({ opacity: 0 })),
            ]),
            transition('false=>true', [
                animate('1.2s ease', style({ opacity: 1 })),
            ])
        ]),

    ]
})

export class GameComponent implements OnInit {
    squares: Square[];
    entries: Entry[];
    actions: Action[];
    gameState: GameState = new GameState;
    currentWord: Word = new Word;
    enteredWord: Word = new Word;
    shuffle: Action = new Action;
    getNew: Action = new Action;
    reset: Action = new Action;
    iconSize: String = '50px';
    dividerSize: String = '60px';
    smallDividerSize: String = '30px';
    constructor() { }

    startTimer() {
        setInterval(() => {
            if (this.gameState.timeLeft > 0) {
                this.gameState.timeLeft--;
            } else {
                this.timeUp();
            }
        }, 1000)
    }

    timeUp() {
        this.gameState.timeUp = true;
        this.gameState.correctWord = this.currentWord.word;
        this.gameState.active = false;
    }

    selectSquare(square: Square, entryPoint: number = null) {
        square.selected = !square.selected;
        square.hovering = false;
        if (square.selected) {
            if (entryPoint) {
                this.entries[entryPoint].letter = square.letter;
                this.entries[entryPoint].letterPath = square.letterPath;
                this.entries[entryPoint].squareID = square.id;
                this.entries[entryPoint].selected = true;
                square.entryID = entryPoint;
            } else {
                this.entries[this.gameState.firstAvailableEntryPoint].letter = square.letter;
                this.entries[this.gameState.firstAvailableEntryPoint].letterPath = square.letterPath;
                this.entries[this.gameState.firstAvailableEntryPoint].squareID = square.id;
                this.entries[this.gameState.firstAvailableEntryPoint].selected = true;
                square.entryID = this.gameState.firstAvailableEntryPoint;
            }
            this.gameState.selectionCount++;
        } else {
            this.gameState.incorrectEntry = false;
            this.entries[square.entryID].letterPath = '';
            this.entries[square.entryID].letter = '';
            this.entries[square.entryID].squareID = null;
            this.entries[square.entryID].selected = false;
            this.squares[square.entryID].entryID = null;
            this.gameState.selectionCount--;
        }
        for (let entry of this.entries) {
            if (entry.squareID === null) {
                this.gameState.firstAvailableEntryPoint = entry.id;
                break;
            }
        }
        if (this.gameState.selectionCount === this.currentWord.word.length) {
            this.enteredWord.word = '';
            for (let entry of this.entries) {
                this.enteredWord.word += entry.letter;
            }
            this.submitWord(this.enteredWord);
        }
    }

    hoverSquare(square: Square) {
        square.hovering = true;
    }

    leaveSquare(square: Square) {
        square.hovering = false;
    }

    hoverAction(action: Action) {
        action.hovering = true;
    }

    leaveAction(action: Action) {
        action.hovering = false;
    }

    newWord() {
        this.getNew.hovering = false;
        this.setupWord();
    }

    resetWord() {
        this.squares.forEach((square) => {
            square.hovering = false;
            square.selected = false;
            square.entryID = null;
        });
        this.entries.forEach((entry) => {
            entry.letterPath = '';
            entry.letter = '';
            entry.squareID = null;
            entry.selected = false;
        });
        this.gameState.firstAvailableEntryPoint = 0;
        this.gameState.selectionCount = 0;
        this.reset.hovering = false;
    }

    shuffleWord() {
        let i = this.squares.length;
        while (i--) {
            const ri = Math.floor(Math.random() * (i + 1));
            [this.squares[i], this.squares[ri]] = [this.squares[ri], this.squares[i]];
        }
        this.shuffle.hovering = false;
    }

    getWord() {
        return words[Math.floor(Math.random() * words.length)]
    }

    submitWord(word: Word) {
        let checkWord: Word = new Word;
        words.find((x) => {
            if (x.uuid === word.uuid) {
                checkWord = x;
            }
        });
        if (word.word === checkWord.word) {
            this.gameState.successWord = successWords[Math.floor(Math.random() * successWords.length)].word;
            this.gameState.correctEntry = true;
            this.gameState.active = false;
        } else {
            this.gameState.incorrectEntry = true;
        }
    }

    setupWord() {
        const wordData = this.getWord();
        let tempSquares = [];
        let tempEntries = [];
        let j = 0;
        for (let letter of wordData.conundrum) {
            let letterObject = {};
            letterObject = {
                id: j, letter: letter, letterPath: letterPaths[letter], selected: false, entryID: null
            }
            j++;
            tempSquares.push(letterObject);
        }
        for (let i = 0; i < wordData.word.length; i++) {
            tempEntries.push({
                id: i,
                letter: '',
                letterPath: '',
                squareID: null
            })
        }
        this.squares = tempSquares;
        this.entries = tempEntries;
        this.currentWord = wordData;
        this.enteredWord.uuid = this.currentWord.uuid;
        this.gameState.firstAvailableEntryPoint = 0;
        this.gameState.selectionCount = 0;
        this.gameState.timeLeft = this.gameState.duration;
        this.gameState.correctEntry = false;
        this.gameState.incorrectEntry = false;
        this.gameState.timeUp = false;
        this.gameState.correctWord = '';
        this.gameState.active = true;

    }

    onResize(event) {
        this.dividerSize = (event.target.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (event.target.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (event.target.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (event.target.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (event.target.innerWidth <= 640) ? '35px' : '50px';

    }

    onOrientationChange(event) {
    }

    loadNewGame() {
        this.setupWord();
    }

    ngOnInit() {
        this.startTimer();
        this.dividerSize = (window.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (window.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (window.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (window.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (window.innerWidth <= 640) ? '35px' : '50px';
    }
}
