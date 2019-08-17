import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, animate, style, query, stagger } from '@angular/animations';
import { Square } from '../../models/Square';
import letterPaths from "../../../assets/letterPaths.json";

@Component({
    selector: 'titleScreen',
    templateUrl: './titleScreen.component.html',
    styleUrls: ['./titleScreen.component.scss'],
    animations: [
        trigger('titleScreenEntrance', [
            transition('void => *', [query('.home-screen-tile , mat-grid-tile', style({ transform: 'translateX(-1000px) rotate(0)', opacity: 0 })),
            query('.home-screen-tile, mat-grid-tile',
                stagger('150ms ease-in', [
                    animate('400ms ease-out', style({ transform: 'translateX(0) rotate(720deg)', opacity: 1 }))
                ]))])
        ]),
        trigger('fadeIn', [
            state("false", style({ opacity: 0 })),
            transition('false=>true', [
                style({ opacity: 0 }),
                animate('2.1s ease', style({ opacity: 1 }))
            ])
        ]),
    ]
})

export class TitleComponent implements OnInit {
    titleScreenTiles: Square[];
    smallDividerSize: String = '30px';
    titleScreenTileLarge: Boolean = true;
    titleScreen: Boolean = true; 
    titleScreenShown: Boolean = false;
    difficulty: number = 9;
    constructor() { }

    updateDifficulty(event){
        this.difficulty = event.value;
    }

    getTitleScreen() {
        const titleScreenWord = "conundrum";
        let tempScreenTiles = [];
        let j = 0;
        for (let letter of titleScreenWord) {
            let letterObject = {};
            letterObject = {
                id: j, letter: letter, letterPath: letterPaths[letter], animationState: null
            }
            j++;
            tempScreenTiles.push(letterObject);
        }
        return tempScreenTiles;
    }

    onResize(event) {
        this.smallDividerSize = (event.target.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (event.target.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.titleScreenTileLarge = (event.target.innerWidth <= 640) ? false : true;
    }

    onOrientationChange(event) {
        this.titleScreenTileLarge = (event.target.innerWidth <= 640) ? false : true;
    }

    titleScreenAnimationDone() {
        this.titleScreenShown = true;
    }

    ngOnInit() {
        this.difficulty = 9;
        this.titleScreenTiles = this.getTitleScreen();
        this.smallDividerSize = (window.innerWidth <= 640) ? '50px' : '30px';
        this.smallDividerSize = (window.innerHeight <= 360) ? '20px' : this.smallDividerSize;
        this.titleScreenTileLarge = (window.innerWidth <= 640) ? false : true;
    }
}
