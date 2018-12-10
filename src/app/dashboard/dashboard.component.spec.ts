import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { ListSearchComponent } from '../list-search/list-search.component';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LISTS } from '../mock-lists';
import { ListService } from '../services/list.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let listService;
  let getListsSpy;

  beforeEach(async(() => {
    listService = jasmine.createSpyObj('ListService', ['getLists']);
    getListsSpy = listService.getLists.and.returnValue( of(LISTS) );
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        ListSearchComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: ListService, useValue: listService }
      ]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Top Lists" as headline', () => {
    expect(fixture.nativeElement.querySelector('h3').textContent).toEqual('Top Lists');
  });

  it('should call listService', async(() => {
    expect(getListsSpy.calls.any()).toBe(true);
    }));

  it('should display 4 links', async(() => {
    expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
  }));

});
