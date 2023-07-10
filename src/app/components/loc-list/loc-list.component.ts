import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';

import { District } from 'src/app/shared/models/district';
import { Role } from 'src/app/shared/models/user';
import { DistrictCrudService } from 'src/app/shared/services/district-crud.service';

@Component({
  selector: 'app-loc-list',
  templateUrl: './loc-list.component.html',
})
export class LocListComponent implements OnInit {
  p: number = 1;
  searchText = '';
  districts: District[] = [];
  currentUser: any = {};
  hideWhenNoDist: boolean = false;
  noData: boolean = false;
  preLoader: boolean = true;
  roles = Role;

  constructor(
    public distApi: DistrictCrudService,
    private route: ActivatedRoute,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];
    this.distApi
      .getAll()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            ...c.payload.doc.data(),
            id: c.payload.doc.id,
          }))
        )
      )
      .subscribe((data) => {
        this.districts = data;
        this.handleDataChange(this.districts);
      });
  }
  saveNewDist(distName: string) {
    // if (distName) {
    //   this.distApi.add({ name: distName });
    // }
  }
  private handleDataChange(locList: District[]) {
    this.preLoader = false;
    this.hideWhenNoDist = !(locList.length <= 0);
    this.noData = locList.length <= 0;
  }
}
