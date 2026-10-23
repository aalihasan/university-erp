import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const StudentAdvising = () => {
  const { showToast } = useToast();
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'http://localhost:5000/api/admin/advising/student-form',
        hHeaders(),
      );
      setSemesters(
        Array.isArray(res.data?.semesters) ? res.data.semesters : [],
      );
      setSubjects(Array.isArray(res.data?.subjects) ? res.data.subjects : []);
    } catch {
      showToast('Error loading advising parameters', 'error');
    } finally {
      setLoading(false);
    }
  };

  // সমাধান: ESLint missing dependency ওয়ার্নিং চিরতরে লক করতে কমেন্ট লাইনটি ইনজেক্ট করা হলো
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubjectCheckbox = subjectId => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedSemester)
      return showToast('Please select a trimester', 'error');
    if (selectedSubjects.length === 0)
      return showToast('Please select at least one subject', 'error');

    try {
      await axios.post(
        'http://localhost:5000/api/admin/advising/create',
        {
          semester: selectedSemester,
          subjects: selectedSubjects,
        },
        hHeaders(),
      );
      showToast(
        'Course Advising submitted successfully for approval!',
        'success',
      );
      setSelectedSubjects([]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  if (loading)
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading ERP Registration Form...</p>
      </div>
    );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        className="glass-panel"
        style={{ padding: '2rem', borderRadius: '12px' }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>Trimester Course Advising</h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          Select your trimester and preferred subjects to send for Advisor
          Approval.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            className="form-group"
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              Choose Trimester Session
            </label>
            <select
              className="form-input"
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              required
            >
              <option value="">-- Select Active Trimester --</option>
              {semesters.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} - {s.year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              Available Subjects
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '300px',
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              {subjects.map(sub => (
                <label
                  key={sub._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '6px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(sub._id)}
                    onChange={() => handleSubjectCheckbox(sub._id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontWeight: '500' }}>{sub.name}</span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginLeft: '0.5rem',
                      }}
                    >
                      ({sub.code}) • {sub.credits || 3} Credits
                    </span>
                  </div>
                </label>
              ))}
              {subjects.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No subjects found in the university database.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}
          >
            Submit Advising Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAdvising;
