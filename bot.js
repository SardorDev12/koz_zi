const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const { getTodayFile } = require('./helpers/getTodayFile');
const { saveProgress } = require('./helpers/saveProgress');
const { daily } = require('./helpers/daily');
const http = require('http');
dotenv.config();

const TOKEN = process.env.TOKEN;
const GROUP_ID = process.env.GROUP_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

const todayFile = getTodayFile();
fs.mkdirSync('data', { recursive: true });

bot.on('message', (msg) => {
  if (msg.chat.id != GROUP_ID) return;
  if (!msg.text) return;

  // 🔴 IGNORE COMMANDS
  if (msg.text.startsWith('/')) return;
  try {
    if (msg.text && msg.text.toLowerCase().includes('kunlikmutolaa')) {
      const quote = {
        message_id: msg.message_id,
        userID: msg.from.id,
        userName: msg.from.first_name,
        date: msg.date,
        text: msg.text,
      };

      saveProgress(quote);
      console.log('Progress saved');
    } else {
      console.log('No progress');
    }
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/\/daily(@\w+)?/, (msg) => {
  if (msg.chat.id != GROUP_ID) return;

  const leaderboard = daily();

  bot.sendMessage(GROUP_ID, leaderboard);
});

const PORT = process.env.PORT || 8000;
http
  .createServer(async (req, res) => {
    try {
      if (req.url === '/daily') {
        const leaderboard = daily();

        await bot.sendMessage(GROUP_ID, leaderboard);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Daily stats sent\n');
        return;
      }

      if(req.url === "/remind"){
        await bot.sendMessage(GROUP_ID, "Bugun mutolaa qildingizmi?")
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end();
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bot is running\n');
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end('Server error\n');
    }
  })
  .listen(PORT, () => {
    console.log('HTTP server running on port', PORT);
  });
