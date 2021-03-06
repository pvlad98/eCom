import { Component, HostListener, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/model/User';
import * as alertyfy from 'alertifyjs';
import { UserServiceService } from 'src/app/services/user-service.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  public loggedinUser!: string;
  public wasInside = true;
  userName!: string;
  user?: User ;
  public text!: String;
  ok!: boolean;
  url = '';
  constructor(public userService: UserServiceService,
    private router: Router) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {

      this.userService.getUser(localStorage.getItem('user')!).subscribe(
        (us: any) => {
          this.user = us;
        }
      );
    }
  }

  reload() {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      document.getElementById("mySidenav")!.style.width = "0";
    }
    this.wasInside = false;
  }


  onLogin(loginForm: NgForm) {
    this.userService.authUser(loginForm.value).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', response.userName);
        this.userName = response.userName;
        this.userService.getUser(response.userName).subscribe(
          (us: any) => {
            this.user = us;
          }
        );
        alertyfy.success('Login Reusit!');
        this.router.navigate(['/']);
      }
    );
  }
  loggedin() {
    this.loggedinUser = localStorage.getItem('token')!;
    this.userName = localStorage.getItem('user')!;
    return this.loggedinUser;
  }
  onLogout() {
    this.userService.onLogout();
  }
  openNav() {
    document.getElementById("mySidenav")!.style.width = "280px";
  }

  /* Set the width of the side navigation to 0 */
  closeNav() {
    document.getElementById("mySidenav")!.style.width = "0";
  }
}
