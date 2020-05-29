import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SanitizeHtmlPipe } from './pipe/sanitize-html.pipe';
import { QuestionListComponent,
  QuestionCreationComponent, ChapterListComponent, McqCreationComponent, McqTemplateSelectionComponent,
  CkeditorToolComponent, QuestionPreviewComponent } from './components';
import { SuiTabsModule, SuiModule } from 'ng2-semantic-ui';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '@sunbird/shared';
import { QuestionCreationHeaderComponent } from './components/question-creation-header/question-creation-header.component';
import { TelemetryModule } from '@sunbird/telemetry';
import { PlayerHelperModule } from '@sunbird/player-helper';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RecursiveTreeComponent } from './components/recursive-tree/recursive-tree.component';
import { ContentUploaderComponent } from './components/content-uploader/content-uploader.component';
import { ResourceTemplateComponent } from './components/resource-template/resource-template.component';
import { DynamicModule } from 'ng-dynamic-component';
import { CommonConsumptionModule } from '@project-sunbird/common-consumption';
import { CollectionComponent } from './components/collection/collection.component';
import { ResourceReorderComponent } from './components/resource-reorder/resource-reorder.component';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';
import { CollectionHierarchyService } from './services/collection-hierarchy/collection-hierarchy.service';
import { SlickModule } from 'ngx-slick';
import { SharedFeatureModule } from '../shared-feature';
import { RouterModule } from '@angular/router';
import { MvcLibraryComponent } from './components/mvc-library/mvc-library.component';
import { MvcExploreComponent } from './components/mvc-explore/mvc-explore.component';
import { MvcSuggestionComponent } from './components/mvc-suggestion/mvc-suggestion.component';
import {CbseRoutingModule} from './cbse-routing.module';
import { MvcListComponent } from './components/mvc-list/mvc-list.component';
import { MvcAccordionComponent } from './components/mvc-accordion/mvc-accordion.component';
import { FilterComponent } from './components/filter/filter.component';
import { NoPreviewComponent } from './components/no-preview/no-preview.component';
import { MvcContentMetadataComponent } from './components/mvc-content-metadata/mvc-content-metadata.component';
@NgModule({
  declarations: [QuestionListComponent, QuestionCreationComponent,
    ChapterListComponent, McqCreationComponent, CkeditorToolComponent ,
    McqTemplateSelectionComponent,
    QuestionPreviewComponent, SanitizeHtmlPipe, QuestionCreationHeaderComponent,
    DashboardComponent, RecursiveTreeComponent,
    ContentUploaderComponent,  ResourceTemplateComponent,
     CollectionComponent, ResourceReorderComponent,
      ContentEditorComponent, MvcLibraryComponent, MvcExploreComponent, MvcSuggestionComponent, MvcListComponent, MvcAccordionComponent, FilterComponent, NoPreviewComponent, MvcContentMetadataComponent],
  imports: [
    RouterModule,
    CommonModule,
    CbseRoutingModule,
    SuiTabsModule,
    CommonConsumptionModule,
    SuiModule,
    ReactiveFormsModule, FormsModule, SharedModule,
    InfiniteScrollModule,
    SharedFeatureModule,
    PlayerHelperModule,
    TelemetryModule,
    SlickModule.forRoot(),
    DynamicModule.withComponents([QuestionListComponent,
       QuestionCreationComponent, ChapterListComponent, McqCreationComponent, CkeditorToolComponent ,
      McqTemplateSelectionComponent,
      QuestionPreviewComponent, QuestionCreationHeaderComponent,
      DashboardComponent, RecursiveTreeComponent, ContentUploaderComponent, ResourceTemplateComponent, ContentEditorComponent]),

  ],
  providers: [CollectionHierarchyService],
  exports: [ SanitizeHtmlPipe ]
})
export class CbseProgramModule { }
