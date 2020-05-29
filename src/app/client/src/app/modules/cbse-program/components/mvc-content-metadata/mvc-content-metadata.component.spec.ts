import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvcContentMetadataComponent } from './mvc-content-metadata.component';

describe('MvcContentMetadataComponent', () => {
  let component: MvcContentMetadataComponent;
  let fixture: ComponentFixture<MvcContentMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvcContentMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvcContentMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
