import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pacman-game',
  templateUrl: './pacman-game.component.html',
  styleUrls: ['./pacman-game.component.css']
})
export class PacmanGameComponent implements OnInit {

  ngOnInit(): void {
    console.log('PacmanGameComponent initialized');
    this.initializePacmanGame();
  }

  initializePacmanGame(): void {
    console.log('Initializing Pacman game');
    const gameContainer = document.getElementById('game-container') as HTMLElement;
    if (!gameContainer) {
      console.error('Game container not found');
      return;
    }
    console.log('Game container found:', gameContainer);

    const grid: HTMLElement[][] = [];
    const pacman = { x: 1, y: 1 };
    const ghosts = [
      { x: 10, y: 10 }
    ];
    const maze = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    function createMaze() {
      console.log('Creating maze');
      maze.forEach((row, y) => {
        const rowDiv: HTMLElement[] = [];
        row.forEach((cell, x) => {
          const div = document.createElement('div');
          div.classList.add('cell');
          if (cell === 1) {
            div.classList.add('wall');
          } else if (cell === 0) {
            div.classList.add('pellet');
          }
          gameContainer.appendChild(div);
          rowDiv.push(div);
        });
        grid.push(rowDiv);
      });
      console.log('Maze created');
    }

    function updatePacman() {
      console.log('Updating Pacman position:', pacman);
      grid[pacman.y][pacman.x].classList.add('pacman');
    }

    function clearPacman() {
      console.log('Clearing Pacman position:', pacman);
      grid[pacman.y][pacman.x].classList.remove('pacman');
    }

    function movePacman(dx: number, dy: number) {
      const newX = pacman.x + dx;
      const newY = pacman.y + dy;
      console.log('Attempting to move Pacman to:', { x: newX, y: newY });
      if (maze[newY][newX] !== 1) {
        clearPacman();
        pacman.x = newX;
        pacman.y = newY;
        updatePacman();
      } else {
        console.log('Move blocked by wall');
      }
    }

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          movePacman(0, -1);
          break;
        case 'ArrowDown':
          movePacman(0, 1);
          break;
        case 'ArrowLeft':
          movePacman(-1, 0);
          break;
        case 'ArrowRight':
          movePacman(1, 0);
          break;
      }
    });

    createMaze();
    updatePacman();
  }
}
