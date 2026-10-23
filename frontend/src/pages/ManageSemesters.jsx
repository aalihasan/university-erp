import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ManageSemesters = () => {
  const { showToast } = useToast();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Spring',
    year: 2026,
    status: 'Upcoming',
    startDate: '',
    endDate: '',
    midTermDate: '',
    finalExamDate: '',
    maxCredits: 15,
    paymentDeadline: '',
  });

  const hChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const fSemesters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'http://localhost:5000/api/admin/semesters',
        hHeaders(),
      );
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fSemesters();
  }, []);

  const resetForm = () => {
    setFormData({
      name: 'Spring',
      year: 2026,
      status: 'Upcoming',
      startDate: '',
      endDate: '',
      midTermDate: '',
      finalExamDate: '',
      maxCredits: 15,
      paymentDeadline: '',
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const hSubmit = async e => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/admin/semesters/${editId}`,
          formData,
          hHeaders(),
        );
        showToast('Updated!', 'success');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/semesters',
          formData,
          hHeaders(),
        );
        showToast('Created!', 'success');
      }
      resetForm();
      fSemesters();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const hEdit = sem => {
    const fD = d => (d ? new Date(d).toISOString().split('T')[0] : '');
    setFormData({
      name: sem.name,
      year: sem.year,
      status: sem.status,
      startDate: fD(sem.startDate),
      endDate: fD(sem.endDate),
      midTermDate: fD(sem.midTermDate),
      finalExamDate: fD(sem.finalExamDate),
      maxCredits: sem.maxCredits,
      paymentDeadline: fD(sem.paymentDeadline),
    });
    setEditId(sem._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const hDelete = async id => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/semesters/${id}`,
        hHeaders(),
      );
      showToast('Deleted!', 'success');
      fSemesters();
    } catch {
      showToast('Error deleting', 'error');
    }
  };

  const fDate = d => (d ? new Date(d).toLocaleDateString('en-GB') : '-');

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
        <h2>Academic Semesters</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Semester
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
          <h3 style={{ marginBottom: '1.5rem' }}>
            {isEditing
              ? 'Edit Semester Session'
              : 'Create Detailed Semester Session'}
          </h3>
          <form
            onSubmit={hSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* সমাধান: প্রতিটি ইনপুট ফিল্ডের ওপর সুন্দর প্রোপার লেবেল বা নাম যোগ করা হলো */}
            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Trimester Name
              </label>
              <select
                className="form-input"
                name="name"
                value={formData.name}
                onChange={hChange}
              >
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
              </select>
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Academic Year
              </label>
              <input
                type="number"
                className="form-input"
                name="year"
                placeholder="e.g. 2026"
                value={formData.year}
                onChange={hChange}
                required
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Max Credit Limit
              </label>
              <input
                type="number"
                className="form-input"
                name="maxCredits"
                placeholder="e.g. 15"
                value={formData.maxCredits}
                onChange={hChange}
                required
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Semester Status
              </label>
              <select
                className="form-input"
                name="status"
                value={formData.status}
                onChange={hChange}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Passed">Passed</option>
              </select>
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Start Date
              </label>
              <input
                type="date"
                className="form-input"
                name="startDate"
                value={formData.startDate}
                onChange={hChange}
                required
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                End Date
              </label>
              <input
                type="date"
                className="form-input"
                name="endDate"
                value={formData.endDate}
                onChange={hChange}
                required
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Mid-Term Expected
              </label>
              <input
                type="date"
                className="form-input"
                name="midTermDate"
                value={formData.midTermDate}
                onChange={hChange}
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Final Exam Expected
              </label>
              <input
                type="date"
                className="form-input"
                name="finalExamDate"
                value={formData.finalExamDate}
                onChange={hChange}
              />
            </div>

            <div
              className="form-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <label
                className="form-label"
                style={{ fontWeight: '500', fontSize: '0.85rem' }}
              >
                Fees Payment Deadline
              </label>
              <input
                type="date"
                className="form-input"
                name="paymentDeadline"
                value={formData.paymentDeadline}
                onChange={hChange}
              />
            </div>

            <div
              style={{
                gridColumn: '1/-1',
                marginTop: '1rem',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Session' : 'Save Session'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        className="glass-panel"
        style={{ overflowX: 'auto', marginTop: '1rem' }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Duration</th>
                <th>Exams (Mid/Final)</th>
                <th>Credits</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(s => (
                <tr key={s._id}>
                  <td>
                    <strong>
                      {s.name} - {s.year}
                    </strong>
                  </td>
                  <td>
                    {fDate(s.startDate)} to {fDate(s.endDate)}
                  </td>
                  <td>
                    Mid: {fDate(s.midTermDate)}
                    <br />
                    Final: {fDate(s.finalExamDate)}
                  </td>
                  <td>{s.maxCredits} Cr</td>
                  <td>{fDate(s.paymentDeadline)}</td>
                  <td>
                    <span
                      style={{
                        color:
                          s.status === 'Active'
                            ? '#2ecc71'
                            : s.status === 'Upcoming'
                              ? '#f1c40f'
                              : '#888',
                        fontWeight: '600',
                      }}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => hEdit(s)}
                      style={{
                        padding: '4px 10px',
                        marginRight: '6px',
                        fontSize: '0.8rem',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => hDelete(s._id)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {semesters.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No semesters found.
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

export default ManageSemesters;
