import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Mail, Lock, Upload, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  const [universityName, setUniversityName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [logo, setLogo] = useState(null);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('universityName', universityName);

      formData.append('email', email);

      formData.append('password', password);

      formData.append('confirmPassword', confirmPassword);

      if (logo) {
        formData.append('universityLogo', logo);
      }

      // await axios.post(
      //   `${import.meta.env.VITE_API_URL}/api/auth/register`,
      //   formData,
      //   {
      //     headers: {
      //       'Content-Type': 'multipart/form-data',
      //     },
      //   },
      // );
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const university = response.data.university;

      if (university) {
        localStorage.setItem(
          'registeredUniversity',
          JSON.stringify({
            name: university.name,
            logo: university.logo,
          }),
        );
      }

      alert('University registration successful. Please login.');

      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="app-container"
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '2.5rem',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <Building2
            size={45}
            style={{
              marginBottom: '0.7rem',
            }}
          />

          <h2>Register Your University</h2>

          <p
            style={{
              color: 'var(--text-secondary)',
            }}
          >
            Create your university admin account
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: 'rgba(239,68,68,0.1)',
              color: 'var(--danger)',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">University Logo</label>

            <div
              style={{
                border: '2px dashed #ccc',
                padding: '1.5rem',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <Upload size={30} />

              <p>Select university logo</p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => setLogo(e.target.files[0])}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">University Name</label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <Building2
                size={18}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                }}
              />

              <input
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                }}
                type="text"
                placeholder="Uttara University"
                value={universityName}
                onChange={e => setUniversityName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Email</label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                }}
              />

              <input
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                }}
                type="email"
                placeholder="admin@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                }}
              />

              <input
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                }}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>

            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.9rem',
            }}
          >
            {loading ? 'Creating Account...' : 'Register University'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
          }}
        >
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
