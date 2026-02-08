
import { useState } from 'react';
import './Audit.css';

function parseTextBill(text) {
  // naive parser: extract lines, totals, and items
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const numeric = (s) => {
    const m = s.replace(/[,₹$]/g,'').match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };

  const items = [];
  let detectedTotal = null;

  for (let line of lines) {
    const low = line.toLowerCase();
    if (/total|grand total|net amount|amount due|amount payable/.test(low)) {
      const v = numeric(line);
      if (v !== null) detectedTotal = v;
      continue;
    }
    // detect lines like: description - qty x price = amount  or description amount
    const parts = line.split(/\s{2,}|\s-\s|\|/).map(p=>p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const last = numeric(parts[parts.length-1]);
      if (last !== null) {
        items.push({ raw: line, description: parts.slice(0,parts.length-1).join(' - '), amount: last });
        continue;
      }
    }
    // fallback: if line contains a number, consider as item
    const n = numeric(line);
    if (n !== null) {
      items.push({ raw: line, description: line.replace(/-?\d+(?:\.\d+)?/,'').trim(), amount: n });
    }
  }

  return { items, total: detectedTotal };
}

export default function Audit(){
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const readFile = async (file) => {
    if (!file) return '';
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'csv' || ext === 'json') {
      return await file.text();
    }
    // for pdf or image we prompt user to provide text; fallback: return empty
    return await file.text().catch(()=>'');
  };

  const handleFiles = async (purchaseFile, saleFile) => {
    setError('');
    try {
      const ptext = await readFile(purchaseFile);
      const stext = await readFile(saleFile);
      const parsedP = parseTextBill(ptext || '');
      const parsedS = parseTextBill(stext || '');
      // build comparison
      const summary = {
        purchaseTotal: parsedP.total,
        saleTotal: parsedS.total,
        totalGap: (parsedS.total != null && parsedP.total != null) ? (parsedS.total - parsedP.total) : null,
        missingInSale: [],
        priceMismatches: [],
      };

      // use item descriptions to compare
      const pMap = new Map();
      for (const it of parsedP.items) {
        const key = it.description.toLowerCase().slice(0,60);
        pMap.set(key, it);
      }
      for (const it of parsedS.items) {
        const key = it.description.toLowerCase().slice(0,60);
        if (!pMap.has(key)) {
          // item present in sale but missing in purchase
          summary.missingInSale.push(it);
        } else {
          const pit = pMap.get(key);
          if (Math.abs((pit.amount||0) - (it.amount||0)) > 0.009) {
            summary.priceMismatches.push({ purchase: pit, sale: it, diff: (it.amount||0) - (pit.amount||0) });
          }
          pMap.delete(key);
        }
      }
      // remaining in pMap are purchase items not found in sale
      summary.missingInPurchase = Array.from(pMap.values());

      setReport(summary);
    } catch (err) {
      setError('Failed to parse files: ' + err.message);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const pf = e.target.elements.purchase.files[0];
    const sf = e.target.elements.sale.files[0];
    if (!pf || !sf) { setError('Please select both purchase and sale documents'); return; }
    handleFiles(pf, sf);
  };

  return (
    <div className="audit-page">
      <section className="audit-hero">
        <div>
          <p className="eyebrow">Revenue Assurance</p>
          <h2>Audit & Leakage Control</h2>
          <p className="muted">
            Compare purchase and sale bills to detect mismatches, missing items,
            and margin gaps before they impact revenue.
          </p>
          <div className="audit-hero-media">
            <img
              src="/two.jpeg"
              alt="Audit hero banner"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/fallback-logo.svg";
              }}
            />
          </div>
        </div>
        <div className="audit-logo">
          <img
            src="/logo.jpeg"
            alt="KathmanduWallet logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/fallback-logo.svg";
            }}
          />
          <div>
            <div className="hero-caption">KathmanduWallet</div>
            <div className="hero-sub">Audit powered by your contribution</div>
          </div>
        </div>
      </section>

      <div className="panel audit-panel">
      <header className="panel-header">
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <img src="/logo.jpeg" alt="KathmanduWallet logo" style={{width:48,height:48,borderRadius:'50%'}} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/fallback-logo.svg'}} />
          <div>
            <h3>Audit - Bill Comparison</h3>
            <p>Upload purchase and sale bills to identify gaps and mismatches.</p>
          </div>
        </div>
      </header>

      <form className="audit-form" onSubmit={onSubmit}>
        <label>Purchase bill (txt/csv/json)
          <input name="purchase" type="file" accept=".txt,.csv,.json" />
        </label>
        <label>Sale bill (txt/csv/json)
          <input name="sale" type="file" accept=".txt,.csv,.json" />
        </label>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="accent" type="submit">Compare Bills</button>
          <button type="button" className="ghost" onClick={()=>{setReport(null); setError('');}}>Reset</button>
        </div>
      </form>

      {error ? <div className="panel-message error">{error}</div> : null}

      {report ? (
        <div className="audit-report">
          <h4>Summary</h4>
          <p>Purchase total: <strong>{report.purchaseTotal ?? 'N/A'}</strong></p>
          <p>Sale total: <strong>{report.saleTotal ?? 'N/A'}</strong></p>
          <p>Total gap (sale - purchase): <strong>{report.totalGap != null ? report.totalGap : 'N/A'}</strong></p>

          <h4>Price mismatches</h4>
          {report.priceMismatches.length ? (
            <ul>
              {report.priceMismatches.map((m,idx)=> (
                <li key={idx}><strong>{m.sale.description}</strong> - sale {m.sale.amount} vs purchase {m.purchase.amount} (diff {m.diff})</li>
              ))}
            </ul>
          ) : <p>No price mismatches found.</p>}

          <h4>Items in sale but not in purchase</h4>
          {report.missingInSale.length ? (
            <ul>{report.missingInSale.map((i,idx)=>(<li key={idx}>{i.raw}</li>))}</ul>
          ) : <p>None</p>}

          <h4>Items in purchase but not in sale</h4>
          {report.missingInPurchase.length ? (
            <ul>{report.missingInPurchase.map((i,idx)=>(<li key={idx}>{i.raw}</li>))}</ul>
          ) : <p>None</p>}
        </div>
      ) : null}

      </div>
    </div>
  );
}
