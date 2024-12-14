import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PinballBoardComponent } from './pinball-board/pinball-board.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { SupportComponent } from './support/support.component';
import { GameMenuComponent } from './game-menu/game-menu.component';

export const routes: Routes = [
  { path: 'game-menu', component: GameMenuComponent },
  { path: 'space-shooter', component: PinballBoardComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'support', component: SupportComponent },
  { path: '', component: HomeComponent } // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
