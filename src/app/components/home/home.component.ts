import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserCrudService } from 'src/app/shared/services/user-crud.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
  showMenu = false;
  currentUser: any = {};
  showInstallAppOption = false;
  isAdmin = false;
  isSuperAdmin = false;
  mobileNumber = '';
  @ViewChild('myDialog') myDialog: ElementRef | undefined;

  @HostListener('window:click', ['$event'])
  onWindowClick(event: any) {
    const targetElement = document.getElementById('dropdown-menu');
    const clickedElement = event.target;

    // Check if the clicked element is the target element or its descendant
    if (clickedElement && !targetElement?.contains(clickedElement as any)) {
      this.showMenu = false;
    }
  }

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private userCred: UserCrudService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit(): void {
    if (!this.currentUser?.phoneNumber) {
      this.openDialog();
    }
  }

  ngOnInit(): void {
    this.currentUser = this.route.snapshot.data['data'];

    this.isSuperAdmin = this.currentUser?.role === 'super-admin';
    this.isAdmin =
      this.currentUser?.role === 'super-admin' ||
      this.currentUser?.role === 'admin';
    this.authService.setCurrentUserInfo(this.currentUser);
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      this.showInstallAppOption = true;
    }
  }

  logout(event: any) {
    event.stopPropagation();
    event.preventDefault();
    this.authService.SignOut();
    this.showMenu = false;
  }

  installApp(event: any) {
    event.stopPropagation();
    event.preventDefault();
    const customEvent = new CustomEvent('Install-App');
    document.dispatchEvent(customEvent);
    this.showMenu = false;
  }

  checkForUpdates(event: any) {
    event.stopPropagation();
    event.preventDefault();
    const customEvent = new CustomEvent('Check-For-Update');
    document.dispatchEvent(customEvent);
    this.showMenu = false;
  }

  openUserMenu(event: any) {
    event.stopPropagation();
    event.preventDefault();
    this.showMenu = !this.showMenu;
  }

  openDialog() {
    this.showMenu = false;
    this.mobileNumber = this.currentUser?.phoneNumber;
    this.myDialog?.nativeElement.showModal();
  }

  async saveStatus() {
    await this.userCred.update(this.currentUser.uid, {
      phoneNumber: this.mobileNumber,
    });
    this.toastr.success('User profile updated successfully');
    this.closeDialog();
  }

  closeDialog() {
    this.myDialog?.nativeElement.close();
  }
}
