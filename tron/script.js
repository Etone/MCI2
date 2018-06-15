const CELL_SIZE = 7;
const BACKGROUND_COLOR = "#444";
const OFFSET_PADDING = 10;

class Game {
  constructor(canvasId, cellSize) {
    this.can = document.getElementById("myCanvas");
	
	this.can.width = window.innerWidth - OFFSET_PADDING;
	this.can.height = window.innerHeight - OFFSET_PADDING;
	
	this.canvas = this.can.getContext("2d");
	
	this.can.addEventListener("touchstart", this.handleTouch.bind(this), false);
    document.onkeydown = this.handleKeyboardEvent.bind(this);

    this.cellSize = cellSize;
    this.width = document.getElementById("myCanvas").width;
    this.height = document.getElementById("myCanvas").height;

    this.lightCycles = [];
    this.recordedPositions = [];
  }

  addLightCycle(lightCycle) {
    this.lightCycles.push(Object.assign({}, lightCycle));
  }
  
  handleTouch(evt){
	  for(let i = 0; i < this.lightCycles.length; i++){
		const lightCycle = this.lightCycles[i];
		let currentX = lightCycle.direction.x;
		let currentY = lightCycle.direction.y;

		
	  //Welches Viertel
		evt.preventDefault();
		let touches = evt.changedTouches;
	
		let newDirection = lightCycle.direction;
	
		for(let i = 0; i < touches.length; i++){
			let y = touches[i].pageY;
			let x = touches[i].pageX;
		
		
		if(x < window.innerWidth/2){
			//player 1
			if(lightCycle.name == "Player 1") {
			
			if(y < window.innerHeight/2){
				//upper left => p1 clocwise
				if(currentX == 0){
					newDirection = {x: -currentY, y: 0}
				} else {
					newDirection = {x: 0, y: currentX}
				}
			} else {
					// lower left =< p1 counterclockwise
					if(currentX == 0) {
						newDirection = {x: currentY, y:0}
					} else {
						newDirection = {x: 0, y: -currentX}
					}
			}
		}
		
		} else {
			//player 2
						if(lightCycle.name == "Player 2") {
			
			if(y < window.innerHeight/2){
				//upper left => p1 clocwise
				if(currentX == 0){
					newDirection = {x: -currentY, y: 0}
				} else {
					newDirection = {x: 0, y: currentX}
				}
			} else {
					// lower left =< p1 counterclockwise
					if(currentX == 0) {
						newDirection = {x: currentY, y:0}
					} else {
						newDirection = {x: 0, y: -currentX}
					}
			}
		}
		}
	}
		  //changeDir des spielers
	  lightCycle.direction = newDirection;
	  }
  }

  
  handleKeyboardEvent(e) {
    for (let i = 0; i < this.lightCycles.length; i++) {
      const lightCycle = this.lightCycles[i];

      if (!lightCycle.active) {
        continue;
      }

      let newDirection;
      if (e.keyCode === lightCycle.keyBindings.up) {
        newDirection = { x: 0, y: -1 };
      } else if (e.keyCode === lightCycle.keyBindings.down) {
        newDirection = { x: 0, y: 1 };
      } else if (e.keyCode === lightCycle.keyBindings.left) {
        newDirection = { x: -1, y: 0 };
      } else if (e.keyCode === lightCycle.keyBindings.right) {
        newDirection = { x: 1, y: 0 };
      } else {
        continue;
      }

      // If we want to go on the direction we come from, do nothing.
      if (
        (newDirection.x === lightCycle.direction.x &&
          newDirection.y !== lightCycle.direction.y) ||
        (newDirection.y === lightCycle.direction.y &&
          newDirection.x !== lightCycle.direction.x)
      ) {
        continue;
      }

      lightCycle.direction = newDirection;
    }
  }

  playerShouldDie(lightCycle) {
    if (
      lightCycle.position.x < 0 ||
      lightCycle.position.y < 0 ||
      lightCycle.position.x >= this.width ||
      lightCycle.position.y >= this.height
    ) {
      return true;
    }

    for (let i = 0; i < this.recordedPositions.length; i++) {
      const position = this.recordedPositions[i].point;

      if (
        lightCycle.position.x - (this.cellSize - 1) / 2 <= position.x &&
        position.x <= lightCycle.position.x + (this.cellSize - 1) / 2 + 1 &&
        lightCycle.position.y - (this.cellSize - 1) / 2 <= position.y &&
        position.y <= lightCycle.position.y + (this.cellSize - 1) / 2 + 1
      ) {
        return true;
      }
    }

    return false;
  }

  updateCell(newPosition, newColor) {
    for (let i = 0; i < this.recordedPositions.length; i++) {
      const position = this.recordedPositions[i];

      if (position.point === newPosition) {
        position.color = newColor;
        return;
      }
    }

    // There was no position recorded for this point, let's create a new one
    this.recordedPositions.push({
      point: newPosition,
      color: newColor
    });
  }

  finished() {
    const activePlayers = this.lightCycles.reduce(
      (a, v) => a + (v.active ? 1 : 0),
      0
    );
    return activePlayers <= 1;
  }

  getWinner() {
    if (!this.finished()) {
      return null;
    }

    return this.lightCycles.find(e => e.active);
  }

  update() {
    for (let i = 0; i < this.lightCycles.length; i++) {
      const lightCycle = this.lightCycles[i];

      if (!lightCycle.active) {
        continue;
      }

      const previousPosition = lightCycle.position;

      // First we update the positions of the light cycles
      // along side with the records of the cells.
      lightCycle.position = {
        x: Math.min(
          lightCycle.position.x + lightCycle.direction.x * this.cellSize,
          this.width - this.cellSize / 2
        ),
        y: Math.min(
          lightCycle.position.y + lightCycle.direction.y * this.cellSize,
          this.height - this.cellSize / 2
        )
      };

      // Then we check if the player is dead and draw the cell
      // in consequence.
      if (!this.playerShouldDie(lightCycle)) {
        this.updateCell(lightCycle.position, lightCycle.color);
        this.updateCell(previousPosition, lightCycle.traceColor);
      } else {
        lightCycle.position = previousPosition;
        lightCycle.active = false;
        this.updateCell(lightCycle.position, "#fff");
      }
    }

    // Finally, we draw the canvas with the update model.
    this.draw();
  }

  draw() {
    // We draw all the canvas with a color
    //this.canvas.fillStyle = BACKGROUND_COLOR;
    //this.canvas.fillRect(0, 0, this.width, this.height);
	
	this.canvas.fillStyle = "#3B0B0B";
    this.canvas.fillRect(0, 0, this.width/2, this.height);
	
	this.canvas.fillStyle = "#0B3B0B";
    this.canvas.fillRect(this.width/2, 0, this.width, this.height);
	


    // Now we draw all the position recorded.
    for (let i = 0; i < this.recordedPositions.length; i++) {
      const { point: position, color } = this.recordedPositions[i];

      this.canvas.fillStyle = color;
      this.canvas.fillRect(
        position.x - (this.cellSize - 1) / 2,
        position.y - (this.cellSize - 1) / 2,
        this.cellSize,
        this.cellSize
      );
    }
  }
}

players = [
  {
    name: "Player 1",
    position: {
      x: 0,
      y: 0
    },
    direction: { x: 0, y: -1 },
    color: "#8B0000",
    traceColor: "#f00",
    keyBindings: {
      up: 38,
      down: 40,
      left: 37,
      right: 39
    },
    active: true,
    score: 0
  },
  {
    name: "Player 2",
    position: {
      x: 0,
      y: 0
    },
    direction: { x: 1, y: 0 },
    color: "#006400",
    traceColor: "#0f0",
    keyBindings: {
      up: 87,
      down: 83,
      left: 65,
      right: 68
    },
    active: true,
    score: 0
  }
];

function load() {
  const game = new Game("myCanvas", CELL_SIZE);

  for (let i = 0; i < players.length; i++) {
    players[i].position = {
      x: Math.floor(
        Math.random() * (document.getElementById("myCanvas").width - CELL_SIZE)
      ),
      y: Math.floor(
        Math.random() * (document.getElementById("myCanvas").height - CELL_SIZE)
      )
    };

    directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 }
    ];

    players[i].direction =
      directions[Math.floor(Math.random() * directions.length)];

    game.addLightCycle(players[i]);
  }




  return game;
}

let game = load();
let beginningDate = performance.now();

function main() {
  game.update();
  if (game.finished()) {
    const winner = game.getWinner();
    if (winner) {
      for (let i = 0; i < players.length; i++) {
        if (players[i].name === winner.name) {
          players[i].score += 1;
        }
      }
    }
    game = load();
    beginningDate = performance.now();
  }

  // Decrease the timeout every 2 seconds
  const elapsedTime = performance.now() - beginningDate;
  const decreasedTimeout = 200 - CELL_SIZE * Math.floor(elapsedTime / 900);
  setTimeout(function() {
    main();
  }, decreasedTimeout);
}

main();
