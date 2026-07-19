# Game App Backend

Backend for the mobile task/game app — handles money, bank, EXP/level, VIP, and mini-games (quiz-type, word game, slot/dice).

## What's included

- `server.js` — Express API + Socket.io chat, wires everything together
- `db.js` — SQLite schema (users, game_logs, transfers)
- `models/user.js` — user CRUD helpers, daily reset logic
- `economy/levelSystem.js` — level thresholds, daily limits, VIP checks
- `economy/bank.js` — deposit/withdraw
- `economy/transfer.js` — user-to-user transfer with tax
- `economy/vip.js` — VIP purchase tiers + task rewards + daily bonus
- `game/quiz.js` — general/flag/maths/animal/footballer/actor/anime quiz logic
- `game/wordGame.js` — unscramble game with streak rewards
- `game/slotDice.js` — betting game with jackpot tiers
- `cron/scheduledJobs.js` — daily bank interest, every-2-month economy reset

## Confirm before going live

A few placeholder numbers need your final OK (search for "confirm" in the code):
- `game/slotDice.js` — normal win multiplier set to 2x
- `economy/vip.js` — daily VIP bonus set to 5000 money + 50 EXP

## Local setup

```bash
npm install
cp .env.example .env
npm start
```

Server runs on `http://localhost:4000` by default.

## Pushing to your GitHub repo

```bash
# Inside this project folder
git init
git add .
git commit -m "Initial backend: economy, VIP, mini-games"

# Link to your existing repo (replace with your repo URL)
git remote add origin https://github.com/snivyny/YOUR-BACKEND-REPO.git
git branch -M main
git push -u origin main
```

## Pulling onto your VPS

```bash
# On the VPS
git clone https://github.com/snivyny/YOUR-BACKEND-REPO.git
cd YOUR-BACKEND-REPO
npm install
cp .env.example .env
# edit .env if needed (PORT, etc.)

# Run with pm2 so it stays alive
npm install -g pm2
pm2 start server.js --name game-backend
pm2 save
```

## API quick reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/user/register` | POST | Create user if not exists |
| `/user/:id` | GET | Get user profile |
| `/game/quiz/answer` | POST | Submit quiz answer (any quiz type) |
| `/game/wordgame/answer` | POST | Submit word game answer |
| `/game/slotdice/play` | POST | Play slot/dice (level 10+) |
| `/bank/deposit` | POST | Deposit money to bank |
| `/bank/withdraw` | POST | Withdraw from bank |
| `/transfer` | POST | Transfer money to another user |
| `/vip/purchase` | POST | Buy VIP with money |
| `/vip/claim-daily-bonus` | POST | Claim daily VIP bonus |
| `/leaderboard/money` | GET | Top 50 by money |
| `/leaderboard/exp` | GET | Top 50 by EXP/level |

Global chat works over Socket.io — connect and listen/emit on `chat:message`.

## Not yet built

- Mother/Moderator admin endpoints (ban, config changes, question bank management)
- Offline-sync conflict resolution logic for the app side
- Actual quiz question banks (flag/maths/animal/footballer/actor/anime content)
