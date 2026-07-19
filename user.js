const db = require("../db");

function getUser(id) {
	const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
	if (user) user.gamePlaysToday = JSON.parse(user.gamePlaysToday || "{}");
	return user;
}

function createUserIfNotExists(id, name) {
	const existing = getUser(id);
	if (existing) return existing;

	db.prepare("INSERT INTO users (id, name) VALUES (?, ?)").run(id, name || "Unknown");
	return getUser(id);
}

function saveUser(user) {
	const payload = { ...user, gamePlaysToday: JSON.stringify(user.gamePlaysToday || {}) };
	db.prepare(`
		UPDATE users SET
			name = @name, role = @role, money = @money, bank = @bank,
			exp = @exp, level = @level, vipExpiresAt = @vipExpiresAt,
			vipSource = @vipSource, streakShieldUsedToday = @streakShieldUsedToday,
			lastVipBonusDate = @lastVipBonusDate, wordGameStreak = @wordGameStreak,
			wordGameFailsToday = @wordGameFailsToday, gamePlaysToday = @gamePlaysToday,
			lastPlayedDate = @lastPlayedDate, banned = @banned
		WHERE id = @id
	`).run(payload);
}

// Resets daily counters if it's a new day since the user last played
function resetDailyIfNewDay(user) {
	const today = new Date().toDateString();
	if (user.lastPlayedDate !== today) {
		user.gamePlaysToday = {};
		user.wordGameFailsToday = 0;
		user.streakShieldUsedToday = 0;
		user.lastPlayedDate = today;
	}
	return user;
}

function getAllUsers() {
	const users = db.prepare("SELECT * FROM users").all();
	return users.map(u => ({ ...u, gamePlaysToday: JSON.parse(u.gamePlaysToday || "{}") }));
}

module.exports = { getUser, createUserIfNotExists, saveUser, resetDailyIfNewDay, getAllUsers };
