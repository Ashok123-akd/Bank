import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getWalletSnapshot, withdrawFunds } from "../../services/api";
import "./Withdraw.css";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 2,
});

const withdrawalTargets = [
  {
    id: "bank",
    title: "Send to bank account",
    subtitle: "Same-day",
    detail: "Nabil Bank •••• 7741",
    route: "Bank transfer",
  },
  {
    id: "mobile",
    title: "Mobile cash-out",
    subtitle: "Instant",
    detail: "Esewa •••• 3310",
    route: "Wallet network",
  },
  {
    id: "cash",
    title: "Cash pickup",
    subtitle: "Within 2 hours",
    detail: "Collect from partner outlets",
    route: "Agent payout",
  },
];

export default function Withdraw() {
  const [balance, setBalance] = useState(0);
  const [availableHold, setAvailableHold] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [targetId, setTargetId] = useState(withdrawalTargets[0].id);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const available = useMemo(
    () => balance - availableHold,
    [balance, availableHold]
  );

  useEffect(() => {
    let mounted = true;
    getWalletSnapshot()
      .then((data) => {
        if (!mounted) return;
        setBalance(data.balance);
        setAvailableHold(data.availableHold || 0);
        setTransactions(data.transactions || []);
      })
      .catch((err) => mounted && setError(err.message || "Failed to load wallet."))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const selectedTarget = withdrawalTargets.find((item) => item.id === targetId);

  const handleWithdraw = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await withdrawFunds({
        amount,
        destination: selectedTarget
          ? `${selectedTarget.title} (${selectedTarget.detail})`
          : "Withdrawal",
      });
      setBalance(data.balance);
      setAvailableHold(data.availableHold || 0);
      setTransactions(data.transactions || []);
      setAmount("");
      setMessage("Withdrawal scheduled from KathmanduWallet.");
    } catch (err) {
      setError(err.message || "Withdrawal failed.");
    }
  };

  const recentWithdrawals = transactions
    .filter((item) => item.type === "Withdraw")
    .slice(0, 4);

  if (loading) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="wallet-page">
      <section className="withdraw-hero">
        <div className="withdraw-hero-copy">
          <p className="eyebrow">Payout Center</p>
          <h2>Withdraw from KathmanduWallet</h2>
          <p className="muted">
            Move funds out securely with clear destination routing.
          </p>
          <div className="hero-media-stack">
            <img
              src="/banner.jpeg"
              alt="Withdraw hero banner"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
            />
            <img
              src="/banner2.png"
              alt="Withdraw secondary banner"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
            />
          </div>
        </div>
        <div className="withdraw-hero-card">
          <span>Total balance</span>
          <strong>{currency.format(balance)}</strong>
          <p>Available to withdraw: {currency.format(available)}</p>
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Withdraw from KathmanduWallet</h3>
            <p>Send funds out of your wallet to a chosen destination.</p>
          </div>
          <div className="wallet-actions">
            <Link to="/app" className="ghost">
              Back to Dashboard
            </Link>
            {message ? <span className="panel-message">{message}</span> : null}
            {error ? <span className="panel-message error">{error}</span> : null}
          </div>
        </header>
        <div className="wallet-balance">
          <div>
            <span>Total balance</span>
            <strong>{currency.format(balance)}</strong>
          </div>
          <div>
            <span>Available to withdraw</span>
            <strong>{currency.format(available)}</strong>
          </div>
        </div>
      </section>

      <div className="wallet-grid">
        <form className="wallet-card" onSubmit={handleWithdraw}>
          <h4>Withdrawal amount</h4>
          <label>
            Amount (NPR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="500.00"
            />
          </label>
          <div className="wallet-note">
            Your balance updates immediately after withdrawal.
          </div>
          <button className="accent" type="submit">
            Withdraw funds
          </button>
        </form>

        <div className="wallet-card">
          <h4>Withdrawal destination</h4>
          <p className="muted">
            Choose where KathmanduWallet should send your money.
          </p>
          <div className="option-list">
            {withdrawalTargets.map((target) => (
              <button
                key={target.id}
                type="button"
                className={`option ${target.id === targetId ? "active" : ""}`}
                onClick={() => setTargetId(target.id)}
              >
                <div>
                  <strong>{target.title}</strong>
                  <span>{target.detail}</span>
                </div>
                <span className="option-tag">{target.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Where your money goes</h3>
            <p>See the path of a withdrawal from wallet to payout.</p>
          </div>
        </header>
        <div className="direction-grid">
          <div className="direction-card">
            <span className="eyebrow">Step 1</span>
            <h4>KathmanduWallet balance</h4>
            <p>Funds are reserved for withdrawal.</p>
          </div>
          <div className="direction-card">
            <span className="eyebrow">Step 2</span>
            <h4>{selectedTarget?.route}</h4>
            <p>We send money to your chosen destination.</p>
          </div>
          <div className="direction-card">
            <span className="eyebrow">Step 3</span>
            <h4>{selectedTarget?.title}</h4>
            <p>Receive funds and complete the payout.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Recent withdrawals</h3>
            <p>Latest wallet payouts and cash-outs.</p>
          </div>
        </header>
        <div className="wallet-list">
          {recentWithdrawals.length ? (
            recentWithdrawals.map((item) => (
              <div key={item.id} className="wallet-row">
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.date}</span>
                </div>
                <div className="wallet-amount negative">
                  {currency.format(Math.abs(item.amount))}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No withdrawals yet. Send funds out to see them here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
