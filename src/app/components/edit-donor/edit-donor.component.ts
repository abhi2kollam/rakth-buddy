import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/services/donor-crud.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Donor } from 'src/app/shared/models/donor';

@Component({
  selector: 'app-edit-donor',
  templateUrl: './edit-donor.component.html',
})
export class EditDonorComponent implements OnInit {
  donor: Partial<Donor> = {};
  id: string | null = null;
  currentUser: any = {};

  constructor(
    private crudApi: CrudService,
    private fb: FormBuilder,
    private location: Location,
    private actRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentUser = this.route.parent?.snapshot.data['data'];

    this.id = this.actRoute.snapshot.paramMap.get('id') ?? null;
    if (this.id) {
      this.crudApi.getDonor(this.id).subscribe((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data() as Donor;
          data.district = data.district ?? '';
          this.donor = data;
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

  updateForm() {
    const data = this.donor;
    const currentTime = new Date().toISOString();
    if (this.id) {
      data.updatedBy = this.authService.userData.uid;
      data.updatedTime = currentTime;
      this.crudApi.updateDonor(this.id, data);
      this.toastr.success(this.donor.name + ' updated successfully');
      this.router.navigate(['home', this.currentUser?.uid, 'list']);
    } else {
      data.createdBy = this.authService.userData.uid;
      data.createdTime = currentTime;
      this.crudApi.addDonor(data);
      this.toastr.success(this.donor.name + ' successfully added!');
      this.resetForm();
    }
  }
  resetForm(form?: NgForm) {
    form?.resetForm();
    this.donor = {};
  }
}
