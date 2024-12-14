import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent {
  constructor(private router: Router) { }

  navigateTo(game: string) {
    this.router.navigate([game]);
  }
}
