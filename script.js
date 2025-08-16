
class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.gameStatus = 'playing';
    this.boardElement = document.getElementById('chess-board');
    this.currentPlayerElement = document.getElementById('current-player');
    this.gameStatusElement = document.getElementById('game-status');
    
    this.pieceUnicode = {
      'white': {
        'king': '♔',
        'queen': '♕',
        'rook': '♖',
        'bishop': '♗',
        'knight': '♘',
        'pawn': '♙'
      },
      'black': {
        'king': '♚',
        'queen': '♛',
        'rook': '♜',
        'bishop': '♝',
        'knight': '♞',
        'pawn': '♟'
      }
    };
    
    this.initializeGame();
  }
  
  initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place black pieces
    board[0] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({type: piece, color: 'black'}));
    board[1] = Array(8).fill({type: 'pawn', color: 'black'});
    
    // Place white pieces
    board[7] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(piece => ({type: piece, color: 'white'}));
    board[6] = Array(8).fill({type: 'pawn', color: 'white'});
    
    return board;
  }
  
  initializeGame() {
    this.renderBoard();
    this.updateUI();
    document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
  }
  
  renderBoard() {
    this.boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.row = row;
        square.dataset.col = col;
        
        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement('span');
          pieceElement.className = 'piece';
          pieceElement.textContent = this.pieceUnicode[piece.color][piece.type];
          square.appendChild(pieceElement);
        }
        
        square.addEventListener('click', () => this.handleSquareClick(row, col));
        this.boardElement.appendChild(square);
      }
    }
  }
  
  handleSquareClick(row, col) {
    if (this.gameStatus !== 'playing') return;
    
    const clickedPiece = this.board[row][col];
    
    if (this.selectedSquare === null) {
      // Select a piece
      if (clickedPiece && clickedPiece.color === this.currentPlayer) {
        this.selectedSquare = {row, col};
        this.highlightSquare(row, col);
        this.showPossibleMoves(row, col);
      }
    } else {
      // Try to move the selected piece
      const {row: fromRow, col: fromCol} = this.selectedSquare;
      
      if (row === fromRow && col === fromCol) {
        // Deselect the piece
        this.clearHighlights();
        this.selectedSquare = null;
      } else if (this.isValidMove(fromRow, fromCol, row, col)) {
        this.makeMove(fromRow, fromCol, row, col);
        this.clearHighlights();
        this.selectedSquare = null;
        this.switchPlayer();
        this.checkGameStatus();
      } else {
        // Select a different piece of the same color
        if (clickedPiece && clickedPiece.color === this.currentPlayer) {
          this.clearHighlights();
          this.selectedSquare = {row, col};
          this.highlightSquare(row, col);
          this.showPossibleMoves(row, col);
        } else {
          this.clearHighlights();
          this.selectedSquare = null;
        }
      }
    }
  }
  
  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const targetPiece = this.board[toRow][toCol];
    
    // Can't capture own piece
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }
    
    // Check if move is within bounds
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
      return false;
    }
    
    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
      case 'rook':
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
      case 'bishop':
        return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
      case 'king':
        return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
      default:
        return false;
    }
  }
  
  isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    const targetPiece = this.board[toRow][toCol];
    
    // Move forward
    if (fromCol === toCol) {
      if (fromRow + direction === toRow && !targetPiece) {
        return true;
      }
      if (fromRow === startRow && fromRow + 2 * direction === toRow && !targetPiece) {
        return true;
      }
    }
    
    // Capture diagonally
    if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow && targetPiece) {
      return true;
    }
    
    return false;
  }
  
  isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }
  
  isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }
  
  isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
           this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
  }
  
  isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
  }
  
  isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(fromRow - toRow);
    const colDiff = Math.abs(fromCol - toCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }
  
  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowDirection = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colDirection = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowDirection;
      currentCol += colDirection;
    }
    
    return true;
  }
  
  makeMove(fromRow, fromCol, toRow, toCol) {
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;
    this.renderBoard();
  }
  
  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    this.updateUI();
  }
  
  highlightSquare(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.classList.add('selected');
  }
  
  showPossibleMoves(row, col) {
    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        if (this.isValidMove(row, col, toRow, toCol)) {
          const square = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
          const targetPiece = this.board[toRow][toCol];
          if (targetPiece && targetPiece.color !== this.currentPlayer) {
            square.classList.add('capture-move');
          } else {
            square.classList.add('possible-move');
          }
        }
      }
    }
  }
  
  clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('selected', 'possible-move', 'capture-move');
    });
  }
  
  checkGameStatus() {
    // Basic game status - could be expanded with checkmate detection
    const kings = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king') {
          kings.push(piece.color);
        }
      }
    }
    
    if (kings.length < 2) {
      this.gameStatus = 'ended';
      this.gameStatusElement.textContent = `Game Over! ${kings[0] ? kings[0].charAt(0).toUpperCase() + kings[0].slice(1) + ' wins!' : 'Draw!'}`;
    }
  }
  
  updateUI() {
    this.currentPlayerElement.textContent = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
    if (this.gameStatus === 'playing') {
      this.gameStatusElement.textContent = 'Game in progress';
    }
  }
  
  resetGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.gameStatus = 'playing';
    this.clearHighlights();
    this.renderBoard();
    this.updateUI();
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new ChessGame();
});
