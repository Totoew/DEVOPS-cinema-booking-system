// import express from "express"
// import cors from "cors"
// import fs from "fs"
// import path from "path"
// import { fileURLToPath } from "url"
// import jwt from "jsonwebtoken"
// import { nanoid } from "nanoid"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const dbPath = path.join(__dirname, "db.json")
// const app = express()
// app.use(cors())
// app.use(express.json())

// function loadDb() {
//     const raw = fs.readFileSync(dbPath, "utf8")
//     return JSON.parse(raw)
// }

// function saveDb(db) {
//     fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
// }

// function tokenFor(email) {
//     return jwt.sign({ email }, "dev-secret")
// }

// function requireAuth(req, res, next) {
//     const h = req.headers["authorization"] || ""
//     const token = h.replace("Bearer ", "")
//     try {
//         const data = jwt.verify(token, "dev-secret")
//         req.userEmail = data.email
//         next()
//     } catch (e) {
//         res.status(401).json({ error: "unauthorized" })
//     }
// }

// app.post("/auth/register", (req, res) => {
//     const { email, password } = req.body || {}
//     if (!email || !password) return res.status(400).json({ error: "invalid" })
//     const db = loadDb()
//     const exists = db.users.find(u => u.email === email)
//     if (exists) return res.status(409).json({ error: "email_exists" })
//     db.users.push({ email, passwordHash: password })
//     saveDb(db)
//     res.json({ token: tokenFor(email) })
// })

// app.post("/auth/login", (req, res) => {
//     const { email, password } = req.body || {}
//     const db = loadDb()
//     const user = db.users.find(u => u.email === email)
//     if (!user) return res.status(401).json({ error: "invalid" })
//     if (user.passwordHash !== password) return res.status(401).json({ error: "invalid" })
//     res.json({ token: tokenFor(email) })
// })

// app.get("/movies", (req, res) => {
//     const db = loadDb()
//     res.json(db.movies)
// })

// app.get("/shows", (req, res) => {
//     const db = loadDb()
//     const { movieId } = req.query
//     const list = movieId ? db.shows.filter(s => s.movieId === movieId) : db.shows
//     res.json(list)
// })

// app.get("/shows/:id", (req, res) => {
//     const db = loadDb()
//     const s = db.shows.find(x => x.id === req.params.id)
//     if (!s) return res.status(404).json({ error: "not_found" })
//     res.json(s)
// })

// app.get("/seats/:showId", (req, res) => {
//     const db = loadDb()
//     const seats = db.seats.filter(s => s.showId === req.params.showId)
//     res.json(seats)
// })

// app.post("/order", (req, res) => {
//     const { showId, seats, promo } = req.body || {}
//     if (!showId || !Array.isArray(seats) || seats.length === 0) return res.status(400).json({ error: "invalid" })
//     const db = loadDb()
//     const show = db.shows.find(s => s.id === showId)
//     if (!show) return res.status(404).json({ error: "not_found" })
//     const seatRows = db.seats.filter(s => s.showId === showId)
//     let price = show.price * seats.length
//     const dbPromo = (promo && db.promoCodes) ? db.promoCodes.find(p => p.code.toLowerCase() === String(promo).toLowerCase() && p.isActive) : null
//     if (dbPromo) {
//         const discount = price * (dbPromo.discountPercent / 100)
//         price = price - discount
//     }
//     seats.forEach(n => {
//         const r = seatRows.find(x => (x.seatNumber == n))
//         if (r) r.isBooked = true
//     })
//     const id = nanoid()
//     const h = req.headers["authorization"] || ""
//     let userEmail = "anonymous"
//     try {
//         const token = String(h).replace("Bearer ", "")
//         const data = jwt.verify(token, "dev-secret")
//         userEmail = (data && data.email) ? data.email : userEmail
//     } catch (e) { }
//     const order = { id, userEmail, showId, seats, amount: price, createdUtc: new Date().toISOString(), status: "confirmed" }
//     db.orders.push(order)
//     saveDb(db)
//     res.json(order)
// })

// app.get("/orders", (req, res) => {
//     const db = loadDb()
//     res.json(db.orders)
// })

// app.post("/payment/charge", (req, res) => {
//     const { card, mm, yy, cvv, amount, promo } = req.body || {}
//     const db = loadDb()
    
//     const cleanCard = (card || "").replace(/\s/g, "")
//     const testCard = db.testCards?.find(c => (String(c.number || "").replace(/\s/g, "")) === cleanCard)
    
//     let cardOk = false
//     let errorMessage = "payment_failed"
    
//     if (testCard) {
//         const currentYear = new Date().getFullYear() % 100
//         const currentMonth = new Date().getMonth() + 1
//         const expYear = parseInt(yy)
//         const expMonth = parseInt(mm)
        
//         if (testCard.status === "blocked") {
//             errorMessage = "card_blocked"
//         } else if (testCard.status === "expired" || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
//             errorMessage = "card_expired"
//         } else if (testCard.balance < (Number(amount) || 0)) {
//             errorMessage = "insufficient_funds"
//         } else if (!/^\d{3}$/.test(cvv)) {
//             errorMessage = "invalid_cvv"
//         } else {
//             cardOk = true
//             testCard.balance -= (Number(amount) || 0)
//             saveDb(db)
//         }
//     } else {
//         const cardLength = cleanCard.length
//         cardOk = cardLength < 16
//     }
    
//     const cvvOk = typeof cvv === "string" && /^\d{2,3}$/.test(cvv)
    
//     let discount = 0
//     if (typeof promo === "string" && promo.trim()) {
//         const promoCode = db.promoCodes?.find(p => p.code.toLowerCase() === promo.toLowerCase() && p.isActive)
//         if (promoCode) {
//             discount = (Number(amount) || 0) * (promoCode.discountPercent / 100)
//             promoCode.usedCount = (promoCode.usedCount || 0) + 1
//             if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
//                 promoCode.isActive = false
//             }
//             saveDb(db)
//         }
//     }
    
//     const finalAmount = (Number(amount) || 0) - discount
    
//     if (cardOk && cvvOk) {
//         return res.json({ ok: true, charged: finalAmount, discount })
//     }
//     return res.status(402).json({ ok: false, error: errorMessage })
// })

// app.post("/admin/promo", (req, res) => {
//     const { code, discountPercent, maxUses } = req.body || {}
//     if (!code || !discountPercent) return res.status(400).json({ error: "invalid" })
    
//     const db = loadDb()
//     if (!db.promoCodes) db.promoCodes = []
    
//     const existing = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase())
//     if (existing) return res.status(409).json({ error: "promo_exists" })
    
//     const promoCode = {
//         id: nanoid(),
//         code: code.toUpperCase(),
//         discountPercent: Number(discountPercent),
//         maxUses: maxUses ? Number(maxUses) : null,
//         usedCount: 0,
//         isActive: true,
//         createdUtc: new Date().toISOString()
//     }
    
//     db.promoCodes.push(promoCode)
//     saveDb(db)
//     res.json(promoCode)
// })

// app.get("/admin/promo", (req, res) => {
//     const db = loadDb()
//     res.json(db.promoCodes || [])
// })

// app.post("/admin/testcard", (req, res) => {
//     const { number, balance, status, holderName } = req.body || {}
//     if (!number || balance === undefined) return res.status(400).json({ error: "invalid" })
    
//     const db = loadDb()
//     if (!db.testCards) db.testCards = []
    
//     const existing = db.testCards.find(c => c.number === number)
//     if (existing) return res.status(409).json({ error: "card_exists" })
    
//     const testCard = {
//         id: nanoid(),
//         number: number.replace(/\s/g, ""),
//         balance: Number(balance),
//         status: status || "active",
//         holderName: holderName || "TEST USER",
//         createdUtc: new Date().toISOString()
//     }
    
//     db.testCards.push(testCard)
//     saveDb(db)
//     res.json(testCard)
// })

// app.get("/admin/testcard", (req, res) => {
//     const db = loadDb()
//     res.json(db.testCards || [])
// })

// app.put("/admin/testcard/:number", (req, res) => {
//     const { number } = req.params
//     const { balance, status } = req.body || {}
    
//     const db = loadDb()
//     const card = db.testCards?.find(c => c.number === number.replace(/\s/g, ""))
//     if (!card) return res.status(404).json({ error: "card_not_found" })
    
//     if (balance !== undefined) card.balance = Number(balance)
//     if (status) card.status = status
    
//     saveDb(db)
//     res.json(card)
// })

// let port = 4000 
// app.listen(port, () => {
//     console.log("Backend is running on port " + port)
// })


import express from "express"
import cors from "cors"
import { Pool } from "pg"
import jwt from "jsonwebtoken"
import { nanoid } from "nanoid"

const app = express()
app.use(cors({
    origin: 'https://cinema-app-project.website.yandexcloud.net',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// 🔹 Подключение к PostgreSQL
const pool = new Pool({
    host: '158.160.80.152',     // IP твоей ВМ
    port: 5432,
    database: 'cinema_db',
    user: 'user',
    password: 'password',
    ssl: false                // В Yandex Cloud можно оставить false для теста
})

// 🔹 Функция запроса
async function query(text, params) {
    const client = await pool.connect()
    try {
        const res = await client.query(text, params)
        return res
    } finally {
        client.release()
    }
}

function tokenFor(email) {
    return jwt.sign({ email }, "dev-secret")
}

function requireAuth(req, res, next) {
    const h = req.headers["authorization"] || ""
    const token = h.replace("Bearer ", "")
    try {
        const data = jwt.verify(token, "dev-secret")
        req.userEmail = data.email
        next()
    } catch (e) {
        res.status(401).json({ error: "unauthorized" })
    }
}

// === AUTH ===
app.post("/auth/register", async (req, res) => {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: "invalid" })
    try {
        await query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
            [email, password]
        )
        res.json({ token: tokenFor(email) })
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: "email_exists" })
        throw err
    }
})

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body || {}
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email])
    const user = rows[0]
    if (!user || user.password_hash !== password) return res.status(401).json({ error: "invalid" })
    res.json({ token: tokenFor(email) })
})

// === MOVIES ===
app.get("/movies", async (req, res) => {
    const { rows } = await query("SELECT * FROM movies")
    res.json(rows)
})

// === SHOWS ===
app.get("/shows", async (req, res) => {
    const { movieId } = req.query
    let sql = "SELECT * FROM shows"
    const params = []
    if (movieId) {
        sql += " WHERE movie_id = $1"
        params.push(movieId)
    }
    const { rows } = await query(sql, params)
    res.json(rows)
})

app.get("/shows/:id", async (req, res) => {
    const { rows } = await query("SELECT * FROM shows WHERE id = $1", [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: "not_found" })
    res.json(rows[0])
})

// === SEATS ===
app.get("/seats/:showId", async (req, res) => {
    const { rows } = await query("SELECT * FROM seats WHERE show_id = $1", [req.params.showId])
    res.json(rows)
})

// === ORDER ===
app.post("/order", async (req, res) => {
    const { showId, seats, promo } = req.body || {}
    if (!showId || !Array.isArray(seats) || seats.length === 0) return res.status(400).json({ error: "invalid" })

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // Получаем цену
        const { rows: showRows } = await client.query("SELECT price FROM shows WHERE id = $1", [showId])
        if (showRows.length === 0) return res.status(404).json({ error: "not_found" })
        const price = showRows[0].price

        let amount = price * seats.length

        // Применяем промокод
        if (promo) {
            const { rows: promoRows } = await client.query(
                "SELECT discount_percent FROM promo_codes WHERE code = $1 AND is_active = true",
                [promo.toUpperCase()]
            )
            if (promoRows.length > 0) {
                const discount = amount * (promoRows[0].discount_percent / 100)
                amount = amount - discount
            }
        }

        // Бронируем места
        for (const seatNumber of seats) {
            await client.query(
                "UPDATE seats SET is_booked = true WHERE show_id = $1 AND seat_number = $2 AND is_booked = false",
                [showId, seatNumber]
            )
        }

        // Создаём заказ
        const id = nanoid()
        const h = req.headers["authorization"] || ""
        let userEmail = "anonymous"
        try {
            const token = h.replace("Bearer ", "")
            const data = jwt.verify(token, "dev-secret")
            userEmail = data.email
        } catch (e) {}

        await client.query(
            "INSERT INTO orders (id, user_email, show_id, seats, amount, created_utc, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [id, userEmail, showId, JSON.stringify(seats), amount, new Date().toISOString(), "confirmed"]
        )

        await client.query('COMMIT')
        res.json({ id, userEmail, showId, seats, amount, createdUtc: new Date().toISOString(), status: "confirmed" })
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally {
        client.release()
    }
})

// === ORDERS ===
app.get("/orders", async (req, res) => {
    const { rows } = await query("SELECT * FROM orders")
    res.json(rows)
})

// === PAYMENT ===
app.post("/payment/charge", async (req, res) => {
    const { card, mm, yy, cvv, amount, promo } = req.body || {}
    const cleanCard = (card || "").replace(/\s/g, "")

    const { rows: cardRows } = await query(
        "SELECT * FROM test_cards WHERE number = $1",
        [cleanCard]
    )
    const testCard = cardRows[0]

    let cardOk = false
    let errorMessage = "payment_failed"

    if (testCard) {
        const currentYear = new Date().getFullYear() % 100
        const currentMonth = new Date().getMonth() + 1
        const expYear = parseInt(yy)
        const expMonth = parseInt(mm)

        if (testCard.status === "blocked") {
            errorMessage = "card_blocked"
        } else if (testCard.status === "expired" || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            errorMessage = "card_expired"
        } else if (testCard.balance < (Number(amount) || 0)) {
            errorMessage = "insufficient_funds"
        } else if (!/^\d{3}$/.test(cvv)) {
            errorMessage = "invalid_cvv"
        } else {
            cardOk = true
            await query(
                "UPDATE test_cards SET balance = balance - $1 WHERE id = $2",
                [Number(amount), testCard.id]
            )
        }
    } else {
        cardOk = cleanCard.length < 16
    }

    const cvvOk = typeof cvv === "string" && /^\d{2,3}$/.test(cvv)

    let discount = 0
    if (typeof promo === "string" && promo.trim()) {
        const { rows: promoRows } = await query(
            "SELECT discount_percent, used_count, max_uses FROM promo_codes WHERE code = $1 AND is_active = true",
            [promo.toUpperCase()]
        )
        const promoCode = promoRows[0]
        if (promoCode) {
            discount = (Number(amount) || 0) * (promoCode.discount_percent / 100)
            const newUses = promoCode.used_count + 1
            const isActive = !promoCode.max_uses || newUses < promoCode.max_uses
            await query(
                "UPDATE promo_codes SET used_count = $1, is_active = $2 WHERE code = $3",
                [newUses, isActive, promo.toUpperCase()]
            )
        }
    }

    const finalAmount = (Number(amount) || 0) - discount

    if (cardOk && cvvOk) {
        return res.json({ ok: true, charged: finalAmount, discount })
    }
    return res.status(402).json({ ok: false, error: errorMessage })
})

// === ADMIN: Промокоды ===
app.post("/admin/promo", async (req, res) => {
    const { code, discountPercent, maxUses } = req.body || {}
    if (!code || !discountPercent) return res.status(400).json({ error: "invalid" })

    const id = nanoid()
    try {
        await query(
            "INSERT INTO promo_codes (id, code, discount_percent, max_uses, used_count, is_active, created_utc) VALUES ($1, $2, $3, $4, 0, true, $5)",
            [id, code.toUpperCase(), discountPercent, maxUses, new Date().toISOString()]
        )
        res.json({ id, code: code.toUpperCase(), discountPercent, maxUses, usedCount: 0, isActive: true, createdUtc: new Date().toISOString() })
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: "promo_exists" })
        throw err
    }
})

app.get("/admin/promo", async (req, res) => {
    const { rows } = await query("SELECT * FROM promo_codes")
    res.json(rows)
})

// === ADMIN: Тестовые карты ===
app.post("/admin/testcard", async (req, res) => {
    const { number, balance, status, holderName } = req.body || {}
    if (!number || balance === undefined) return res.status(400).json({ error: "invalid" })

    const id = nanoid()
    try {
        await query(
            "INSERT INTO test_cards (id, number, balance, status, holder_name, created_utc) VALUES ($1, $2, $3, $4, $5, $6)",
            [id, number.replace(/\s/g, ""), balance, status || "active", holderName || "TEST USER", new Date().toISOString()]
        )
        res.json({ id, number: number.replace(/\s/g, ""), balance, status: status || "active", holderName: holderName || "TEST USER", createdUtc: new Date().toISOString() })
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: "card_exists" })
        throw err
    }
})

app.get("/admin/testcard", async (req, res) => {
    const { rows } = await query("SELECT * FROM test_cards")
    res.json(rows)
})

app.put("/admin/testcard/:number", async (req, res) => {
    const { number } = req.params
    const { balance, status } = req.body || {}

    const cleanNumber = number.replace(/\s/g, "")
    const { rows } = await query("SELECT * FROM test_cards WHERE number = $1", [cleanNumber])
    if (rows.length === 0) return res.status(404).json({ error: "card_not_found" })

    await query(
        "UPDATE test_cards SET balance = $1, status = $2 WHERE number = $3",
        [balance !== undefined ? balance : rows[0].balance, status || rows[0].status, cleanNumber]
    )

    const { rows: updated } = await query("SELECT * FROM test_cards WHERE number = $1", [cleanNumber])
    res.json(updated[0])
})

// === Запуск сервера ===
const port = 4000
app.listen(port, () => {
    console.log("Backend is running on port " + port)
})
