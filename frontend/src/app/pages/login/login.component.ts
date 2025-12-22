import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ApiService } from "../../services/api.service"
import { AuthService } from "../../services/auth.service"



@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <h1>Вход</h1>
    <form class="form" (ngSubmit)="submit()">
      <div *ngIf="error" class="error">{{error}}</div>
      <label>Email</label>
      <input [(ngModel)]="email" name="email" type="email" required>
      <label>Пароль</label>
      <input [(ngModel)]="password" name="password" type="password" required minlength="6">
      <button class="primary" type="submit">Войти</button>
      <div class="nav-link">
        <span>Нет аккаунта? </span>
        <a routerLink="/register">Зарегистрироваться</a>
      </div>
    </form>
  `
})
export class LoginPage {
    email = ""
    password = ""
    error = ""
    constructor(private api: ApiService, private auth: AuthService, private router: Router) { }
    submit() {
        this.error = ""
        this.api.login(this.email, this.password).subscribe({
            next: v => {
                this.auth.setAuth(v.token, v.user)
                this.router.navigateByUrl("/movies")
            },
            error: err => {
                this.error = "Неверный email или пароль"
            }
        })
    }
}
