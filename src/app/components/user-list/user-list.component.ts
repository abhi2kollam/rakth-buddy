import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, map } from 'rxjs';

import { UserExtended } from 'src/app/shared/models/user';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  p: number = 1;
  searchText = '';
  users: UserExtended[] = [];
  currentUser: any = {};

  selectedItems: string[] = ['guest','admin','super-admin'];

  constructor(
    public crudApi: UserCrudService,
    private route: ActivatedRoute,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];

    this.crudApi
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.doc.id,
            ...c.payload.doc.data(),
          }))
        )
      )
      .subscribe((data) => {
        data.forEach((item, index, list) => {
          list[index].role = list[index].role ?? 'guest';
        });

        this.users = data.filter((doc: any) => doc.id !== this.currentUser.uid);
      });
  }

  onStatusFilter(status: string, event: Event) {
    if ((event?.target as any)?.checked) {
      this.selectedItems.push(status);
    } else {
      const index = this.selectedItems.findIndex((s) => s === status);
      this.selectedItems.splice(index, 1);
    }
    this.selectedItems = [...this.selectedItems];
  }
}
