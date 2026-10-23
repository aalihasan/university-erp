import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const StudentReport = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const loadReportCard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://university-erp-backend-yfj2.onrender.com/api/admin/grades/report-card',
          hHeaders(),
        );
        setRecords(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast('Error retrieving academic grade ledger', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadReportCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate Cumulative CGPA
  const calculateCGPA = () => {
    if (records.length === 0) return '0.00';
    const activeGrades = records.filter(r => r.letterGrade !== 'F');
    if (activeGrades.length === 0) return '0.00';
    const totalPoints = activeGrades.reduce((sum, r) => sum + (r.gpa || 0), 0);
    return (totalPoints / activeGrades.length).toFixed(2);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        <div>
          <h2>Academic Transcript Ledger</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              margin: '0.2rem 0 0 0',
            }}
          >
            Trimester performance report index based on official UGC grade scale
            matrix.
          </p>
        </div>
        <div
          style={{
            background: 'rgba(var(--accent-primary-rgb), 0.15)',
            color: 'var(--accent-primary)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontWeight: 'bold',
          }}
        >
          CGPA: {calculateCGPA()} / 4.00
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Compiling transcript matrix...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Trimester</th>
                <th>Mid (30)</th>
                <th>Final (40)</th>
                <th>Sessional (30)</th>
                <th>Total</th>
                <th>GPA</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.subject?.name}</strong>{' '}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Code: {r.subject?.code}
                    </div>
                  </td>
                  <td>
                    {r.semester?.name} - {r.semester?.year}
                  </td>
                  <td>{r.midMarks}</td>
                  <td>{r.finalMarks}</td>
                  <td>{r.assignmentMarks}</td>
                  <td style={{ fontWeight: '600' }}>{r.totalMarks}</td>
                  <td
                    style={{
                      color:
                        r.letterGrade === 'F'
                          ? '#e74c3c'
                          : 'var(--accent-primary)',
                      fontWeight: 'bold',
                    }}
                  >
                    {r.gpa?.toFixed(2)}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: r.letterGrade === 'F' ? '#e74c3c' : '#2ecc71',
                      }}
                    >
                      {r.letterGrade}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No academic grades published for your account yet.
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

export default StudentReport;
