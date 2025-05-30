import React from 'react';

const ResponsiveTest: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Responsive Test</h2>
      
      {/* Test with inline styles and media queries */}
      <div 
        style={{
          border: '2px solid red',
          padding: '10px',
          margin: '10px 0'
        }}
      >
        <div 
          style={{
            display: 'block',
            backgroundColor: 'lightblue',
            padding: '10px',
            marginBottom: '10px'
          }}
          className="desktop-view"
        >
          <h3>Desktop Table View</h3>
          <table style={{ width: '100%', border: '1px solid black' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Email</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Role</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid black', padding: '8px' }}>John Doe</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>john@example.com</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>Admin</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  <button>Edit</button> <button>Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div 
          style={{
            display: 'none',
            backgroundColor: 'lightgreen',
            padding: '10px'
          }}
          className="mobile-view"
        >
          <h3>Mobile Card View</h3>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid gray', 
            borderRadius: '8px', 
            padding: '15px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Name:</strong> <span>John Doe</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Email:</strong> <span>john@example.com</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Role:</strong> <span>Admin</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Actions:</strong> 
              <div>
                <button style={{ marginRight: '5px' }}>Edit</button>
                <button>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 767px) {
          .desktop-view {
            display: none !important;
          }
          .mobile-view {
            display: block !important;
          }
        }
        
        @media (min-width: 768px) {
          .desktop-view {
            display: block !important;
          }
          .mobile-view {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveTest;
