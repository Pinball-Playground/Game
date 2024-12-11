import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinballBoardComponent } from './pinball-board.component';

describe('PinballBoardComponent', () => {
  let component: PinballBoardComponent;
  let fixture: ComponentFixture<PinballBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinballBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinballBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
