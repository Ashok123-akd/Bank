import React from 'react';
import './Withdraw.css';
import { Link } from 'react-router-dom';

export default function Withdraw() {
  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h3>Withdraw</h3>
          <p>Quickly withdraw funds from your wallet.</p>
        </div>
        <Link to="/app" className="ghost">Back</Link>
      </header>
      <div>
        <p>Withdraw functionality demo page. Connect to real payouts in production.</p>
      </div>
    </div>
  );
}
