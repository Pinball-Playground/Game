import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dx: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Score {
  name: string;
  score: number;
}

@Component({
  selector: 'app-space-shooter',
  templateUrl: './space-shooter.component.html',
  styleUrls: ['./space-shooter.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SpaceShooterComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  public score: number = 0;
  public gameOver: boolean = false;
  private bullets: Bullet[] = [];
  private player!: Player;
  private enemies: Enemy[] = [];
  private frames: number = 0;
  private isGameOver: boolean = false;
  private backgroundY: number = 0;
  private canShoot: boolean = true;
  private enemySpawnRate: number = 100;
  public leaderboard: Score[] = [];
  public playerName: string = '';
  public showInput: boolean = false;

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    const gameOverText = document.getElementById('gameOver')!;
    const finalScoreText = document.getElementById('finalScore')!;
    const scoreText = document.getElementById('score')!;
    const nameInput = document.getElementById('nameInput') as HTMLInputElement;
    const leaderboardElement = document.getElementById('leaderboard')!;

    const backgroundImg = new Image();
    backgroundImg.src = 'assets/space-background.jpg'; // Ensure this path is correct

    const playerSprite = new Image();
    playerSprite.src = 'assets/player-ship.png'; // Ensure this path is correct

    const enemySprite = new Image();
    enemySprite.src = 'assets/enemy-ship.png'; // Ensure this path is correct

    const initializeGame = () => {
      // Update canvas dimensions to match the window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      this.player = {
        x: canvas.width / 2 - 20,
        y: canvas.height - 100,
        width: 40,
        height: 40,
        speed: 10,
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

      scoreText.textContent = `Score: ${this.score}`;
      gameOverText.style.display = 'none';
      nameInput.style.display = 'none';
      leaderboardElement.style.display = 'none';
    };

    const drawBackground = () => {
      this.backgroundY += 1; // Scroll speed
      if (this.backgroundY >= canvas.height) {
        this.backgroundY = 0;
      }
      this.ctx.drawImage(backgroundImg, 0, this.backgroundY - canvas.height, canvas.width, canvas.height);
      this.ctx.drawImage(backgroundImg, 0, this.backgroundY, canvas.width, canvas.height);
    };

    const drawPlayer = () => {
      this.ctx.drawImage(playerSprite, this.player.x, this.player.y, this.player.width, this.player.height);
    };

    const createBullet = () => {
      this.bullets.push({
        x: this.player.x + this.player.width / 2 - 5,
        y: this.player.y,
        width: 10,
        height: 20,
        speed: 10
      });
    };

    const drawBullets = () => {
      this.bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        if (bullet.y + bullet.height < 0) {
          this.bullets.splice(index, 1);
        } else {
          this.ctx.fillStyle = 'yellow';
          this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
      });
    };

    const createEnemy = () => {
      this.enemies.push({
        x: Math.random() * (canvas.width - 80),
        y: -80,
        width: 80,
        height: 80,
        speed: 1.5
      });
    };

    const drawEnemies = () => {
      this.enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        if (enemy.y > canvas.height) {
          endGame();
        } else {
          this.ctx.save();
          this.ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          this.ctx.rotate(Math.PI); // Rotate 180 degrees
          this.ctx.drawImage(enemySprite, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
          this.ctx.restore();
        }

        if (
          this.player.x < enemy.x + enemy.width &&
          this.player.x + this.player.width > enemy.x &&
          this.player.y < enemy.y + enemy.height &&
          this.player.y + this.player.height > enemy.y
        ) {
          endGame();
        }
      });
    };

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
            updateScore(50);
          }
        });
      });
    };

    const movePlayer = () => {
      this.player.x += this.player.dx;

      if (this.player.x < 0) this.player.x = 0;
      if (this.player.x + this.player.width > canvas.width) this.player.x = canvas.width - this.player.width;
    };

    const updateScore = (points: number) => {
      this.score += points;
      scoreText.textContent = `Score: ${this.score}`;

      if (this.score % 500 === 0) {
        this.enemySpawnRate = Math.max(20, this.enemySpawnRate - 10); // Increase spawn frequency, minimum spawn rate is 20
      }
    };

    const endGame = async () => {
      this.isGameOver = true;
      finalScoreText.textContent = this.score.toString();
      gameOverText.style.display = 'none'; // Hide game over text initially

      // Save the score to Firestore
      const scoresCollection = collection(this.firestore, 'scores');
      const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
      const scoresSnapshot = await getDocs(scoresQuery);

      if (scoresSnapshot.size < 10 || this.score > scoresSnapshot.docs[scoresSnapshot.size - 1].data()['score']) {
        this.showInput = true;
        nameInput.style.display = 'block';
        nameInput.focus();
      } else {
        this.showLeaderboard();
      }
    };

    const saveScore = async () => {
      const scoresCollection = collection(this.firestore, 'scores');
      const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
      const scoresSnapshot = await getDocs(scoresQuery);

      if (scoresSnapshot.size >= 10) {
        const lowestScoreDoc = scoresSnapshot.docs[scoresSnapshot.size - 1];
        await deleteDoc(doc(this.firestore, 'scores', lowestScoreDoc.id));
      }

      await addDoc(scoresCollection, { name: this.playerName, score: this.score, date: new Date() });
      this.showLeaderboard();
    };

    const showLeaderboard = async () => {
      const scoresCollection = collection(this.firestore, 'scores');
      const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
      const scoresSnapshot = await getDocs(scoresQuery);

      this.leaderboard = scoresSnapshot.docs.map(doc => doc.data() as Score);
      this.scrollLeaderboard();
    };

    const scrollLeaderboard = () => {
      const leaderboardElement = document.getElementById('leaderboard')!;
      leaderboardElement.style.display = 'block';
      leaderboardElement.style.position = 'absolute';
      leaderboardElement.style.left = '50%';
      leaderboardElement.style.transform = 'translateX(-50%)';
      leaderboardElement.style.bottom = '-100%'; // Start from below the screen

      let scrollPosition = -leaderboardElement.scrollHeight;

      const scroll = () => {
        if (scrollPosition >= window.innerHeight) {
          leaderboardElement.style.display = 'none';
          gameOverText.style.display = 'block'; // Show game over text after scroll
        } else {
          scrollPosition += 0.8; // Adjust scroll speed as needed
          leaderboardElement.style.bottom = `${scrollPosition}px`;
          requestAnimationFrame(scroll);
        }
      };

      scroll();
    };

    const update = () => {
      if (this.isGameOver) return;

      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
      drawPlayer();
      drawBullets();
      drawEnemies();
      detectCollisions();
      movePlayer();

      this.frames++;
      if (this.frames % this.enemySpawnRate === 0) createEnemy();

      requestAnimationFrame(update);
    };

    const keyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.player.dx = -this.player.speed;
      if (e.key === 'ArrowRight' || e.key === 'd') this.player.dx = this.player.speed;
      if (e.key === 'r' && this.isGameOver && !this.showInput) { // Check if name input is not visible
        initializeGame();
        update();
      } else if (e.key === ' ' && this.canShoot && !this.isGameOver) {
        createBullet();
        this.canShoot = false;
      }
    };

    const keyUp = (e: KeyboardEvent) => {
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
    };

    nameInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && this.showInput) {
        this.playerName = nameInput.value.toUpperCase().slice(0, 3);
        nameInput.style.display = 'none';
        this.showInput = false;
        saveScore();
      }
    });

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('resize', initializeGame); // Handle resizing

    initializeGame();
    update();
  }

  private async showLeaderboard() {
    const scoresCollection = collection(this.firestore, 'scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    this.leaderboard = scoresSnapshot.docs.map(doc => doc.data() as Score);
    this.scrollLeaderboard();
  }

  private scrollLeaderboard() {
    const leaderboardElement = document.getElementById('leaderboard')!;
    leaderboardElement.style.display = 'block';
    leaderboardElement.style.position = 'absolute';
    leaderboardElement.style.left = '50%';
    leaderboardElement.style.transform = 'translateX(-50%)';
    leaderboardElement.style.bottom = '-100%'; // Start from below the screen

    let scrollPosition = -leaderboardElement.scrollHeight;

    const scroll = () => {
      if (scrollPosition >= window.innerHeight) {
        leaderboardElement.style.display = 'none';
        const gameOverText = document.getElementById('gameOver')!;
        gameOverText.style.display = 'block'; // Show game over text after scroll
      } else {
        scrollPosition += 0.8; // Adjust scroll speed as needed
        leaderboardElement.style.bottom = `${scrollPosition}px`;
        requestAnimationFrame(scroll);
      }
    };

    scroll();
  }
}