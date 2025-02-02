# Discord Chess Canvas

A simple yet powerful package for creating chess boards and generating images for Discord.

## Installation

To install the package, run the following command:

```bash
npm install dc-chess-canvas
```

## Usage

### 1. `generatePNG`

```javascript
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

```

### 2. `generateBuffer` for Discord

```javascript
const { Client, GatewayIntentBits } = require('discord.js');
const { Chess } = require('chess.js');
const ChessCreator = require('chess-creator');
const { AttachmentBuilder } = require('discord.js');

(async () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    await client.login('YOUR_BOT_TOKEN'); // Replace with your bot's token

    const canvas = new ChessCreator({
        size: 720,
        style: 'space',
        boardStyle: 'stone'
    });
    const chess = new Chess();
    canvas.loadFEN(chess.fen());

    const playerOne = {
        name: "Cyclone",
        avatar: 'https://cdn.discordapp.com/avatars/408785106942164992/1a449430e3a9a830efebb8c57917f943.png?size=4096'
    };
    const playerTwo = {
        name: "K1NG",
        avatar: 'https://cdn.discordapp.com/avatars/841319721860988931/0f5980d4b3824db0806069beec97e114.png?size=4096'
    };

    const buffer = await canvas.generateBuffer(playerOne, playerTwo, 1);

    let turn = 2;

    client.on('messageCreate', async (message) => {
        if (message.content === '!start') { // Start the chess game when the command is given
            const sendM = await message.channel.send({content: 3 - turn, files:[new AttachmentBuilder(buffer, { name: 'cycloid-chess.png' })]});

            async function makeRandomMove() {
                var possibleMoves = chess.moves();
                var randomIdx = Math.floor(Math.random() * possibleMoves.length);
                chess.move(possibleMoves[randomIdx]);

                canvas.loadFEN(chess.fen());
                turn = 3 - turn;

                const autoBuffer = await canvas.generateBuffer(playerOne, playerTwo, turn);
                sendM.then(newmsg => {
                    let attachment = new AttachmentBuilder(autoBuffer, { name: 'cycloid-chess.png' });
                    newmsg.edit({content: turn, files:[attachment]});
                });
            }

            setInterval(makeRandomMove, 10000);
        }
    });

})();
```

## License

MIT License
