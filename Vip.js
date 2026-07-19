const VIP_PURCHASE_TIERS = [
	{ cost: 10_000_000, days: 1 },
	{ cost: 25_000_000, days: 3 },
	{ cost: 50_000_000, days: 7 }
];

const VIP_TASK_REWARDS = {
	easy: 1,
	medium: 3,
	hard: 7,
	veryHard: 15,
	extreme: 30 // max
};

function addVipDays(user, days, source) {
	const now = Date.now();
	const base = user.vipExpiresAt && user.vipExpiresAt > now ? user.vipExpiresAt : now;
	user.vipExpiresAt = base + days * 24 * 60 * 60 * 1000;
	user.vipSource = source;
}

function purchaseVip(user, tierIndex) {
	const tier = VIP_PURCHASE_TIERS[tierIndex];
	if (!tier) throw new Error("Invalid VIP tier");
	if (user.money < tier.cost) throw new Error("Insufficient money");

	user.money -= tier.cost;
	addVipDays(user, tier.days, "purchased");

	return { newExpiry: user.vipExpiresAt };
}

function grantVipFromTask(user, difficulty) {
	const days = VIP_TASK_REWARDS[difficulty];
	if (!days) throw new Error("Invalid difficulty");

	addVipDays(user, days, "task_reward");
	return { newExpiry: user.vipExpiresAt };
}

function claimDailyVipBonus(user) {
	const { isVipActive } = require("./levelSystem");
	if (!isVipActive(user)) throw new Error("VIP required");

	const today = new Date().toDateString();
	if (user.lastVipBonusDate === today) throw new Error("Already claimed today");

	user.money += 5000; // confirm exact amount with Zishan
	user.exp += 50;     // confirm exact amount with Zishan
	user.lastVipBonusDate = today;

	return { moneyAwarded: 5000, expAwarded: 50 };
}

function useStreakShieldIfAvailable(user) {
	const { isVipActive } = require("./levelSystem");
	if (isVipActive(user) && !user.streakShieldUsedToday) {
		user.streakShieldUsedToday = 1;
		return true; // streak protected
	}
	return false;
}

module.exports = {
	VIP_PURCHASE_TIERS,
	VIP_TASK_REWARDS,
	purchaseVip,
	grantVipFromTask,
	claimDailyVipBonus,
	useStreakShieldIfAvailable
};
