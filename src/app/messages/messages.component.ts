import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../services/message.service';
import { List }         from '../list-detail/list';
import { ListService }  from '../services/list.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  @Input() list: List;

  constructor(
    public messageService: MessageService,
    private listService: ListService,
    private route: ActivatedRoute,
    private location: Location
    ) {}

  ngOnInit() {
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
