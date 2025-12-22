import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <h1>Выбор мест</h1>
    <div class="cinema-hall">
      <div class="screen">Экран</div>
      
      <div class="legend">
        <div class="legend-item">
          <span class="seat-demo free"></span> Свободно
        </div>
        <div class="legend-item">
          <span class="seat-demo selected"></span> Выбрано
        </div>
        <div class="legend-item">
          <span class="seat-demo booked"></span> Занято
        </div>
        <div class="legend-item">
          <span class="seat-demo disabled"></span> Недоступно
        </div>
      </div>

      <div class="hall-grid">
        <div *ngFor="let row of rows; let rowIndex = index" class="seat-row">
          <span class="row-label">{{rowIndex + 1}}</span>
          <div class="seats-in-row">
            <button *ngFor="let seat of row; let seatIndex = index"
                    class="seat"
                    [class.free]="!booked.has(seat) && !selected.has(seat) && !isLastInRow(rowIndex, seatIndex)"
                    [class.selected]="selected.has(seat)"
                    [class.booked]="booked.has(seat)"
                    [class.disabled]="isLastInRow(rowIndex, seatIndex)"
                    [disabled]="booked.has(seat) || isLastInRow(rowIndex, seatIndex)"
                    (click)="toggle(seat)">
              {{seatIndex + 1}}
            </button>
          </div>
          <span class="row-label">{{rowIndex + 1}}</span>
        </div>
      </div>

      <div class="booking-panel">
        <div class="selected-seats" *ngIf="selected.size > 0">
          <h3>Выбранные места: {{selected.size}}</h3>
          <div class="selected-list">
            <span *ngFor="let seat of selectedArray()" class="selected-seat">
              Ряд {{getRowFromSeat(seat)}} Место {{getSeatFromSeat(seat)}}
            </span>
          </div>
        </div>
        
        <div class="promo-section">
          <label>Промокод</label>
          <input [(ngModel)]="promo" 
                 placeholder="Введите промокод"
                 [class.invalid]="promoError"
                 (blur)="validatePromo()">
          <div *ngIf="promoError" class="field-error">{{promoError}}</div>
        </div>
        
        <button [disabled]="selected.size === 0" 
                class="book-btn" 
                (click)="create()">
          Перейти к оплате ({{selected.size}} мест)
        </button>
      </div>
    </div>
  `
})
export class SeatsPage implements OnInit {
    id = ""
    seats: string[] = []
    rows: string[][] = []
    booked = new Set<string>()
    selected = new Set<string>()
    promo = ""
    promoError = ""
    seatsPerRow = 10
    numberOfRows = 8
    
    constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) { }
    
    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get("id") || ""
        this.api.seats(this.id).subscribe(v => {
            this.seats = v.seats
            this.booked = new Set(v.booked)
            this.buildRows()
        })
    }
    
    buildRows() {
        this.rows = []
        const hallConfig = this.getHallConfiguration()
        
        for (let row = 1; row <= hallConfig.rows; row++) {
            const rowSeats: string[] = []
            for (let seat = 1; seat <= hallConfig.seatsPerRow; seat++) {
                rowSeats.push(`r${row}c${seat}`)
            }
            this.rows.push(rowSeats)
        }
        this.numberOfRows = hallConfig.rows
        this.seatsPerRow = hallConfig.seatsPerRow
    }
    
    getHallConfiguration() {
        const hallConfigs: any = {
            "Зал 1": { rows: 8, seatsPerRow: 12 },
            "Зал 2": { rows: 10, seatsPerRow: 10 },
            "Зал 3": { rows: 6, seatsPerRow: 14 }
        }
        return hallConfigs["Зал 1"] || { rows: 8, seatsPerRow: 10 }
    }
    
    isLastInRow(rowIndex: number, seatIndex: number) { 
        return seatIndex === this.seatsPerRow - 1
    }
    
    toggle(s: string) {
        if (this.selected.has(s)) {
            this.selected.delete(s)
        } else {
            this.selected.add(s)
        }
    }
    
    selectedArray() {
        return Array.from(this.selected)
    }
    
    getRowFromSeat(seat: string): number {
        const match = seat.match(/r(\d+)c(\d+)/)
        return match ? parseInt(match[1]) : 0
    }
    
    getSeatFromSeat(seat: string): number {
        const match = seat.match(/r(\d+)c(\d+)/)
        return match ? parseInt(match[2]) : 0
    }
    
    validatePromo() {
        if (!this.promo.trim()) {
            this.promoError = ""
            return
        }
        
        const validPromoCodes = ['STUDENT', 'FRIDAY50', 'FREE']
        if (!validPromoCodes.includes(this.promo.toUpperCase())) {
            this.promoError = "Промокод недействителен"
        } else {
            this.promoError = ""
        }
    }
    
    create() {
        this.validatePromo()
        
        if (this.promoError) {
            return
        }
        
        const arr = Array.from(this.selected)
        this.api.createBooking(this.id, arr, this.promo).subscribe(v => {
            this.router.navigate(["/checkout", v.id], { state: { amount: v.amount, promo: this.promo } })
        })
    }
}
