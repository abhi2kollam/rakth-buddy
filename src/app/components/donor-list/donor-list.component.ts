import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/crud.service';
import { Donor } from '../../shared/donor';

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

  constructor(public crudApi: CrudService, public toastr: ToastrService) {}

  ngOnInit() {
    this.dataState();
    let s = this.crudApi.getDonorsList();
    s.snapshotChanges().subscribe((data) => {
      this.donors = [];
      data.forEach((item) => {
        let a: any = item.payload.toJSON();
        a['$key'] = item.key;
        this.donors.push(a as Donor);
      });
    });
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

  deleteDonor(donor: Donor) {
    if (window.confirm('Are sure you want to delete this donor ?')) {
      this.crudApi.deleteDonor(donor.$key);
      this.toastr.success(donor.name + ' successfully deleted!');
    }
  }
}
