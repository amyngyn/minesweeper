var debug = false;
var MINE = minesweeper.MINE;

/**
 * Constructor for a Minesweeper game object.
 *
 * @param {String} containerId HTML ID for an empty element to contain this
 *     minesweeper game's display.
 */
var Minesweeper = function(containerId) {
  this.container = $(containerId);
};

/**
 * Attaches Minesweeper display to screen and sets up click listeners.
 */
Minesweeper.prototype.init = function(settings) {
  this.settings = settings;
  this.won = false;
  this.lost = false;
  this.firstClickOccurred = false;
  this.cellsRevealed = 0;
  this.cellsFlagged = 0;
  this.cellsToReveal = (settings.rows * settings.cols) - settings.mines;
  this.elapsedTime = 0;
  clearInterval(this.timeInterval);

  this.initField(settings.rows, settings.cols);
  this.initDisplay();
};

/**
 * Only generates a 2-D array with the given rows and cols as dimensions; does
 * not actually add mines to field. Mines are added after the first click.
 *
 * Each cell is an object with two properties: val and flagged. Each val is
 * either MINE or a number representing how many MINEs are adjacent to that
 * cell. flagged starts out as false and is toggled when the user marks a cell
 * as a flag.
 */
Minesweeper.prototype.initField = function(rows, cols) {
  // Initialize 2-D array
  this.field = [];
  for (var i = 0; i < rows; i++) {
    var row = new Array(cols);
    for (var j = 0; j < cols; j++) {
      row[j] = { val: 0, flagged: false };
    }
    this.field.push(row);
  }
};

/**
 * Updates this.field to contain the number of mines requested.
 *
 * Should be called after the user has made their first click so that mines can
 * be placed while avoiding that location.
 */
Minesweeper.prototype.setMines = function(mines, firstClickRow, firstClickCol) {
  var field = this.field;
  var rows = field.length;
  var cols = field[0].length;

  // Must count mines actually planted so that mines are not placed in
  // previously selected locations.
  var minesPlanted = 0;
  while (minesPlanted != mines) {
    var row = Math.floor(Math.random() * rows);
    var col = Math.floor(Math.random() * cols);

    // Cannot use cell if the user just clicked it or if it was already a mine
    if ((row == firstClickRow && col == firstClickCol)
      || (field[row][col] && field[row][col].val == MINE)) continue;

    field[row][col] = {
      val: MINE,
      flagged: false
    };

    minesPlanted++;
  }

  // Fill field with mine counts
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      field[i][j].val = this.countAdjacentMines(i, j);
    }
  }
};

/**
 * For a given coordinate, returns the number of mines it is next to.
 */
Minesweeper.prototype.countAdjacentMines = function(row, col) {
  var field = this.field;
  if (field[row][col] && field[row][col].val == MINE) return MINE;
  var count = 0;
  var neighbors = this.getNeighbors(row, col);
  for (var i = 0; i < neighbors.length; i++) {
    var r = neighbors[i].row;
    var c = neighbors[i].col;
    if (field[r][c] && field[r][c].val == MINE) count++;
  }
  return count;
};

/**
 * Every cell calls this click handler the first time it's clicked. If it was
 * the first cell to be clicked (flagged cells do not count), this finally adds
 * mines to the screen and excludes this click. Otherwise, a first click was
 * already made, so we can just change this cell's click handler for the
 * duration of the game.
 */
Minesweeper.prototype.handleFirstClick = function(row, col) {
  if (this.field[row][col].flagged) return;

  if (this.firstClickOccurred) {
    var that = this;
    this.getCell(row, col).click(function(event) {
      that.revealCell(row, col);
    });
  } else {
    this.firstClickOccurred = true;
    this.setMines(this.settings.mines, row, col);
    this.initDisplay();
    this.startTimer();
  }

  this.revealCell(row, col);
};

/**
 * Adds HTML table for this object's already initialized field. Control panel is
 * added after mines are added in order to set width correctly.
 */
Minesweeper.prototype.initDisplay = function() {
  // for resetting the game
  this.container.empty();

  this.display = $(document.createElement('table'));
  this.display.addClass('no-highlight inset');
  this.display.attr('cellspacing', 0);

  var that = this;
  this.field.forEach(function(row, r) {

    var tr = document.createElement('tr');
    row.forEach(function(cell, c) {

      var td = $(document.createElement('td'));
      td.html(that.field[r][c].val);

      // left click
      td.click(function(event) {
        that.handleFirstClick(r, c);
      });
      
      // right click
      td.get(0).oncontextmenu = function(event) {
        event.preventDefault();
        that.toggleFlag(r, c);
      };

      // styling
      td.addClass('cell outset');
      if (debug) td.addClass('debug');
      if (that.field[r][c].flagged) {
        td.addClass('flagged');
        td.html(minesweeper.FLAG);
      }

      tr.appendChild(td.get(0));
    });
    that.display.append(tr);
  });

  this.container.append(this.display);
  this.initControlPanel();
};

/**
 * Control panel is the top portion that has the timer, mine count, and reset
 * button. This adds those components to the top of the container.  Must be
 * called after the game cells are added so that the total width can be used.
 */
Minesweeper.prototype.initControlPanel = function() {
  var that = this;
  this.controlPanel = $(document.createElement('div'));
  this.controlPanel.resetButton = $(document.createElement('div'));
  this.controlPanel.flagCount = $(document.createElement('div'));
  this.controlPanel.timer = $(document.createElement('div'));

  var controlPanel = this.controlPanel;
  var resetButton = this.controlPanel.resetButton;
  var flagCount = this.controlPanel.flagCount;
  var timer = this.controlPanel.timer;

  // need elements on screen for width calculations, hide panel until done
  controlPanel.append(resetButton);
  controlPanel.css('visibility', 'hidden');
  this.container.prepend(controlPanel);

  // overall panel styling
  controlPanel.addClass('control-panel inset');
  controlPanel.width($(this.display).innerWidth());

  // debug link styling
  var debugLink = $(document.createElement('a'));
  debugLink.html('debug');
  debugLink.click(this.toggleDebug);
  debugLink.addClass('debug-link');
  this.container.append(debugLink);

  // reset button styling and clicks
  resetButton.addClass('reset-button outset');
  resetButton.css('margin-left',
      (controlPanel.innerWidth() - resetButton.width()) / 2);
  resetButton.click(function(event) {
    that.init(that.settings);
  });

  // counter for mines left
  controlPanel.prepend(flagCount);
  flagCount.addClass('counter');
  flagCount.html(this.zeroFill(this.settings.mines, 2));
  flagCount.css('float', 'left');

  // counter for time elapsed
  controlPanel.prepend(timer);
  timer.addClass('counter');
  timer.html(this.zeroFill(0));
  timer.css('float', 'right');
  timer.css('text-align', 'right');

  controlPanel.css('visibility', 'visible');
};

/**
 * Returns the HTML element for this cell.
 */
Minesweeper.prototype.getCell = function(row, col) {
  return $(this.display[0].rows[row].cells[col]);
};

/**
 * Reveals the contents of a cell.
 *
 * Special cases:
 * - User wants to reveal neighbors of a cell they previously revealed and have
 *   flagged mines for. Flags may be inaccurate, so a mine could be revealed.
 * - User reveals a cell that is not adjacent to any mines, which triggers more
 *   reveals up until non-zero cells are found.
 */
Minesweeper.prototype.revealCell = function(row, col) {
  var field = this.field;

  // do nothing if already lost or if a flagged cell is clicked
  if (this.gameEnded() || field[row][col].flagged) return;

  // revealCellHelper must be called on each neighbor for an expand because
  // the helper assumes it is working on unrevealed cells and will also return
  // early if it is given a non-zero cell.
  if (this.validExpandRequested(row, col)) {
    var neighbors = this.getNeighbors(row, col);
    for (var i = 0; i < neighbors.length; i++) {
      this.revealCellHelper(neighbors[i].row, neighbors[i].col);
      if (this.gameEnded()) return;
    }

  } else {
    this.revealCellHelper(row, col);
  }
};

/**
 * Reveals cell at (row, col), then recursively expands its neighbors if it
 * doesn't have any neighboring mines (i.e., its field value is 0).
 *
 * It is possible to lose if the user manually tries to expand all neighbors on
 * a cell by incorrectly flagging neighboring cells (see revealCell); otherwise,
 * it shouldn't be possible for this to result in a loss.
 */
Minesweeper.prototype.revealCellHelper = function(row, col) {
  // base case: don't reveal flagged or already revealed cells
  if (this.field[row][col].flagged
      || this.getCell(row, col).hasClass('revealed')) return;

  this.revealSingleCell(row, col);

  // base case: stop expanding if cell is non-zero or its reveal lead to a loss 
  if (this.gameEnded() || this.field[row][col].val != 0) return;

  // recursive step: reveal neighbors
  var neighbors = this.getNeighbors(row, col);
  for (var i = 0; i < neighbors.length; i++) {
    this.revealCellHelper(neighbors[i].row, neighbors[i].col);
    if (this.gameEnded()) return;
  }
};

/**
 * Updates styling for a cell so that it shows its number on the screen.
 * Checks whether this reveal resulted in a win or loss.
 */
Minesweeper.prototype.revealSingleCell = function(row, col) {
  var displayCell = this.getCell(row, col);
  var cell = this.field[row][col];

  if (displayCell.hasClass('revealed') || cell.flagged) return;

  displayCell.html(cell.val);
  displayCell.addClass('revealed cell-' + cell.val);
  displayCell.removeClass('outset');
  if (debug) displayCell.removeClass('debug');

  this.cellsRevealed++;
  if (cell.val == MINE) {
    this.displayLoss();
  } else if (this.cellsRevealed == this.cellsToReveal) {
    this.displayWin();
  }
};

/**
 * Returns a list of coordinates for cells adjacent to this row and column.
 */
Minesweeper.prototype.getNeighbors = function(row, col) {
  var field = this.field;
  var neighbors = [];
  for (var r = row - 1; r <= row + 1; r++) {
    for (var c = col - 1; c <= col + 1; c++) {
      if (0 <= r && r < field.length
          && 0 <= c && c < field[0].length
          && !(r == row && c == col)) {
        neighbors.push({row: r, col: c});
      }
    }
  }
  return neighbors;
};

/**
 * A valid expansion request is one where the cell clicked has already been
 * revealed and has exactly as many flagged neighbors as its own value.
 */
Minesweeper.prototype.validExpandRequested = function(row, col) {
  if (!this.getCell(row, col).hasClass('revealed')) return false;

  var flagCount = 0;
  var neighbors = this.getNeighbors(row, col);
  for (var i = 0; i < neighbors.length; i++) {
    var r = neighbors[i].row;
    var c = neighbors[i].col;
    var neighbor = this.getCell(r, c);
    if (!neighbor.hasClass('revealed') && this.field[r][c].flagged) {
      flagCount++;
    }
  }

  return flagCount == this.field[row][col].val;
};

/**
 * Switches styling to display a flagged or unflagged cell.
 * TODO: use forceFlag variable to allow auto flagging feature
 */
Minesweeper.prototype.toggleFlag = function(row, col, forceFlag) {
  var displayCell = this.getCell(row, col);

  if (displayCell.hasClass('revealed')) return;

  var cell = this.field[row][col];
  if (!this.field[row][col].flagged) {
    displayCell.addClass('flagged');
    displayCell.html(minesweeper.FLAG);
    this.cellsFlagged++;
    cell.flagged = true;
  } else if (!forceFlag) {
    displayCell.removeClass('flagged');
    displayCell.html(cell.val);
    this.cellsFlagged--;
    cell.flagged = false;
  }
  this.controlPanel.flagCount.html(this.settings.mines - this.cellsFlagged);
};

/**
 * Starts timer so that display clock ticks every second.
 */
Minesweeper.prototype.startTimer = function() {
  var that = this;
  this.timeInterval = setInterval(function() {
    that.controlPanel.timer.html(++that.elapsedTime);
    if (that.elapsedTime > minesweeper.MAX_TIME)
      clearInterval(that.timeInterval);
  }, 1000);
};

/**
 * Stops timer and shows win message.
 */
Minesweeper.prototype.displayWin = function() {
  this.won = true;
  this.controlPanel.resetButton.html('You win!');
  clearInterval(this.timeInterval);
};

/**
 * Reveals all unflagged mines, shows loss message, and sets this.lost to true.
 */
Minesweeper.prototype.displayLoss = function() {
  if (this.lost) return;
  this.lost = true;
  this.controlPanel.resetButton.html('You lose!');
  clearInterval(this.timeInterval);
  for (var r = 0; r < this.field.length; r++) {
    for (var c = 0; c < this.field[0].length; c++) {
      var cell = this.field[r][c];
      if (cell.val == MINE && !cell.flagged) {
        this.revealSingleCell(r, c);
      }
    }
  }
};

/**
 * For debugging purposes, allow the user to continue playing as if they haven't
 * lost, even if mines have been revealed.
 */
Minesweeper.prototype.gameEnded = function() {
  return !debug && (this.won || this.lost);
};

/**
 * Returns the given value as a string padded with zeroes up to length.
 */
Minesweeper.prototype.zeroFill = function(value, length) {
  if (length === undefined) length = 3;
  return value;
};

/**
 * When called, reveals (or hides) values of all cells.
 */
Minesweeper.prototype.toggleDebug = function() {
  debug = !debug;
  $('.cell:not(.revealed)').toggleClass('debug');
};

