import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoPreviewComponent } from './no-preview.component';

describe('NoPreviewComponent', () => {
  let component: NoPreviewComponent;
  let fixture: ComponentFixture<NoPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
