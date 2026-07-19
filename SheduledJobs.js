const cron = require("node-cron");
const { getAllUsers, saveUser } = require("../models/user");
const { getBankInterestRate } = require("../economy/levelSystem");

// ── Daily bank interest (runs every midnight) ──
function startDailyInterestJob() {
	cron.schedule("0 0 * * *", () => {
		const users = getAllUsers();
		for (const user of users) {
			if (user.bank > 0) {
				const rate = getBankInterestRate(user); // 1.02 normal, 1.03 VIP
				user.bank = Math.floor(user.bank * rate);
				saveUser(user);
			}
		}
		console.log(`[${new Date().toISOString()}] Daily bank interest applied to ${users.length} users`);
	});
}

// ── Economy reset every 2 months (odd months, 1st day, midnight) ──
// money cap: 100k | bank cap: 50k
function startEconomyResetJob() {
	cron.schedule("0 0 1 1,3,5,7,9,11 *", () => {
		const users = getAllUsers();
		for (const user of users) {
			if (user.money > 100000) user.money = 100000;
			if (user.bank > 50000) user.bank = 50000;
			saveUser(user);
		}
		console.log(`[${new Date().toISOString()}] Economy reset applied (money cap 100k, bank cap 50k)`);
	});
}

// ── Reset daily VIP streak-shield flag at midnight (separate from per-user lazy reset) ──
function startDailyFlagResetJob() {
	cron.schedule("0 0 * * *", () => {
		const users = getAllUsers();
		for (const user of users) {
			user.streakShieldUsedToday = 0;
			user.wordGameFailsToday = 0;
			user.gamePlaysToday = {};
			saveUser(user);
		}
		console.log(`[${new Date().toISOString()}] Daily flags reset for ${users.length} users`);
	});
}

function startAllScheduledJobs() {
	startDailyInterestJob();
	startEconomyResetJob();
	startDailyFlagResetJob();
}

module.exports = { startAllScheduledJobs };
