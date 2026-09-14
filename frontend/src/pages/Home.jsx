import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const Home = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 5%',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
          }}
        >
          <GraduationCap size={34} />

          <strong
            style={{
              fontSize: '1.3rem',
            }}
          >
            University ERP
          </strong>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.7rem',
          }}
        >
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>

          <Link
            to="/register"
            className="btn"
            style={{
              border: '1px solid var(--accent-primary)',
            }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: 'auto',
          padding: '6rem 2rem 4rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '0.6rem 1rem',
            borderRadius: '50px',
            background: 'rgba(99,102,241,0.1)',
            marginBottom: '1.5rem',
          }}
        >
          <ShieldCheck size={18} />
          <span style={{ marginLeft: '0.5rem' }}>
            Complete University Management System
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
            margin: '0 0 1.2rem',
            lineHeight: 1.1,
          }}
        >
          Manage Your University
          <br />
          From One Platform
        </h1>

        <p
          style={{
            maxWidth: '700px',
            margin: 'auto',
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          A modern ERP management system for universities, colleges, students,
          professors and administrators.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/register"
            className="btn btn-primary"
            style={{
              padding: '0.9rem 1.5rem',
            }}
          >
            Register Your University
            <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Link>

          <Link
            to="/login"
            className="btn"
            style={{
              padding: '0.9rem 1.5rem',
              background: 'white',
            }}
          >
            Admin Login
          </Link>
        </div>
      </section>

      {/* ERP CARDS */}
      <section
        style={{
          maxWidth: '1100px',
          margin: 'auto',
          padding: '2rem 2rem 5rem',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          ERP Management
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'white',
            }}
          >
            <GraduationCap size={40} />

            <h3>University ERP</h3>

            <p>
              Manage students, professors, courses, subjects, attendance,
              notices and more.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <Users size={20} />
              <span>Student Management</span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.7rem',
              }}
            >
              <BookOpen size={20} />
              <span>Course Management</span>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'white',
            }}
          >
            <BookOpen size={40} />

            <h3>College ERP</h3>

            <p>
              A complete management platform for colleges and educational
              institutions.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <Users size={20} />
              <span>Student & Teacher Management</span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.7rem',
              }}
            >
              <BookOpen size={20} />
              <span>Academic Management</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
