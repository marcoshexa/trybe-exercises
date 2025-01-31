require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const error = require('./middlewares/error')
const createError = require('./utils/createError');

const profile = require('./routes/profile')

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('uploads'));

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const { withoutDate } = req.query;
    if (withoutDate) return callback(null, file.originalname);
    callback(null, `${Date.now()}-${file.originalname}`);
  },
  destination: (_req, file, callback) => {
    const dirs = fs.readdirSync(path.join(__dirname, 'uploads'));
    const dirsWithoutTimestamp = dirs.map((dir) => dir.replace(/^\d+-?/, ''));
    if (dirsWithoutTimestamp.includes(file.originalname)) {
      return callback(createError('File already exists', 409));
    } 
    callback(null, 'uploads');
  }
})

const fileFilter = (_req, file, callback) => {
  if (/.*\.png$/.test(file.originalname)) return callback(null, true);
  callback(createError('Extension must be `png`', 403));
}

const upload = multer({ storage, fileFilter });

app.post('/upload', upload.single('file'), (req, res) => {
  res.status(200).json({ body: req.body, file: req.file });
});

const multiple = multer({ dest: 'uploads' });

app.post('/multiple', multiple.array('files'), (req, res) => {
  const { files } = req;
  const result = files.map(({ filename, originalname }) => ({
    file: originalname,
    url: `http://localhost:3000/${filename}`
  }));
  res.status(200).json(result);
})

app.get('/ping', (_req, res) => res.json({ message: 'Pong!' }));

app.use('/profile', profile);

app.use(error);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
