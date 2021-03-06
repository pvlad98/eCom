import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserForRegister } from 'src/app/model/UserBase';
import { UserServiceService } from 'src/app/services/user-service.service';
import * as alertyfy from 'alertifyjs';
import { User } from 'src/app/model/User';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss']
})
export class UserRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  userDidRegister!: boolean;
  user: UserForRegister | undefined;
  constructor(
    private formB: FormBuilder,
    private userService: UserServiceService,private router: Router) { }

  ngOnInit(): void {
    this.createRegistrationForm();
  }

  createRegistrationForm() {
    this.registerForm = this.formB.group({
      userName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      tara: [null],
      judet: [null],
      oras: [null],
      strada: [null],
      numarul: [null],
      pfp: [null],

    }, { validators: [this.matchPassword, this.mobileisNumber] })
  }
  onSubmit() {
    this.userDidRegister = true;
    if (this.registerForm.valid) {
      this.userService.addUser(this.userData()).subscribe(() => {
        this.registerForm.reset();
        this.userDidRegister = false;
        alertyfy.success("Inregistrare cu success");
        setTimeout(() => {
          this.router.navigate(['user/login']);
        }, 1500);
      }
      );
    }
    else {
      alertyfy.error('Nu ai introdus corect datele necesare!');
    }
  }
  userData(): UserForRegister {
    return this.user = {
      userName: this.userName.value,
      email: this.email.value,
      password: this.password.value,
      mobile: this.mobile.value,

    }
  }


  matchPassword(fg: FormGroup): Validators {
    return fg.get('password')!.value === fg.get('confirmPassword')!.value
      ? null! : { notmatched: true };
  }
  mobileisNumber(fg: FormGroup): Validators {
    return (typeof +fg.get('mobile')!.value === "number" && !isNaN(+fg.get('mobile')!.value)) ? null! : { notmobile: true };
  }
  get userName() {
    return this.registerForm.get('userName') as FormControl;
  }
  get email() {
    return this.registerForm.get('email') as FormControl;
  }
  get password() {
    return this.registerForm.get('password') as FormControl;
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }
  get mobile() {
    return this.registerForm.get('mobile') as FormControl;
  }
}
