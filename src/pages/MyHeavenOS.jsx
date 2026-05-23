import React, { useEffect, useState } from 'react';
import { User } from '@/entities/User';
import { ProductBookmark } from '@/entities/ProductBookmark';
import { Product } from '@/entities/Product';
import { Match } from '@/entities/Match';
import { PSPTransaction } from '@/entities/PSPTransaction';

export default function MyHeavenOS(){
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState({ wins: [], losses: [] });
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            setProfile(user);

            // In a real app, these would be separate backend functions as defined in your API spec.
            // For this UI component, we'll simulate the data fetching.
            // setBookmarks(await api('/v1/me/bookmarks/products'));
            // setHistory(await api('/v1/me/history'));
            // setPayments(await api('/v1/me/payments'));
            
            // Simulating with some mock data for now.
            setBookmarks([
                { product_id: '1', title: 'Example Bookmarked Item', retailer: 'amazon', price_cents: 1999 }
            ]);
            setHistory({
                wins: [{ match_id: 'w1', title: 'Won a Great Prize', tracking: '12345XYZ' }],
                losses: [{ match_id: 'l1', title: 'Lost a Close Match' }]
            });
            setPayments([
                { id: 'p1', created_at: new Date().toISOString(), provider: 'stripe', token: 'tok_xxx', last4: '4242', amount_cents: 100, status: 'captured', avs_result: 'pass', geo_country: 'US' }
            ]);

        } catch (error) {
            console.error("Failed to load user data:", error);
        }
        setIsLoading(false);
    };
    fetchData();
  },[]);

  if (isLoading || !profile) {
      return <div>Loading your HeavenOS...</div>
  }

  return (
    <div style={{fontFamily:'system-ui', padding:20, color: 'white'}}>
      <h1>My HeavenOS</h1>
      <section>
        <h2>Snapshot</h2>
        <div>Handle: {profile.handle || '—'}</div>
        <div>Country: {profile.country || '—'}</div>
        <div>Karma: {profile.karma_points ?? 100}</div>
        <div>W/L: 0 / 0</div>
        <div>Fair-Play Streak: {profile.fair_play_streak ?? 0} days</div>
      </section>

      <section>
        <h2>Bookmarks (Products)</h2>
        <ul>{bookmarks.map(b=> <li key={b.product_id}>{b.title} — {b.retailer} — ${(b.price_cents/100).toFixed(2)}</li>)}</ul>
      </section>

      <section>
        <h2>History</h2>
        <h3>Wins</h3>
        <ul>{(history.wins||[]).map((w)=> <li key={w.match_id}>#{w.match_id.slice(0,8)} — {w.title} — tracking: {w.tracking || 'tbd'}</li>)}</ul>
        <h3>Losses</h3>
        <ul>{(history.losses||[]).map((l)=> <li key={l.match_id}>#{l.match_id.slice(0,8)} — {l.title}</li>)}</ul>
      </section>

      <section>
        <h2>Payments (redacted)</h2>
        <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}><thead><tr><th>When</th><th>Provider</th><th>Token</th><th>Last4</th><th>Amount</th><th>Status</th><th>AVS</th><th>Geo</th></tr></thead>
          <tbody>
            {payments.map((p)=><tr key={p.id}>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>{p.provider}</td>
              <td>{p.token}</td>
              <td>{p.last4 || '—'}</td>
              <td>${(p.amount_cents/100).toFixed(2)}</td>
              <td>{p.status}</td>
              <td>{p.avs_result || '—'}</td>
              <td>{p.geo_country || '—'}</td>
            </tr>)}
          </tbody>
        </table>
        <p style={{fontSize:12, opacity:.7}}>We only store payment <strong>tokens</strong> and last-4. PANs never touch our systems.</p>
      </section>
    </div>
  )
}