import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

@Component({
  selector: 'app-pinball-board',
  templateUrl: './pinball-board.component.html',
  styleUrls: ['./pinball-board.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PinballBoardComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  public score: number = 0;
  public gameOver: boolean = false;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];

  ngOnInit(): void {
    console.log('ngOnInit called'); // Debug log
    this.startGame();
  }

  startGame() {
    console.log('startGame called'); // Debug log
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) {
      console.error('Failed to get canvas context'); // Debug log
      return;
    }
    const gameOverText = document.getElementById('gameOver');

    // Ensure the canvas dimensions are set correctly
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      speed: 7,
      dx: 0,
      color: 'white',
    };

    const enemyFrequency = 100;
    let frames = 0;
    let isGameOver = false;

    // Function to draw the player
    const drawPlayer = () => {
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x, player.y, player.width, player.height);
    };

    // Function to create a bullet
    const createBullet = () => {
      this.bullets.push({
        x: player.x + player.width / 2 - 5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 10,
        color: 'yellow',
      });
    };

    // Function to draw bullets
    const drawBullets = () => {
      this.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        if (bullet.y + bullet.height < 0) {
          this.bullets.splice(index, 1);
        } else {
          this.ctx.fillStyle = bullet.color;
          this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
      });
    };

    // Function to create an enemy
    const createEnemy = () => {
      this.enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 3,
        color: 'red',
      });
    };

    // Function to draw enemies
    const drawEnemies = () => {
      this.enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        if (enemy.y > canvas.height) {
          this.enemies.splice(index, 1);
        } else {
          this.ctx.fillStyle = enemy.color;
          this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }

        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          endGame();
        }
      });
    };

    // Function to detect collisions between bullets and enemies
    const detectCollisions = () => {
      this.bullets.forEach((bullet, bIndex) => {
        this.enemies.forEach((enemy, eIndex) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            this.bullets.splice(bIndex, 1);
            this.enemies.splice(eIndex, 1);
          }
        });
      });
    };

    // Function to move the player
    const movePlayer = () => {
      player.x += player.dx;

      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    };

    // Function to end the game
    const endGame = () => {
      isGameOver = true;
      if (gameOverText) {
        gameOverText.style.display = 'block';
      }
    };

    // Game loop function
    const update = () => {
      if (isGameOver) return;

      console.log('Updating game frame'); // Debug log

      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawPlayer();
      drawBullets();
      drawEnemies();
      detectCollisions();
      movePlayer();

      frames++;
      if (frames % enemyFrequency === 0) createEnemy();

      requestAnimationFrame(update);
    };

    // Event listeners for keyboard inputs
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
      if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
      if (e.key === ' ') createBullet();
    };

    const keyUp = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'a' ||
        e.key === 'd'
      ) {
        player.dx = 0;
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // Start the game loop
    update();
  }
}


