import React, { useEffect, useMemo, useState } from "react";
import "./Home.css";
import {
  depositFunds,
  getWalletSnapshot,
  payBill,
  transferFunds,
} from "../../services/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const quickServices = [
  { id: "electricity", title: "Electricity", subtitle: "Due in 6 days", tag: "Power" },
  { id: "water", title: "Water", subtitle: "Auto-pay active", tag: "Utilities" },
  { id: "internet", title: "Internet", subtitle: "Unlimited plan", tag: "Home" },
  { id: "gas", title: "Gas", subtitle: "Usage alert", tag: "Utilities" },
  { id: "mobile", title: "Mobile", subtitle: "Prepaid top-up", tag: "Phone" },
  { id: "tv", title: "Streaming", subtitle: "Renews Feb 18", tag: "Media" },
  { id: "tuition", title: "Tuition", subtitle: "Next semester", tag: "Education" },
  { id: "insurance", title: "Insurance", subtitle: "Policy active", tag: "Cover" },
];

const Home = () => {
  const [balance, setBalance] = useState(0);
  const [walletName] = useState("Rhythm Wallet");
  const [depositAmount, setDepositAmount] = useState("");
  const [transferForm, setTransferForm] = useState({
    to: "",
    amount: "",
    note: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [availableHold, setAvailableHold] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);

  const available = useMemo(() => balance - availableHold, [balance, availableHold]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getWalletSnapshot()
      .then((data) => {
        if (!mounted) return;
        setBalance(data.balance);
        setTransactions(data.transactions || []);
        setAvailableHold(data.availableHold || 0);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load wallet.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeposit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await depositFunds(depositAmount);
      setBalance(data.balance);
      setTransactions(data.transactions || []);
      setDepositAmount("");
      setMessage("Deposit successful.");
    } catch (err) {
      setError(err.message || "Deposit failed.");
    }
  };

  const handleTransfer = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await transferFunds({
        to: transferForm.to,
        amount: transferForm.amount,
      });
      setBalance(data.balance);
      setTransactions(data.transactions || []);
      setTransferForm({ to: "", amount: "", note: "" });
      setMessage("Transfer sent.");
    } catch (err) {
      setError(err.message || "Transfer failed.");
    }
  };

  const handlePayBill = async (service) => {
    setError("");
    setMessage("");
    try {
      const data = await payBill({
        serviceId: service.id,
        serviceName: service.title,
        amount: 49,
      });
      setBalance(data.balance);
      setTransactions(data.transactions || []);
      setMessage(`${service.title} bill paid.`);
    } catch (err) {
      setError(err.message || "Bill payment failed.");
    }
  };

  if (loading) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-card">
          <div>
            <p className="eyebrow">Wallet Overview</p>
            <h2>{walletName}</h2>
            <p className="muted">
              Secure wallet for deposits, transfers, and utility payments.
            </p>
          </div>
          <div className="balance">
            <span>Total Balance</span>
            <strong>{currency.format(balance)}</strong>
            <p>Available: {currency.format(available)}</p>
          </div>
        </div>
        <div className="hero-grid">
          <div className="stat-card">
            <span>Monthly Inflow</span>
            <strong>{currency.format(3280)}</strong>
            <p>+12% vs last month</p>
          </div>
          <div className="stat-card">
            <span>Bill Forecast</span>
            <strong>{currency.format(410)}</strong>
            <p>Next 14 days</p>
          </div>
          <div className="stat-card">
            <span>Rewards</span>
            <strong>{currency.format(125.5)}</strong>
            <p>Cashback ready</p>
          </div>
        </div>
      </div>

      <div className="home-body">
        <section className="panel">
          <header className="panel-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Deposit funds or transfer instantly.</p>
            </div>
            <div>
              {message ? <span className="panel-message">{message}</span> : null}
              {error ? <span className="panel-message error">{error}</span> : null}
            </div>
          </header>
          <div className="panel-grid">
            <form className="action-card" onSubmit={handleDeposit}>
              <h4>Deposit Funds</h4>
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                  placeholder="500.00"
                />
              </label>
              <button type="submit">Add to Wallet</button>
              <p className="helper">Funds appear instantly in your wallet balance.</p>
            </form>

            <form className="action-card" onSubmit={handleTransfer}>
              <h4>Transfer Funds</h4>
              <label>
                Recipient
                <input
                  type="text"
                  value={transferForm.to}
                  onChange={(event) =>
                    setTransferForm((prev) => ({ ...prev, to: event.target.value }))
                  }
                  placeholder="Name or Wallet ID"
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transferForm.amount}
                  onChange={(event) =>
                    setTransferForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  placeholder="120.00"
                />
              </label>
              <label>
                Note
                <input
                  type="text"
                  value={transferForm.note}
                  onChange={(event) =>
                    setTransferForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  placeholder="What's it for?"
                />
              </label>
              <button type="submit">Send Money</button>
              <p className="helper">Transfers are instant within your wallet network.</p>
            </form>
          </div>
        </section>

        <section className="panel">
          <header className="panel-header">
            <div>
              <h3>Bill Payments & Services</h3>
              <p>Manage electricity and other essential services in one place.</p>
            </div>
            <button className="ghost">Add Service</button>
          </header>
          <div className="services-grid">
            {quickServices.map((service) => (
              <div key={service.id} className="service-card">
                <div>
                  <span className="service-tag">{service.tag}</span>
                  <h4>{service.title}</h4>
                  <p>{service.subtitle}</p>
                </div>
                <button type="button" onClick={() => handlePayBill(service)}>
                  Pay Bill
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel ledger">
          <header className="panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Track deposits, transfers, and bill payments.</p>
            </div>
            <button className="ghost">View All</button>
          </header>
          <div className="ledger-list">
            {transactions.map((item) => (
              <button
                type="button"
                className="ledger-row"
                key={item.id}
                onClick={() => setSelectedTx(item)}
              >
                <div>
                  <h4>{item.label}</h4>
                  <span>{item.type}</span>
                </div>
                <div className="ledger-meta">
                  <strong className={item.amount < 0 ? "negative" : "positive"}>
                    {currency.format(item.amount)}
                  </strong>
                  <span>{item.date}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {selectedTx ? (
        <div className="drawer-overlay" onClick={() => setSelectedTx(null)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <p className="eyebrow">Transaction Details</p>
                <h3>{selectedTx.label}</h3>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setSelectedTx(null)}
              >
                Close
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-card">
                <span>Type</span>
                <strong>{selectedTx.type}</strong>
              </div>
              <div className="drawer-card">
                <span>Amount</span>
                <strong
                  className={selectedTx.amount < 0 ? "negative" : "positive"}
                >
                  {currency.format(selectedTx.amount)}
                </strong>
              </div>
              <div className="drawer-card">
                <span>Date</span>
                <strong>{selectedTx.date}</strong>
              </div>
              <div className="drawer-card">
                <span>Status</span>
                <strong>Completed</strong>
              </div>
              <div className="drawer-note">
                <span>Note</span>
                <p>
                  {selectedTx.type === "Transfer"
                    ? "Transfer completed instantly via wallet network."
                    : "Recorded in your wallet activity."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
