import React, { useState } from 'react';

export default function ContactUs(){
  const [sent,setSent]=useState(false);
  const [form,setForm]=useState({subject:'', category:'other', body:'', email:''});
  const submit = async ()=>{
    // This would call a backend function or integration to send the message
    // e.g., await Core.SendEmail(...)
    console.log("Submitting contact form:", form);
    setSent(true);
  };
  if(sent) return <div style={{padding:20, color: 'white'}}>Thanks! We’ve received your message. We aim to reply within 1–2 business days for shipping, faster for abuse reports.</div>;
  return (
    <div style={{fontFamily:'system-ui', padding:20, color: 'white'}}>
      <h1>Contact Us</h1>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
          <label>Subject <input style={{width: '100%', padding: 8, background: '#333', border: '1px solid #555', color: 'white' }} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label>
          <label>Category 
            <select style={{width: '100%', padding: 8, background: '#333', border: '1px solid #555', color: 'white' }} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="billing">Billing</option>
              <option value="prize">Prize/Shipping</option>
              <option value="abuse">Abuse/Report</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Email <input style={{width: '100%', padding: 8, background: '#333', border: '1px solid #555', color: 'white' }} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
          <label>Message <textarea style={{width: '100%', padding: 8, background: '#333', border: '1px solid #555', color: 'white', minHeight: 100 }} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label>
          <button style={{ padding: '10px 15px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={submit}>Send</button>
      </div>
    </div>
  )
}