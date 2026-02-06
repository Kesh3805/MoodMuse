import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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

app.get('/', (req: Request, res: Response) => {
  res.send('MoodMuse Backend is running...');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/muse', (req: Request, res: Response) => {
  const { mood, entry, mode } = req.body as {
    mood?: string;
    entry?: string;
    mode?: string;
  };

  const trimmedEntry = entry?.trim();

  if (!trimmedEntry) {
    res.status(400).json({ message: 'Share a few words so the Muse can respond.' });
    return;
  }

  const responses = {
    journal:
      'Your words are a lantern in the dark—keep writing, and the path will appear.',
    chat: 'I hear the tremble and the courage. What feels most alive right now?',
    creative:
      'Let us turn this into art: paint the feeling with three unexpected metaphors.',
    silent:
      'I am here with you, breathing beside your silence. Stay as long as you need.',
  };

  const moodLine = mood ? ` Today tastes like ${mood.toLowerCase()}.` : '';
  const message = `${responses[mode as keyof typeof responses] ?? responses.journal}${moodLine}`;

  res.json({ message });
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
