import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-content">
        <h1>Кинотеатр</h1>
        <button class="logout-btn" *ngIf="auth.isLoggedIn()" (click)="logout()">Выйти</button>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      background: rgba(44, 62, 80, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      z-index: 1000;
      padding: 1rem 0;
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-content h1 {
      color: white;
      margin: 0;
      font-size: 1.5rem;
    }
    
    .logout-btn {
      background: rgba(231, 76, 60, 0.8);
      border: 1px solid #e74c3c;
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    
    .logout-btn:hover {
      background: rgba(231, 76, 60, 1);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
    }
  `]
})
export class HeaderComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    if (confirm("Вы уверены, что хотите выйти?")) {
      this.auth.logout()
      this.router.navigate(["/login"])
    }
  }
}
