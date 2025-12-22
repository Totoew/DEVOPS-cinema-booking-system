import { Injectable } from "@angular/core"

@Injectable({ providedIn: "root" })
export class AuthService {
    key = "auth_token"
    userKey = "user"
    setAuth(token: string, user: any) {
        localStorage.setItem(this.userKey, JSON.stringify(user))
        localStorage.setItem("token", token)
    }
    token() {
        return localStorage.getItem("token") || ""
    }
    isLoggedIn() {
        return !!localStorage.getItem("token")
    }
    logout() {
        localStorage.removeItem("token")
        localStorage.removeItem(this.userKey)
    }
}
