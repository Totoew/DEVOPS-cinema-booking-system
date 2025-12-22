import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { ApiService } from "../../services/api.service"



@Component({
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <h1>Афиша</h1>
    <div class="grid cols-3">
      <div class="card movie" *ngFor="let m of list">
        <div class="poster">
          <img [src]="m.poster" [alt]="m.title" *ngIf="m.poster">
          <div class="overlay">
            <div class="t">{{m.title}}</div>
            <div class="d">{{m.genre}} • {{m.durationMin}} мин • {{m.rating}}</div>
          </div>
        </div>
        <div class="movie-info">
          <button routerLink="/movie/{{m.id}}/showtimes">Выбрать сеанс</button>
        </div>
      </div>
    </div>
  `
})
export class MoviesPage implements OnInit {
    list: any[] = []
    constructor(private api: ApiService) { }
    ngOnInit() { this.api.movies().subscribe(v => this.list = v) }
}
