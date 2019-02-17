import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { List }         from './list';
import { ListService }  from '../services/list.service';

@Component({
  selector: 'app-details-panel',
  templateUrl: './details-panel.component.html',
  styleUrls: ['./details-panel.component.css']
})
export class DetailsPanelComponent implements OnInit {
  @Input() list: List;

  constructor(
    private route: ActivatedRoute,
    private listService: ListService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  handleClick(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.listService.getList(id).subscribe(list => this.list = list);
    
  }

  getList(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.listService.getList(id).subscribe(list => this.list = list);
  }

  goBack(): void {
    this.location.back();
  }

 save(): void {
    this.listService.updateList(this.list).subscribe(() => this.goBack());
  }
}
