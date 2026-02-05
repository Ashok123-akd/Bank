import React from 'react';
import './Deposit.css';
import { Link } from 'react-router-dom';

export default function Deposit() {
  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h3>Deposit</h3>
          <p>Add funds to your wallet.</p>
        </div>
        <Link to="/app" className="ghost">Back</Link>
      </header>
      <div>
        <p>Deposit functionality demo page. Use the wallet actions on the dashboard to add funds.</p>
      </div>
    </div>
  );
}
