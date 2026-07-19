function deposit(user, amount) {
	if (amount <= 0) throw new Error("Invalid amount");
	if (user.money < amount) throw new Error("Insufficient balance");

	user.money -= amount;
	user.bank += amount;
	return { deposited: amount, newBank: user.bank, newMoney: user.money };
}

function withdraw(user, amount) {
	if (amount <= 0) throw new Error("Invalid amount");
	if (user.bank < amount) throw new Error("Insufficient bank balance");

	user.bank -= amount;
	user.money += amount;
	return { withdrawn: amount, newBank: user.bank, newMoney: user.money };
}

module.exports = { deposit, withdraw };
