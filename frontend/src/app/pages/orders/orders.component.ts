import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule],
    template: `
    <h1>Мои заказы</h1>
    <div class="table-like">
      <div class="row orders-head">
        <div>ID</div><div>Сеанс</div><div>Места</div><div>Статус</div><div>Сумма</div>
      </div>
      <div class="row" *ngFor="let b of list">
        <div>{{b.id}}</div>
        <div>{{b.showtimeId}}</div>
        <div>{{b.seats.join(", ")}}</div>
        <div><span class="badge" [class.success]="b.status==='paid'">{{b.status}}</span></div>
        <div>{{b.amount}} ₽</div>
      </div>
    </div>
  `
})
export class OrdersPage implements OnInit {
    list: any[] = []
    constructor(private api: ApiService) { }
    ngOnInit() {
        this.api.bookings().subscribe(v => this.list = v)
    }
}
