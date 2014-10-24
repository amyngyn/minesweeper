function MSDisplay(settings) {
  // TODO error checking?
  this.display = settings.display;
  this.rows = settings.rows;
  this.cols = settings.cols;
  this.mines = settings.mines;
  this.field = initializeField();
}

//MSDisplay.MINE = -1;
//MSDisplay.ROW = 0;
//MSDisplay.COL = 1;

MSDisplay.prototype.initializeField = function() {
  var field = [];
  // Create empty grid.
  for (var i = 0; i < this.rows; i++) {
    field.push(new Array(this.cols));
  }

  // Place mines.
  for (var i = 0; i < mines; i++) {
    // TODO check scoping
    do {
      var row = Math.floor(Math.random() * rows);
      var col = Math.floor(Math.random() * cols);
    } while(field[row][col] != MINE);
    field[row][col] = MINE;
  }


  return field;
};

// TODO private methods????
MSDisplay.prototype.inBounds_ = function(row, col) {
  return 0 <= row && row < this.field.length
      && 0 <= col && col < this.field[0].length;
};

/**
 * Returns all neighbors of the given cell.
 *
 * @param {number} row
 * @param {number} col
 * @return {Array}
 */
MSDisplay.prototype.getNeighbors = function(row, col) {
  if (!this.inBounds_(row, col)) {
    // TODO throw error wat
  }
  var neighbors = [];
  for (var dr = -1; dr <= 1; dr++) {
    for (var dc = -1; dc <= 1; dc++) {
      var r = row + dr;
      var c = col + dc;
      if (this.inBounds_(row, col) && !(dr == 0 && dc == 0)) {
        neighbors.push([r, c]);
      }
    }
  }
  return neighbors;
};

var generateField = function() {

  var countMines = function(field, row, col) {
    if (field[row][col] == MINE) return MINE;

    var neighbors = getNeighbors(field, row, col);

    var count = 0;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var r = row + dr;
        var c = col + dc;
        if (0 <= r && r < field.length) {
          if (0 <= c && c < field[0].length) {
        if ((dr != 0 || dc != 0) && field[r][c] == MINE) {
          count++;
        }
          }
        }
      }
    }
    return count;
  };

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      field[i][j] = countMines(field, i, j);
    }
  }
  return field;
};
