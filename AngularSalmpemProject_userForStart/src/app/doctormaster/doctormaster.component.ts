import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctormaster',
  templateUrl: './doctormaster.component.html',
  styleUrls: ['./doctormaster.component.scss']
})
export class DoctormasterComponent implements OnInit {
  collapedSideBar: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  receiveCollapsed($event: boolean) {
      this.collapedSideBar = $event;
  }

}
