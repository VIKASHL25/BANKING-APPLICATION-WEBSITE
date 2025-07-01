import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="home-link">Go back home</Link>
      
      <style>
        {`
        .not-found {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background-color: #f9fafb;
        }
        
        h1 {
          font-size: 6rem;
          font-weight: 700;
          color: #6366f1;
          margin: 0;
        }
        
        h2 {
          font-size: 2rem;
          color: #1f2937;
          margin-top: 0.5rem;
        }
        
        p {
          color: #4b5563;
          margin: 1rem 0 2rem 0;
        }
        
        .home-link {
          padding: 0.75rem 1.5rem;
          background-color: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .home-link:hover {
          background-color: #4f46e5;
        }
        `}
      </style>
    </div>
  );
};

export default NotFound;
