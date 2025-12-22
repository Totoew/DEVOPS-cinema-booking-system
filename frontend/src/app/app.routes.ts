import { Routes } from "@angular/router"
import { MoviesPage } from "./pages/movies/movies.component"
import { LoginPage } from "./pages/login/login.component"
import { RegisterPage } from "./pages/register/register.component"
import { ShowtimesPage } from "./pages/showtimes/showtimes.component"
import { SeatsPage } from "./pages/seats/seat-picker.component"
import { CheckoutPage } from "./pages/checkout/checkout.component"
import { OrdersPage } from "./pages/orders/orders.component"
import { AuthGuard } from "./guards/auth.guard"


export const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginPage },
    { path: "register", component: RegisterPage },
    { path: "movies", component: MoviesPage, canActivate: [AuthGuard] },
    { path: "movie/:id/showtimes", component: ShowtimesPage, canActivate: [AuthGuard] },
    { path: "showtime/:id/seats", component: SeatsPage, canActivate: [AuthGuard] },
    { path: "checkout/:orderId", component: CheckoutPage, canActivate: [AuthGuard] },
    { path: "orders", component: OrdersPage, canActivate: [AuthGuard] },
    { path: "**", redirectTo: "/login" }
]
