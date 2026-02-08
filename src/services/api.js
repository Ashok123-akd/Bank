// Simple API helpers for the app
export async function fetchUsers({ limit = 30, skip = 0 } = {}) {
	const url = `https://dummyjson.com/users?limit=${limit}&skip=${skip}`;
	try {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`Network response was not ok: ${res.status}`);
		}
		const data = await res.json();
		// dummyjson returns an object with `users` array
		return data;
	} catch (err) {
		console.error("fetchUsers error:", err);
		throw err;
	}
}

const WALLET_STORAGE_KEY = "wallet_state_v1";

const defaultWalletState = {
	balance: 5230.5,
	availableHold: 120.75,
	transactions: [
		{ id: 1, type: "Deposit", label: "Salary top-up", amount: 2200, date: "Feb 1" },
		{ id: 2, type: "Bill", label: "Internet plan", amount: -89, date: "Jan 29" },
		{ id: 3, type: "Transfer", label: "Sent to Karen", amount: -150, date: "Jan 27" },
		{ id: 4, type: "Deposit", label: "Cashback", amount: 38.5, date: "Jan 25" },
	],
};

function loadWalletState() {
	const raw = localStorage.getItem(WALLET_STORAGE_KEY);
	if (!raw) return defaultWalletState;
	try {
		const parsed = JSON.parse(raw);
		return { ...defaultWalletState, ...parsed };
	} catch (err) {
		console.error("wallet state parse error:", err);
		return defaultWalletState;
	}
}

function saveWalletState(state) {
	localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
	return state;
}

function withLatency(result, delay = 450) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(result), delay);
	});
}

function createTransaction({ type, label, amount }) {
	return {
		id: Date.now(),
		type,
		label,
		amount,
		date: "Today",
	};
}

export async function getWalletSnapshot() {
	const state = loadWalletState();
	return withLatency(state);
}

export async function depositFunds(amountOrPayload, sourceOverride = "") {
	const payload = amountOrPayload && typeof amountOrPayload === "object" ? amountOrPayload : null;
	const amount = payload ? payload.amount : amountOrPayload;
	const source = (payload?.source || sourceOverride || "").trim();
	const value = Number.parseFloat(amount);
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error("Invalid deposit amount.");
	}
	const state = loadWalletState();
	const label = source ? `Top up from ${source}` : "Wallet deposit";
	const next = {
		...state,
		balance: state.balance + value,
		transactions: [
			createTransaction({ type: "Deposit", label, amount: value }),
			...state.transactions,
		],
	};
	saveWalletState(next);
	return withLatency(next);
}

export async function transferFunds({ to, amount }) {
	const value = Number.parseFloat(amount);
	if (!to || !to.trim()) {
		throw new Error("Recipient is required.");
	}
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error("Invalid transfer amount.");
	}
	const state = loadWalletState();
	if (value > state.balance) {
		throw new Error("Insufficient balance.");
	}
	const next = {
		...state,
		balance: state.balance - value,
		transactions: [
			createTransaction({ type: "Transfer", label: `Sent to ${to}`, amount: -value }),
			...state.transactions,
		],
	};
	saveWalletState(next);
	return withLatency(next);
}

export async function payBill({ serviceId, serviceName, amount = 0 }) {
	const value = Number.parseFloat(amount) || 0;
	const state = loadWalletState();
	if (value > state.balance) {
		throw new Error("Insufficient balance.");
	}
	const label = `${serviceName || serviceId} bill`;
	const next = {
		...state,
		balance: state.balance - value,
		transactions: [
			createTransaction({ type: "Bill", label, amount: -value }),
			...state.transactions,
		],
	};
	saveWalletState(next);
	return withLatency(next);
}

export async function withdrawFunds({ amount, destination }) {
	const value = Number.parseFloat(amount);
	if (!destination || !destination.trim()) {
		throw new Error("Withdrawal destination is required.");
	}
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error("Invalid withdrawal amount.");
	}
	const state = loadWalletState();
	if (value > state.balance) {
		throw new Error("Insufficient balance.");
	}
	const label = `Withdraw to ${destination.trim()}`;
	const next = {
		...state,
		balance: state.balance - value,
		transactions: [
			createTransaction({ type: "Withdraw", label, amount: -value }),
			...state.transactions,
		],
	};
	saveWalletState(next);
	return withLatency(next);
}
