const { getTransferTaxRate } = require("./levelSystem");

function transferMoney(sender, receiver, amount) {
	if (amount <= 0) throw new Error("Invalid amount");
	if (sender.money < amount) throw new Error("Insufficient balance");

	const taxRate = getTransferTaxRate(sender); // 5% normal, 3% VIP
	const tax = Math.floor(amount * taxRate); // burned, goes nowhere
	const amountAfterTax = amount - tax;

	sender.money -= amount;
	receiver.money += amountAfterTax;

	return { sent: amount, burned: tax, received: amountAfterTax };
}

module.exports = { transferMoney };
