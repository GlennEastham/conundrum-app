export class GameState {
    correctEntry: Boolean;
    incorrectEntry: Boolean;
    timeUp: Boolean = false;
    active: Boolean = false;
    newBoard: Boolean = false;
    newBoardAnimation: Boolean = false;
    firstAvailableEntryPoint = 0;
    selectionCount = 0;
    timeLeft = 60;
    duration = 60;
    successWord: String = '';
}