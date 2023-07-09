import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, take } from 'rxjs';

import { CrudService } from '../../shared/services/donor-crud.service';
import { Donor } from '../../shared/models/donor';
import { AuthService } from 'src/app/shared/services/auth.service';
import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { RequestStatus } from 'src/app/shared/models/request';
import { ActivatedRoute } from '@angular/router';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { DialogService } from 'src/app/shared/services/dialog-service';
import { DistrictCrudService } from 'src/app/shared/services/district-crud.service';
import { District } from 'src/app/shared/models/district';

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
  districts: District[] = [];
  filter = { district: '', location: '', group: '', availableStatus: '' };
  complexFilter: any = null;
  advanced = false;
  constructor(
    public authService: AuthService,
    private districtApi: DistrictCrudService,
    public crudApi: CrudService,
    public requestApi: RequestCrudService,
    public toastr: ToastrService,
    public route: ActivatedRoute,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    const order: any = {
      available: 0,
      soon:1,
      unavailable: 2,
    };
    const sortByDate = (a: any, b: any) => {
      const statusA = order[a.availableStatus];
      const statusB = order[b.availableStatus];
      const dateA = new Date(a.createdTime).getTime();
      const dateB = new Date(b.createdTime).getTime();
      if (statusA < statusB) {
        return -1;
      } else if (statusA > statusB) {
        return 1;
      }
      return dateB - dateA;
    };
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
              availableStatus: this.defineColor(
                c.payload.doc.data().lastDonated
              ),
              id: c.payload.doc.id,
            }))
          )
        )
        .subscribe((donorList) => {
          donorList.sort(sortByDate);
          this.donors = donorList;
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

        donorList.sort(sortByDate);

        this.donors = donorList;
      });
    }
    this.districtApi
      .getAll()
      .valueChanges()

      .pipe(take(1))
      .subscribe((districts) => {
        if (districts) {
          this.districts = districts;
        }
      });
  }

  showAdvanced(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.advanced = !this.advanced;
  }

  defineColor(lastDonated: string) {
    if (!lastDonated) {
      return 'available';
    }
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    const twoMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    return new Date(lastDonated) > threeMonthsAgo
      ? new Date(lastDonated) < twoMonthsAgo
        ? 'soon'
        : 'unavailable'
      : 'available';
  }

  applyFilter() {
    this.searchText = '';
    this.complexFilter = { ...this.filter };
  }
  clearFilter() {
    this.searchText = '';
    this.complexFilter = null;
    this.filter = { district: '', location: '', group: '', availableStatus: '' };
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
      .then(() => {})
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
