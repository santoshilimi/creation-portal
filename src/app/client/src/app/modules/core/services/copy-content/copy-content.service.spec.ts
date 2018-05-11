import { TestBed, inject } from '@angular/core/testing';

import { CopyContentService } from './copy-content.service';
import { SharedModule } from '@sunbird/shared';
import { CoreModule, UserService } from '@sunbird/core';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import * as testData from './copy-content.service.spec.data';

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('CopyContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule, CoreModule],
      providers: [CopyContentService, UserService, { provide: Router, useClass: RouterStub }]
    });
  });

  it('should make copy api call and get success response', inject([CopyContentService],
    (service: CopyContentService) => {
      const userService = TestBed.get(UserService);
      userService._userProfile = testData.mockRes.userData;
      spyOn(service, 'post').and.callFake(() => Observable.of(testData.mockRes.successResponse));
      service.copyContent(testData.mockRes.contentData).subscribe(
        apiResponse => {
          expect(apiResponse.responseCode).toBe('OK');
        }
      );
    }));
});
