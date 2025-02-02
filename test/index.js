(async () => {
    // Import required modules
    const { Chess } = require('chess.js');
    const ChessCreator = require('../src');

    // Initialize ChessCreator with customized configuration
    const chessBoard = new ChessCreator({
        size: 720,              // Set board size
        style: 'space',         // Set board style (options: 'space', 'classic', etc.)
        boardStyle: 'stone'     // Set board texture (options: 'stone', 'wood', etc.)
    });

    // Initialize a new chess game
    const chess = new Chess();
    
    // Load the initial chess position using FEN (Forsyth-Edwards Notation)
    chessBoard.loadFEN(chess.fen());

    // Define player details for avatars and names
    const playerOne = {
        name: "Cyclone",
        avatar: 'https://cdn.discordapp.com/avatars/408785106942164992/1a449430e3a9a830efebb8c57917f943.png?size=4096'
    };
    const playerTwo = {
        name: "K1NG",
        avatar: 'https://cdn.discordapp.com/avatars/841319721860988931/0f5980d4b3824db0806069beec97e114.png?size=256'
    };

    // Generate the initial chess board image and save it
    const boardImage = chessBoard.generatePNG('./chess-board.png', playerOne, playerTwo, 1);

    // Variable to track the player's turn
    let turn = 2; // Start with player two

    // Function to make a random move in the chess game
    function makeRandomMove() {
        const possibleMoves = chess.moves();  // Get all possible moves
        if (possibleMoves.length === 0) return; // If no moves are available, return

        const randomIdx = Math.floor(Math.random() * possibleMoves.length);  // Select a random move
        chess.move(possibleMoves[randomIdx]);  // Apply the move
        
        // Update the chess board with the new FEN after the move
        chessBoard.loadFEN(chess.fen());

        // Generate the updated chess board image and save it
        chessBoard.generatePNG('./chess-board.png', playerOne, playerTwo, turn);

        // Switch turns between the two players
        turn = 3 - turn;
    }

    // Set an interval to make a random move every 10 seconds
    setInterval(makeRandomMove, 10000);
})();
