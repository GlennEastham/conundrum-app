import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style, keyframes, query, stagger } from '@angular/animations';
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
    selector: 'game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
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
        trigger('titleScreenEntrance', [
            transition('void => *', [ query('.home-screen-tile , mat-grid-tile',style({ transform: 'translateX(-600px) rotate(0)', opacity: 0})),
            query('.home-screen-tile, mat-grid-tile',
              stagger('150ms ease-in', [
                animate('400ms ease-out', style({ transform: 'translateX(0) rotate(720deg)', opacity: 1}))
            ]))])
        ]),
        trigger('wobbleAnimation', [
            transition('false<=>true', animate('2s ease', keyframes([
                style({ transform: 'translateX(0) rotate(-4deg)', offset: 0 }),
                style({ transform: 'translateX(2%) rotate(-8deg)', offset: 0.15 }),
                style({ transform: 'translateX(4%) rotate(4deg)', offset: 0.3 }),
                style({ transform: 'translateX(2%) rotate(-8deg)', offset: 0.45 }),
                style({ transform: 'translateX(4%) rotate(4deg)', offset: 0.6 }),
                style({ transform: 'translateX(2%) rotate(-8deg)', offset: 0.85 }),
                style({ transform: 'translateX(0) rotate(-4deg)', offset: 1 })
            ])))
        ])
    ]
})

export class GameComponent implements OnInit {
    squares: Square[];
    entries: Entry[];
    actions: Action[];
    homeScreenTiles: Square[];
    titleScreenShown = false;
    gameState: GameState = new GameState;
    currentWord: Word;
    enteredWord: Word = new Word;
    shuffle: Action = new Action;
    getNew: Action = new Action;
    reset: Action = new Action;
    iconSize: String = '50px';
    dividerSize: String = '60px';
    smallDividerSize: String = '30px';
    homeScreen = true;
    wobble = false;
    constructor(private wordService: WordService) { }

    startTimer() {
        setInterval(() => {
            if(this.gameState.timeLeft > 0) {
                this.gameState.timeLeft--;
            } else {
                this.timeUp();
            }
        },1000)
    }

    timeUp(){
        this.gameState.timeUp = true;
        this.gameState.correctWord = this.currentWord.word;
        this.gameState.active = false;
    }

    selectSquare(square: Square, entryPoint: number = null) {
        square.selected = !square.selected;
        square.hovering = false;
        if (square.selected) {
            if(entryPoint){
                this.entries[entryPoint].letter = square.letter;
                this.entries[entryPoint].letterPath = square.letterPath;
                this.entries[entryPoint].squareID = square.id;
                this.entries[entryPoint].selected = true;
                square.entryID = entryPoint;
            }else{
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

    // getHint() {
    //     let correctWord =  this.currentWord.word.split("");
    //     let availableSquares = [];
    //     let correctSquares = [];
    //     this.squares.forEach((square) => {
    //          //unselected or incorrect squares;
    //         if(square.selected){
    //             if(correctWord[square.entryID] === square.letter){
    //                 correctSquares.push(square);
    //             }else{
    //                 availableSquares.push(square);
    //             }
    //         }else{
    //             availableSquares.push(square);
    //         }
    //     });

    //     let i = availableSquares.length;
    //     let randomSquare = availableSquares[Math.floor(Math.random() * (i))]
    //     if(randomSquare.selected){
    //         this.selectSquare(randomSquare)
    //     }

    //     console.log( correctWord);
    //     console.log(randomSquare.letter);
    //     this.squares.forEach((square) => {
    //         //Check index AND letter matches for words containing the same letter more than once
    //         if(randomSquare.letter === correctWord[square.id] && !square.entryID){
    //             this.selectSquare(square, correctWord.indexOf(randomSquare.letter));
    //         }
    //     });
    // }

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
            return true;
        } else {
            this.gameState.incorrectEntry = true;
            return false;
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
    }

    getTitleScreen(){
        const titleScreenWord = "conundrum";
        let tempScreenTiles = [];
        let j = 0;
        for (let letter of titleScreenWord) {
            let letterObject = {};
            letterObject = {
                id: j, letter: letter, letterPath: letterPaths[letter], selected: false, entryID: null
            }
            j++;
            tempScreenTiles.push(letterObject);
        }

        return tempScreenTiles;
    }

    tileScreenEntranceDone(event){
        this.titleScreenShown = true;
    }

    onWobbleDone($event) {
          this.wobble = !this.wobble;
    }

    onResize(event) {
        this.dividerSize = (event.target.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (event.target.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (event.target.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (event.target.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (event.target.innerWidth <= 640) ? '35px' : '50px';
    }

    loadNewGame() {
        this.gameState.newBoardAnimation = true;
        this.setupWord();
    }

    ngOnInit() {
        this.homeScreenTiles = this.getTitleScreen();
        // this.setupWord();
        // this.startTimer();
        this.dividerSize = (window.innerWidth <= 640) ? '100px' : '60px';
        this.dividerSize = (window.innerHeight <= 360) ? '40px' : this.dividerSize;
        this.smallDividerSize = (window.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (window.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.iconSize = (window.innerWidth <= 640) ? '35px' : '50px';
    }
}
