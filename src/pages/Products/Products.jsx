import React from 'react';
import './Products.css';

const products = [
  { id: 'sip', title: 'SIP', desc: 'Systematic Investment Plan for disciplined investing', cta: 'Open SIP' },
  { id: 'demat', title: 'Demat Account', desc: 'Hold your securities digitally and trade easily', cta: 'Open Demat' },
  { id: 'broker', title: 'Broker Account', desc: 'Connect with brokers for market access', cta: 'Connect Broker' },
  { id: 'qr', title: 'Request QR', desc: 'Request a QR code for easy payments', cta: 'Request QR' },
];

export default function Products(){
  return (
    <div className="panel">
      <header className="panel-header">
        <div>
          <h3>Products</h3>
          <p>Explore financial products available to you.</p>
        </div>
      </header>
      <div className="products-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <img src="/logo.jpeg" alt="KathmanduWallet logo" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/fallback-logo.svg'}} />
              <h4 style={{margin:0}}>{p.title}</h4>
            </div>
            <p>{p.desc}</p>
            <button className="accent">{p.cta}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
