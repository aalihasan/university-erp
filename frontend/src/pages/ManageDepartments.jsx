import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Network,
  PlusCircle,
  Database,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ManageDepartments = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState({
    facultyName: 'School of Science & Engineering',
    name: '',
    code: '',
    description: '',
  });

  const facultyList = [
    'School of Science & Engineering',
    'School of Business',
    'School of Arts & Social Sciences',
    'School of Education & Physical Education',
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'http://localhost:5000/api/admin/departments',
        getAuthHeaders(),
      );
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showToast('Error fetching departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await axios.post(
        'http://localhost:5000/api/admin/departments/seed',
        {},
        getAuthHeaders(),
      );
      showToast(
        res.data.message || 'Uttara University Departments Seeded!',
        'success',
      );
      fetchDepartments();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Error seeding departments',
        'error',
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/admin/departments',
        formData,
        getAuthHeaders(),
      );
      showToast('Department added successfully!', 'success');
      setShowForm(false);
      setFormData({
        facultyName: 'School of Science & Engineering',
        name: '',
        code: '',
        description: '',
      });
      fetchDepartments();
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Error adding department',
        'error',
      );
    }
  };

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Network size={28} color="var(--accent-primary)" />
            Manage Faculties & Departments
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              margin: '0.3rem 0 0 0',
              fontSize: '0.9rem',
            }}
          >
            Uttara University Academic Structure Configuration
          </p>
        </div>
        <div
          className="page-header-actions"
          style={{ display: 'flex', gap: '1rem' }}
        >
          {departments.length === 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleSeedData}
              disabled={seeding}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Database size={18} />
              {seeding ? 'Seeding...' : 'Seed Uttara University Structure'}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PlusCircle size={18} /> Add Program / Department
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            borderRadius: '12px',
          }}
        >
          <h3>Add New Academic Program</h3>
          <form
            onSubmit={handleSubmit}
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.25rem',
              marginTop: '1rem',
            }}
          >
            <div className="form-group">
              <label className="form-label">
                Select Faculty (Main Department)
              </label>
              <select
                className="form-input"
                value={formData.facultyName}
                onChange={e =>
                  setFormData({ ...formData, facultyName: e.target.value })
                }
                required
              >
                {facultyList.map(fac => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CSE"
                value={formData.code}
                onChange={e =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Brief outline..."
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginRight: '1rem' }}
              >
                Save Unit
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

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}>
          <p>Loading academic structure...</p>
        </div>
      ) : departments.length === 0 ? (
        <div
          className="glass-panel text-center"
          style={{ padding: '4rem', textAlign: 'center' }}
        >
          <HelpCircle
            size={48}
            style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}
          />
          <h3>No Academic Structure Found</h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '450px',
              margin: '0.5rem auto 1.5rem auto',
            }}
          >
            Click below to generate all official faculties and departments of
            Uttara University.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleSeedData}
            disabled={seeding}
          >
            <Database size={18} style={{ marginRight: '0.5rem' }} />
            {seeding
              ? 'Generating Setup...'
              : 'Setup Uttara University Structure Now'}
          </button>
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
        >
          {facultyList.map(faculty => {
            const filteredDepts = departments.filter(
              d => d.facultyName === faculty,
            );
            if (filteredDepts.length === 0) return null;

            return (
              <div
                key={faculty}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 1.25rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: 'var(--accent-primary)',
                    fontSize: '1.2rem',
                    borderBottom: '2px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <Layers size={20} />
                  {faculty}
                  <span
                    style={{
                      fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '0.1rem 0.6rem',
                      borderRadius: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {filteredDepts.length} Units
                  </span>
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {filteredDepts.map(dept => (
                    <div
                      key={dept._id}
                      className="glass-panel card-hover"
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontWeight: '600',
                              fontSize: '1.05rem',
                              color: 'var(--text-main)',
                            }}
                          >
                            {dept.name}
                          </h4>
                          <span
                            style={{
                              background:
                                'rgba(var(--accent-primary-rgb), 0.15)',
                              color: 'var(--accent-primary)',
                              fontWeight: '700',
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {dept.code}
                          </span>
                        </div>
                        <p
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            margin: '0.5rem 0',
                            minHeight: '35px',
                            lineHeight: '1.4',
                          }}
                        >
                          {dept.description || 'No description provided.'}
                        </p>
                      </div>
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Head:</span>
                        <span
                          style={{
                            fontWeight: '500',
                            color: dept.headOfDepartment
                              ? 'var(--text-main)'
                              : 'var(--warning)',
                          }}
                        >
                          {dept.headOfDepartment?.name || 'Not Appointed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
