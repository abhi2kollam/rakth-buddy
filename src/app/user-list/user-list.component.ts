import { Component, OnInit } from '@angular/core';
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

  constructor(public crudApi: UserCrudService, public toastr: ToastrService) {}

  ngOnInit() {
    // this.dataState();
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

        this.users = data.filter((doc: any) => doc.role !== 'super-admin');
      });
  }
}
