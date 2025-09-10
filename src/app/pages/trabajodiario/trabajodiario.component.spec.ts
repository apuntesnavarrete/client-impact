import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajodiarioComponent } from './trabajodiario.component';

describe('TrabajodiarioComponent', () => {
  let component: TrabajodiarioComponent;
  let fixture: ComponentFixture<TrabajodiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajodiarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrabajodiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
