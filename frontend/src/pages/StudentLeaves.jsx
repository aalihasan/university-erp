import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const StudentLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', reason: '' });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');

      // সমাধান: এক্সিওস রিকোয়েস্টে হেডার পাসিং লজিক ১০০% নিখুঁত করা হলো
      const res = await axios.get('http://localhost:5000/api/student/leaves', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ব্যাকএন্ড থেকে আসা ডেটা সরাসরি অ্যারে নাকি অবজেক্ট তা চেক করে স্টেটে রাখা হলো
      if (res.data) {
        const leaveData = Array.isArray(res.data)
          ? res.data
          : res.data.leaves || [];
        setLeaves(leaveData);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      // সমাধান: পোস্ট রিকোয়েস্টে ডেটা রেন্ডারিং সিঙ্ক
      await axios.post('http://localhost:5000/api/student/leaves', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowForm(false);
      setFormData({ date: '', reason: '' });
      showToast('Leave request submitted successfully!', 'success');

      // ডাটা সেভ হওয়ার পর ২00 মিলিগ্রাম একটু সময় দিয়ে রিলোড করা যাতে ডাটাবেজ সিঙ্ক হতে পারে
      setTimeout(() => {
        fetchLeaves();
      }, 200);
    } catch (error) {
      showToast('Error submitting leave request', 'error');
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = status => {
    switch (status) {
      case 'Approved':
        return (
          <span style={{ color: 'var(--success)', fontWeight: '600' }}>
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span style={{ color: 'var(--danger)', fontWeight: '600' }}>
            Rejected
          </span>
        );
      default:
        return (
          <span style={{ color: 'var(--warning)', fontWeight: '600' }}>
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>My Leave Requests</h2>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <Send size={18} style={{ marginRight: '0.5rem' }} /> Apply for Leave
          </button>
        </div>
      </div>
      {showForm && (
        <div
          className="glass-panel"
          style={{ padding: '1.5rem', marginBottom: '2rem' }}
        >
          <h3>Apply for Leave</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reason for leave</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.reason}
                onChange={e =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginRight: '1rem' }}
            >
              Submit Request
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Requested On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No leave requests found.
                </td>
              </tr>
            ) : (
              leaves.map(leave => (
                <tr key={leave._id}>
                  <td>{formatDate(leave.date)}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>{formatDate(leave.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentLeaves;
