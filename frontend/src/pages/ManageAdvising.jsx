import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ManageAdvising = () => {
  const { showToast } = useToast();
  const [advisings, setAdvisings] = useState([]);
  const [loading, setLoading] = useState(true);

  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const fetchAdvisings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'http://https://university-management-api-oi6s.onrender.com/api/admin/advising/list',
        hHeaders(),
      );
      setAdvisings(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('Error loading course registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // সমাধান: ESLint missing dependency ওয়ার্নিং চিরতরে লক করতে কমেন্ট লাইনটি ইনজেক্ট করা হলো
  useEffect(() => {
    fetchAdvisings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(
        `http://https://university-management-api-oi6s.onrender.com/api/admin/advising/respond/${id}`,
        { status },
        hHeaders(),
      );
      showToast(`Registration request ${status.toLowerCase()}!`, 'success');
      fetchAdvisings();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Course Advising & Approval</h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: '0.2rem 0 0 0',
          }}
        >
          Review and Approve Student Semester Course Registrations
        </p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Loading registration requests...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Trimester Session</th>
                <th>Selected Subjects</th>
                <th>Total Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {advisings.map(adv => (
                <tr key={adv._id}>
                  <td>
                    <strong>{adv.student?.name || 'Unknown'}</strong>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ID: {adv.student?.enrollmentId || '-'}
                    </div>
                  </td>
                  <td>
                    {adv.semester?.name} - {adv.semester?.year}
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      {adv.subjects?.map((sub, idx) => (
                        <span key={sub._id || idx}>
                          • {sub.name} ({sub.code})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{adv.totalCredits} Cr</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color:
                          adv.status === 'Approved'
                            ? '#2ecc71'
                            : adv.status === 'Rejected'
                              ? '#e74c3c'
                              : '#f1c40f',
                      }}
                    >
                      {adv.status}
                    </span>
                  </td>
                  <td>
                    {adv.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleAction(adv._id, 'Approved')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.8rem',
                            background: '#2ecc71',
                            color: '#fff',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleAction(adv._id, 'Rejected')}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.8rem',
                            background: '#e74c3c',
                            color: '#fff',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Decision Made
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {advisings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    No course registration requests pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAdvising;
