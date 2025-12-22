import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http"
import { Observable, map } from "rxjs"

@Injectable({ providedIn: "root" })
export class ApiService {
    base = "http://89.169.176.67:4000"
    constructor(private http: HttpClient) { }

    private authHeaders() {
        const t = localStorage.getItem("token") || ""
        return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : new HttpHeaders()
    }

    movies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/movies`)
    }

    showtimes(movieId: string): Observable<any[]> {
        const params = new HttpParams().set("movieId", movieId)
        return this.http.get<any[]>(`${this.base}/shows`, { params })
    }

    seats(showId: string): Observable<{ seats: string[]; booked: string[] }> {
        return this.http.get<any[]>(`${this.base}/seats/${showId}`).pipe(
            map(rows => {
                const toCode = (n: number) => {
                    const col = ((n - 1) % 10) + 1
                    const row = Math.ceil(n / 10)
                    return `r${row}c${col}`
                }
                const all = rows.map((r: any) => toCode(r.seatNumber))
                const booked = rows.filter((r: any) => r.isBooked).map((r: any) => toCode(r.seatNumber))
                return { seats: all, booked }
            })
        )
    }

    register(email: string, password: string): Observable<any> {
        return this.http.post(`${this.base}/auth/register`, { email, password })
            .pipe(map((r: any) => ({ token: r.token, user: { email } })))
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.base}/auth/login`, { email, password })
            .pipe(map((r: any) => ({ token: r.token, user: { email } })))
    }

    createBooking(showId: string, seats: string[], promo?: string): Observable<any> {
        const toNumber = (s: string) => {
            const m = /^r(\d+)c(\d+)$/i.exec(s)
            if (!m) return s as any
            const row = +m[1], col = +m[2]
            return (row - 1) * 10 + col
        }
        const payload = { showId, seats: seats.map(toNumber), promo }
        return this.http.post(`${this.base}/order`, payload, { headers: this.authHeaders() })
            .pipe(map((o: any) => ({ id: o.id, amount: o.amount, status: o.status })))
    }

    bookings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.base}/orders`, { headers: this.authHeaders() })
    }

    charge(orderId: string, card: string, mm: string, yy: string, cvv: string, amount: number, promo?: string): Observable<any> {
        const body = { orderId, card, mm, yy, cvv, amount, promo }
        return this.http.post(`${this.base}/payment/charge`, body, { headers: this.authHeaders() })
            .pipe(map((r: any) => ({ ok: r.ok, charged: r.charged })))
    }
}
