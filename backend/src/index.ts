import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

type MoodEntry = {
  id: number;
  mood: string;
  entry: string;
  createdAt: string;
};

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const moodEntries: MoodEntry[] = [];
let nextMoodId = 1;

app.get('/', (req: Request, res: Response) => {
  res.send('MoodMuse Backend is running...');
});

app.get('/api/moods', (req: Request, res: Response) => {
  res.json(moodEntries);
});

app.post('/api/moods', (req: Request, res: Response) => {
  const { mood, entry } = req.body as { mood?: string; entry?: string };

  if (!mood || !entry) {
    res.status(400).json({ message: 'Mood and entry are required.' });
    return;
  }

  const newEntry: MoodEntry = {
    id: nextMoodId,
    mood,
    entry,
    createdAt: new Date().toISOString(),
  };

  nextMoodId += 1;
  moodEntries.unshift(newEntry);
  io.emit('mood:created', newEntry);
  res.status(201).json(newEntry);
});

app.post('/api/muse', (req: Request, res: Response) => {
  const { mood, entry } = req.body as { mood?: string; entry?: string };
  const moodKey = mood?.toLowerCase() ?? 'neutral';

  const prompts: Record<string, string> = {
    joyful:
      "Your joy crackles like dawn light. Hold it close and let it warm the words you're writing.",
    calm: 'The quiet you carry feels like still water—let it reflect something true about you.',
    sad: 'Even in your heaviness, there is softness. Tell me where the ache began.',
    angry:
      'Your fire is honest and necessary. What boundary is asking to be honored right now?',
    anxious:
      'Let’s breathe together for a moment. What is the smallest thing you can name that feels safe?',
    reflective:
      'You are turning over a stone in your heart. What did you hope to find underneath?',
  };

  const response =
    prompts[moodKey] ??
    'I am here with you—tell me more about the shape of this feeling.';

  res.json({
    response,
    echo: entry ?? '',
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
