import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { CrudService } from '../../shared/services/donor-crud.service';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';

@Component({
  selector: 'app-user-donor',
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent implements OnInit {
  editForm: FormGroup | undefined;
  id: string | null = null;
  constructor(
    private crudApi: UserCrudService,
    private fb: FormBuilder,
    private location: Location,
    private actRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.updateUserData();
    this.id = this.actRoute.snapshot.paramMap.get('id') ?? null;
    if (this.id) {
      this.crudApi.get(this.id).subscribe((snapshot: any) => {
        if (snapshot.exists) {
          const documentData = snapshot.data();
          const formData: any = {};
          formData.role = documentData.role ?? 'guest';
          formData.displayName = documentData.displayName ?? '';
          // Process the retrieved document here
          this.editForm?.setValue(formData);
        } else {
          // Document does not exist
          console.log('Document does not exist');
        }
      });
    }
  }

  get displayName() {
    return this.editForm?.get('displayName');
  }

  get role() {
    return this.editForm?.get('role');
  }

  updateUserData() {
    this.editForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', [Validators.required]],
    });
  }

  goBack() {
    this.location.back();
  }

  updateForm() {
    if (this.id) {
      this.crudApi.update(this.id, this.editForm?.value);
      this.toastr.success(
        this.editForm?.controls['displayName'].value + ' updated successfully'
      );
      this.router.navigate(['home', 'users']);
    }
  }
}
