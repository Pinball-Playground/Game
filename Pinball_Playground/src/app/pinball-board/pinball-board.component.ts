import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-pinball-board',
  templateUrl: './pinball-board.component.html',
  styleUrls: ['./pinball-board.component.css'],
})

export class PinballBoardComponent implements OnInit {
  @ViewChild('gameCanvas') gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private player!: Player;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  public score: number = 0; //CHANGE TO PRIVATE WITH PROPER ALL THAT STUFF
  private gameOver: boolean = false;
  private keys = { ArrowLeft: false, ArrowRight: false, Space: false };
  private interval: any;

  
  ngOnInit(): void {
    console.log('Testing canvas rendering');
    this.initializeCanvas();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('Canvas Test', 50, 50);
  }

  private initializeCanvas() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.gameCanvas.nativeElement.width = window.innerWidth;
    this.gameCanvas.nativeElement.height = window.innerHeight;
  }
  
  startGame() {
    console.log('Game starting...');
    this.initializeCanvas();
    this.gameOver = false;
    this.score = 0;
    this.bullets = [];
    this.enemies = [];
    this.player = new Player(
      this.gameCanvas.nativeElement.width / 2 - 25,
      this.gameCanvas.nativeElement.height - 70
    );
    console.log('Player initialized:', this.player);
    this.interval = setInterval(() => this.gameLoop(), 1000 / 60); // 60 FPS
    this.spawnEnemy();
  }
  

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Space') {
      this.keys[event.key] = true;
    }
  }
  
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Space') {
      this.keys[event.key] = false;
    }
  }
  

  private gameLoop() {
    if (this.gameOver) {
      clearInterval(this.interval);
      console.log('Game Over. Loop stopped.');
      return;
    }
    

    this.ctx.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    // Move player and shoot
    this.player.move(this.keys);
    this.player.shoot(this.keys, this.bullets);

    // Move bullets
    this.bullets.forEach((bullet, index) => {
      bullet.move();
      if (bullet.y < 0) this.bullets.splice(index, 1);
      bullet.draw(this.ctx);
    });

    // Move and draw enemies
    this.enemies.forEach((enemy, index) => {
      enemy.move();
      if (enemy.y > this.gameCanvas.nativeElement.height) {
        this.enemies.splice(index, 1);
      }
      enemy.draw(this.ctx);
    });

    // Collision detection
    this.checkCollisions();

    // Spawn new enemies periodically
    if (Math.random() < 0.02) this.spawnEnemy();

    // Draw player
    this.player.draw(this.ctx);

    // Update score
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
  }

  private spawnEnemy() {
    const x = Math.random() * (this.gameCanvas.nativeElement.width - 40);
    this.enemies.push(new Enemy(x, -40));
  }

  private checkCollisions() {
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
          this.enemies.splice(enemyIndex, 1);
          this.bullets.splice(bulletIndex, 1);
          this.score += 10;
        }
      });
    });
  }
}

class Player {
  constructor(public x: number, public y: number) {}
  width = 50;
  height = 50;
  speed = 7;

  move(keys: any) {
    if (keys.ArrowLeft && this.x > 0) this.x -= this.speed;
    if (keys.ArrowRight && this.x < window.innerWidth - this.width) this.x += this.speed;
  }

  shoot(keys: any, bullets: Bullet[]) {
    if (keys.Space) {
      bullets.push(new Bullet(this.x + this.width / 2));
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!ctx) {
      console.error('Context is not available for drawing the player');
      return;
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  
}

class Bullet {
  constructor(public x: number, public y: number = window.innerHeight - 70) {}
  width = 5;
  height = 20;
  speed = 5;

  move() {
    this.y -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(public x: number, public y: number) {}
  width = 40;
  height = 40;
  speed = 2;

  move() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    console.log('Drawing player at:', this.x, this.y); // Debug
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  
}


