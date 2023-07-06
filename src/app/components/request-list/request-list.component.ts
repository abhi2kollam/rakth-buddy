import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map } from 'rxjs';

import { CrudService } from 'src/app/shared/services/donor-crud.service';

import { RequestCrudService } from 'src/app/shared/services/request-crud.service';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { Request, RequestStatus } from 'src/app/shared/models/request';
@Component({
  selector: 'app-user-list',
  templateUrl: './request-list.component.html',
})
export class RequestListComponent implements OnInit {
  p: number = 1;
  searchText = '';
  requests: Request[] = [];

  constructor(
    public requestApi: RequestCrudService,
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
  async onDropdownChange(request: any) {
    const data: any = {
      status: request.status,
      updatedTime: new Date().toISOString(),
    };
    await this.requestApi.update(request.id, data);

    this.toastr.success('Request updated successfully');
  }
}
