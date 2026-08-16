import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#333' }}>
        {statusCode ? `${statusCode} - Server Error` : 'Client Error'}
      </h1>
      <p style={{ color: '#666', marginTop: '0.5rem' }}>
        {statusCode === 404 ? 'This page could not be found.' : 'An unexpected error occurred.'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
