import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacmanGameComponent } from './pacman-game.component';

describe('PacmanGameComponent', () => {
  let component: PacmanGameComponent;
  let fixture: ComponentFixture<PacmanGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacmanGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacmanGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
