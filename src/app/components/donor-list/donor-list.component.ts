import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/services/donor-crud.service';
import { Donor } from '../../shared/donor';
import { AuthService } from 'src/app/shared/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-donor-list',
  templateUrl: './donor-list.component.html',
})
export class DonorListComponent implements OnInit {
  p: number = 1;
  searchText = '';
  donors: Donor[] = [];
  hideWhenNoDonor: boolean = false;
  noData: boolean = false;
  preLoader: boolean = true;

  constructor(
    public authService: AuthService,
    public crudApi: CrudService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.dataState();
    let s = this.crudApi.getDonorsList();
    s.snapshotChanges()
    .pipe(
      map((changes) =>
        changes.map((c) => ({
          id: c.payload.doc.id,
          ...c.payload.doc.data(),
        }))
      )
    )
    .subscribe((data) => {
      this.donors = data;
    });
  }

  get isAdmin(){
    return this.authService.isAdmin();
  }

  dataState() {
    this.crudApi
      .getDonorsList()
      .valueChanges()
      .subscribe((data) => {
        this.preLoader = false;
        if (data.length <= 0) {
          this.hideWhenNoDonor = false;
          this.noData = true;
        } else {
          this.hideWhenNoDonor = true;
          this.noData = false;
        }
      });
  }

  deleteDonor(donor: any) {
    if (window.confirm('Are sure you want to delete this donor ?')) {
      this.crudApi.deleteDonor(donor.id);
      this.toastr.success(donor.name + ' successfully deleted!');
    }
  }
}
