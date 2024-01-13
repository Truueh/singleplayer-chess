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
    turn = {
        WHITE: "white",
        BLACK: "black",
    };
    whitePawns = new Array(8).fill(false);
    blackPawns = new Array(8).fill(false);
    currentTurn = turn.WHITE;
    lastMove = [new Array(2).fill(new Array(2).fill(-1))];
    kingsMoved = [false, false]; // 0 = white
    whiteRooksMoved = [false, false]; // 0 = left
    blackRooksMoved = [false, false]; // 0 = left
    pieceSize = size / 9;
    moveSound.setVolume(0.5);

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
        if (matrixContains(getAvailableMoves(), [getMatrixPos()[0], getMatrixPos()[1]])) {
            applyMove(); deselectPiece();
            return;
        }
        
        cancelMove();
    }
}

function getAvailableMoves() {
    let availableSquares = [];
    let modifier = 1;
    let y = selectedPiece.yPos; let x = selectedPiece.xPos;
    let targetSquare = [getMatrixPos()[0], getMatrixPos()[1]];
    if (selectedPiece.piece > 10)
        modifier = -1;

    // If correct turn
    if (selectedPiece.piece < 10 && currentTurn == turn.BLACK || (selectedPiece.piece > 10 && currentTurn == turn.WHITE))
        return availableSquares;
    
    // PAWN MOVEMENT
    if (selectedPiece.piece == piece.PAWN || selectedPiece.piece == piece.PAWN + piece.BLACK) {
        // Eat moves
        if (y - modifier >= 0 && y - modifier < 8) {
            if (board[y - modifier][x - modifier] != 0) {
                if ((selectedPiece.piece < 10 && board[y - modifier][x - modifier] > 10) || (selectedPiece.piece > 10 && board[y - modifier][x - modifier] < 10)) {
                    availableSquares.push([y - modifier, x - modifier]);
                }
            }
        }
        if (y - modifier >= 0 && x + modifier >= 0) {
            if (board[y - modifier][x + modifier] != 0) {
                if ((selectedPiece.piece < 10 && board[y - modifier][x + modifier] > 10) || (selectedPiece.piece > 10 && board[y - modifier][x + modifier] < 10)) {
                    availableSquares.push([y - modifier, x + modifier]);
                }
            }
        }

        // Position moves
        if (y - modifier >= 0 && y - modifier < 8 && board[y - modifier][x] == 0) {
            availableSquares.push([y - modifier, x]);
        }
        else
            return availableSquares;
        if (y - (2 * modifier) >= 0 && y - (2 * modifier) < 8 && board[y - (2 * modifier)][x] == 0) {
            if (modifier == 1 && !whitePawns[x] || (modifier == -1 && !blackPawns[x])) {
                availableSquares.push([y - (2 * modifier), x]);
            }   
        }
    }

    // ROOK & QUEEN MOVEMENT
    if (selectedPiece.piece == piece.ROOK || selectedPiece.piece == piece.ROOK + piece.BLACK || selectedPiece.piece == piece.QUEEN || selectedPiece.piece == piece.QUEEN + piece.BLACK) {
        for (let i = 1;i < y + 1; i++) { // up
            if (board[y - i][x] != 0) {
                if ((selectedPiece.piece > 10 && board[y - i][x] < 10) || (selectedPiece.piece < 10 && board[y - i][x] > 10)) {
                    availableSquares.push([y - i, x]);
                }
                break;
            }

            availableSquares.push([y - i, x]);
        } // down
        for (let i = 1;i < 8 - y; i++) { // down
            if (board[y + i][x] != 0) {
                if ((selectedPiece.piece > 10 && board[y + i][x] < 10) || (selectedPiece.piece < 10 && board[y + i][x] > 10)) {
                    availableSquares.push([y + i, x]);
                }
                break;
            }

            availableSquares.push([y + i, x]);
        }
        for (let i = 1;i < x + 1; i++) { // left
            if (board[y][x - i] != 0) {
                if ((selectedPiece.piece > 10 && board[y][x - i] < 10) || (selectedPiece.piece < 10 && board[y][x - i] > 10)) {
                    availableSquares.push([y, x - i]);
                }
                break;
            }

            availableSquares.push([y, x - i]);
        }
        for (let i = 1;i < 8 - x; i++) { // right
            if (board[y][x + i] != 0) {
                if ((selectedPiece.piece > 10 && board[y][x + i] < 10) || (selectedPiece.piece < 10 && board[y][x + i] > 10)) {
                    availableSquares.push([y, x + i]);
                }
                break;
            }

            availableSquares.push([y, x + i]);
        }
    }

    // KNIGHT MOVEMENT
    if (selectedPiece.piece == piece.KNIGHT || selectedPiece.piece == piece.KNIGHT + piece.BLACK) {
          // up + left
        if (y - 2 >= 0 && x - 1 >= 0) {
            if (board[y - 2][x - 1] == 0) {
                availableSquares.push([y - 2,x - 1]);
            }
            else if ((selectedPiece.piece > 10 && board[y - 2][x - 1] < 10) || (selectedPiece.piece < 10 && board[y - 2][x - 1] > 10)) {
                availableSquares.push([y - 2,x - 1]);
            }
        } // up + right
        if (y - 2 >= 0 && x + 1 < 8) {
            if (board[y - 2][x + 1] == 0)
                availableSquares.push([y - 2,x + 1]);
            else if ((selectedPiece.piece > 10 && board[y - 2][x + 1] < 10) || (selectedPiece.piece < 10 && board[y - 2][x + 1] > 10)) {
                availableSquares.push([y - 2, x + 1]);
            }
        } // down + left
        if (y + 2 < 8 && x - 1 >= 0) {
            if (board[y + 2][x - 1] == 0) {
                availableSquares.push([y + 2,x - 1]);
            }
            else if ((selectedPiece.piece > 10 && board[y + 2][x - 1] < 10) || (selectedPiece.piece < 10 && board[y + 2][x - 1] > 10)) {
                availableSquares.push([y + 2, x - 1]);
            }
        } // down + right
        if (y + 2 < 8 && x + 1 >= 0) {
            if (board[y + 2][x + 1] == 0) {
                availableSquares.push([y + 2, x + 1]);
            }
            else if ((selectedPiece.piece > 10 && board[y + 2][x + 1] < 10) || (selectedPiece.piece < 10 && board[y + 2][x + 1] > 10)) {
                availableSquares.push([y + 2, x + 1]);
            }
        } // left + up
        if (x - 2 >= 0 && y - 1 >= 0) {
            if (board[y - 1][x - 2] == 0) {
                availableSquares.push([y - 1, x - 2]);
            }
            else if ((selectedPiece.piece > 10 && board[y - 1][x - 2] < 10) || (selectedPiece.piece < 10 && board[y - 1][x - 2] > 10)) {
                availableSquares.push([y - 1, x - 2]);
            }
        } // left + down
        if (x - 2 >= 0 && y + 1 < 8) {
            if (board[y + 1][x - 2] == 0) {
                availableSquares.push([y + 1, x - 2]);
            }
            else if ((selectedPiece.piece > 10 && board[y + 1][x - 2] < 10) || (selectedPiece.piece < 10 && board[y + 1][x - 2] > 10)) {
                availableSquares.push([y + 1, x - 2]);
            }
        } // right + up
        if (x + 2 < 8 && y - 1 >= 0) {
            if (board[y - 1][x + 2] == 0) {
                availableSquares.push([y - 1, x + 2]);
            }
            else if ((selectedPiece.piece > 10 && board[y - 1][x + 2] < 10) || (selectedPiece.piece < 10 && board[y - 1][x + 2] > 10)) {
                availableSquares.push([y - 1, x + 2]);
            }
        } // right + down
        if (x + 2 < 8 && y + 1 < 8) {
            if (board[y + 1][x + 2] == 0) {
                availableSquares.push([y + 1, x + 2]);
            }
            else if ((selectedPiece.piece > 10 && board[y + 1][x + 2] < 10) || (selectedPiece.piece < 10 && board[y + 1][x + 2] > 10)) {
                availableSquares.push([y + 1, x + 2]);
            }
        }
    }

    // BISHOP & QUEEN MOVEMENT
    if (selectedPiece.piece == piece.BISHOP || selectedPiece.piece == piece.BISHOP + piece.BLACK || selectedPiece.piece == piece.QUEEN || selectedPiece.piece == piece.QUEEN + piece.BLACK) {
        for (let i = 1; i < 8; i++) {
            if (y + i < 8 && x + i < 8) {
                if (board[y + i][x + i] != 0) {       
                    if ((selectedPiece.piece > 10 && board[y + i][x + i] < 10) || (selectedPiece.piece < 10 && board[y + i][x + i] > 10)) {
                        availableSquares.push([y + i, x + i]);
                    }
                    break;
                }
                availableSquares.push([y + i, x + i]);
            } 
        }
        for (let i = 1; i < 8; i++) {
            if (y - i >= 0 && x - i >= 0) {
                if (board[y - i][x - i] != 0) {
                    if ((selectedPiece.piece > 10 && board[y - i][x - i] < 10) || (selectedPiece.piece < 10 && board[y - i][x - i] > 10)) {
                        availableSquares.push([y - i, x - i]);
                    }
                    break;
                }
                availableSquares.push([y - i, x - i]);
            } 
        }
        for (let i = 1; i < 8; i++) {
            if (y - i >= 0 && x + i < 8) {
                if (board[y - i][x + i] != 0) {
                    if ((selectedPiece.piece > 10 && board[y - i][x + i] < 10) || (selectedPiece.piece < 10 && board[y - i][x + i] > 10)) {
                        availableSquares.push([y - i, x + i]);
                    }
                    break;
                }
                    availableSquares.push([y - i, x + i]);
            } 
        }
        for (let i = 1; i < 8; i++) {
            if (y + i < 8 && x - i >= 0) {
                if (board[y + i][x - i] != 0) {
                    if ((selectedPiece.piece > 10 && board[y + i][x - i] < 10) || (selectedPiece.piece < 10 && board[y + i][x - i] > 10)) {
                        availableSquares.push([y + i, x - i]);
                    }
                    break;
                }
                availableSquares.push([y + i, x - i]);
            } 
        }
    }

    // KING MOVEMENT
    if (selectedPiece.piece == piece.KING || selectedPiece.piece == piece.KING + piece.BLACK) {
        if (y + 1 < 8) {
            if (board[y + 1][x] == 0 || ((selectedPiece.piece > 10 && board[y + 1][x] < 10) || (selectedPiece.piece < 10 && board[y + 1][x] > 10))) { // down
                availableSquares.push([y + 1, x]);
        }
        } if (y - 1 >= 0) { // up
            if (board[y - 1][x] == 0 || ((selectedPiece.piece > 10 && board[y - 1][x] < 10) || (selectedPiece.piece < 10 && board[y - 1][x] > 10)))
                availableSquares.push([y - 1, x]);
        } if (x + 1 < 8) { // right
            if (board[y][x + 1] == 0 || ((selectedPiece.piece > 10 && board[y][x + 1] < 10) || (selectedPiece.piece < 10 && board[y][x + 1] > 10)))
                availableSquares.push([y, x + 1]);
        } if (x - 1 >= 0) { // left
            if (board[y][x - 1] == 0 || ((selectedPiece.piece > 10 && board[y][x - 1] < 10) || (selectedPiece.piece < 10 && board[y][x - 1] > 10)))
                availableSquares.push([y, x - 1]);
        } if (x + 1 < 8 && y + 1 < 8) { // down right
            if (board[y + 1][x + 1] == 0 || ((selectedPiece.piece > 10 && board[y + 1][x + 1] < 10) || (selectedPiece.piece < 10 && board[y + 1][x + 1] > 10)))
                availableSquares.push([y + 1, x + 1])
        } if (x - 1 >= 0 && y + 1 < 8) { // down left
            if (board[y + 1][x - 1] == 0 || ((selectedPiece.piece > 10 && board[y + 1][x - 1] < 10) || (selectedPiece.piece < 10 && board[y + 1][x - 1] > 10)))
                availableSquares.push([y + 1, x - 1])
        } if (x - 1 >= 0 && y - 1 >= 0) { // left up
            if (board[y - 1][x - 1] == 0 || ((selectedPiece.piece > 10 && board[y - 1][x - 1] < 10) || (selectedPiece.piece < 10 && board[y - 1][x - 1] > 10)))
                availableSquares.push([y - 1, x - 1])
        } if (x + 1 < 8 && y - 1 >= 0) { // right up
            if (board[y - 1][x + 1] == 0 || ((selectedPiece.piece > 10 && board[y - 1][x + 1] < 10) || (selectedPiece.piece < 10 && board[y - 1][x + 1] > 10)))
                availableSquares.push([y - 1, x + 1])
        }
    }

    // CASTLING
    if (selectedPiece.piece == piece.KING) { // white king castle
        if (!kingsMoved[0]) { // if white king hasn't moved
            if (targetSquare[1] == 6) { // short side castling
                if (!whiteRooksMoved[1]) {
                    if (board[targetSquare[0]][targetSquare[1]] == 0 && board[targetSquare[0]][targetSquare[1] - 1] == 0) { // if space between rook and king is empty
                        availableSquares.push(targetSquare);
                    }
                }
            } else if (targetSquare[1] == 1) {
                if (!whiteRooksMoved[0]) { // long side castling
                    if (board[targetSquare[0]][targetSquare[1]] == 0 && board[targetSquare[0]][targetSquare[1] + 1] == 0 && board[targetSquare[0]][targetSquare[1] + 2] == 0) { // if space between rook and king is empty
                        availableSquares.push(targetSquare);
                    }
                }
            }
        }
    } else if (selectedPiece.piece == piece.KING + piece.BLACK) { // black king castle
        if (!kingsMoved[1]) { // if black king hasn't moved
            if (targetSquare[1] == 6) { // short side castling
                if (!blackRooksMoved[1]) {
                    if (board[targetSquare[0]][targetSquare[1]] == 0 && board[targetSquare[0]][targetSquare[1] - 1] == 0) { // if space between rook and king is empty
                        availableSquares.push(targetSquare);
                    }
                }
            } else if (targetSquare[1] == 1) { // long side castling
                if (!blackRooksMoved[0]) {
                    if (board[targetSquare[0]][targetSquare[1]] == 0 && board[targetSquare[0]][targetSquare[1] + 1] == 0 && board[targetSquare[0]][targetSquare[1] + 2] == 0) { // if space between rook and king is empty
                        availableSquares.push(targetSquare);
                    }
                }
            }
        }
    }

    return availableSquares;
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

function applyMove() {
    // variables
    let targetSquare = [getMatrixPos()[0], getMatrixPos()[1]];
    let modifier = 0; if (selectedPiece.piece > piece.BLACK) modifier = piece.BLACK;

    board = FenToBoard(gamePositions[gamePositions.length - 1]);
    viewingGamePosition = gamePositions.length - 1;
    
    // handle pawn first moves
    if (selectedPiece.piece == piece.PAWN)
        whitePawns[selectedPiece.xPos] = true;
    else if (selectedPiece.piece == piece.PAWN + piece.BLACK)
        blackPawns[selectedPiece.xPos] = true;

    // color changes
    lastMove.push([[selectedPiece.yPos, selectedPiece.xPos], targetSquare])

    // handle castling
    if (selectedPiece.piece == piece.KING || selectedPiece.piece == piece.KING + piece.BLACK) {
        if (targetSquare[1] == 6 && ((selectedPiece.piece < 10 && !kingsMoved[0]) || (selectedPiece.piece > 10 && !kingsMoved[1]))) { // short side castling
            board[targetSquare[0]][targetSquare[1]] = piece.KING + modifier;
            board[targetSquare[0]][targetSquare[1] - 1] = piece.ROOK + modifier;
            board[targetSquare[0]][targetSquare[1] + 1] = piece.NONE + modifier;
            
            deselectPiece();
            changeTurn();
            if (selectedPiece.piece > piece.BLACK) {
                kingsMoved[1] = true; blackRooksMoved[0] = true;
            } else {
                kingsMoved[0] = true; whiteRooksMoved[0] = true;
            }

            gamePositions.push(boardToFen(board));
            viewingGamePosition++;
            moveSound.play();
            return;
        }
        else if (targetSquare[1] == 1 && ((selectedPiece.piece < 10 && !kingsMoved[0]) || (selectedPiece.piece > 10 && !kingsMoved[1]))) { // long side castling
            board[targetSquare[0]][2] = piece.KING + modifier;
            board[targetSquare[0]][3] = piece.ROOK + modifier;
            board[targetSquare[0]][0] = piece.NONE + modifier;
                
            deselectPiece();
            changeTurn();
            if (selectedPiece.piece > piece.BLACK) {
                kingsMoved[1] = true; blackRooksMoved[0] = true;
            } else {
                kingsMoved[0] = true; whiteRooksMoved[0] = true;
            }

            gamePositions.push(boardToFen(board));
            viewingGamePosition++;
            moveSound.play();
            return;
        }
    }

    // handle castling - rooks and kings movement
    if (selectedPiece.piece == piece.KING && !kingsMoved[0]) {
        kingsMoved[0] = true;
    } else if (selectedPiece.piece == piece.KING + piece.BLACK && !kingsMoved[1]) {
        kingsMoved[1] = true;
    } else if (selectedPiece.piece == piece.ROOK && selectedPiece.xPos == 0 && !whiteRooksMoved[0]) {
        whiteRooksMoved[0] = true;
    } else if (selectedPiece.piece == piece.ROOK && selectedPiece.xPos == 7 && !whiteRooksMoved[1]) {
        whiteRooksMoved[1] = true;
    } else if (selectedPiece.piece == piece.ROOK + piece.BLACK && selectedPiece.xPos == 0 && !blackRooksMoved[0]) {
        blackRooksMoved[0] = true;
    } else if (selectedPiece.piece == piece.ROOK + piece.BLACK && selectedPiece.xPos == 7 && !blackRooksMoved[1]) {
        blackRooksMoved[1] = true;
    }

    // set changes
    board[selectedPiece.yPos][selectedPiece.xPos] = piece.NONE;
    board[getMatrixPos()[0]][getMatrixPos()[1]] = selectedPiece.piece;
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

let piece = {
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
    let pieceFromNumber = {}; pieceFromNumber[piece.PAWN] = "p"; pieceFromNumber[piece.KNIGHT] = "n"; pieceFromNumber[piece.BISHOP] = "b"; 
                                 pieceFromNumber[piece.ROOK] = "r"; pieceFromNumber[piece.QUEEN] = "q"; pieceFromNumber[piece.KING] = "k"; 

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
    let pieceFromCharacter = {}; pieceFromCharacter["p"] = piece.PAWN; pieceFromCharacter["n"] = piece.KNIGHT; pieceFromCharacter["b"] = piece.BISHOP; 
                                 pieceFromCharacter["r"] = piece.ROOK; pieceFromCharacter["q"] = piece.QUEEN; pieceFromCharacter["k"] = piece.KING; 

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
                currentPiece = pieceFromCharacter[character.toLowerCase()] + piece.BLACK;
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