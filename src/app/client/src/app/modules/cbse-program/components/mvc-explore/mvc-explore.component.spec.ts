import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcExploreComponent } from './mvc-explore.component';

describe('MvcExploreComponent', () => {
  let component: MvcExploreComponent;
  let fixture: ComponentFixture<MvcExploreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvcExploreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvcExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
