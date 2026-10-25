import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ManageTimetables = () => {
  const { showToast } = useToast();
  const [timetables, setTimetables] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    semester: '',
    course: '',
    subject: '',
    professor: '',
    day: 'Sunday',
    startTime: '',
    endTime: '',
    roomNumber: '',
  });

  const daysList = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const hChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [listRes, formRes] = await Promise.all([
        axios.get(
          'http://https://university-management-api-oi6s.onrender.com/api/admin/timetable/list',
          hHeaders(),
        ),
        axios.get(
          'http://https://university-management-api-oi6s.onrender.com/api/admin/timetable/form-data',
          hHeaders(),
        ),
      ]);
      setTimetables(Array.isArray(listRes.data) ? listRes.data : []);
      setSemesters(formRes.data?.semesters || []);
      setCourses(formRes.data?.courses || []);
      setSubjects(formRes.data?.subjects || []);
      setProfessors(formRes.data?.professors || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading timetable data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🌟 সমাধান: অসীম লুপ (Infinite Loop) এবং ERR_INSUFFICIENT_RESOURCES চিরতরে বন্ধ করতে
  // ডিপেন্ডেন্সি অ্যারে সম্পূর্ণ খালি [] রাখা হলো এবং ESLint ওয়ার্নিং লক কমেন্ট যুক্ত করা হলো।
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(
        'http://https://university-management-api-oi6s.onrender.com/api/admin/timetable/create',
        formData,
        hHeaders(),
      );
      showToast('Class schedule created successfully!', 'success');
      setShowForm(false);
      setFormData({
        semester: '',
        course: '',
        subject: '',
        professor: '',
        day: 'Sunday',
        startTime: '',
        endTime: '',
        roomNumber: '',
      });
      loadInitialData();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Error creating schedule',
        'error',
      );
    }
  };

  const hDelete = async id => {
    if (!window.confirm('Delete this class schedule?')) return;
    try {
      await axios.delete(
        `http://https://university-management-api-oi6s.onrender.com/api/admin/timetable/delete/${id}`,
        hHeaders(),
      );
      showToast('Schedule removed!', 'success');
      loadInitialData();
    } catch {
      showToast('Error deleting schedule', 'error');
    }
  };

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        <h2>Class Timetable Scheduling</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Class Slot
        </button>
      </div>

      {showForm && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            marginBottom: '1.5rem',
            borderRadius: '12px',
          }}
        >
          <h3 style={{ marginBottom: '1.25rem' }}>
            Create Class Schedule Slot
          </h3>
          <form
            onSubmit={hSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Select Trimester
              </label>
              <select
                className="form-input"
                name="semester"
                value={formData.semester}
                onChange={hChange}
                required
              >
                <option value="">-- Select Semester --</option>
                {semesters.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.year}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Select Course/Department
              </label>
              <select
                className="form-input"
                name="course"
                value={formData.course}
                onChange={hChange}
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Select Subject
              </label>
              <select
                className="form-input"
                name="subject"
                value={formData.subject}
                onChange={hChange}
                required
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Assign Professor
              </label>
              <select
                className="form-input"
                name="professor"
                value={formData.professor}
                onChange={hChange}
                required
              >
                <option value="">-- Select Professor --</option>
                {professors.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Day of Week
              </label>
              <select
                className="form-input"
                name="day"
                value={formData.day}
                onChange={hChange}
                required
              >
                {daysList.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Start Time
              </label>
              <input
                type="text"
                className="form-input"
                name="startTime"
                placeholder="e.g. 09:00 AM"
                value={formData.startTime}
                onChange={hChange}
                required
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                End Time
              </label>
              <input
                type="text"
                className="form-input"
                name="endTime"
                placeholder="e.g. 10:30 AM"
                value={formData.endTime}
                onChange={hChange}
                required
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                Room Number
              </label>
              <input
                type="text"
                className="form-input"
                name="roomNumber"
                placeholder="e.g. Room 402"
                value={formData.roomNumber}
                onChange={hChange}
                required
              />
            </div>
            <div style={{ gridColumn: '1/-1', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginRight: '0.75rem' }}
              >
                Save Schedule
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Loading class routines...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Room</th>
                <th>Subject</th>
                <th>Course/Dept</th>
                <th>Professor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map(t => (
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
                  <td>{t.subject?.name}</td>
                  <td>{t.course?.name}</td>
                  <td>{t.professor?.name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => hDelete(t._id)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {timetables.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No class routines created yet.
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

export default ManageTimetables;
