import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SpaceShooterComponent } from './space-shooter/space-shooter.component';
import { SupportComponent } from './support/support.component';
import { GameMenuComponent } from './game-menu/game-menu.component';
import { RunnerComponent } from './runner/runner.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game-menu', component: GameMenuComponent },
  { path: 'space-shooter', component: SpaceShooterComponent },
  { path: 'runner', component: RunnerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
