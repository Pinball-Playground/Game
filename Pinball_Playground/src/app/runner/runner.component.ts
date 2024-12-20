import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  gravity: number;
  jumpStrength: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Score {
  name: string;
  score: number;
}

@Component({
  selector: 'app-runner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  public score: number = 0;
  public gameOver: boolean = false;
  private player!: Player;
  private obstacles: Obstacle[] = [];
  private obstacleTimer: number = 0;
  private obstacleInterval: number = 120;
  private gameSpeed: number = 3;
  private backgroundX: number = 0;
  public leaderboard: Score[] = [];
  public playerName: string = '';
  public showInput: boolean = false;
  private groundLevel: number = 0;

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    const gameOverText = document.getElementById('gameOver')!;
    const finalScoreText = document.getElementById('finalScore')!;
    const scoreText = document.getElementById('score')!;
    const nameInput = document.getElementById('nameInput') as HTMLInputElement;
    const leaderboardElement = document.getElementById('leaderboard')!;
    const leaderboardContent = document.getElementById('leaderboardContent')!;
    const restartButton = document.getElementById('restartButton')!;

    const playerImage = new Image();
    playerImage.src = 'assets/cube.png';

    const obstacleImage = new Image();
    obstacleImage.src = 'assets/spike.png';

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/runner_bkgnd.jpg';

    const initializeGame = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.groundLevel = canvas.height / 2;

      this.player = {
        x: 100,
        y: this.groundLevel - 30,
        width: 30,
        height: 30,
        dy: 0,
        gravity: 0.46,
        jumpStrength: -10.5
      };

      this.obstacles = [];
      this.obstacleTimer = 0;
      this.gameSpeed = 3;
      this.score = 0;
      this.backgroundX = 0;
      this.gameOver = false;

      scoreText.textContent = `Score: ${this.score}`;
      gameOverText.style.display = 'none';
      nameInput.style.display = 'none';
      leaderboardElement.style.display = 'none';
    };

    const drawBackground = () => {
      this.ctx.drawImage(backgroundImage, this.backgroundX, 0, canvas.width, canvas.height);
      this.ctx.drawImage(backgroundImage, this.backgroundX + canvas.width, 0, canvas.width, canvas.height);
      this.backgroundX -= this.gameSpeed / 2;
      if (this.backgroundX <= -canvas.width) {
        this.backgroundX = 0;
      }
    };

    const drawPlayer = () => {
      this.ctx.drawImage(playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
    };

    const updatePlayer = () => {
      this.player.dy += this.player.gravity;
      this.player.y += this.player.dy;

      if (this.player.y + this.player.height > this.groundLevel) {
        this.player.y = this.groundLevel - this.player.height;
        this.player.dy = 0;
      }
    };

    const spawnObstacle = () => {
      const spikeCount = Math.floor(Math.random() * 3) + 1; // Randomly choose 1, 2, or 3 spikes
      const spacing = 0; // Spacing between spikes

      for (let i = 0; i < spikeCount; i++) {
        this.obstacles.push({
          x: canvas.width + i * (this.player.width + spacing),
          y: this.groundLevel - this.player.height,
          width: this.player.width,
          height: this.player.height
        });
      }
    };

    const drawObstacles = () => {
      this.obstacles.forEach(obstacle => {
        this.ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    };

    const updateObstacles = () => {
      this.obstacles.forEach(obstacle => {
        obstacle.x -= this.gameSpeed;
      });

      this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    };

    const checkCollisions = () => {
      for (const obstacle of this.obstacles) {
        if (
          this.player.x < obstacle.x + obstacle.width &&
          this.player.x + this.player.width > obstacle.x &&
          this.player.y < obstacle.y + obstacle.height &&
          this.player.y + this.player.height > obstacle.y
        ) {
          this.endGame();
        }
      }
    };

    const update = () => {
      if (this.gameOver) return;

      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
      drawPlayer();
      updatePlayer();

      this.obstacleTimer++;
      if (this.obstacleTimer >= this.obstacleInterval) {
        spawnObstacle();
        this.obstacleTimer = 0;
        this.gameSpeed += 0.1;

        if (this.score > 0 && this.score % 10 === 0) {
          this.gameSpeed += 0.5;
        }

        this.score++;
        scoreText.textContent = `Score: ${this.score}`;
      }

      drawObstacles();
      updateObstacles();

      checkCollisions();

      requestAnimationFrame(update);
    };

    const keyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && this.player.y + this.player.height === this.groundLevel) {
        this.player.dy = this.player.jumpStrength;
      }
    };

    nameInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && this.showInput) {
        this.playerName = nameInput.value.toUpperCase().slice(0, 3);
        nameInput.style.display = 'none';
        this.showInput = false;
        this.saveScore();
      }
    });

    restartButton.addEventListener('click', () => {
      initializeGame();
      update();
    });

    window.addEventListener('keydown', keyDown);
    window.addEventListener('resize', initializeGame); // Handle resizing

    initializeGame();
    update();
  }

  private async endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    const finalScoreText = document.getElementById('finalScore')!;
    const gameOverText = document.getElementById('gameOver')!;
    const nameInputContainer = document.getElementById('nameInputContainer')!;
    const nameInput = document.getElementById('nameInput') as HTMLInputElement;
    const leaderboardElement = document.getElementById('leaderboard')!;
    const leaderboardContent = document.getElementById('leaderboardContent')!;

    finalScoreText.textContent = this.score.toString();
    gameOverText.style.display = 'none'; // Hide game over text while leaderboard is scrolling

    // Save the score to Firestore
    const scoresCollection = collection(this.firestore, 'runner-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    if (scoresSnapshot.size < 10 || this.score > scoresSnapshot.docs[scoresSnapshot.size - 1].data()['score']) {
      this.showInput = true;
      nameInputContainer.style.display = 'block';
      nameInput.style.display = 'block';
      nameInput.focus();
    } else {
      this.showLeaderboard();
    }
  }

  private async saveScore() {
    const scoresCollection = collection(this.firestore, 'runner-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    if (scoresSnapshot.size >= 10) {
      const lowestScoreDoc = scoresSnapshot.docs[scoresSnapshot.size - 1];
      await deleteDoc(doc(this.firestore, 'runner-scores', lowestScoreDoc.id));
    }

    await addDoc(scoresCollection, { name: this.playerName, score: this.score, date: new Date() });
    this.showLeaderboard();
  }

  private async showLeaderboard() {
    const scoresCollection = collection(this.firestore, 'runner-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    this.leaderboard = scoresSnapshot.docs.map(doc => doc.data() as Score);
    this.scrollLeaderboard();
  }

  private scrollLeaderboard() {
    const leaderboardElement = document.getElementById('leaderboard')!;
    const leaderboardContent = document.getElementById('leaderboardContent')!;
    const nameInputContainer = document.getElementById('nameInputContainer')!;
    const gameOverText = document.getElementById('gameOver')!;

    leaderboardElement.style.display = 'block';
    leaderboardContent.style.position = 'absolute';
    leaderboardContent.style.bottom = `-${window.innerHeight}px`;
    leaderboardContent.style.left = '50%';
    leaderboardContent.style.transform = 'translateX(-50%)';

    let scrollPosition = -window.innerHeight;

    const scroll = () => {
      if (scrollPosition >= leaderboardContent.scrollHeight) {
        leaderboardElement.style.display = 'none';
        if (!this.showInput) {
          gameOverText.style.display = 'block'; // Show game over text after scroll
        }
      } else {
        scrollPosition += 0.8;
        leaderboardContent.style.bottom = `${scrollPosition}px`;
        requestAnimationFrame(scroll);
      }
    };

    scroll();
  }
}
