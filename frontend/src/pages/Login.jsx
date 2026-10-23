import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setLoading(true);

      // 🌟 সমাধান: ৪0৪ এরর দূর করতে আপনার লাইভ রেন্ডার ব্যাকএন্ডের সঠিক অফিশিয়াল লগইন এন্ডপয়েন্ট লিঙ্ক করা হলো
      const res = await axios.post('https://onrender.com', {
        email,
        password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));

        showToast('Login successful! Welcome back.', 'success');

        // রোল অনুযায়ী ড্যাশবোর্ডে রিডাইরেক্ট লজিক
        const role = res.data.role;
        if (role === 'Admin') navigate('/admin/dashboard');
        else if (role === 'Professor') navigate('/professor/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || 'Login failed! Invalid credentials.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#fff',
            borderRadius: '50%',
            margin: '0 auto 1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            style={{ color: '#333', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            University
          </span>
        </div>
        <h2 style={{ marginBottom: '1.5rem' }}>University ERP Login</h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@uttarauniversity.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontWeight: 'bold',
              marginTop: '0.5rem',
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
