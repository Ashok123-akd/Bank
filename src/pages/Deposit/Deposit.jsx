import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { depositFunds, getWalletSnapshot } from "../../services/api";
import "./Deposit.css";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 2,
});

const fundingSources = [
  {
    id: "bank",
    title: "Linked bank transfer",
    subtitle: "1-2 minutes",
    detail: "Himalayan Bank •••• 2144",
    route: "Bank account",
  },
  {
    id: "card",
    title: "Debit card top-up",
    subtitle: "Instant",
    detail: "Visa •••• 9921",
    route: "Card network",
  },
  {
    id: "cash",
    title: "Cash agent deposit",
    subtitle: "Same-day",
    detail: "Deposit at partner outlets",
    route: "Agent network",
  },
];

export default function Deposit() {
  const [balance, setBalance] = useState(0);
  const [availableHold, setAvailableHold] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [sourceId, setSourceId] = useState(fundingSources[0].id);
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

  const selectedSource = fundingSources.find((item) => item.id === sourceId);

  const handleDeposit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await depositFunds({
        amount,
        source: selectedSource
          ? `${selectedSource.title} (${selectedSource.detail})`
          : "Wallet top-up",
      });
      setBalance(data.balance);
      setAvailableHold(data.availableHold || 0);
      setTransactions(data.transactions || []);
      setAmount("");
      setMessage("Deposit received in KathmanduWallet.");
    } catch (err) {
      setError(err.message || "Deposit failed.");
    }
  };

  const recentDeposits = transactions.filter((item) => item.type === "Deposit").slice(0, 4);

  if (loading) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="wallet-page">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Deposit to KathmanduWallet</h3>
            <p>Choose where your top-up comes from and add funds instantly.</p>
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
            <span>Available now</span>
            <strong>{currency.format(available)}</strong>
          </div>
        </div>
      </section>

      <div className="wallet-grid">
        <form className="wallet-card" onSubmit={handleDeposit}>
          <h4>Top up amount</h4>
          <label>
            Amount (NPR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1000.00"
            />
          </label>
          <div className="wallet-note">
            Funds land directly in your KathmanduWallet balance.
          </div>
          <button className="accent" type="submit">
            Add funds
          </button>
        </form>

        <div className="wallet-card">
          <h4>Funding source</h4>
          <p className="muted">
            Select where the money comes from before it moves into KathmanduWallet.
          </p>
          <div className="option-list">
            {fundingSources.map((source) => (
              <button
                key={source.id}
                type="button"
                className={`option ${source.id === sourceId ? "active" : ""}`}
                onClick={() => setSourceId(source.id)}
              >
                <div>
                  <strong>{source.title}</strong>
                  <span>{source.detail}</span>
                </div>
                <span className="option-tag">{source.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Where your money goes</h3>
            <p>Track the route of your deposit from source to wallet.</p>
          </div>
        </header>
        <div className="direction-grid">
          <div className="direction-card">
            <span className="eyebrow">Step 1</span>
            <h4>{selectedSource?.title}</h4>
            <p>{selectedSource?.detail}</p>
          </div>
          <div className="direction-card">
            <span className="eyebrow">Step 2</span>
            <h4>{selectedSource?.route}</h4>
            <p>Payment is authorized and pushed to KathmanduWallet.</p>
          </div>
          <div className="direction-card">
            <span className="eyebrow">Step 3</span>
            <h4>Wallet balance</h4>
            <p>Funds are available instantly for transfers and bill pay.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Recent deposits</h3>
            <p>Latest top-ups into your wallet balance.</p>
          </div>
        </header>
        <div className="wallet-list">
          {recentDeposits.length ? (
            recentDeposits.map((item) => (
              <div key={item.id} className="wallet-row">
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.date}</span>
                </div>
                <div className="wallet-amount positive">
                  {currency.format(item.amount)}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No deposits yet. Add funds to see them here.</p>
          )}
        </div>
      </section>
    </div>
  );
}
