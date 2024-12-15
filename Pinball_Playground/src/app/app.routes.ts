import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SpaceShooterComponent } from './space-shooter/space-shooter.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { SupportComponent } from './support/support.component';
import { PacmanGameComponent } from './pacman-game/pacman-game.component';
import { GameMenuComponent } from './game-menu/game-menu.component';

export const routes: Routes = [
  { path: 'space-shooter', component: SpaceShooterComponent },
  { path: 'pacman-game', component: PacmanGameComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'support', component: SupportComponent },
  { path: 'game-menu', component: GameMenuComponent },
  { path: '', redirectTo: '/game-menu', pathMatch: 'full' } // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
