import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/crud.service';

@Component({
  selector: 'app-edit-donor',
  templateUrl: './edit-donor.component.html',
})
export class EditDonorComponent implements OnInit {
  editForm: FormGroup | undefined;
  id:string|null = null;
  constructor(
    private crudApi: CrudService,
    private fb: FormBuilder,
    private location: Location,
    private actRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.updateDonorData();
    this.id = this.actRoute.snapshot.paramMap.get('id') ?? null;
    if(this.id){
      this.crudApi
        .getDonor(this.id)
        .valueChanges()
        .subscribe((data) => {
          this.editForm?.setValue(data);
        });
    }
  }

  get name() {
    return this.editForm?.get('name');
  }


  get group() {
    return this.editForm?.get('group');
  }

  get mobileNumber() {
    return this.editForm?.get('mobileNumber');
  }

  updateDonorData() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      group: [
        '',
        [
          Validators.required,
        ],
      ],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }

  goBack() {
    this.location.back();
  }

  updateForm() {
    if(this.id){
      this.crudApi.updateDonor(this.editForm?.value);
      this.toastr.success(
        this.editForm?.controls['name'].value + ' updated successfully'
      );
      this.router.navigate(['home', 'list']);
    }else{
      this.crudApi.addDonor(this.editForm?.value);
      this.toastr.success(
        this.editForm?.controls['name'].value + ' successfully added!'
      );
      this.resetForm();
    }
  }
  resetForm() {
    this.editForm?.reset();
  }
}
