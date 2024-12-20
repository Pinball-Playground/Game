import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-runner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    const canvas = this.gameCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const playerImage = new Image();
    playerImage.src = 'assets/cube.png';

    const obstacleImage = new Image();
    obstacleImage.src = 'assets/spike.png';

    const backgroundImage = new Image();
    backgroundImage.src = 'assets/runner_bkgnd.jpg';

    const groundLevel = canvas.height * 0.75; // 1/4 of the screen from the bottom

    const player = {
      x: 100,
      y: groundLevel - 30,
      width: 30,
      height: 30,
      dy: 0,
      gravity: 0.475,
      jumpStrength: -10
    };

    const obstacles: { x: number; y: number; width: number; height: number }[] = [];
    let obstacleTimer = 0;
    const obstacleInterval = 120;

    let gameSpeed = 3;
    let score = 0;

    let backgroundX = 0;

    function drawBackground() {
      ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
      ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);
      backgroundX -= gameSpeed / 2;
      if (backgroundX <= -canvas.width) {
        backgroundX = 0;
      }
    }

    function drawPlayer() {
      ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }

    function updatePlayer() {
      player.dy += player.gravity;
      player.y += player.dy;

      if (player.y + player.height > groundLevel) {
        player.y = groundLevel - player.height;
        player.dy = 0;
      }
    }

    function spawnObstacle() {
      const spikeCount = Math.floor(Math.random() * 3) + 1; // Randomly choose 1, 2, or 3 spikes
      const spacing = 0; // Spacing between spikes

      for (let i = 0; i < spikeCount; i++) {
        obstacles.push({
          x: canvas.width + i * (player.width + spacing),
          y: groundLevel - player.height,
          width: player.width,
          height: player.height
        });
      }
    }

    function drawObstacles() {
      obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });
    }

    function updateObstacles() {
      obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
      });

      obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    }

    function checkCollisions() {
      for (const obstacle of obstacles) {
        if (
          player.x < obstacle.x + obstacle.width &&
          player.x + player.width > obstacle.x &&
          player.y < obstacle.y + obstacle.height &&
          player.y + player.height > obstacle.y
        ) {
          alert(`Game Over! Your score: ${score}`);
          resetGame();
        }
      }
    }

    function resetGame() {
      player.y = groundLevel - player.height;
      player.dy = 0;
      obstacles.length = 0;
      score = 0;
      gameSpeed = 3;
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();

      drawPlayer();
      updatePlayer();

      obstacleTimer++;
      if (obstacleTimer >= obstacleInterval) {
        spawnObstacle();
        obstacleTimer = 0;
        gameSpeed += 0.1;

        if (score > 0 && score % 10 === 0) {
          gameSpeed += 0.5;
        }

        score++;
      }

      drawObstacles();
      updateObstacles();

      checkCollisions();

      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      requestAnimationFrame(gameLoop);
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && player.y + player.height === groundLevel) {
        player.dy = player.jumpStrength;
      }
    });

    gameLoop();
  }
}
