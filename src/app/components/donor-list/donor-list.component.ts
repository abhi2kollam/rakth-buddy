import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';

import { CrudService } from '../../shared/services/donor-crud.service';
import { Donor } from '../../shared/models/donor';
import { AuthService } from 'src/app/shared/services/auth.service';
import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { RequestStatus } from 'src/app/shared/models/request';

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
    public requestApi: RequestCrudService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.dataState();
    if (this.authService.isAdmin()) {
      let s = this.crudApi.getDonorsList();
      s.snapshotChanges()
        .pipe(
          map((changes) =>
            changes.map((c) => ({
              ...c.payload.doc.data(),
              id: c.payload.doc.id,
            }))
          )
        )
        .subscribe((data) => {
          this.donors = data;
        });
    } else {
      combineLatest([
        this.crudApi.getDonorsList().get(),
        this.requestApi.getAll().get(),
      ]).subscribe(([donors, requests]) => {
        const donorList: any = [];
        donors?.forEach((donor) => {
          const requestData = requests?.docs.filter(
            (request) =>
              request.data().donorId === donor.id &&
              request.data().requesterId === this.authService.userData?.uid
          );
          donorList.push({
            ...donor.data(),
            id: donor.id,
            status: requestData[0]?.data()?.status,
          });
        });

        this.donors = donorList;
      });
    }
  }

  get isAdmin() {
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
  requestContact(event: any, donor: Donor) {
    event.stopPropagation();
    event.preventDefault();
    this.requestApi.addRequest({
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      donorId: donor.id,
      remarks: '',
      requesterId: this.authService.userData?.uid,
      status: RequestStatus.pending,
    });
    this.toastr.success(donor.name + `'s contact request placed successfully`);
  }
}
