const express = require('express');
const app = express();
const { Client, MessageMedia, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const session = require('express-session');
const multer = require('multer'); // For handling file uploads
const csv = require('csv-parser'); // For parsing CSV files
const cors = require('cors');
app.use(cors())
const fs = require('fs');
const { promisify } = require('util');

app.use(express.json());

// Create a storage engine for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // The directory where uploaded files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});
const uploads = multer({ storage: Storage });

// Define a POST route for sending messages
app.post('/send-messages', upload.single('csv'), async(req, res) => {
  // Read and process the CSV file containing contact numbers
  const contactNumbers = [];
  req.file.buffer
    .toString()
    .split('\n')
    .forEach((line) => {
      const number = line.trim();
      if (number) {
        contactNumbers.push(number);
      }
    });

  // Send messages to the contact numbers
  const message = req.body.message;
console.log(contactNumbers);
console.log(message);
for (let index = 0; index < contactNumbers.length; index++) {
  let test = contactNumbers[index]
  console.log(test);
  let code = await client.sendMessage('234' + test + '@c.us', message);
  console.log(code);
}

  res.send('Messages sent successfully.');
});

// Define a POST route for sending media files
app.post('/send-media', uploads.fields([{ name: 'media', maxCount: 1 }, { name: 'csv', maxCount: 1 }]), async (req, res) => {
  try {
    // Read and process the CSV file containing contact numbers
    const csvFile = await promisify(fs.readFile)(req.files['csv'][0].path);
    const mediaFile = req.files['media'][0];

    const numbers = csvFile.toString().split('\r\n').map((number) => number.trim());

    for (const number of numbers) {
      // Validate the format of the phone number here (remove any special characters or spaces)
      const cleanNumber = number.replace(/[^\d]+/g, '');

      if (cleanNumber) {
        const media = MessageMedia.fromFilePath(mediaFile.path);
        const chat = await client.sendMessage( '234' + cleanNumber + '@c.us', media);
        console.log(chat);
        console.log(`Media sent to ${cleanNumber}`);
      }
    }

    res.status(200).json({ success: true, message: 'Media sent' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error sending media' });
  }
});

  

// Define a route to display the QR code
app.get('/qr', (req, res) => {
const client = new Client({
  authStrategy: new NoAuth(),
  puppeteer: {
    headless: false,
  }
});
client.on('ready', ()=> {
  console.log('client is ready')
  )}
client.initialize();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
