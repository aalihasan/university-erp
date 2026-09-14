import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download } from 'lucide-react';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // সমাধান: লোকাল স্টোরেজ থেকে সরাসরি রিয়েল টোকেন তোলার নিখুঁত নিয়ম
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        // সমাধান: টোকেন হেডার এবং লোকালহোস্ট লিংক দিয়ে স্টাডি মেটেরিয়ালের লিস্ট গেট করা হলো
        const res = await axios.get(
          'http://localhost:5000/api/student/studymaterial',
          getAuthHeaders(),
        );

        // ডাটা সরাসরি অ্যারে আকারে আসছে কিনা তা সেফলি হ্যান্ডেল করা হলো
        if (res.data) {
          setMaterials(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Error fetching study materials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Study Materials</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {materials.map(mat => (
            <div
              key={mat._id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FileText size={18} color="var(--accent-primary)" />
                {mat.title}
              </h4>
              <p
                style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
              >
                Course: {mat.course?.name}
              </p>
              <p style={{ marginTop: '0.5rem', flex: 1 }}>{mat.description}</p>
              {/* সমাধান: ফাইল ডাউনলোডের ইউআরএল সরাসরি লোকালহোস্টে ম্যাপ করা হলো */}
              <a
                href={`http://localhost:5000${mat.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex justify-center mt-4"
              >
                <Download size={18} style={{ marginRight: '0.5rem' }} />{' '}
                Download File
              </a>
            </div>
          ))}
          {materials.length === 0 && (
            <p style={{ gridColumn: '1/-1' }}>
              No materials uploaded yet for your course.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;
