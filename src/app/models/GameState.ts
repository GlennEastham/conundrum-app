export class GameState {
    correctEntry: Boolean = false;
    incorrectEntry: Boolean = false;
    timeUp: Boolean = false;
    active: Boolean = false;
    newBoard: Boolean = false;
    newBoardAnimation: Boolean = false;
    difficulty: number;
    firstAvailableEntryPoint: number = 0;
    selectionCount: number = 0;
    timeLeft: number = 60;
    duration: number = 60;
    successWord: String = '';
    correctWord: String = '';
}