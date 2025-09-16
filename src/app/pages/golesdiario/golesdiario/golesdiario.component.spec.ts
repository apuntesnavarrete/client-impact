import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GolesdiarioComponent } from './golesdiario.component';

describe('GolesdiarioComponent', () => {
  let component: GolesdiarioComponent;
  let fixture: ComponentFixture<GolesdiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GolesdiarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GolesdiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
