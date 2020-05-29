import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcSuggestionComponent } from './mvc-suggestion.component';

describe('MvcSuggestionComponent', () => {
  let component: MvcSuggestionComponent;
  let fixture: ComponentFixture<MvcSuggestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvcSuggestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvcSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
