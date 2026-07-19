const { useStreakShieldIfAvailable } = require("../economy/vip");

const STREAK_REWARD_PER_LEVEL = 10000; // 1st=10k, 2nd=20k, 3rd=30k... infinite
const MAX_FAILS_PER_DAY = 10;

function answerWordGame(user, isCorrect) {
	if (user.wordGameFailsToday >= MAX_FAILS_PER_DAY) {
		throw new Error("Word game locked for today — too many fails");
	}

	if (isCorrect) {
		user.wordGameStreak += 1;
		const reward = user.wordGameStreak * STREAK_REWARD_PER_LEVEL; // infinite growth
		user.money += reward;

		return { correct: true, streak: user.wordGameStreak, moneyGained: reward };
	} else {
		// VIP streak shield: protects streak once per day
		const shielded = useStreakShieldIfAvailable(user);

		if (shielded) {
			return { correct: false, streakProtected: true, streak: user.wordGameStreak };
		}

		user.wordGameStreak = 0;
		user.wordGameFailsToday += 1;

		return {
			correct: false,
			streakProtected: false,
			streak: 0,
			failsToday: user.wordGameFailsToday,
			locked: user.wordGameFailsToday >= MAX_FAILS_PER_DAY
		};
	}
}

module.exports = { answerWordGame, STREAK_REWARD_PER_LEVEL, MAX_FAILS_PER_DAY };
