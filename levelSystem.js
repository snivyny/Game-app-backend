// Level threshold: Level1=100, Level2=250, Level3=450... (gap increases by 50 each level)
function getLevelThreshold(level) {
	let threshold = 100;
	let gap = 150;
	for (let i = 2; i <= level; i++) {
		threshold += gap;
		gap += 50;
	}
	return threshold;
}

function getLevelFromExp(totalExp) {
	let level = 1;
	while (getLevelThreshold(level + 1) <= totalExp) {
		level++;
	}
	return level;
}

function isBettingGameUnlocked(level) {
	return level >= 10; // slot, dice, guess, spin locked before level 10
}

function isVipActive(user) {
	return user.vipExpiresAt && user.vipExpiresAt > Date.now();
}

function getDailyLimit(user) {
	let limit = 20 + Math.floor(user.level / 10) * 2;
	if (isVipActive(user)) limit += 10;
	return limit;
}

function applyVipRewardBonus(amount, user) {
	return isVipActive(user) ? Math.floor(amount * 1.5) : amount;
}

function getBankInterestRate(user) {
	return isVipActive(user) ? 1.03 : 1.02;
}

function getTransferTaxRate(user) {
	return isVipActive(user) ? 0.03 : 0.05;
}

module.exports = {
	getLevelThreshold,
	getLevelFromExp,
	isBettingGameUnlocked,
	isVipActive,
	getDailyLimit,
	applyVipRewardBonus,
	getBankInterestRate,
	getTransferTaxRate
};
