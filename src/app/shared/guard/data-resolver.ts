import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, take } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserExtended } from '../models/user';

@Injectable()
export class DataResolver implements Resolve<UserExtended | undefined> {
  constructor(public afs: AngularFirestore) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<UserExtended | undefined> {
    // Fetch data using the data service
    const id = route.params['id'];
    return new Promise((resolve, reject) => {
      this.afs
        .doc<UserExtended>('/users/'+id)
        .get()
        .subscribe({
          next: (value) => {
            resolve(value.data()); // Resolve the Promise with the emitted value
          },
          error: (error) => {
            reject(error); // Reject the Promise with the error
          },
          complete: () => {
            // Handle completion if needed
          },
        });
    });
  }
}
