import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { SpaceShooterComponent } from './space-shooter/space-shooter.component';
import { RunnerComponent } from './runner/runner.component';
import { CatchComponent } from './catch/catch.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game-menu', component: GameMenuComponent },
  { path: 'space-shooter', component: SpaceShooterComponent },
  { path: 'runner', component: RunnerComponent },
  { path: 'catch', component: CatchComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
