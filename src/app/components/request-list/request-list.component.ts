import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';

import { CrudService } from 'src/app/shared/services/donor-crud.service';
import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { Request } from 'src/app/shared/models/request';
import { DialogService } from 'src/app/shared/services/dialog-service';
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

  constructor(
    public requestApi: RequestCrudService,
    private dialogService: DialogService,
    public userApi: UserCrudService,
    public donorApi: CrudService,
    public toastr: ToastrService
  ) {}

  async ngOnInit() {
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
      });

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
    this.closeDialog()

    this.toastr.success('Request updated successfully');
  }

  deleteRequest(request: any) {
    this.dialogService
      .openConfirmation('Are sure you want to delete this donor ')
      .then((confirmed: boolean) => {
        if (confirmed) {
          this.requestApi.delete(request.id);
          this.toastr.success('request successfully deleted!');
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
