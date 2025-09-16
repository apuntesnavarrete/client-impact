import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantelesDiarioComponent } from './planteles-diario.component';

describe('PlantelesDiarioComponent', () => {
  let component: PlantelesDiarioComponent;
  let fixture: ComponentFixture<PlantelesDiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantelesDiarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantelesDiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
