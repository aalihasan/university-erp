import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ProfessorTimetable = () => {
  const { showToast } = useToast();
  const [myRoutine, setMyRoutine] = useState([]);
  const [loading, setLoading] = useState(true);

  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const fetchMyRoutine = async () => {
      try {
        setLoading(true);
        // সমাধান: নতুন ডেডিকেটেড প্রফেসর-ফিড এপিআই থেকে সরাসরি ডাটা আনা হচ্ছে
        const res = await axios.get(
          'https://university-erp-backend-yfj2.onrender.com/api/admin/timetable/professor-feed',
          hHeaders(),
        );
        setMyRoutine(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast('Error loading your class routine', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMyRoutine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2>My Class Schedule</h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: '0.2rem 0 0 0',
          }}
        >
          Your personal trimester lecture timeline and assigned classrooms.
        </p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Loading your schedule...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Classroom</th>
                <th>Subject Name</th>
                <th>Course / Dept</th>
                <th>Trimester Session</th>
              </tr>
            </thead>
            <tbody>
              {myRoutine.map(t => (
                <tr key={t._id}>
                  <td>
                    <strong>{t.day}</strong>
                  </td>
                  <td>
                    {t.startTime} - {t.endTime}
                  </td>
                  <td>
                    <span
                      style={{
                        color: 'var(--accent-primary)',
                        fontWeight: '600',
                      }}
                    >
                      {t.roomNumber}
                    </span>
                  </td>
                  <td>
                    {t.subject?.name} ({t.subject?.code})
                  </td>
                  <td>{t.course?.name}</td>
                  <td>
                    {t.semester?.name} - {t.semester?.year}
                  </td>
                </tr>
              ))}
              {myRoutine.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center"
                    style={{ color: 'var(--text-muted)', padding: '2rem 0' }}
                  >
                    No classes assigned to you in the current semester
                    timetable.
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

export default ProfessorTimetable;
