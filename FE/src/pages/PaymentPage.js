// PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './PaymentPage.css';

const PLANS = {
  Pro:     { name: 'Pro',     amount: 19.99 },
  Premium: { name: 'Premium', amount: 29.99 },
};

export default function PaymentPage() {
  const [plan, setPlan]       = useState('Pro');
  const [amount, setAmount]   = useState(PLANS.Pro.amount);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/payments/')
       .then(r => setHistory(r.data))
       .catch(() => console.error('Failed to load payment history'));
  }, []);

  const handlePlanChange = e => {
    const sel = PLANS[e.target.value];
    setPlan(sel.name);
    setAmount(sel.amount);
  };

  const purchase = () => {
    setError('');
    setLoading(true);

    api.post('/payments/', { plan, amount })
      .then(r => {
        const { checkout_url } = r.data;
        // redirect user to PayOS checkout page
        window.location.href = checkout_url;
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.detail || 'Payment init failed');
      })
      .finally(() => setLoading(false));
  };

  const getStatusClass = status => {
    const s = (status||'').toLowerCase();
    if (s==='succeeded' || s==='completed') return 'succeeded';
    if (s==='pending') return 'pending';
    if (s==='failed')   return 'failed';
    return 'default';
  };

  return (
    <div className="payment-page">
      <h1>Upgrade Your Account</h1>

      <div className="payment-form">
        <label>
          Plan:
          <select value={plan} onChange={handlePlanChange}>
            {Object.values(PLANS).map(p => (
              <option key={p.name} value={p.name}>
                {p.name} — ${p.amount.toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <button onClick={purchase} disabled={loading}>
          {loading ? 'Processing…' : `Pay $${amount.toFixed(2)}`}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <h2>Your Payment History</h2>
      <ul className="payment-history-list">
        {history.length > 0 ? (
          history.map(p => (
            <li key={p.id} className="payment-history-item">
              <div className="details">
                <span className="date">
                  {new Date(p.created_at).toLocaleString()}
                </span>
                : <span className="plan">{p.plan} — ${p.amount}</span>
              </div>
              <span className={`status-badge ${getStatusClass(p.status)}`}>
                {p.status}
              </span>
            </li>
          ))
        ) : (
          <p>No payment history found.</p>
        )}
      </ul>
    </div>
  );
}
