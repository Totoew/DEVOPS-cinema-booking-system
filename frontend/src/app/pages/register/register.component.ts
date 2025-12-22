import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <h1>Регистрация</h1>
    <form class="form" (ngSubmit)="submit()">
      <div *ngIf="error" class="error">{{error}}</div>
      <label>Email</label>
      <input [(ngModel)]="email" name="email" type="email" required>
      <label>Пароль</label>
      <input [(ngModel)]="password" name="password" type="password" required>
      <button class="primary" type="submit">Создать аккаунт</button>
      <div class="nav-link">
        <span>Уже есть аккаунт? </span>
        <a routerLink="/login">Войти</a>
      </div>
    </form>
  `
})
export class RegisterPage {
    email = ""
    password = ""
    error = ""
    constructor(private api: ApiService, private router: Router) { }
    submit() {
        this.error = ""
        this.api.register(this.email, this.password).subscribe({
            next: () => this.router.navigateByUrl("/login"),
            error: err => {
                const code = err?.error?.error
                this.error = code === "email_exists" ? "Такой email уже зарегистрирован" : "Ошибка регистрации"
            }
        })
    }
}
