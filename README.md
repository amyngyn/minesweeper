minesweeper
===========
This is an implementation of [Minesweeper](http://en.wikipedia.org/wiki/Microsoft_Minesweeper). To use this, create a `Minesweeper` object and call `init` on it with the desired settings. For example usage, see `index.html`.

differences from classic
------------------------
 * left-right click to reveal neighboring cells is now triggered with left click only
 * left click on a revealed cell with exactly as many neighbors as its number will automatically flag neighbors
 * cheat mode - click bottom left of game to reveal all mines
 
todo
----
 * add icons for mines, flags, and start button (win, lose, reset)
 * **hint system** - when stuck, point out rules that can be applied
 * **evil minesweeper** - for uncertain situations, always set the mines to be where the user clicked
 * **good minesweeper** - in a situation where no mines can be flagged absolutely, reveal a mine
