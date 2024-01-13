let size; let pieceSize;
let blackPawn; let whitePawn;
let blackKnight; let whiteKnight;
let blackRook; let whiteRook;
let blackBishop; let whiteBishop;
let blackQueen; let whiteQueen;
let blackKing; let whiteKing;

let board; let lastMove;
let selectedPiece; let kingsMoved;
let whitePawns; let blackPawns;
let turn; let whiteRooksMoved;
let currentTurn; let blackRooksMoved;
let gamePositions; let viewingGamePosition;
let Move; let bottomPlayer; let Player;
let availableMoves;

let moveSound;

function preload() {
    // images
    whitePawn = loadImage('https://i.imgur.com/5aAQo9B.png'); blackPawn = loadImage('https://i.imgur.com/IUHGYCI.png');
    whiteBishop = loadImage('https://i.imgur.com/Ogp0HUg.png'); blackBishop = loadImage('https://i.imgur.com/yE35P0i.png');
    whiteKnight = loadImage('https://i.imgur.com/oNQGgMN.png'); blackKnight = loadImage('https://i.imgur.com/qicpw7C.png');
    whiteQueen = loadImage('https://i.imgur.com/aEHn0os.png'); blackQueen = loadImage('https://i.imgur.com/rR3SSLj.png');
    whiteKing = loadImage('https://i.imgur.com/OPLvDGS.png'); blackKing = loadImage('https://i.imgur.com/IDq7IiT.png');
    whiteRook = loadImage('https://i.imgur.com/AGjBZ8z.png'); blackRook = loadImage('https://i.imgur.com/p9JXeQp.png');

    // sounds
    soundFormats('mp3', 'ogg');
    moveSound = loadSound('sounds/eat.mp3');
}

function setup() {
    size = 870;
    board = FenToBoard("RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr");
    gamePositions = [boardToFen(board)];
    viewingGamePosition = 0;
    selectedPiece = {
        piece: -1,
        xPos: -1,
        yPos: -1,
    };
    turn = Player = {
        WHITE: "white",
        BLACK: "black",
    };
    Move = function (piece, startPos, endPos) {
        this.piece = 0;
        this.startPos = [-1, -1];
        this.endPos = [-1, -1];

        this.equals = function(move) {
            if (move.piece = this.piece && move.startPos == this.startPos && move.endPos == this.endPos)
                return true;
            return false;
        }
    }
    whitePawns = new Array(8).fill(false);
    blackPawns = new Array(8).fill(false);
    availableMoves = [];
    currentTurn = turn.WHITE;
    lastMove = [new Array(2).fill(new Array(2).fill(-1))];
    kingsMoved = [false, false]; // 0 = white
    whiteRooksMoved = [false, false]; // 0 = left
    blackRooksMoved = [false, false]; // 0 = left
    pieceSize = size / 9;
    moveSound.setVolume(0.5);
    if (Math.random() > 0.5)
        bottomPlayer = Player.WHITE;
    else
        bottomPlayer = Player.BLACK;

    createCanvas(size, size);
}

function draw() {
    drawBoard();

    // Draw last move
    if (lastMove[viewingGamePosition][0][0] != -1) {
        fill(254, 208, 73, 70);
        rect(lastMove[viewingGamePosition][0][1] * (size / 8), lastMove[viewingGamePosition][0][0] * (size / 8), size / 8);
        rect(lastMove[viewingGamePosition][1][1] * (size / 8), lastMove[viewingGamePosition][1][0] * (size / 8), size / 8);
    }

    // Draw pieces
    drawPieces();

    // Player interaction
    if (mouseIsPressed) {
        if (selectedPiece.piece != -1) {
            imageMode(CENTER);
            drawPiece(selectedPiece.piece, mouseY, mouseX);
            // image(pieceToImage(selectedPiece.piece), mouseX, mouseY, size / 8, size / 8);
        }
    }
}

function keyPressed() {
    moveSound.setVolume(0.5);

    if (keyCode == LEFT_ARROW) {
        if (viewingGamePosition > 0) {
            viewingGamePosition--;
            board = FenToBoard(gamePositions[viewingGamePosition]);
            moveSound.play();
        }
    } else if (keyCode == RIGHT_ARROW) {
        if (viewingGamePosition < gamePositions.length - 1) {
            viewingGamePosition++;
            board = FenToBoard(gamePositions[viewingGamePosition]);
            moveSound.play();
        }
    }
}

function mousePressed() {
    if (mouseX >= 0 && mouseX <= size && mouseY >= 0 && mouseY <= size) {
        if (board[getMatrixPos()[0]][getMatrixPos()[1]] != 0) { // if a piece exists in target square
            selectedPiece.piece = board[getMatrixPos()[0]][getMatrixPos()[1]];
            selectedPiece.xPos = getMatrixPos()[1];
            selectedPiece.yPos = getMatrixPos()[0];
            board[getMatrixPos()[0]][getMatrixPos()[1]] = 0;
        }
    }
}

function mouseReleased() {
    if (selectedPiece.piece != -1) {
        let move = new Move(selectedPiece.piece, [selectedPiece.yPos, selectedPiece.xPos], getMatrixPos());
        if (matrixContains(getAvailableMoves(), move.endPos)) {
            requestMove(move);
            return;
        }
        
        cancelMove();
    }
}

function getPawnMoves(player, y, x) {
    let availableMoves = [];
    let piece = Piece.PAWN;
    if (player == Player.BLACK)
        piece = Piece.PAWN + Piece.BLACK;
    let yModifier = 1;
    if (bottomPlayer == player) {
        yModifier = -1;
    }
    print(y);

    // Position moves
    if (y - yModifier >= 0 && y - yModifier < 8) { // if pawn can progress by one
        print("pawn has space to progress");
        if (board[y - yModifier][x] == 0) { // if next square is free
            print("pawn's next square is free");
            availableMoves.push(new Move(piece, [y, x], [y - yModifier, x])); // add move
        }
    }

    return availableMoves;
}

function getAvailableMoves(player) {
    let availableMoves = [];

    // loop through the board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == Piece.PAWN || board[i][j] == Piece.PAWN + Piece.BLACK) { // if found a pawn
                for (let x = 0; x < getPawnMoves().length; x++) {
                    print("test");
                    availableMoves.push(getPawnMoves(player, i, j)[x]); // add move to available moves list
                }
            }
        }
    }

    return availableMoves;
}

function matrixContains(m, r) {
    for(var i = 0; i<m.length; i++){
        let checker = []
        for(var j = 0; j<m[i].length; j++){
            if(m[i][j] === r[j]){
                checker.push(true)
            } else {
                checker.push(false)
            }
        }
        if (checker.every(check => check === true)){
            return true
        }
    }
    return false
}

function requestMove(move) {
    for (let i = 0; i < availableMoves.length; i++) {
        if (availableMoves[i].equals(move)) {
            applyMove(move);
        }
    }
}

function applyMove(move) {
    board[move.startPos[0]][move.startPos[1]] = Piece.NONE;
    board[move.endPos[0]][move.endPos[1]] = move.piece;
    gamePositions.push(boardToFen(board));
    viewingGamePosition = gamePositions.length - 1;
    moveSound.play();
    deselectPiece();
    changeTurn();
}

function changeTurn() {
    if (currentTurn == turn.WHITE)
        currentTurn = turn.BLACK;
    else
        currentTurn = turn.WHITE;
}

function deselectPiece() {
    selectedPiece.piece = -1;
    selectedPiece.xPos = -1;
    selectedPiece.yPos = -1;
}

function cancelMove() {
    board[selectedPiece.yPos][selectedPiece.xPos] = selectedPiece.piece;
    deselectPiece();
}

function getMatrixPos() {
    return [roundToHundred(mouseY) / (size / 8), roundToHundred(mouseX) / (size / 8)];
}

function roundToHundred(n) {
    return Math.floor(n / (size / 8)) * (size / 8);
}

function pieceToImage(piece) {
    let img;
    switch (piece) {
        case 1:
            img = whitePawn;
            break;
        case 2:
            img = whiteBishop;
            break;
        case 3:
            img = whiteKnight;
            break;
        case 4:
            img = whiteRook;
            break;
        case 5:
            img = whiteQueen;
            break;
        case 6:
            img = whiteKing;
            break;
        case 11:
            img = blackPawn;
            break;
        case 12:
            img = blackBishop;
            break;
        case 13:
            img = blackKnight;
            break;
        case 14:
            img = blackRook;
            break;
        case 15: 
            img = blackQueen;
            break;
        case 16:
            img = blackKing;
            break;
        default:
            return null;
    }

    return img;
}

function drawBoard() {
    rectMode(CORNER);
    fill(191,164,129);
    noStroke();
    background(123,88,62);
    for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
            if ((file + rank) % 2 == 0) {
                rect(file * (size / 8), rank * (size / 8), size/8);
            }
        }
    }
}

function drawPieces() {
    let offset = 5;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            x = i * (size / 8) + offset + (pieceSize / 2);
            y = j * (size / 8) + offset + (pieceSize / 2);

            drawPiece(board[i][j], x, y);
        }
    }
}

function drawPiece(piece, x, y) {
    if (pieceToImage(piece) != null) {
        imageMode(CENTER);
        
        image(pieceToImage(piece), y, x, pieceSize, pieceSize);
    }
}

let Piece = {
    NONE: 0,
    PAWN: 1,
    BISHOP: 2,
    KNIGHT: 3,
    ROOK: 4,
    QUEEN: 5,
    KING: 6,
    BLACK: 10,
}

function boardToFen(someBoard) {
    /** example board:
     *  0: (8) [4, 3, 2, 6, 5, 2, 3, 4]
        1: (8) [1, 1, 1, 1, 1, 1, 1, 1]
        2: (8) [0, 0, 0, 0, 0, 0, 0, 0]
        3: (8) [0, 0, 0, 0, 0, 0, 0, 0]
        4: (8) [0, 0, 0, 0, 0, 0, 0, 0]
        5: (8) [0, 0, 0, 0, 0, 0, 0, 0]
        6: (8) [11, 11, 11, 11, 11, 11, 11, 11]
        7: (8) [14, 13, 12, 16, 15, 12, 13, 14]
     */
    let code = "";
    let pieceFromNumber = {}; pieceFromNumber[Piece.PAWN] = "p"; pieceFromNumber[Piece.KNIGHT] = "n"; pieceFromNumber[Piece.BISHOP] = "b"; 
                                 pieceFromNumber[Piece.ROOK] = "r"; pieceFromNumber[Piece.QUEEN] = "q"; pieceFromNumber[Piece.KING] = "k"; 

    for (let i = 0; i < someBoard.length; i++) {
        let spacesCounter = 0;
        for (let j = 0; j < someBoard.length; j++) {
            let character = someBoard[i][j] + "";
            let isCaps = false;

            if (!Number.isNaN(parseInt(character))) {
                if (parseInt(character) == 0)
                    spacesCounter++;
                else {
                    if (parseInt(character) > 10) {
                        isCaps = true;
                        character = character - 10;
                    }
                    if (spacesCounter > 0) {
                        code += spacesCounter;
                        spacesCounter = 0;
                    }
                    if (isCaps) {
                        code += pieceFromNumber[parseInt(character)].toUpperCase();
                    }
                    else
                        code += pieceFromNumber[parseInt(character)];
                }
            }
        }
        if (spacesCounter > 0) {
            code += spacesCounter;
                        spacesCounter = 0;
        }
        code += "/";
    }
    code = code.substring(0, code.length - 1);
    return code;
}

function FenToBoard(code) {
    // example code: "rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR"
    let currentBoard = [];
    let rank = 0;
    let file = 0;
    for (let i = 0; i < 8; i++) {
        currentBoard[i] = new Array(8).fill(0);
    }
    let pieceFromCharacter = {}; pieceFromCharacter["p"] = Piece.PAWN; pieceFromCharacter["n"] = Piece.KNIGHT; pieceFromCharacter["b"] = Piece.BISHOP; 
                                 pieceFromCharacter["r"] = Piece.ROOK; pieceFromCharacter["q"] = Piece.QUEEN; pieceFromCharacter["k"] = Piece.KING; 

    while (code.length > 0) {
        let character = code[0];
        code = code.substring(1);
        let currentPiece = 0;

        if (character == "/") {
            rank += 1;
            file = 0;
        }
        else if (!Number.isNaN(parseInt(character))) { // if character is a number - indicating an amount of spaces
            file += parseInt(character);
        } else {
            if (character == character.toUpperCase()) {
                currentPiece = pieceFromCharacter[character.toLowerCase()] + Piece.BLACK;
            }
            else {
                currentPiece = pieceFromCharacter[character.toLowerCase()];
            }

            currentBoard[rank][file] = currentPiece;
            file++;
        }
    }   

    return currentBoard;
}