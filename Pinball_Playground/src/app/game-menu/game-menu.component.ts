import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent {
  constructor(private router: Router,private location: Location) { }

  goBack(): void {
    this.location.back();
  }

  navigateTo(game: string) {
    this.router.navigate([game]);
  }
}
