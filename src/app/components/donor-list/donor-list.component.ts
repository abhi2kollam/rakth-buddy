import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';

import { CrudService } from '../../shared/services/donor-crud.service';
import { Donor } from '../../shared/models/donor';
import { AuthService } from 'src/app/shared/services/auth.service';
import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { RequestStatus } from 'src/app/shared/models/request';
import { ActivatedRoute } from '@angular/router';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { DialogService } from 'src/app/shared/services/dialog-service';

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
  isAdmin = false;
  currentUser: any = {};
  constructor(
    public authService: AuthService,
    public crudApi: CrudService,
    public requestApi: RequestCrudService,
    public toastr: ToastrService,
    public route: ActivatedRoute,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];
    this.isAdmin =
      this.currentUser.role === 'admin' ||
      this.currentUser.role === 'super-admin';
    this.dataState();
    if (this.isAdmin) {
      let s = this.crudApi.getDonorsList();
      s.snapshotChanges()
        .pipe(
          map((changes) =>
            changes.map((c) => ({
              ...c.payload.doc.data(),
              availableStatus: this.defineColor(c.payload.doc.data().lastDonated),
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
          const isSameCreator =
            donor.data().createdBy === this.authService.userData?.uid;
          donorList.push({
            ...donor.data(),
            availableStatus: this.defineColor(donor.data().lastDonated),
            id: donor.id,
            isSameCreator,
            status: requestData[0]?.data()?.status,
            remarks: requestData[0]?.data()?.remarks,
          });
        });

        this.donors = donorList;
      });
    }
  }

  defineColor(lastDonated: string) {
    if (!lastDonated) {
      return 'available';
    }
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    return new Date(lastDonated) > threeMonthsAgo ? 'unavailable' : 'available';
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
  copyContact(donor: any) {
    navigator.clipboard
      .writeText(donor.mobileNumber)
      .then(() => {
      })
      .catch((error) => {
        console.error('Error copying mobile number:', error);
        // You can display an error message to the user if copying failed
      });
  }

  deleteDonor(donor: any) {
    this.dialogService
      .openConfirmation('Are sure you want to delete this donor ')
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.crudApi.deleteDonor(donor.id);
          this.toastr.success(donor.name + ' successfully deleted!');
        }
      });
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
