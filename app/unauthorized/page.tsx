import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>401 - Unauthorized</h1>
      <p style={styles.message}>You are not allowed to access this page.</p>
      <Link href="/" passHref>
        <button style={styles.button}>Go Back Home</button>
      </Link>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#121212',
    color: '#f1f1f1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#ff4d4f', // red tone
  },
  message: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    color: '#cccccc',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
};
