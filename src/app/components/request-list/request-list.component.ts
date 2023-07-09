import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';

import { CrudService } from 'src/app/shared/services/donor-crud.service';
import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { Request } from 'src/app/shared/models/request';
import { DialogService } from 'src/app/shared/services/dialog-service';
import { ActivatedRoute } from '@angular/router';
import { UserExtended } from 'src/app/shared/models/user';
@Component({
  selector: 'app-user-list',
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  p: number = 1;
  searchText = '';
  requests: Request[] = [];
  request: Partial<Request> = {};
  @ViewChild('myDialog') myDialog: ElementRef | undefined;
  selectedItems = ['pending', 'on-hold', 'approved', 'rejected'];
  currentUser: UserExtended | null = null;
  constructor(
    public requestApi: RequestCrudService,
    private dialogService: DialogService,
    public userApi: UserCrudService,
    public donorApi: CrudService,
    public toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];
    this.loadList();
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

  loadList() {
    combineLatest([
      this.donorApi.getDonorsList().get(),
      this.userApi.getAll().get(),
      this.requestApi.getAll().get(),
    ]).subscribe(([donors, users, requests]) => {
      const requestList: any = [];
      requests?.forEach((request) => {
        const requestData = request.data();
        const userData = users?.docs
          .find((user) => user.id === requestData.requesterId)
          ?.data();
        const donorData = donors?.docs
          .find((donor) => donor.id === requestData.donorId)
          ?.data();
        if (
          this.currentUser?.role == 'super-admin' ||
          (donorData?.district &&
            this.currentUser?.assignedDistricts &&
            this.currentUser?.assignedDistricts?.includes(donorData?.district))
        ) {
          requestList.push({
            ...request.data(),
            id: request.id,
            requesterName: userData?.displayName,
            requesterEmail: userData?.email,
            requesterMobile: userData?.phoneNumber,
            donorName: donorData?.name,
            donorMobile: donorData?.mobileNumber,
            donorDistrict: donorData?.district,
          });
        }
      });
      const order: any = {
        pending: 0,
        'on-hold': 1,
        approved: 2,
        rejected: 3,
      };
      const sortByDate = (a: any, b: any) => {
        const statusA = order[a.status];
        const statusB = order[b.status];
        const dateA = new Date(a.updatedTime).getTime();
        const dateB = new Date(b.updatedTime).getTime();
        if (statusA < statusB) {
          return -1;
        } else if (statusA > statusB) {
          return 1;
        }
        return dateA - dateB;
      };
      requestList.sort(sortByDate);
      this.requests = requestList;
    });
  }
  async saveStatus() {
    const data: any = {
      status: this.request.status,
      remarks: this.request.remarks,
      updatedTime: new Date().toISOString(),
    };
    await this.requestApi.update((this.request as any).id, data);
    this.closeDialog();
    this.toastr.success('Request updated successfully');
  }

  deleteRequest(request: any) {
    this.dialogService
      .openConfirmation('Are sure you want to delete this request ')
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.requestApi.delete(request.id);
          this.toastr.success('request successfully deleted!');
          this.loadList();
        }
      });
  }
  openDialog(request: Partial<Request>) {
    this.request = request;
    this.myDialog?.nativeElement.showModal();
  }

  closeDialog() {
    this.myDialog?.nativeElement.close();
  }
}
