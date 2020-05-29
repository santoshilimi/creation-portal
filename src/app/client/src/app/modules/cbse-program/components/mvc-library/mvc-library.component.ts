import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mvc-library',
  templateUrl: './mvc-library.component.html',
  styleUrls: ['./mvc-library.component.scss']
})
export class MvcLibraryComponent implements OnInit {
  exploreTab = true;

  constructor( public router: Router) { }

  ngOnInit() {
  }
  activeTab(tabName) {
    this.exploreTab = !this.exploreTab;
}
}
