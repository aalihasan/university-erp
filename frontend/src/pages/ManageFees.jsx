import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ManageFees = () => {
  const { showToast } = useToast();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    semester: '',
    title: 'Tuition Fee',
    amount: '',
    dueDate: '',
  });

  const hChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const hHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [feeRes, formRes] = await Promise.all([
        axios.get(
          'https://university-erp-backend-yfj2.onrender.com/api/admin/fees/list',
          hHeaders(),
        ),
        axios.get(
          'https://university-erp-backend-yfj2.onrender.com/api/admin/fees/form-data',
          hHeaders(),
        ),
      ]);

      // সমাধান: 'res.data' এর পরিবর্তে সঠিক ভেরিয়েবল 'feeRes.data' লক করা হলো
      setFees(Array.isArray(feeRes.data) ? feeRes.data : []);
      setStudents(
        Array.isArray(formRes.data?.students) ? formRes.data.students : [],
      );
      setSemesters(
        Array.isArray(formRes.data?.semesters) ? formRes.data.semesters : [],
      );
    } catch (err) {
      console.error(err);
      showToast('Error loading financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // সমাধান: ESLint missing dependency ওয়ার্নিং পুরোপুরি রিমুভ করার জন্য কমেন্ট ইগনোরার যুক্ত করা হলো
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(
        'https://university-erp-backend-yfj2.onrender.com/api/admin/fees/create',
        formData,
        hHeaders(),
      );
      showToast('Fee Invoice generated successfully!', 'success');
      setShowForm(false);
      setFormData({
        student: '',
        semester: '',
        title: 'Tuition Fee',
        amount: '',
        dueDate: '',
      });
      loadInitialData();
    } catch {
      showToast('Error creating invoice', 'error');
    }
  };

  const hCollectPayment = async id => {
    if (!payAmount || Number(payAmount) <= 0)
      return showToast('Enter valid amount', 'error');
    try {
      await axios.put(
        `https://university-erp-backend-yfj2.onrender.com/api/admin/fees/pay/${id}`,
        { amountPaid: payAmount },
        hHeaders(),
      );
      showToast('Payment updated successfully!', 'success');
      setPayAmount('');
      setSelectedFeeId(null);
      loadInitialData();
    } catch {
      showToast('Payment collection failed', 'error');
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
        <h2>Fee Management System</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Create Invoice
        </button>
      </div>

      {showForm && (
        <div
          className="glass-panel"
          style={{ padding: '1.5rem', marginBottom: '1.5rem' }}
        >
          <form
            onSubmit={hSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <select
              className="form-input"
              name="student"
              value={formData.student}
              onChange={hChange}
              required
            >
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.enrollmentId || s.email})
                </option>
              ))}
            </select>
            <select
              className="form-input"
              name="semester"
              value={formData.semester}
              onChange={hChange}
              required
            >
              <option value="">-- Select Trimester --</option>
              {semesters.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} - {m.year}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="form-input"
              name="title"
              placeholder="Invoice Title"
              value={formData.title}
              onChange={hChange}
              required
            />
            <input
              type="number"
              className="form-input"
              name="amount"
              placeholder="Total Amount"
              value={formData.amount}
              onChange={hChange}
              required
            />
            <input
              type="date"
              className="form-input"
              name="dueDate"
              value={formData.dueDate}
              onChange={hChange}
              required
            />
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn btn-primary">
                Generate Invoice
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                style={{ marginLeft: '0.5rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Loading billing data...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>TRIMESTER</th>
                <th>TITLE</th>
                <th>TOTAL BILL</th>
                <th>PAID</th>
                <th>STATUS</th>
                <th>COLLECT PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f._id}>
                  <td>
                    <strong>{f.student?.name || 'Unknown Student'}</strong>
                  </td>
                  <td>
                    {f.semester?.name} - {f.semester?.year}
                  </td>
                  <td>{f.title}</td>
                  <td>৳{f.amount}</td>
                  <td style={{ color: '#2ecc71' }}>৳{f.paidAmount}</td>
                  <td>
                    <span
                      style={{
                        color:
                          f.status === 'Paid'
                            ? '#2ecc71'
                            : f.status === 'Partial'
                              ? '#f1c40f'
                              : '#e74c3c',
                        fontWeight: 'bold',
                      }}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td>
                    {f.status !== 'Paid' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="number"
                          placeholder="Tk"
                          value={selectedFeeId === f._id ? payAmount : ''}
                          onChange={e => {
                            setSelectedFeeId(f._id);
                            setPayAmount(e.target.value);
                          }}
                          style={{
                            width: '80px',
                            background: '#111',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            border: '1px solid #333',
                          }}
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={() => hCollectPayment(f._id)}
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          Pay
                        </button>
                      </div>
                    ) : (
                      <span>Full Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No financial bills created yet.
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

export default ManageFees;
