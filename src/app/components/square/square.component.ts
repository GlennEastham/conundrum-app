import { Component, OnInit } from '@angular/core';
import { Square } from '../../models/Square';
import { Entry } from '../../models/Entry';
import { Action } from '../../models/Action';
import { WordService } from '../../services/word.service';
import letterPaths from "../../../assets/letterPaths.json";
import iconPaths from "../../../assets/iconPaths.json";

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],

})

export class SquareComponent implements OnInit {
    squares: Square[];
    entries: Entry[];
    actions: Action[];
    firstAvailableEntryPoint = 0;
    constructor(private wordService: WordService) { }

    onSelect(square: Square) {
        square.selected = !square.selected;
        if (square.selected) {
            this.entries[this.firstAvailableEntryPoint].letterPath = square.letterPath;
            this.entries[this.firstAvailableEntryPoint].squareID = square.id;
            this.entries[this.firstAvailableEntryPoint].selected = true;
            square.entryID = this.firstAvailableEntryPoint;
            
        } else {
            this.entries[square.entryID].letterPath = '';
            this.entries[square.entryID].squareID = null;
            this.entries[square.entryID].selected = false;
        }

        for (let entry of this.entries) {
            if (entry.squareID === null) {
                this.firstAvailableEntryPoint = entry.id;
                break;
            }
        }
    }

    onMouseEnter(square: Square){
        square.hovering = true;
    }
    
    onMouseLeave(square: Square){
        square.hovering = false;
    }

    ngOnInit() {
        this.wordService.getWord().subscribe(wordData => {
            let word = wordData;
            let tempSquares = [];
            let tempEntries = [];
            let tempActions = [];
            let j = 0;
            for (let letter of word['word']) {
                let letterObject = {};
                letterObject = {
                    id: j, letter: letter, letterPath: letterPaths[letter], selected: false, enteredAtSquare: null
                }
                j++;
                tempSquares.push(letterObject);
            }

            for (let i = 0; i < 9; i++) {
                tempEntries.push({
                    id: i,
                    letter: '',
                    letterPath: '',
                    squareID: null
                })
            }
            tempActions.push({action: "undo", iconPath: iconPaths['undo'], hovering: false});
            this.squares = tempSquares;
            this.entries = tempEntries;
            this.actions = tempActions;
        });
    }

}
