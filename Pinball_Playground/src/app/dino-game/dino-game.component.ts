import { Component } from '@angular/core';

@Component({
  selector: 'app-dino-game',
  imports: [],
  templateUrl: './dino-game.component.html',
  styleUrl: './dino-game.component.css'
})
export class DinoGameComponent {

  function showTime() {
  document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
  showTime();
}, 1000);

}
