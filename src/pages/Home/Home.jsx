import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../provider/authContext";
import "./Home.css";
import {
  depositFunds,
  getWalletSnapshot,
  payBill,
  transferFunds,
} from "../../services/api";

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
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

const buildProfileForm = (user) => ({
  firstName: user?.firstName || user?.name?.split(" ")[0] || "",
  lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
  address: user?.address || "",
  email: user?.email || "",
  accountNumber: user?.accountNumber || "",
});

const Home = () => {
  const [balance, setBalance] = useState(0);
  const walletName = "KathmanduWallet";
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

  const { user: currentUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(currentUser));

  const saveProfile = () => {
    try {
      const raw = localStorage.getItem('registered_users');
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(u => u.email === profileForm.email || u.accountNumber === profileForm.accountNumber);
      const updated = { ...list[idx], ...profileForm };
      if (idx >= 0) list[idx] = updated; else list.push(updated);
      localStorage.setItem('registered_users', JSON.stringify(list));
      localStorage.setItem('user', JSON.stringify(updated));
      // update auth context stored user by reloading
      window.location.reload();
    } catch (err) {
      console.error('profile save', err);
    }
  };

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
      // if recipient is an account number, try to find name
      let toLabel = transferForm.to;
      try {
        const raw = localStorage.getItem('registered_users');
        const list = raw ? JSON.parse(raw) : [];
        const found = list.find(u => u.accountNumber === transferForm.to || u.email === transferForm.to || `${u.firstName} ${u.lastName}` === transferForm.to);
        if (found) toLabel = `${found.firstName || found.name} (${found.accountNumber})`;
      } catch {
        // ignore
      }

      const data = await transferFunds({
        to: toLabel,
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
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:12}}>
            <div className="balance">
            <span>Total Balance</span>
            <strong>{currency.format(balance)}</strong>
            <p>Available: {currency.format(available)}</p>
            </div>

            <div style={{background:'rgba(255,255,255,0.9)',padding:'8px 12px',borderRadius:10,border:'1px solid var(--border)'}}>
              <div style={{fontSize:12,color:'var(--ink-500)'}}>Logged in as</div>
              <div style={{fontWeight:700}}>{currentUser?.firstName || currentUser?.name || currentUser?.email}</div>
              <div style={{fontSize:12,color:'var(--ink-500)',marginTop:6}}>Account: <strong>{currentUser?.accountNumber || '—'}</strong></div>
              <div style={{marginTop:8,display:'flex',gap:8}}>
                <button className="ghost" onClick={() => { navigator.clipboard?.writeText(currentUser?.accountNumber || ''); }}>Copy</button>
                <button
                  className="ghost"
                  onClick={() => {
                    setProfileForm(buildProfileForm(currentUser));
                    setEditingProfile(true);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
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

      <section className="panel gallery-panel">
        <header className="panel-header">
          <div>
            <h3>Wallet Highlights</h3>
            <p>Moments from KathmanduWallet services and offers.</p>
          </div>
        </header>
        <div className="gallery-grid">
          <figure className="gallery-card">
            <img
              src="/banner.jpeg"
              alt="KathmanduWallet community event"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
            />
            <figcaption>Community rewards drive</figcaption>
          </figure>
          <figure className="gallery-card">
            <img
              src="/banner2.png"
              alt="KathmanduWallet merchant partners"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
            />
            <figcaption>New merchant partners</figcaption>
          </figure>
          <figure className="gallery-card">
            <img
              src="/two.jpeg"
              alt="KathmanduWallet lifestyle offering"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/fallback-logo.svg'; }}
            />
            <figcaption>Lifestyle cashback offers</figcaption>
          </figure>
        </div>
      </section>

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
      {editingProfile ? (
        <div className="drawer-overlay" onClick={() => setEditingProfile(false)}>
          <aside className="drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <p className="eyebrow">Edit Profile</p>
                <h3>Profile</h3>
              </div>
              <button type="button" className="ghost" onClick={() => setEditingProfile(false)}>Close</button>
            </div>
            <div className="drawer-body">
              <label>First name
                <input value={profileForm.firstName} onChange={(e)=>setProfileForm(p=>({...p,firstName:e.target.value}))} />
              </label>
              <label>Last name
                <input value={profileForm.lastName} onChange={(e)=>setProfileForm(p=>({...p,lastName:e.target.value}))} />
              </label>
              <label>Address
                <input value={profileForm.address} onChange={(e)=>setProfileForm(p=>({...p,address:e.target.value}))} />
              </label>
              <label>Email
                <input value={profileForm.email} onChange={(e)=>setProfileForm(p=>({...p,email:e.target.value}))} />
              </label>
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button className="accent" onClick={()=>{saveProfile(); setEditingProfile(false);}}>Save</button>
                <button className="ghost" onClick={()=>setEditingProfile(false)}>Cancel</button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default Home;
