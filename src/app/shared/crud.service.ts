import { Injectable } from '@angular/core';
import { Donor } from './donor';

import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})

export class CrudService {
  donorsRef: AngularFireList<any> | undefined;
  donorRef: AngularFireObject<any> | undefined;

  constructor(private db: AngularFireDatabase) {}

  addDonor(donor: Donor) {
    this.donorsRef?.push({
      name: donor.name,
      group: donor.group,
      mobileNumber: donor.mobileNumber,
    });
  }

  getDonor(id: string) {
    this.donorRef = this.db.object('donor-list/' + id);
    return this.donorRef;
  }

  getDonorsList() {
    this.donorsRef = this.db.list('donor-list');
    return this.donorsRef;
  }

  updateDonor(donor: Donor) {
    this.donorRef?.update({
      name: donor.name,
      group: donor.group,
      mobileNumber: donor.mobileNumber,
    });
  }

  deleteDonor(id: string) {
    this.donorRef = this.db.object('donor-list/' + id);
    this.donorRef.remove();
  }
}
