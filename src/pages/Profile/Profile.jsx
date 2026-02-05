import { useState } from "react";
import { useAuth } from "../../provider/authContext";
import "./Profile.css";

const buildProfileForm = (user) => ({
  firstName: user?.firstName || user?.name?.split(" ")[0] || "",
  lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
  address: user?.address || "",
  email: user?.email || "",
  accountNumber: user?.accountNumber || "",
});

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(currentUser));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveProfile = () => {
    setMessage("");
    setError("");
    try {
      const raw = localStorage.getItem("registered_users");
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(
        (u) => u.email === profileForm.email || u.accountNumber === profileForm.accountNumber
      );
      const updated = { ...list[idx], ...profileForm };
      if (idx >= 0) list[idx] = updated;
      else list.push(updated);
      localStorage.setItem("registered_users", JSON.stringify(list));
      localStorage.setItem("user", JSON.stringify(updated));
      setMessage("Profile updated. Refreshing session...");
      window.location.reload();
    } catch (err) {
      console.error("profile save", err);
      setError("Failed to update profile.");
    }
  };

  return (
    <div className="profile">
      <section className="hero-block">
        <div>
          <p className="eyebrow">Profile Center</p>
          <h2>Account Profile</h2>
          <p className="muted">
            Keep your details updated for smooth transfers and wallet services.
          </p>
          <div className="hero-note">
            <strong>Contribution:</strong> Logo placement sponsored by you.
          </div>
        </div>
        <div className="hero-logo">
          <img
            src="/logo.png"
            alt="logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/fallback-logo.svg";
            }}
          />
          <div>
            <div className="hero-caption">Bank of Kathmandu</div>
            <div className="hero-sub">Official identity mark</div>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h3>Profile Details</h3>
            <p>Manage contact info and account number.</p>
          </div>
          <div>
            {message ? <span className="panel-message">{message}</span> : null}
            {error ? <span className="panel-message error">{error}</span> : null}
          </div>
        </header>

        <div className="profile-grid">
          <label>
            First name
            <input
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
          </label>
          <label>
            Last name
            <input
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </label>
          <label className="span-2">
            Address
            <input
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </label>
          <label className="span-2">
            Email
            <input
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </label>
          <label>
            Account number
            <input value={profileForm.accountNumber} readOnly />
          </label>
          <div className="profile-actions">
            <button className="accent" type="button" onClick={saveProfile}>
              Save Profile
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(profileForm.accountNumber || "")
              }
            >
              Copy Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
