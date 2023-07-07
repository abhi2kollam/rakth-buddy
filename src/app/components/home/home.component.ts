import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';

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

  @HostListener('window:click', ['$event'])
  onWindowClick(event: any) {
    const targetElement = document.getElementById('dropdown-menu');
    const clickedElement = event.target;

    // Check if the clicked element is the target element or its descendant
    if (clickedElement && !targetElement?.contains(clickedElement as any)) {
      this.showMenu = false;
      // document.removeEventListener('click', this.eventListner.bind(this));
    }
  }

  constructor(public authService: AuthService, private route: ActivatedRoute) {}

  ngAfterViewInit(): void {}

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
}
