import React from 'react';
import logo from "../assets/loader.gif";
import { Container } from 'react-bootstrap';
import './Spinner.css'; // Create this CSS file for additional styling

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-overlay">
      <Container 
        className="spinner-container"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}
      >
        <img 
          src={logo} 
          alt="loading" 
          className="spinner-image"
          style={{
            width: '150px',
            height: '150px',
            filter: 'drop-shadow(0 0 8px rgba(67, 97, 238, 0.5))',
            animation: 'pulse 2s infinite ease-in-out'
          }}
        />
        <p className="spinner-text mt-3" style={{
          color: '#4361ee',
          fontSize: '1.2rem',
          fontWeight: '500',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {message}
        </p>
      </Container>
    </div>
  );
};

export default Spinner;
