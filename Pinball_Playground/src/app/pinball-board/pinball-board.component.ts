import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-pinball-board',
  templateUrl: './pinball-board.component.html',
  styleUrls: ['./pinball-board.component.css']
})
export class PinballBoardComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private player: any;
  private bullets: any[] = [];
  private enemies: any[] = [];
  public score: number = 0; // Make score public
  private gameOver: boolean = false;
  private backgroundImg: HTMLImageElement;
  private playerSprite: HTMLImageElement;
  private enemySprite: HTMLImageElement;
  private frames: number = 0;
  private isGameOver: boolean = false;
  private backgroundY: number = 0;
  private canShoot: boolean = true;
  private enemySpawnRate: number = 100;

  constructor() {
    this.backgroundImg = new Image();
    this.backgroundImg.src = 'src/assets/space-background.jpg'; // Provide a path to the space background image

    this.playerSprite = new Image();
    this.playerSprite.src = 'src/assets/player-ship.png'; // Provide a path to the player sprite image

    this.enemySprite = new Image();
    this.enemySprite.src = 'src/assets/enemy-ship.png'; // Provide a path to the enemy sprite image
  }

  ngOnInit(): void {
    this.initializeGame();
  }

  ngAfterViewInit(): void {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();

    // Ensure images are loaded before starting the game loop
    this.backgroundImg.onload = () => {
      console.log('Background image loaded');
      this.playerSprite.onload = () => {
        console.log('Player sprite loaded');
        this.enemySprite.onload = () => {
          console.log('Enemy sprite loaded');
          this.startGameLoop();
        };
      };
    };

    // Check if images are already cached
    const dummyEvent = new Event('load');
    if (this.backgroundImg.complete) {
      this.backgroundImg.onload!(dummyEvent);
    }
    if (this.playerSprite.complete) {
      this.playerSprite.onload!(dummyEvent);
    }
    if (this.enemySprite.complete) {
      this.enemySprite.onload!(dummyEvent);
    }

    window.addEventListener('keydown', this.keyDown.bind(this));
    window.addEventListener('keyup', this.keyUp.bind(this));
    window.addEventListener('resize', this.initializeGame.bind(this));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.resizeCanvas();
  }

  resizeCanvas(): void {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  initializeGame(): void {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 80,
      width: 40,
      height: 40,
      speed: 15,
      dx: 0
    };

    this.bullets = [];
    this.enemies = [];
    this.frames = 0;
    this.isGameOver = false;
    this.score = 0;
    this.backgroundY = 0;
    this.canShoot = true;
    this.enemySpawnRate = 100;

    const scoreText = document.getElementById('score')!;
    scoreText.textContent = `Score: ${this.score}`;
    const gameOverText = document.getElementById('gameOver')!;
    gameOverText.style.display = 'none';
  }

  startGameLoop(): void {
    console.log('Starting game loop');
    const gameLoop = () => {
      if (this.gameOver) return;

      this.update();
      this.draw();

      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  update(): void {
    console.log('Updating game state');
    // Update game state
    this.updateBullets();
    this.updateEnemies();
  }

  draw(): void {
    console.log('Drawing game state');
    const canvas = this.gameCanvas.nativeElement;
    // Clear the canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    this.ctx.drawImage(this.backgroundImg, 0, 0, canvas.width, canvas.height);

    // Draw player
    this.ctx.drawImage(this.playerSprite, this.player.x, this.player.y, this.player.width, this.player.height);

    // Draw bullets
    this.drawBullets();

    // Draw enemies
    this.drawEnemies();

    // Draw score
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  }

  updateBullets(): void {
    this.bullets.forEach((bullet, index) => {
      bullet.y -= bullet.speed;

      if (bullet.y + bullet.height < 0) {
        this.bullets.splice(index, 1);
      }
    });
  }

  drawBullets(): void {
    this.bullets.forEach(bullet => {
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  createBullet(): void {
    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 5,
      y: this.player.y,
      width: 5,
      height: 10,
      speed: 10
    });
  }

  createEnemy(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 3
    });
  }

  drawEnemies(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.enemies.forEach((enemy, index) => {
      enemy.y += enemy.speed;

      if (enemy.y > canvas.height) {
        this.endGame();
      } else {
        this.ctx.save();
        this.ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        this.ctx.rotate(Math.PI);
        this.ctx.drawImage(this.enemySprite, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        this.ctx.restore();
      }

      if (
        this.player.x < enemy.x + enemy.width &&
        this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + enemy.height &&
        this.player.y + this.player.height > enemy.y
      ) {
        this.endGame();
      }
    });
  }

  updateEnemies(): void {
    this.enemies.forEach((enemy, index) => {
      enemy.y += enemy.speed;

      if (enemy.y > this.gameCanvas.nativeElement.height) {
        this.enemies.splice(index, 1);
      }
    });
  }

  detectCollisions(): void {
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
          this.updateScore(50);
        }
      });
    });
  }

  movePlayer(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.player.x += this.player.dx;

    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > canvas.width) this.player.x = canvas.width - this.player.width;
  }

  updateScore(points: number): void {
    this.score += points;
    const scoreText = document.getElementById('score')!;
    scoreText.textContent = `Score: ${this.score}`;

    if (this.score % 500 === 0) {
      this.enemySpawnRate = Math.max(20, this.enemySpawnRate - 10);
    }
  }

  endGame(): void {
    this.isGameOver = true;
    const finalScoreText = document.getElementById('finalScore')!;
    finalScoreText.textContent = this.score.toString();
    const gameOverText = document.getElementById('gameOver')!;
    gameOverText.style.display = 'block';
  }

  keyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.player.dx = -this.player.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') this.player.dx = this.player.speed;
    if (e.key === 'r' && this.isGameOver) {
      this.initializeGame();
      this.update();
    } else if (e.key === ' ' && this.canShoot && !this.isGameOver) {
      this.createBullet();
      this.canShoot = false;
    }
  }

  keyUp(e: KeyboardEvent): void {
    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'a' ||
      e.key === 'd'
    ) {
      this.player.dx = 0;
    }
    if (e.key === ' ') {
      this.canShoot = true;
    }
  }
}


