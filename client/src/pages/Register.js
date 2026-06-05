import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    departureDate: '', destination: 'Paris, France', university: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      // Seed default data
      const token = localStorage.getItem('pf_token');
      const headers = { Authorization: `Bearer ${token}` };
      await Promise.allSettled([
        axios.post('/api/checklist/seed', {}, { headers }),
        axios.post('/api/packing/seed', {}, { headers }),
        axios.post('/api/goals/seed', {}, { headers }),
        axios.post('/api/french/seed', {}, { headers }),
        axios.post('/api/bucketlist/seed', {}, { headers }),
      ]);
      addToast('Bienvenue! Your journey begins ✨');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-brand">
          <div className="auth-title">Commençons!</div>
          <div className="auth-subtitle">✦ Create your study abroad journal ✦</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Sophie" required />
            </div>
            <div className="form-group">
              <label className="form-label">University</label>
              <input className="form-input" value={form.university}
                onChange={e => setForm({ ...form, university: e.target.value })}
                placeholder="Sciences Po" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="votre@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" minLength={6} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Departure Date</label>
              <input type="date" className="form-input" value={form.departureDate}
                onChange={e => setForm({ ...form, departureDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input className="form-input" value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon journal ✨'}
          </button>
        </form>

        <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--rouge)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
