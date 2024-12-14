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
  private player: { x: number; y: number; width: number; height: number; speed: number; dx: number; color: string; } | null = null;

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

    // Ensure the canvas dimensions are set correctly
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      speed: 5.6, // Reduced speed by 20%
      dx: 0,
      color: 'white',
    };

    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;

    const enemyFrequency = 100;
    let frames = 0;

    // Function to draw the player
    const drawPlayer = () => {
      if (this.player) {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
    };

    // Function to create a bullet
    const createBullet = () => {
      this.bullets.push({
        x: this.player!.x + this.player!.width / 2 - 5,
        y: this.player!.y,
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
          this.player &&
          this.player.x < enemy.x + enemy.width &&
          this.player.x + this.player.width > enemy.x &&
          this.player.y < enemy.y + enemy.height &&
          this.player.y + this.player.height > enemy.y
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
            this.score += 10; // Increment score on collision
          }
        });
      });
    };

    // Function to move the player
    const movePlayer = () => {
      if (this.player) {
        this.player.x += this.player.dx;

        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > canvas.width) this.player.x = canvas.width - this.player.width;
      }
    };

    // Function to end the game
    const endGame = () => {
      this.gameOver = true;
      this.player = null;
      this.bullets = [];
      this.enemies = [];
      console.log('Game Over'); // Debug log
      const gameOverText = document.getElementById('gameOver');
      if (gameOverText) {
        gameOverText.style.display = 'block';
      }
    };

    // Game loop function
    const update = () => {
      if (this.gameOver) {
        console.log('Game loop stopped'); // Debug log
        return;
      }

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
      if (this.player) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.player.dx = -this.player.speed;
        if (e.key === 'ArrowRight' || e.key === 'd') this.player.dx = this.player.speed;
        if (e.key === ' ') createBullet();
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      if (this.player) {
        if (
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'a' ||
          e.key === 'd'
        ) {
          this.player.dx = 0;
        }
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    // Start the game loop
    update();
  }

  restartGame() {
    this.gameOver = false;
    const gameOverText = document.getElementById('gameOver');
    if (gameOverText) {
      gameOverText.style.display = 'none';
    }
    this.startGame();
  }
}


