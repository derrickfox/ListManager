import { Component, OnInit } from '@angular/core';
import { List } from '../list-detail/list';
import { ListService } from '../services/list.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  lists: List[] = [];

  constructor(private listService: ListService) { }

  ngOnInit() {
    this.getLists();
  }

  getLists(): void {
    this.listService.getLists()
      .subscribe(lists => this.lists = lists.slice(1, 5));
  }
}
