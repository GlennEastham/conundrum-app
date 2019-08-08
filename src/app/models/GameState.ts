export class GameState {
    correctEntry: Boolean = false;
    incorrectEntry: Boolean = false;
    timeUp: Boolean = false;
    active: Boolean = false;
    newBoard: Boolean = false;
    newBoardAnimation: Boolean = false;
    firstAvailableEntryPoint: number = 0;
    selectionCount = 0;
    timeLeft = 60;
    duration = 60;
    successWord: String = '';
    correctWord: String = '';
}