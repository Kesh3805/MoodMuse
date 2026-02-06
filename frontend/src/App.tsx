import { useMemo, useState } from 'react';

const moods = [
  'Softly hopeful',
  'Restless',
  'Tender',
  'Melancholy',
  'Electric joy',
  'Stormy',
];

const modes = [
  { id: 'journal', label: 'Journal Mode' },
  { id: 'chat', label: 'Chat Mode' },
  { id: 'creative', label: 'Creative Mode' },
  { id: 'silent', label: 'Silent Mode' },
];

const quickPrompts = [
  'Tell me what today felt like in one sentence.',
  'What do you wish someone understood about you right now?',
  'Name a color that matches your mood and why.',
  'What would soothe you in the next ten minutes?',
];

const pickPrompt = (index: number) => quickPrompts[index % quickPrompts.length];

const apiBase = 'http://localhost:3001';

const App = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState(moods[0]);
  const [mode, setMode] = useState(modes[0].id);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompt = useMemo(() => pickPrompt(entry.length), [entry.length]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${apiBase}/api/muse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, entry, mode }),
      });

      if (!res.ok) {
        throw new Error('Muse is resting. Try again in a moment.');
      }

      const data = await res.json();
      setResponse(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <main className="container">
        <header className="hero">
          <span className="badge">MoodMuse</span>
          <h1>A living diary, a poetic mirror.</h1>
          <p>
            Capture the moment, and let your Muse translate it into a gentle reflection.
          </p>
        </header>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Check in with your Muse</h2>
              <p>{prompt}</p>
            </div>
            <div className="mood-pill">{mood}</div>
          </div>

          <div className="field-group">
            <label htmlFor="mood">Mood color</label>
            <select
              id="mood"
              value={mood}
              onChange={(event) => setMood(event.target.value)}
            >
              {moods.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="mode">Muse mode</label>
            <div className="mode-row">
              {modes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={mode === option.id ? 'mode active' : 'mode'}
                  onClick={() => setMode(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="entry">Your words</label>
            <textarea
              id="entry"
              placeholder="Write freely — your Muse is listening."
              value={entry}
              onChange={(event) => setEntry(event.target.value)}
              rows={5}
            />
          </div>

          <button
            className="primary"
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || entry.trim().length === 0}
          >
            {isLoading ? 'Listening…' : 'Reflect with the Muse'}
          </button>

          {error && <p className="status error">{error}</p>}
          {response && <p className="status response">“{response}”</p>}
        </section>

        <section className="grid">
          <div className="panel">
            <h3>Heartbeat timeline</h3>
            <p>
              Track your emotional seasons. Each entry becomes part of a luminous story you
              can revisit.
            </p>
          </div>
          <div className="panel">
            <h3>Emotional archaeology</h3>
            <p>
              MoodMuse quietly notices patterns — like the nights when thunder makes you
              brave.
            </p>
          </div>
          <div className="panel">
            <h3>Creative alchemy</h3>
            <p>
              Turn feelings into poems, prompts, and rituals that soften the sharp edges.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
