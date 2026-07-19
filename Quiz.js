const { getLevelFromExp, applyVipRewardBonus } = require("../economy/levelSystem");

const EXP_PER_CORRECT_ANSWER = 155;
const MONEY_REWARD_CORRECT = 300;
const MONEY_PENALTY_WRONG = 300;

/**
 * Handles answering any quiz-type game (general/flag/maths/animal/footballer/actor/anime).
 * @param {object} user
 * @param {boolean} isCorrect
 */
function answerQuiz(user, isCorrect) {
	if (isCorrect) {
		const moneyGain = applyVipRewardBonus(MONEY_REWARD_CORRECT, user);
		const expGain = applyVipRewardBonus(EXP_PER_CORRECT_ANSWER, user);

		user.money += moneyGain;
		user.exp += expGain;
		user.level = getLevelFromExp(user.exp);

		return { correct: true, moneyChange: moneyGain, expChange: expGain, newLevel: user.level };
	} else {
		user.money -= MONEY_PENALTY_WRONG; // no floor - can go negative
		return { correct: false, moneyChange: -MONEY_PENALTY_WRONG, expChange: 0 };
	}
}

module.exports = { answerQuiz, EXP_PER_CORRECT_ANSWER, MONEY_REWARD_CORRECT, MONEY_PENALTY_WRONG };
