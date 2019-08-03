import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation, state, animate, style, keyframes } from '@angular/animations';
import { shake, flipInY, fadeOut } from 'ng-animate';

import { Action } from '../../models/Action';
import { Entry } from '../../models/Entry';
import { GameState } from '../../models/GameState';
import { Square } from '../../models/Square';
import { Word } from '../../models/Word';
import { WordService } from '../../services/word.service';
import iconPaths from "../../../assets/iconPaths.json";
import letterPaths from "../../../assets/letterPaths.json";
import words from "../../../assets/words.json";
import successWords from "../../../assets/successWords.json";

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
    animations: [
        trigger('shake', [
            transition('false=>true', animate('1.5s ease-in', keyframes([
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
            transition('false=>true', [
                style({ fontSize: 30, opacity: 1 }),
                animate('1.1s ease-in', style({ fontSize: 160, opacity: 1 }))
            ])
        ]),
        trigger('gameBoardFadeIn', [    
            transition('true=>false', [
                style({ opacity:0 }),
                animate('2s ease-in', style({ opacity: 1 })),
            ])
        ]),
        trigger('gameBoardFadeOut', [
            transition('false=>true', [
                style({ opacity:1 }),
                animate('0.3s ease-out', style({ opacity: 0 })),
                animate('0.8s ease-out', style({ opacity: 0 })),
            ])
        ]),
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
    firstAvailableEntryPoint;
    selectionCount;
    menuColumns;
    iconSize: String = '50px';
    dividerSize: String = '60px';
    successWord: String = '';
    
    constructor(private wordService: WordService) { }

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
            let randomSuccessWordId = Math.floor(Math.random() * 43);
            this.successWord = successWords[randomSuccessWordId];
            this.gameState.correctEntryAnimation = true;
            return true;
        } else {
            this.gameState.incorrectEntry = true;
            return false;
        }
    }

    correctEntry() {
        this.gameState.correctEntryAnimation = false;
        this.gameState.newBoardAnimation = true;
        this.setupWord();
    }

    setupWord() {
        const wordData = this.getWord();
        let tempSquares = [];
        let tempEntries = [];
        let j = 0;
        for (let letter of wordData.word) {
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
        this.gameState.correctEntry = false;
        this.gameState.incorrectEntry = false;
        this.shuffleWord(); 
    }

    onResize(event) {
        this.dividerSize = (event.target.innerWidth <= 640) ? '100px' : '60px';
        this.iconSize = (event.target.innerWidth <= 640) ? '35px' : '50px';
        this.menuColumns = (event.target.innerWidth <= 640) ? 6 : 6;
    }

    ngOnInit() {
        this.setupWord();
        this.dividerSize = (window.innerWidth <= 640) ? '100px' : '60px';
        this.iconSize = (window.innerWidth <= 640) ? '35px' : '50px';
        this.menuColumns = (window.innerWidth <= 640) ? 6 : 6;
    }
}
