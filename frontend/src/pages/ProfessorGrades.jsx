import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ProfessorGrades = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    student: '',
    semester: '',
    subject: '',
    midMarks: '',
    finalMarks: '',
    assignmentMarks: '',
  });

  const hChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://university-erp-backend-yfj2.onrender.com/api/admin/grades/form-data',
          hHeaders(),
        );
        setStudents(res.data?.students || []);
        setSemesters(res.data?.semesters || []);
        setSubjects(res.data?.subjects || []);
      } catch {
        showToast('Error loading evaluation parameters', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hSubmit = async e => {
    e.preventDefault();
    if (
      Number(formData.midMarks) > 30 ||
      Number(formData.assignmentMarks) > 30 ||
      Number(formData.finalMarks) > 40
    ) {
      return showToast(
        'Marks limit exceeded! (Mid: 30, Final: 40, Assignment: 30)',
        'error',
      );
    }
    try {
      await axios.post(
        'https://university-erp-backend-yfj2.onrender.com/api/admin/grades/submit',
        formData,
        hHeaders(),
      );
      showToast('Academic marks updated successfully!', 'success');
      setFormData({
        student: '',
        semester: '',
        subject: '',
        midMarks: '',
        finalMarks: '',
        assignmentMarks: '',
      });
    } catch {
      showToast('Error saving academic grade', 'error');
    }
  };

  if (loading)
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading evaluation ledger...</p>
      </div>
    );

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        className="glass-panel"
        style={{ padding: '2rem', borderRadius: '12px' }}
      >
        <h2>Student Grade Evaluation</h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          Input internal trimester evaluation marks based on the UGC 100-mark
          distribution structure.
        </p>

        <form
          onSubmit={hSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Select Student
            </label>
            <select
              className="form-input"
              name="student"
              value={formData.student}
              onChange={hChange}
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.enrollmentId || s.email})
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Trimester Session
            </label>
            <select
              className="form-input"
              name="semester"
              value={formData.semester}
              onChange={hChange}
              required
            >
              <option value="">-- Choose Trimester --</option>
              {semesters.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} - {m.year}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Subject Unit
            </label>
            <select
              className="form-input"
              name="subject"
              value={formData.subject}
              onChange={hChange}
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Mid-Term Assessment (Max 30)
            </label>
            <input
              type="number"
              className="form-input"
              name="midMarks"
              placeholder="0 - 30"
              value={formData.midMarks}
              onChange={hChange}
              required
            />
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Final Theory Examination (Max 40)
            </label>
            <input
              type="number"
              className="form-input"
              name="finalMarks"
              placeholder="0 - 40"
              value={formData.finalMarks}
              onChange={hChange}
              required
            />
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
              Sessional / Assignment (Max 30)
            </label>
            <input
              type="number"
              className="form-input"
              name="assignmentMarks"
              placeholder="0 - 30"
              value={formData.assignmentMarks}
              onChange={hChange}
              required
            />
          </div>
          <div style={{ gridColumn: '1/-1', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold' }}
            >
              Publish Grade Metrics
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessorGrades;
