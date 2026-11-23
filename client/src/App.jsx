import { useState } from 'react';

const emptyForm = { name: '', email: '', message: '' };

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [submissions, setSubmissions] = useState([]);
  const [view, setView] = useState('form');
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Load failed');
      setSubmissions(await res.json());
      setError('');
    } catch {
      setError('Could not load submissions');
    }
  }

  async function submit(event) {
    event.preventDefault();
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submit failed');
      }
      setForm(emptyForm);
      setView('list');
      await load();
    } catch (err) {
      setError(err.message || 'Could not submit');
    }
  }

  function showList() {
    setError('');
    setView('list');
    load();
  }

  if (view === 'list') {
    return (
      <main>
        <h1>Submissions</h1>
        <button onClick={() => setView('form')}>Back to form</button>
        {error && <p className="error">{error}</p>}
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <ul>
            {submissions.map((item) => (
              <li key={item._id}>
                <strong>{item.name}</strong> &lt;{item.email}&gt;
                <p>{item.message}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Submit a message</h1>
      <form onSubmit={submit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <button onClick={showList}>View all submissions</button>
      {error && <p className="error">{error}</p>}
    </main>
  );
}
