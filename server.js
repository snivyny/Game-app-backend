require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { getUser, createUserIfNotExists, saveUser, resetDailyIfNewDay, getAllUsers } = require("./models/user");
const { getDailyLimit, isVipActive } = require("./economy/levelSystem");
const { deposit, withdraw } = require("./economy/bank");
const { transferMoney } = require("./economy/transfer");
const { purchaseVip, grantVipFromTask, claimDailyVipBonus } = require("./economy/vip");
const { answerQuiz } = require("./game/quiz");
const { answerWordGame } = require("./game/wordGame");
const { playSlotDice } = require("./game/slotDice");
const { startAllScheduledJobs } = require("./cron/scheduledJobs");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ── Middleware: load user + daily reset check ──
function loadUser(req, res, next) {
	const userId = req.body.userId || req.query.userId;
	if (!userId) return res.status(400).json({ error: "userId required" });

	let user = getUser(userId);
	if (!user) return res.status(404).json({ error: "User not found" });
	if (user.banned) return res.status(403).json({ error: "User is banned" });

	user = resetDailyIfNewDay(user);
	req.user = user;
	next();
}

function checkDailyLimit(gameKey) {
	return (req, res, next) => {
		const user = req.user;
		const played = user.gamePlaysToday[gameKey] || 0;
		if (played >= getDailyLimit(user)) {
			return res.status(429).json({ error: `Daily limit reached for ${gameKey}` });
		}
		user.gamePlaysToday[gameKey] = played + 1;
		next();
	};
}

// ── Auth / user creation ──
app.post("/user/register", (req, res) => {
	const { userId, name } = req.body;
	const user = createUserIfNotExists(userId, name);
	res.json(user);
});

app.get("/user/:id", (req, res) => {
	const user = getUser(req.params.id);
	if (!user) return res.status(404).json({ error: "Not found" });
	res.json({ ...user, vipActive: isVipActive(user) });
});

// ── Quiz-type games (general, flag, maths, animal, footballer, actor, anime — same endpoint, different content on the app side) ──
app.post("/game/quiz/answer", loadUser, checkDailyLimit("quiz"), (req, res) => {
	const { isCorrect } = req.body;
	const result = answerQuiz(req.user, isCorrect);
	saveUser(req.user);
	res.json(result);
});

// ── Word unscramble game ──
app.post("/game/wordgame/answer", loadUser, checkDailyLimit("wordGame"), (req, res) => {
	try {
		const { isCorrect } = req.body;
		const result = answerWordGame(req.user, isCorrect);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// ── Slot / Dice (betting, level 10+ only) ──
app.post("/game/slotdice/play", loadUser, checkDailyLimit("slotDice"), (req, res) => {
	try {
		const { betAmount } = req.body;
		const result = playSlotDice(req.user, betAmount);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// ── Bank ──
app.post("/bank/deposit", loadUser, (req, res) => {
	try {
		const result = deposit(req.user, req.body.amount);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.post("/bank/withdraw", loadUser, (req, res) => {
	try {
		const result = withdraw(req.user, req.body.amount);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// ── Transfer ──
app.post("/transfer", loadUser, (req, res) => {
	try {
		const receiver = getUser(req.body.toUserId);
		if (!receiver) return res.status(404).json({ error: "Receiver not found" });

		const result = transferMoney(req.user, receiver, req.body.amount);
		saveUser(req.user);
		saveUser(receiver);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// ── VIP ──
app.post("/vip/purchase", loadUser, (req, res) => {
	try {
		const result = purchaseVip(req.user, req.body.tierIndex);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

app.post("/vip/claim-daily-bonus", loadUser, (req, res) => {
	try {
		const result = claimDailyVipBonus(req.user);
		saveUser(req.user);
		res.json(result);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// ── Leaderboard ──
app.get("/leaderboard/money", (req, res) => {
	const users = getAllUsers()
		.sort((a, b) => b.money - a.money)
		.slice(0, 50)
		.map(u => ({ id: u.id, name: u.name, money: u.money, vip: isVipActive(u) }));
	res.json(users);
});

app.get("/leaderboard/exp", (req, res) => {
	const users = getAllUsers()
		.sort((a, b) => b.exp - a.exp)
		.slice(0, 50)
		.map(u => ({ id: u.id, name: u.name, exp: u.exp, level: u.level, vip: isVipActive(u) }));
	res.json(users);
});

// ── Global chat (Socket.io) ──
io.on("connection", (socket) => {
	socket.on("chat:message", (data) => {
		// data: { userId, name, message }
		io.emit("chat:message", { ...data, timestamp: Date.now() });
	});

	socket.on("disconnect", () => {});
});

// ── Start scheduled jobs (bank interest, economy reset, daily flag reset) ──
startAllScheduledJobs();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Game backend running on port ${PORT}`));
