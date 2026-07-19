const { isBettingGameUnlocked, applyVipRewardBonus } = require("../economy/levelSystem");

// ── Probability tiers (cumulative) ──
// Roll a number 0-100 and match against tiers, top to bottom (rarest first)
const TIERS = [
	{ name: "epic_jackpot", chance: 0.2, multiplier: 50 },
	{ name: "rare_jackpot", chance: 1, multiplier: 10 },
	{ name: "medium_jackpot", chance: 3, multiplier: 3 },
	{ name: "normal_win", chance: 35.8, multiplier: 2 }
];
// Total win chance = 0.2 + 1 + 3 + 35.8 = 40%
// Everything else (60%) = lose (1x loss — just the bet amount)

function rollOutcome() {
	const roll = Math.random() * 100; // 0 - 100
	let cumulative = 0;

	for (const tier of TIERS) {
		cumulative += tier.chance;
		if (roll < cumulative) {
			return tier;
		}
	}
	return { name: "lose", chance: 0, multiplier: 0 };
}

/**
 * Play a round of slot/dice.
 * @param {object} user - user row (must have .level, .money, VIP fields)
 * @param {number} betAmount
 * @returns {object} result info
 */
function playSlotDice(user, betAmount) {
	if (!isBettingGameUnlocked(user.level)) {
		throw new Error("Betting games unlock at level 10");
	}
	if (betAmount <= 0) {
		throw new Error("Invalid bet amount");
	}
	if (user.money < betAmount) {
		throw new Error("Insufficient balance");
	}

	// Deduct bet upfront
	user.money -= betAmount;

	const outcome = rollOutcome();

	if (outcome.name === "lose") {
		return {
			result: "lose",
			betAmount,
			winnings: 0,
			newBalance: user.money
		};
	}

	let winnings = betAmount * outcome.multiplier;
	winnings = applyVipRewardBonus(winnings, user); // VIP +50% bonus on winnings

	user.money += winnings;

	return {
		result: outcome.name,
		multiplier: outcome.multiplier,
		betAmount,
		winnings,
		newBalance: user.money
	};
}

module.exports = { playSlotDice, rollOutcome, TIERS };
