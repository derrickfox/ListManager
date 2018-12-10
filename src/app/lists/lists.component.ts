import { Component, OnInit } from '@angular/core';

import { List } from '../list-detail/list';
import { ListService } from '../services/list.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  lists: List[];

  constructor(private listService: ListService) { }

  ngOnInit() {
    this.getLists();
  }

  getLists(): void {
    this.listService.getLists()
    .subscribe(lists => this.lists = lists);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.listService.addList({ name } as List)
      .subscribe(list => {
        this.lists.push(list);
      });
  }

  delete(list: List): void {
    this.lists = this.lists.filter(h => h !== list);
    this.listService.deleteList(list).subscribe();
  }

}
