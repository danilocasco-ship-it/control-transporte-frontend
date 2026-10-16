import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertcustomService } from 'src/app/core/services/alertcustom.service';
import { LoginRequestDTO } from './DTO/LoginRequestDTO';
import { LoginResponseDTO } from './DTO/LoginResponseDTO';
import { LoginService } from './Services/LoginService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType = false;
  returnUrl = '/';
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private alertService: AlertcustomService
  ) {}

  ngOnInit(): void {
    if (this.loginService.token) {
      void this.router.navigate(['/']);
      return;
    }

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.login();
  }

  login(): void {
    const loginData = new LoginRequestDTO({
      codusuario: this.f['username'].value,
      clave: this.f['password'].value,
      codempresa: 9,
    });

    this.loginService.login(loginData).then(
      (response: LoginResponseDTO) => {
        if (!response?.token) {
          this.alertService.showWarning(
            response?.respuesta || 'Usuario o contraseña incorrectos'
          );
          return;
        }

        this.loginService.saveToken(response.token);
        void this.router.navigateByUrl(this.returnUrl || '/');
      },
      (error: LoginResponseDTO | Error) => {
        if (error instanceof Error) {
          this.alertService.showError(error.message, 'Error inesperado');
        } else {
          this.alertService.showError(
            error.respuesta || 'No se pudo iniciar sesión',
            'Error de la API'
          );
        }
      }
    );
  }

  toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }
}
