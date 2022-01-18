import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientmasterComponent } from './patientmaster.component';

describe('PatientmasterComponent', () => {
  let component: PatientmasterComponent;
  let fixture: ComponentFixture<PatientmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientmasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
