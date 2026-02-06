import { useEffect, useMemo, useState } from 'react';

type MoodEntry = {
  id: number;
  mood: string;
  entry: string;
  createdAt: string;
};

const MOODS = ['Joyful', 'Calm', 'Sad', 'Angry', 'Anxious', 'Reflective'];

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const API_BASE = 'http://localhost:3001';

const moodDescriptions: Record<string, string> = {
  Joyful: 'Celebrate wins and amplify the light.',
  Calm: 'Breathe into stillness and slow the room down.',
  Sad: 'Hold space for tenderness and honesty.',
  Angry: 'Name what needs protecting.',
  Anxious: 'Ground yourself in the next small step.',
  Reflective: 'Trace patterns and discover meaning.',
};

const App = () => {
  const [mood, setMood] = useState(MOODS[0]);
  const [entry, setEntry] = useState('');
  const [museResponse, setMuseResponse] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const moodHint = useMemo(() => moodDescriptions[mood], [mood]);

  const loadEntries = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/moods`);
      if (!response.ok) {
        throw new Error('Unable to load moods.');
      }
      const data = (await response.json()) as MoodEntry[];
      setEntries(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load mood entries.',
      );
    }
  };

  useEffect(() => {
    void loadEntries();
  }, []);

  const handleSubmit = async () => {
    if (!entry.trim()) {
      setError('Write a few lines before sending your entry.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, entry }),
      });

      if (!response.ok) {
        throw new Error('Unable to save your entry.');
      }

      const saved = (await response.json()) as MoodEntry;
      setEntries((prev) => [saved, ...prev]);
      setEntry('');

      const museReply = await fetch(`${API_BASE}/api/muse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, entry }),
      });

      if (!museReply.ok) {
        throw new Error('Unable to hear from the Muse.');
      }

      const museData = (await museReply.json()) as { response: string };
      setMuseResponse(museData.response);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">MoodMuse</p>
        <h1>A living diary, a poetic mirror.</h1>
        <p className="subtitle">
          Capture your emotional weather and let the Muse reflect it back with
          gentle insight.
        </p>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Today&apos;s mood</h2>
            <p className="hint">{moodHint}</p>
          </div>
          <span className="badge">MVP</span>
        </div>

        <div className="mood-picker">
          {MOODS.map((option) => (
            <button
              key={option}
              className={option === mood ? 'pill active' : 'pill'}
              onClick={() => setMood(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        <label className="label" htmlFor="entry">
          Your entry
        </label>
        <textarea
          id="entry"
          placeholder="Write a few honest lines about how you&apos;re feeling..."
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          rows={5}
        />

        <div className="actions">
          <button
            className="primary"
            onClick={handleSubmit}
            type="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Listening...' : 'Share with the Muse'}
          </button>
          {error ? <span className="error">{error}</span> : null}
        </div>
      </section>

      <section className="panel">
        <h2>The Muse responds</h2>
        <p className="muse">
          {museResponse ||
            'Send an entry to receive a poetic reflection from your Muse.'}
        </p>
      </section>

      <section className="panel">
        <h2>Recent entries</h2>
        {entries.length === 0 ? (
          <p className="hint">
            Your mood timeline will appear here after your first entry.
          </p>
        ) : (
          <div className="entries">
            {entries.map((item) => (
              <article key={item.id} className="entry">
                <div className="entry-header">
                  <span className="entry-mood">{item.mood}</span>
                  <span className="entry-date">{formatDate(item.createdAt)}</span>
                </div>
                <p>{item.entry}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
