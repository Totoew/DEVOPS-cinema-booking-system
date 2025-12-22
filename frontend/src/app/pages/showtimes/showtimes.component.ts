import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, RouterLink } from "@angular/router"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <h1>Сеансы</h1>
    <div class="list">
      <div class="row showtime" *ngFor="let s of list">
        <div class="hall">{{s.hall}}</div>
        <div class="datetime">{{formatDateTime(s.startUtc)}}</div>
        <div class="price">{{s.price}} ₽</div>
        <div class="status">Доступно</div>
        <a [routerLink]="['/showtime', s.id, 'seats']" class="select-btn">Выбрать места</a>
      </div>
    </div>
  `
})
export class ShowtimesPage implements OnInit {
    list: any[] = []
    constructor(private route: ActivatedRoute, private api: ApiService) { }
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get("id")!
        this.api.showtimes(id).subscribe(v => this.list = v)
    }
    formatDateTime(utcString: string): string {
        const date = new Date(utcString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${day}.${month} ${hours}:${minutes}`
    }
}
