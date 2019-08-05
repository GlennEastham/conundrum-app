import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style, keyframes } from '@angular/animations';
import { Action } from '../../models/Action';
import { Entry } from '../../models/Entry';
import { GameState } from '../../models/GameState';
import { Square } from '../../models/Square';
import { Word } from '../../models/Word';
import { WordService } from '../../services/word.service';
import letterPaths from "../../../assets/letterPaths.json";
import words from "../../../assets/conundrums_nine.json";
import successWords from "../../../assets/successWords.json";

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
    animations: [
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
            state("false", style({ opacity: 0 })),
            transition('false=>true', [
                style({ fontSize: 30, opacity: 0 }),
                animate('1.1s ease', style({ fontSize: 130, opacity: 1 }))
            ])
        ]),
        trigger('timeUp', [
            state("true", style({ opacity: 1 })),
            state("false", style({ opacity: 0 })),
            transition('false=>true', [
                style({ opacity: 0 }),
                animate('1.1s ease', style({ opacity: 1 }))
            ]),
            transition('true=>false', [
                style({ opacity: 1 }),
                animate('0.4s ease', style({ opacity: 0 }))
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
        ])
    ]
})

export class SquareComponent implements OnInit {
    squares: Square[];
    entries: Entry[];
    actions: Action[];
    gameState: GameState = new GameState;
    currentWord: Word;
    enteredWord: Word = new Word;
    shuffle: Action = new Action;
    getNew: Action = new Action;
    reset: Action = new Action;
    firstAvailableEntryPoint = 0;
    selectionCount = 0;
    timeLeft = 60;
    duration = 60;
    timerRate;
    menuColumns;
    iconSize: String = '50px';
    dividerSize: String = '60px';
    smallDividerSize: String = '30px';
    successWord: String = '';
    interval;
    constructor(private wordService: WordService) { }

    startTimer() {
        this.interval = setInterval(() => {
            this.timerRate = 1 - (this.timeLeft - 1) / this.duration;
            if(this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.timeUp();
            }
        },1000)
    }

    timeUp(){
        this.gameState.timeUp = true;
        this.gameState.active = false;
    }

    selectSquare(square: Square) {
        square.selected = !square.selected;
        square.hovering = false;
        if (square.selected) {
            this.entries[this.firstAvailableEntryPoint].letter = square.letter;
            this.entries[this.firstAvailableEntryPoint].letterPath = square.letterPath;
            this.entries[this.firstAvailableEntryPoint].squareID = square.id;
            this.entries[this.firstAvailableEntryPoint].selected = true;
            square.entryID = this.firstAvailableEntryPoint;
            this.selectionCount++;
        } else {
            this.gameState.incorrectEntry = false;
            this.entries[square.entryID].letterPath = '';
            this.entries[square.entryID].letter = '';
            this.entries[square.entryID].squareID = null;
            this.entries[square.entryID].selected = false;
            this.selectionCount--;
        }
        for (let entry of this.entries) {
            if (entry.squareID === null) {
                this.firstAvailableEntryPoint = entry.id;
                break;
            }
        }
        if (this.selectionCount === this.currentWord.word.length) {
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
        this.firstAvailableEntryPoint = 0;
        this.selectionCount = 0;
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
            this.successWord = successWords[Math.floor(Math.random() * successWords.length)].word;
            this.gameState.correctEntry = true;
            this.gameState.active = false;
            return true;
        } else {
            this.gameState.incorrectEntry = true;
            return false;
        }
    }

    loadNewGame() {
        this.gameState.newBoardAnimation = true;
        this.setupWord();
    }

    setupWord() {
        const wordData = this.getWord();
        let tempSquares = [];
        let tempEntries = [];
        let j = 0;
        for (let letter of wordData.conundrum) {
            let letterObject = {};
            letterObject = {
                id: j, letter: letter, letterPath: letterPaths[letter], selected: false, enteredAtSquare: null
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
        this.firstAvailableEntryPoint = 0;
        this.selectionCount = 0;
        this.timeLeft = this.duration;
        this.gameState.correctEntry = false;
        this.gameState.incorrectEntry = false;
        this.gameState.timeUp = false;
        this.gameState.active= true;
        
        // this.shuffleWord(); 
    }

    onResize(event) {
        this.dividerSize = (event.target.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (event.target.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (event.target.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (event.target.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (event.target.innerWidth <= 640) ? '35px' : '50px';
        this.menuColumns = (event.target.innerWidth <= 640) ? 6 : 6;
    }

    ngOnInit() {
        this.setupWord();
        this.startTimer();
        this.dividerSize = (window.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (window.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (window.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (window.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (window.innerWidth <= 640) ? '35px' : '50px';
        this.menuColumns = (window.innerWidth <= 640) ? 6 : 6;
    }
}
