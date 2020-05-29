import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcAccordionComponent } from './mvc-accordion.component';

describe('MvcAccordionComponent', () => {
  let component: MvcAccordionComponent;
  let fixture: ComponentFixture<MvcAccordionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvcAccordionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvcAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
