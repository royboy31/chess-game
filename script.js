const chessboard = document.getElementById('chessboard');
    let selectedPiece = null;
    let selectedSquare = null;
    let isWhiteTurn = true;
    const pieces = {
      'a8': '♜', 'b8': '♞', 'c8': '♝', 'd8': '♛', 'e8': '♚', 'f8': '♝', 'g8': '♞', 'h8': '♜',
      'a7': '♟', 'b7': '♟', 'c7': '♟', 'd7': '♟', 'e7': '♟', 'f7': '♟', 'g7': '♟', 'h7': '♟',
      'a2': '♙', 'b2': '♙', 'c2': '♙', 'd2': '♙', 'e2': '♙', 'f2': '♙', 'g2': '♙', 'h2': '♙',
      'a1': '♖', 'b1': '♘', 'c1': '♗', 'd1': '♕', 'e1': '♔', 'f1': '♗', 'g1': '♘', 'h1': '♖'
    };

    const pieceValues = {
      '♟': 1, '♙': 1,
      '♞': 3, '♘': 3,
      '♝': 3, '♗': 3,
      '♜': 5, '♖': 5,
      '♛': 9, '♕': 9,
      '♚': 0, '♔': 0
    };

    function createChessboard() {
      for (let row = 8; row >= 1; row--) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          const file = String.fromCharCode(97 + col);
          const rank = row;
          const squareId = `${file}${rank}`;
          
          square.classList.add('square');
          square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
          square.id = squareId;
          square.addEventListener('click', handleSquareClick);

          if (pieces[squareId]) {
            const piece = document.createElement('div');
            piece.classList.add('piece');
            piece.textContent = pieces[squareId];
            piece.dataset.position = squareId;
            piece.dataset.color = pieces[squareId].charCodeAt(0) > 9817 ? 'white' : 'black';
            square.appendChild(piece);
          }

          chessboard.appendChild(square);
        }
      }
    }

    function handleSquareClick(event) {
      const square = event.currentTarget;
      const piece = square.querySelector('.piece');
      
      if (selectedPiece) {
        if (isValidMove(selectedSquare, square.id)) {
          movePiece(selectedSquare, square.id);
          isWhiteTurn = !isWhiteTurn;
        }
        selectedPiece = null;
        selectedSquare = null;
        clearHighlights();
      } else if (piece && ((isWhiteTurn && piece.dataset.color === 'white') || 
                          (!isWhiteTurn && piece.dataset.color === 'black'))) {
        selectedPiece = piece;
        selectedSquare = square.id;
        highlightSquare(square);
        highlightPossibleMoves(square.id);
      }
    }

    function isValidMove(from, to) {
      const fromSquare = document.getElementById(from);
      const toSquare = document.getElementById(to);
      const piece = fromSquare.querySelector('.piece');
      const targetPiece = toSquare.querySelector('.piece');
      
      if (!piece) return false;
      if (targetPiece && targetPiece.dataset.color === piece.dataset.color) return false;
      
      const fromFile = from.charCodeAt(0) - 96;
      const fromRank = Number(from[1]);
      const toFile = to.charCodeAt(0) - 96;
      const toRank = Number(to[1]);
      const dx = Math.abs(toFile - fromFile);
      const dy = Math.abs(toRank - fromRank);
      
      switch (piece.textContent) {
        case '♙': // White pawn
          if (fromFile === toFile) {
            if (fromRank === 2 && (dy === 1 || dy === 2)) return true;
            if (fromRank !== 2 && dy === 1) return true;
          } else if (dx === 1 && dy === 1 && targetPiece) return true;
          break;
          
        case '♟': // Black pawn
          if (fromFile === toFile) {
            if (fromRank === 7 && (dy === 1 || dy === 2)) return true;
            if (fromRank !== 7 && dy === 1) return true;
          } else if (dx === 1 && dy === 1 && targetPiece) return true;
          break;
          
        case '♘': case '♞': // Knight
          return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
          
        case '♗': case '♝': // Bishop
          return dx === dy && isPathClear(from, to);
          
        case '♖': case '♜': // Rook
          return (dx === 0 || dy === 0) && isPathClear(from, to);
          
        case '♕': case '♛': // Queen
          return (dx === dy || dx === 0 || dy === 0) && isPathClear(from, to);
          
        case '♔': case '♚': // King
          return dx <= 1 && dy <= 1;
      }
      
      return false;
    }

    function isPathClear(from, to) {
      const fromFile = from.charCodeAt(0);
      const fromRank = Number(from[1]);
      const toFile = to.charCodeAt(0);
      const toRank = Number(to[1]);
      
      const dx = Math.sign(toFile - fromFile);
      const dy = Math.sign(toRank - fromRank);
      
      let x = fromFile + dx;
      let y = fromRank + dy;
      
      while (x !== toFile || y !== toRank) {
        const square = document.getElementById(String.fromCharCode(x) + y);
        if (square.querySelector('.piece')) return false;
        x += dx;
        y += dy;
      }
      
      return true;
    }

    function movePiece(from, to) {
      const fromSquare = document.getElementById(from);
      const toSquare = document.getElementById(to);
      const piece = fromSquare.querySelector('.piece');
      
      // Remove any existing piece in target square
      if (toSquare.querySelector('.piece')) {
        toSquare.removeChild(toSquare.querySelector('.piece'));
      }
      
      // Move the piece
      toSquare.appendChild(piece);
      piece.dataset.position = to;
    }

    function highlightSquare(square) {
      square.style.border = '2px solid yellow';
    }

    function highlightPossibleMoves(squareId) {
      const square = document.getElementById(squareId);
      const piece = square.querySelector('.piece');
      if (!piece) return;
      
      for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
          const targetSquare = document.getElementById(String.fromCharCode(96 + col) + row);
          if (isValidMove(squareId, targetSquare.id)) {
            targetSquare.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
          }
        }
      }
    }

    function clearHighlights() {
      document.querySelectorAll('.square').forEach(square => {
        square.style.border = '';
        square.style.backgroundColor = '';
      });
    }

    createChessboard();
