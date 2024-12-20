import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc } from '@angular/fire/firestore';

interface Score {
  name: string;
  score: number;
}

@Component({
  selector: 'app-catch',
  templateUrl: './catch.component.html',
  styleUrls: ['./catch.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CatchComponent implements OnInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private scoreElement!: HTMLElement;
  private gameOverElement!: HTMLElement;
  private nameInput!: HTMLInputElement;
  private leaderboardElement!: HTMLElement;
  public leaderboard: Score[] = [];
  private score: number = 0;
  private isGameOver: boolean = false;
  public showInput: boolean = false;
  public playerName: string = '';

  private player = {
    x: 0,
    y: 0,
    width: 150,
    height: 20,
    speed: 10,
    color: '#3498db'
  };

  private ball = {
    x: 0,
    y: 0,
    radius: 15,
    speed: 2,
    color: '#e74c3c'
  };

  private keys = {
    left: false,
    right: false
  };

  constructor(private firestore: Firestore) { }

  ngOnInit(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.scoreElement = document.getElementById('score')!;
    this.gameOverElement = document.getElementById('game-over')!;
    this.nameInput = document.getElementById('nameInput') as HTMLInputElement;
    this.leaderboardElement = document.getElementById('leaderboard')!;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - 50;

    this.ball.x = Math.random() * this.canvas.width;
    this.ball.y = 0;

    this.updateScore();
    this.gameLoop();

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private drawPlayer(): void {
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
  }

  private drawBall(): void {
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.ball.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  private updateBall(): void {
    this.ball.y += this.ball.speed;

    if (this.ball.y - this.ball.radius > this.canvas.height) {
      this.endGame();
    }
  }

  private detectCollision(): void {
    if (
      this.ball.y + this.ball.radius >= this.player.y &&
      this.ball.x >= this.player.x &&
      this.ball.x <= this.player.x + this.player.width
    ) {
      this.score++;
      this.ball.y = 0;
      this.ball.x = Math.random() * this.canvas.width;
      this.ball.speed += 0.2;
      this.updateScore();
    }
  }

  private updateScore(): void {
    this.scoreElement.textContent = `Score: ${this.score}`;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.keys.left = true;
    } else if (event.key === 'ArrowRight') {
      this.keys.right = true;
    }
    console.log('KeyDown:', this.keys);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.keys.left = false;
    } else if (event.key === 'ArrowRight') {
      this.keys.right = false;
    }
    console.log('KeyUp:', this.keys);
  }

  private updatePlayer(): void {
    if (this.keys.left && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys.right && this.player.x < this.canvas.width - this.player.width) {
      this.player.x += this.player.speed;
    }
    console.log('Player Position:', this.player.x);
  }

  private gameLoop(): void {
    if (this.isGameOver) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updatePlayer();
    this.drawPlayer();
    this.drawBall();
    this.updateBall();
    this.detectCollision();

    requestAnimationFrame(() => this.gameLoop());
  }

  restartGame(): void {
    this.score = 0;
    this.isGameOver = false;
    this.ball.y = 0;
    this.ball.x = Math.random() * this.canvas.width;
    this.ball.speed = 2;
    this.updateScore();
    this.gameOverElement.style.display = 'none';
    this.leaderboardElement.style.display = 'none';
    this.gameLoop();
  }

  private async endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    const finalScoreText = document.getElementById('finalScore')!;
    finalScoreText.textContent = this.score.toString();
    this.gameOverElement.style.display = 'block';

    const scoresCollection = collection(this.firestore, 'catch-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    if (scoresSnapshot.size < 10 || this.score > scoresSnapshot.docs[scoresSnapshot.size - 1].data()['score']) {
      this.showInput = true;
      this.nameInput.style.display = 'block';
      this.nameInput.focus();
    } else {
      this.showLeaderboard();
    }
  }

  private async saveScore() {
    const scoresCollection = collection(this.firestore, 'catch-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    if (scoresSnapshot.size >= 10) {
      const lowestScoreDoc = scoresSnapshot.docs[scoresSnapshot.size - 1];
      await deleteDoc(doc(this.firestore, 'catch-scores', lowestScoreDoc.id));
    }

    await addDoc(scoresCollection, { name: this.playerName, score: this.score, date: new Date() });
    this.showLeaderboard();
  }

  private async showLeaderboard() {
    const scoresCollection = collection(this.firestore, 'catch-scores');
    const scoresQuery = query(scoresCollection, orderBy('score', 'desc'), limit(10));
    const scoresSnapshot = await getDocs(scoresQuery);

    this.leaderboard = scoresSnapshot.docs.map(doc => doc.data() as Score);
    this.leaderboardElement.style.display = 'block';
  }

  @HostListener('window:keydown', ['$event'])
  handleNameInput(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.showInput) {
      this.playerName = this.nameInput.value.toUpperCase().slice(0, 3);
      this.nameInput.style.display = 'none';
      this.showInput = false;
      this.saveScore();
    }
  }
}