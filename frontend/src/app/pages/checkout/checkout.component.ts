import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <h1>Оплата</h1>
    <div class="pay-summary">Сумма к оплате: {{totalDisplay()}} ₽</div>
    
    <form class="form" (ngSubmit)="pay()" #paymentForm="ngForm">
      <div *ngIf="error" class="error-message">{{error}}</div>
      <div *ngIf="success" class="success-message">{{success}}</div>
      
      <div class="field-group">
        <label>Номер карты</label>
        <input [(ngModel)]="card" 
               name="card" 
               placeholder="0000 0000 0000 0000" 
               required
               maxlength="19"
               (input)="formatCard($event)"
               [class.invalid]="cardError">
        <div *ngIf="cardError" class="field-error">{{cardError}}</div>
      </div>
      
      <div class="field-row">
        <div class="field-group">
          <label>Месяц</label>
          <input [(ngModel)]="mm" 
                 name="mm" 
                 placeholder="MM" 
                 required 
                 pattern="\\d{2}"
                 maxlength="2"
                 [class.invalid]="mmError">
          <div *ngIf="mmError" class="field-error">{{mmError}}</div>
        </div>
        
        <div class="field-group">
          <label>Год</label>
          <input [(ngModel)]="yy" 
                 name="yy" 
                 placeholder="YY" 
                 required 
                 pattern="\\d{2}"
                 maxlength="2"
                 [class.invalid]="yyError">
          <div *ngIf="yyError" class="field-error">{{yyError}}</div>
        </div>
        
        <div class="field-group">
          <label>CVV</label>
          <input [(ngModel)]="cvv" 
                 name="cvv" 
                 placeholder="000" 
                 required 
                 pattern="\\d{2,3}"
                 maxlength="3"
                 [class.invalid]="cvvError">
          <div *ngIf="cvvError" class="field-error">{{cvvError}}</div>
        </div>
      </div>
      
      <div class="field-group">
        <label>Имя на карте</label>
        <input [(ngModel)]="nameOnCard" 
               name="nameOnCard" 
               placeholder="IVANOV IVAN" 
               required
               [class.invalid]="nameError">
        <div *ngIf="nameError" class="field-error">{{nameError}}</div>
      </div>
      
      <button class="primary" type="submit" [disabled]="loading">
        {{loading ? 'Обработка...' : 'Оплатить'}}
      </button>
    </form>
  `
})
export class CheckoutPage {
    orderId = ""
    amount = 0
    fee = 5
    card = ""
    mm = ""
    yy = ""
    cvv = ""
    nameOnCard = ""
    
    error = ""
    success = ""
    loading = false
    
    cardError = ""
    mmError = ""
    yyError = ""
    cvvError = ""
    nameError = ""
    
    constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {
        this.orderId = this.route.snapshot.paramMap.get("orderId") || ""
        const st: any = this.router.getCurrentNavigation()?.extras.state || {}
        this.amount = st.amount || 0
    }
    
    totalDisplay() {
        const base = this.amount.toFixed(2)
        const total = base + this.fee
        return total
    }
    
    formatCard(event: any) {
        let value = event.target.value.replace(/\s/g, '')
        let formattedValue = value.replace(/(.{4})/g, '$1 ').trim()
        this.card = formattedValue
        this.validateCard()
    }
    
    validateCard() {
        const cleanCard = this.card.replace(/\s/g, '')
        if (cleanCard.length === 0) {
            this.cardError = ""
        } else if (!/^\d+$/.test(cleanCard)) {
            this.cardError = "Номер карты должен содержать только цифры"
        } else if (cleanCard.length < 13) {
            this.cardError = "Номер карты слишком короткий"
        } else if (cleanCard.length > 19) {
            this.cardError = "Номер карты слишком длинный"
        } else {
            this.cardError = ""
        }
    }
    
    validateExpiry() {
        const currentYear = new Date().getFullYear() % 100
        const currentMonth = new Date().getMonth() + 1
        
        const month = parseInt(this.mm)
        const year = parseInt(this.yy)
        
        if (this.mm && (month < 1 || month > 12)) {
            this.mmError = "Месяц должен быть от 01 до 12"
        } else {
            this.mmError = ""
        }
        
        if (this.yy && year < currentYear) {
            this.yyError = "Год не может быть в прошлом"
        } else if (this.yy && year === currentYear && month < currentMonth) {
            this.yyError = "Карта просрочена"
        } else {
            this.yyError = ""
        }
    }
    
    validateCVV() {
        if (this.cvv && !/^\d{2,3}$/.test(this.cvv)) {
            this.cvvError = "CVV должен содержать 2-3 цифры"
        } else {
            this.cvvError = ""
        }
    }
    
    validateName() {
        if (this.nameOnCard && this.nameOnCard.length < 2) {
            this.nameError = "Имя слишком короткое"
        } else {
            this.nameError = ""
        }
    }
    
    pay() {
        this.error = ""
        this.success = ""
        this.loading = true
        
        this.validateCard()
        this.validateExpiry()
        this.validateCVV()
        this.validateName()
        
        if (this.cardError || this.mmError || this.yyError || this.cvvError || this.nameError) {
            this.error = "Пожалуйста, исправьте ошибки в форме"
            this.loading = false
            return
        }
        
        this.api.charge(this.orderId, this.card.replace(/\s/g, ""), this.mm, this.yy, this.cvv, Number(this.totalDisplay())).subscribe({
            next: (result) => {
                this.loading = false
                this.success = "Оплата прошла успешно!"
                setTimeout(() => {
                    this.router.navigateByUrl("/orders")
                }, 2000)
            },
            error: (err) => {
                this.loading = false
                const errorCode = err?.error?.error || "payment_failed"
                
                switch (errorCode) {
                    case "card_blocked":
                        this.error = "Карта заблокирована. Обратитесь в банк."
                        break
                    case "card_expired":
                        this.error = "Срок действия карты истек."
                        break
                    case "insufficient_funds":
                        this.error = "Недостаточно средств на карте."
                        break
                    case "invalid_cvv":
                        this.error = "Неверный CVV код."
                        break
                    default:
                        this.error = "Ошибка при обработке платежа. Проверьте данные карты."
                }
            }
        })
    }
}
