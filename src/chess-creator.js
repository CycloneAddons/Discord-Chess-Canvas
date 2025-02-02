const {
  createCanvas,
  loadImage,
} = require('canvas');
const Frame = require('canvas-to-buffer');
const { Chess } = require('chess.js');
const fs = require('fs');
const path = require('path');

const {
  cols,
  white,
  black,
  defaultSize,
  defaultLight,
  defaultDark,
  deafultStyle,
  filePaths,
  defaultBoardStyle
} = require('./config');

/**
 * Object constructor, initializes options.
 * @param {object} options Optional options
 * @param {number} size Pixel length of desired image
 * @param {string} light Color of light squares
 * @param {string} dark Color of dark squares
 * @param {style} style Desired style of pieces
 */
function ChessCreator(options = {}) {
  this.chess = new Chess();

  this.size = options.size || defaultSize;
  this.light = options.light || defaultLight;
  this.dark = options.dark || defaultDark;
  this.style = options.style || deafultStyle;
  this.boardStyle = options.boardStyle;

  this.ready = false;
}

ChessCreator.prototype = {
  /**
   * Loads PGN into chess.js object.
   * @param {string} pgn Chess game PGN
   */
  async loadPGN(pgn) {
    if (!this.chess.load_pgn(pgn)) {
      throw new Error('PGN could not be read successfully');
    } else {
      this.ready = true;
    }
  },

  /**
   * Loads FEN into chess.js object
   * @param {string} fen Chess position FEN
   */
  async loadFEN(fen) {
    if (!this.chess.load(fen)) {
      throw new Error('FEN could not be read successfully');
    } else {
      this.ready = true;
    }
  },

  /**
   * Loads position array into chess.js object
   * @param {Array<string>} array Chess position array
   */
  loadArray(array) {
    this.chess.clear();

    for (let i = 0; i < array.length; i += 1) {
      for (let j = 0; j < array[i].length; j += 1) {
        if (array[i][j] !== '' && black.includes(array[i][j].toLowerCase())) {
          this.chess.put(
            {
              type: array[i][j].toLowerCase(),
              color: white.includes(array[i][j]) ? 'w' : 'b',
            },
            (cols[j] + (8 - i)),
          );
        }
      }
    }
    this.ready = true;
  },

  /**
   * Generates buffer image based on position
   * @returns {Buffer} Image buffer
   */
  async generateBuffer(author, author2, layout) {
    if (!this.ready) {
      throw new Error('Load a position first');
    }
    

    const canvas = createCanvas(900, 900);
    const ctx = canvas.getContext('2d');
   
    // Main part of the whole canvas
    const x = canvas.width / 2 - (this.size / 2);
    const y = canvas.height / 2 - (this.size / 2);


      const boardImage = await loadImage(path.join(__dirname, `resources/boards/${this.boardStyle}.png`))
      await ctx.drawImage(boardImage, x, y, this.size, this.size);
    
    for (let i = 0; i < 8; i += 1) {
      for (let j = 0; j < 8; j += 1) {
         
        const piece = this.chess.get(layout === 1 ? cols[7 - j] + ((7 - i) + 1) : cols[j] + (i + 1));
         if (piece && piece.type !== '' && black.includes(piece.type.toLowerCase())) {
          const image = `resources/pieces/${this.style}/${filePaths[`${piece.color}${piece.type}`]}.png`;
          const imageFile = await loadImage(path.join(__dirname, image));
          await ctx.drawImage(
            imageFile,
            layout === 1 ? x + ((this.size / 8) * ((7-j)+1))  - (this.size / 8): x + ((this.size / 8) * (7-j)), // Adjusted x-coordinate
            y + ((this.size / 8) * i),
            (this.size / 8) ,
            (this.size / 8)
          );
        }
      }
    }
    const avatarImage = await loadImage(layout ===1 ? author.avatar : author2.avatar);
    const avatarSize = 50;
    const avatarX =  20 + x;
    const avatarY = canvas.height - avatarSize - 10;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

const name = layout ===1 ? author.name : author2.name;
ctx.fillStyle = "white"; 
ctx.font = "25px Arial"; 
ctx.textAlign = "left"; 
ctx.fillText(name, avatarX + avatarSize + 5, canvas.height - avatarSize/2 );


const avatarImaget = await loadImage(layout === 1 ? author2.avatar : author.avatar);
const avatarSizet = 50; // Define the size of the circular avatar
const avatarXt = canvas.width - avatarSize * 3; // Distance from the left edge of the canvas
const avatarYt = 10; // Distance from the top edge of the canvas

ctx.save();
ctx.beginPath();
ctx.arc(avatarXt + avatarSizet / 2, avatarYt + avatarSizet / 2, avatarSizet / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatarImaget, avatarXt, avatarYt, avatarSizet, avatarSizet);
ctx.restore();

const namet = layout === 1 ? author2.name : author.name;
ctx.fillStyle = "white"; 
ctx.font = "25px Arial"; 
ctx.textAlign = "right"; 
ctx.fillText(namet, avatarXt - 5, avatarYt + avatarSizet / 2+5); // Adjust the vertical position to align it with the avatar

    const frame = new Frame(canvas, {
      image: {
        types: [
          'png',
        ],
      },
    });
    return frame.toBuffer();
  },

  /**
   * Generates PNG image based on position
   * @param {string} pngPath File name
   */
  async generatePNG(pngPath, author,  author2, layout) {
    if (!this.ready) {
      throw new Error('Load a position first');
    }

    const buffer = await this.generateBuffer(author, author2, layout);

    fs.open(pngPath, 'w', (err, fd) => {
      if (err) {
        throw new Error(`could not open file: ${err}`);
      }

      fs.write(fd, buffer, 0, buffer.length, null, (writeError) => {
        if (writeError) {
          throw new Error(`error writing file: ${writeError}`);
        }
        fs.close(fd, () => pngPath);
      });
    });
  },
};

module.exports = ChessCreator;
