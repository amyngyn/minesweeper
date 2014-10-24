var MINE = minesweeper.MINE;

/**
 * Returns a list of row-cell tuples for cells adjacent to this row and column.
 *
 * @param {Array} field A 2-D array of each cell's mine value.
 * @param {Number} row The row index.
 * @param {Number} col The col index.
 * @return {Array} List of coordinate tuples.
 */
var getNeighbors = function(field, row, col) {
  var neighbors = [];
  for (var dr = -1; dr <= 1; dr++) {
    for (var dc = -1; dc <= 1; dc++) {
      var r = row + dr;
      var c = col + dc;
      if (0 <= r && r < field.length
          && 0 <= c && c < field[0].length
          && !(dr == 0 && dc == 0)) {
        neighbors.push([r, c]);
      }
    }
  }
  return neighbors;
};

/**
 * @param {Array} field A 2-D array of each cell's mine value.
 * @param {Number} row The row index.
 * @param {Number} col The col index.
 * @return {Number} Number of mines adjacent to the given cell.
 */
var countAdjacentMines = function(field, row, col) {
  if (field[row][col] == MINE) return MINE;

  var count = 0;
  var neighbors = getNeighbors(field, row, col);
  for (var i = 0; i < neighbors.length; i++) {
    if (field[neighbors[i][0]][neighbors[i][1]] == MINE) count++;
  }
  return count;
};

/**
 * Randomly generates a 2-D minesweeper field from the given settings. Settings
 * should contain values for rows, cols, and mines.
 *
 * @param {Object} settings Configuration for this minesweeper game.
 * @return {Array} 2-D Array of values representing a randomly generated
 *     minesweeper field.
 */
var generateField = function(settings) {
  var rows = settings.rows;
  var cols = settings.cols;
  var mines = settings.mines ? settings.mines : 20;

  // Initialize 2-D array
  var field = [];
  for (var i = 0; i < rows; i++) {
    var row = new Array(cols);
    field.push(row);
  }

  // Set mines
  for (var i = 0; i < mines; i++) {
    var row = Math.floor(Math.random() * rows);
    var col = Math.floor(Math.random() * cols);
    // if this slot already contained a mine, add another
    if (field[row][col] == MINE) i--;
    else field[row][col] = MINE;
  }

  // Fill field with mine counts
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      field[i][j] = countAdjacentMines(field, i, j);
    }
  }
  return field;
};

var revealCell = function(field, row, col) {
  var cell = $('#minesweeper')[0].rows[row].cells[col];
  if (field[row][col] == MINE) {
    cell.innerHTML = field[row][col];
    $('#round-result')[0].innerHTML = 'You lose!'
  } else if (field[row][col] != 0) {
    cell.innerHTML = field[row][col];
  } else if (cell.innerHTML == '&nbsp;') { // TODO figure out how to stop recursion
    cell.innerHTML = '&nbsp; ';
    var neighbors = getNeighbors(field, row, col);
    for (var i = 0; i < neighbors.length; i++) {
      revealCell(field, neighbors[i][0], neighbors[i][1]);
    }
  }
  cell.className = 'cell-' + field[row][col];
};

var initializeDisplay = function(display, field) {
  field.forEach(function(row, i) {
    var tr = document.createElement('tr');
    row.forEach(function(cell, j) {
      var td = document.createElement('td');
      td.innerHTML = '&nbsp';
      td.className = 'cell';
      td.onclick = function(event) {
        revealCell(field, i, j);
      };
      tr.appendChild(td);
    });
    display.appendChild(tr);
  });
};

var main = function(settings) {
  var field = generateField(settings);
  initializeDisplay(settings.display, field);
};

var settings = {
    display: $('#minesweeper')[0],
    rows: 15,
    cols: 15,
    mines: 20
};

main(settings);
