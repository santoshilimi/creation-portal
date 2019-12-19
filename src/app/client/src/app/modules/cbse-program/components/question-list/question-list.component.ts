import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input, ChangeDetectorRef, OnChanges } from '@angular/core';
import { ConfigService, ToasterService, IUserData } from '@sunbird/shared';
import { UserService, PublicDataService, ActionService, ContentService } from '@sunbird/core';
import { TelemetryService } from '@sunbird/telemetry';
import { tap, map, catchError } from 'rxjs/operators';
import * as _ from 'lodash-es';
import { UUID } from 'angular2-uuid';
import { of, forkJoin, throwError } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CbseProgramService } from '../../services';
@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit, OnChanges {
  // @Input() programContext: any;
  // @Input() role: any;
  @Input() resourceName: any;
  // @Input() templateDetails: any;
  @Output() changeStage = new EventEmitter<any>();
  @Output() publishButtonStatus = new EventEmitter<any>();
  @Input() practiceQuestionSetComponentInput: any;
  public programContext: any;
  public role: any;
  public templateDetails: any;
  public questionList = [];
  public selectedQuestionId: any;
  public questionReadApiDetails: any = {};
  public questionMetaData: any;
  public refresh = true;
  public showLoader = true;
  public enableRoleChange = false;
  public showSuccessModal = false;
  public publishInProgress = false;
  public publishedResourceId: any;
  public questionSelectionStatus: any;
  public existingContentVersionKey = '';
  selectedAll: any;
  initialized: boolean;
  private questionTypeName = {
    vsa: 'Very Short Answer',
    sa: 'Short Answer',
    la: 'Long Answer',
    mcq: 'Multiple Choice Question',
    curiosity: 'Curiosity Question'
  };

  constructor(private configService: ConfigService, private userService: UserService, private publicDataService: PublicDataService,
    public actionService: ActionService, private cdr: ChangeDetectorRef, public toasterService: ToasterService,
    public telemetryService: TelemetryService, private fb: FormBuilder, private cbseService: CbseProgramService,
    public contentService: ContentService) {
  }
  ngOnChanges(changedProps: any) {
    if (this.enableRoleChange) {
      this.initialized = false; // it should be false before fetch
      if(this.programContext.questionType) {
        this.fetchQuestionWithRole();
      }
    }
    if ((this.programContext.currentRole === 'REVIEWER') || (this.programContext.currentRole === 'PUBLISHER')) {
      this.programContext['showMode'] = 'previewPlayer';
    } else {
      this.programContext['showMode'] = 'editorForm';
    }
  }
  ngOnInit() {
    this.programContext = _.get(this.practiceQuestionSetComponentInput, 'programContext');
    this.role = _.get(this.practiceQuestionSetComponentInput, 'role');
    this.templateDetails = _.get(this.practiceQuestionSetComponentInput, 'templateDetails');
    // console.log('changes detected in question list', this.role);
    if (this.programContext.questionType) {
      this.fetchQuestionWithRole();
    } else {
      console.log(this.templateDetails.questionCategories);
    }
    this.enableRoleChange = true;
    this.selectedAll = false;
  }
  private fetchQuestionWithRole() {
    (this.role.currentRole === 'REVIEWER') ? this.fetchQuestionList(true) : this.fetchQuestionList();
  }

  private fetchQuestionList(isReviewer?: boolean) {
    const req = {
      url: `${this.configService.urlConFig.URLS.COMPOSITE.SEARCH}`,
      data: {
        'request': {
          'filters': {
            'objectType': 'AssessmentItem',
            'board': this.programContext.board,
            'framework': this.programContext.framework,
            'gradeLevel': this.programContext.gradeLevel,
            'subject': this.programContext.subject,
            'medium': this.programContext.medium,
            'type': this.programContext.questionType === 'mcq' ? 'mcq' : 'reference',
            'category': this.programContext.questionType === 'curiosity' ? 'CuriosityQuestion' :
              this.programContext.questionType.toUpperCase(),
            'topic': this.programContext.topic,
            'createdBy': this.userService.userid,
            'programId': this.programContext.programId,
            'version': 3,
            'status': []
          },
          'sort_by': { 'createdOn': 'desc' }
        }
      }
    };
    if (isReviewer) {
      delete req.data.request.filters.createdBy;
      if (this.programContext.selectedSchoolForReview) {
        req.data.request.filters['organisation'] = this.programContext.selectedSchoolForReview;
      }
      req.data.request.filters.status = ['Review'];
    }
    let apiRequest;
    apiRequest = [this.contentService.post(req).pipe(
      tap(data => this.showLoader = false),
      catchError(err => {
        const errInfo = { errorMsg: 'Fetching question list failed' };
        return throwError(this.cbseService.apiErrorHandling(err, errInfo));
      }))];
    if (this.role.currentRole === 'PUBLISHER') {
      delete req.data.request.filters.createdBy;
      req.data.request.filters.status = ['Live'];
      if (this.programContext.resourceIdentifier) {
        // tslint:disable-next-line:max-line-length
        apiRequest = [this.contentService.post(req).pipe(tap(data => this.showLoader = false),
          catchError(err => {
            const errInfo = { errorMsg: 'Fetching question list failed' };
            return throwError(this.cbseService.apiErrorHandling(err, errInfo));
          })),
        this.fetchExistingResource(this.programContext.resourceIdentifier)];
      }
    }



    forkJoin(apiRequest)
      .subscribe((res: any) => {
        this.questionList = res[0].result.items || [];
        let selectedQuestionList = [];
        if (res[1]) {
          selectedQuestionList = _.map(_.get(res[1], 'result.content.questions'), 'identifier') || [];
        }
        _.forEach(this.questionList, (question) => {
          if (_.includes(selectedQuestionList, question.identifier)) {
            question.isSelected = true;
          } else {
            question.isSelected = false;
          }
        });
        if (this.questionList.length) {
          this.selectedQuestionId = this.questionList[0].identifier;
          this.handleQuestionTabChange(this.selectedQuestionId);
          this.questionSelectionStatus = this.questionList[0].isSelected;
        }
        this.selectedAll = this.questionList.every((question: any) => {
          return question.isSelected === true;
        });
      });
  }

  fetchExistingResource(contentId) {
    const request = {
      url: `${this.configService.urlConFig.URLS.CONTENT.GET}/${contentId}`,
    };
    return this.contentService.get(request).pipe(map((response) => {
      this.existingContentVersionKey = _.get(response, 'result.content.versionKey');
      return response;
    }, err => {
      console.log(err);
    }), catchError(err => {
      const errInfo = { errorMsg: 'Resource updation failed' };
      return throwError(this.cbseService.apiErrorHandling(err, errInfo));
    }));
  }


  handleQuestionTabChange(questionId) {
    if (_.includes(this.programContext.questionList, questionId)) { return; }
    this.programContext.questionList = [];
    this.programContext.questionList.push(questionId);
    this.selectedQuestionId = questionId;
    this.showLoader = true;
    this.getQuestionDetails(questionId).pipe(tap(data => this.showLoader = false))
      .subscribe((assessment_item) => {
        let editorMode;
        if (['Draft', 'Review', 'Reject'].includes(assessment_item.status)) {
          editorMode = 'edit';
        } else {
          editorMode = 'view';
        }
        this.questionMetaData = {
          mode: editorMode,
          data: assessment_item
        };
        // min of 1sec timeOut is set, so that it should go to bottom of call stack and execute whennever the player data is available
        if (this.programContext.showMode === 'previewPlayer' && this.initialized) {
          this.showLoader = true;
          setTimeout(() => {
            this.showLoader = false;
          }, 1000);
        }
        // tslint:disable-next-line:max-line-length
        if (this.role.currentRole === 'CONTRIBUTOR' && (editorMode === 'edit' || editorMode === 'view') && (this.programContext.showMode === 'editorForm')) {
          this.refreshEditor();
        }
        this.initialized = true;
      });
    const selectedQuestion = _.find(this.questionList, { identifier: questionId });
    if (selectedQuestion) {
      this.questionSelectionStatus = selectedQuestion.isSelected;
    }
  }
  public getQuestionDetails(questionId) {
    if (this.questionReadApiDetails[questionId]) {
      return of(this.questionReadApiDetails[questionId]);
    }
    const req = {
      url: `${this.configService.urlConFig.URLS.ASSESSMENT.READ}/${questionId}`
    };
    return this.actionService.get(req).pipe(map(res => {
      this.questionReadApiDetails[questionId] = res.result.assessment_item;
      return res.result.assessment_item;
    }),
      catchError(err => {
        const errInfo = { errorMsg: 'Fetching Question details failed' };
        return throwError(this.cbseService.apiErrorHandling(err, errInfo));
      }));
  }
  public createNewQuestion(): void {
    this.questionMetaData = {
      mode: 'create'
    };
    this.refreshEditor();
  }
  public questionStatusHandler(event) {
    console.log('editor event', event);
    if (event.type === 'close') {
      this.questionMetaData = {};
      if (this.questionList.length) {
        this.handleQuestionTabChange(this.selectedQuestionId);
      }
      return;
    }
    if (event.status === 'failed') {
      console.log('failed');
    } else {
      if (event.type === 'update') {
        delete this.questionReadApiDetails[event.identifier];
        this.handleQuestionTabChange(this.selectedQuestionId);
      } if (event.type === 'Reject' || event.type === 'Live') {
        this.showLoader = true;
        setTimeout(() => this.fetchQuestionList(true), 2000);
      } else {
        this.showLoader = true;
        setTimeout(() => this.fetchQuestionList(), 2000);
      }
    }
  }

  handleRefresEvent() {
    this.refreshEditor();
  }
  private refreshEditor() {
    this.refresh = false;
    this.cdr.detectChanges();
    this.refresh = true;
  }

  selectAll() {
    _.forEach(this.questionList, (question) => {
      question.isSelected = this.selectedAll;
    });
    this.questionSelectionStatus = this.selectedAll;
  }

  checkIfAllSelected(qs) {
    this.selectedAll = this.questionList.every((question: any) => {
      return question.isSelected === true;
    });
    if (this.selectedQuestionId === qs.identifier) {
      this.questionSelectionStatus = qs.isSelected;
    }
  }
  questionQueueStatusHandler(event) {
    const selectedQuestion = _.find(this.questionList, { identifier: event.questionId });
    if (selectedQuestion) {
      selectedQuestion.isSelected = event.status;
    }
    this.selectedAll = this.questionList.every((question: any) => {
      return question.isSelected === true;
    });
    this.questionSelectionStatus = event.status;
  }
  public publishQuestions() {
    const selectedQuestions = _.filter(this.questionList, (question) => _.get(question, 'isSelected'));
    this.publishInProgress = true;
    this.publishButtonStatus.emit(this.publishInProgress);
    const selectedQuestionsData = _.reduce(selectedQuestions, (final, question) => {
      final.ids.push(_.get(question, 'identifier'));
      final.author.push(_.get(question, 'author'));
      final.category.push(_.get(question, 'category'));
      final.attributions = _.union(final.attributions, _.get(question, 'organisation'));
      return final;
    }, { ids: [], author: [], category: [], attributions: [] });

    if (selectedQuestionsData.ids.length > 0) {
      const questions = [];
      _.forEach(_.get(selectedQuestionsData, 'ids'), (value) => {
        questions.push({ 'identifier': value });
      });
      this.cbseService.getECMLJSON(selectedQuestionsData.ids).subscribe((theme) => {
        let creator = this.userService.userProfile.firstName;
        if (!_.isEmpty(this.userService.userProfile.lastName)) {
          creator = this.userService.userProfile.firstName + ' ' + this.userService.userProfile.lastName;
        }

        const option = {
          url: `private/content/v3/create`,
          data: {
            'request': {
              'content': {
                // tslint:disable-next-line:max-line-length
                'name': this.resourceName || `${this.questionTypeName[this.programContext.questionType]} - ${this.programContext.topic}`,
                'contentType': this.programContext.questionType === 'curiosity' ? 'CuriosityQuestionSet' : 'PracticeQuestionSet',
                'mimeType': 'application/vnd.ekstep.ecml-archive',
                'programId': this.programContext.programId,
                'program': this.programContext.program,
                'framework': this.programContext.framework,
                'board': this.programContext.board,
                'medium': [this.programContext.medium],
                'gradeLevel': [this.programContext.gradeLevel],
                'subject': [this.programContext.subject],
                'topic': [this.programContext.topic],
                'createdBy': this.userService.userid, // '95e4942d-cbe8-477d-aebd-ad8e6de4bfc8'  || 'edce4f4f-6c82-458a-8b23-e3521859992f',
                'creator': creator,
                'questionCategories': _.uniq(_.compact(_.get(selectedQuestionsData, 'category'))),
                'editorVersion': 3,
                'code': UUID.UUID(),
                'body': JSON.stringify(theme),
                'resourceType': this.programContext.questionType === 'curiosity' ? 'Teach' : 'Practice',
                'description': `${this.questionTypeName[this.programContext.questionType]} - ${this.programContext.topic}`,
                'questions': questions,
                'author': _.join(_.uniq(_.compact(_.get(selectedQuestionsData, 'author'))), ', '),
                'attributions': _.uniq(_.compact(_.get(selectedQuestionsData, 'attributions'))),
                'unitIdentifiers': [this.programContext.textBookUnitIdentifier],
                'plugins': [{
                  identifier: 'org.sunbird.questionunit.quml',
                  semanticVersion: '1.0'
                }],
                // tslint:disable-next-line: max-line-length
                'appIcon': 'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/content/do_11279144369168384014/artifact/qa_1561455529937.png'
              }
            }
          }
        };
        this.contentService.post(option).pipe(catchError(err => {
          const errInfo = { errorMsg: 'Resource publish failed' };
          return throwError(this.cbseService.apiErrorHandling(err, errInfo));
        }))
          .subscribe((res) => {
            console.log('res ', res);
            if (res.responseCode === 'OK' && (res.result.content_id || res.result.node_id)) {
              this.publishResource(res.result.content_id || res.result.node_id);
            }
          }, error => {
            this.publishInProgress = false;
            this.publishButtonStatus.emit(this.publishInProgress);
          });
      });
    } else {
      this.publishInProgress = false;
      this.publishButtonStatus.emit(this.publishInProgress);
      this.toasterService.error('Please select some questions to Publish');
    }
  }

  public updateQuestions() {
    const selectedQuestions = _.filter(this.questionList, (question) => _.get(question, 'isSelected'));
    this.publishInProgress = true;
    this.publishButtonStatus.emit(this.publishInProgress);
    const selectedQuestionsData = _.reduce(selectedQuestions, (final, question) => {
      final.ids.push(_.get(question, 'identifier'));
      final.author.push(_.get(question, 'author'));
      final.category.push(_.get(question, 'category'));
      final.attributions = _.union(final.attributions, _.get(question, 'organisation'));
      return final;
    }, { ids: [], author: [], category: [], attributions: [] });
    if (selectedQuestionsData.ids.length > 0) {
      const questions = [];
      _.forEach(_.get(selectedQuestionsData, 'ids'), (value) => {
        questions.push({ 'identifier': value });
      });

      const updateBody = this.cbseService.getECMLJSON(selectedQuestionsData.ids);
      const versionKey = this.getContentVersion(this.programContext.resourceIdentifier);

      forkJoin([updateBody, versionKey]).subscribe((response: any) => {
        const existingContentVersionKey = _.get(response[1], 'content.versionKey');
        const options = {
          url: `private/content/v3/update/${this.programContext.resourceIdentifier}`,
          data: {
            'request': {
              'content': {
                questions: questions,
                body: JSON.stringify(response[0]),
                versionKey: existingContentVersionKey,
                'author': _.join(_.uniq(_.compact(_.get(selectedQuestionsData, 'author'))), ', '),
                'attributions': _.uniq(_.compact(_.get(selectedQuestionsData, 'attributions'))),
                // tslint:disable-next-line:max-line-length
                name: this.resourceName || `${this.questionTypeName[this.programContext.questionType]} - ${this.programContext.topic}`
              }
            }
          }
        };
        this.contentService.patch(options).pipe(catchError(err => {
          const errInfo = { errorMsg: 'Resource updation failed' };
          return throwError(this.cbseService.apiErrorHandling(err, errInfo));
        }))
          .subscribe((res) => {
            if (res.responseCode === 'OK' && (res.result.content_id || res.result.node_id)) {
              this.publishResource(res.result.content_id || res.result.node_id);
            }
          }, error => {
            this.publishInProgress = false;
            this.publishButtonStatus.emit(this.publishInProgress);
          });
      });
    } else {
      this.publishInProgress = false;
      this.publishButtonStatus.emit(this.publishInProgress);
    }
  }

  getContentVersion(contentId) {
    const req = {
      url: `${this.configService.urlConFig.URLS.CONTENT.GET}/${contentId}?mode=edit&fields=versionKey,createdBy`
    };
    return this.contentService.get(req).pipe(
      map(res => {
        return _.get(res, 'result');
      }, err => {
        console.log(err);
        this.toasterService.error(_.get(err, 'error.params.errmsg') || 'content update failed');
      })
    );
  }
  public selectQuestionCategory(questionCategory) {
    this.programContext.questionType = questionCategory;
    this.fetchQuestionWithRole();
  }
  publishResource(contentId) {
    const requestBody = {
      request: {
        content: {
          publisher: 'CBSE',
          lastPublishedBy: this.userService.userid // '99606810-7d5c-4f1f-80b0-36c4a0b4415d'
        }
      }
    };
    const optionVal = {
      url: `private/content/v3/publish/${contentId}`,
      data: requestBody
    };
    this.contentService.post(optionVal).pipe(catchError(err => {
      const errInfo = { errorMsg: 'Resource updation failed' };
      return throwError(this.cbseService.apiErrorHandling(err, errInfo));
    }))
      .subscribe(response => {
        this.publishedResourceId = response.result.content_id || response.result.node_id || '';
        // tslint:disable-next-line:max-line-length
        this.updateHierarchyObj(contentId, this.resourceName || `${this.questionTypeName[this.programContext.questionType]} - ${this.programContext.topic}`);

      }, (err) => {
        this.publishInProgress = false;
        this.publishButtonStatus.emit(this.publishInProgress);
      });
  }

  updateHierarchyObj(contentId, name) {
    const index = _.indexOf(_.keys(this.programContext.hierarchyObj.hierarchy), this.programContext.textBookUnitIdentifier);
    if (index >= 0) {
      this.programContext.hierarchyObj.hierarchy[this.programContext.textBookUnitIdentifier].children.push(contentId);
      if (!_.has(this.programContext.hierarchyObj.hierarchy, contentId)) {
        this.programContext.hierarchyObj.hierarchy[contentId] = {
          'name': name,
          'contentType': this.programContext.questionType === 'curiosity' ? 'CuriosityQuestionSet' : 'PracticeQuestionSet',
          'children': [],
          'root': false
        };
      }
    }
    const requestBody = {
      'request': {
        'data': {
          'nodesModified': {},
          'hierarchy': this.programContext.hierarchyObj.hierarchy,
          'lastUpdatedBy': this.userService.userid
        }
      }
    };
    const req = {
      url: `private/content/v3/hierarchy/update`,
      data: requestBody
    };
    this.contentService.patch(req).pipe(catchError(err => {
      const errInfo = { errorMsg: 'Resource updation failed' };
      return throwError(this.cbseService.apiErrorHandling(err, errInfo));
    }))
      .subscribe((res) => {
        this.showSuccessModal = true;
        this.publishInProgress = false;
        this.publishButtonStatus.emit(this.publishInProgress);
        this.toasterService.success('content created & published successfully');
      }, err => {
        console.log(err);
        this.toasterService.error(_.get(err, 'error.params.errmsg') || 'content update failed');
      });
  }

  public dismissPublishModal() {
    setTimeout(() => this.changeStage.emit('prev'), 0);
  }
}
