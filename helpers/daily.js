const fs = require("fs");
const path = require("path");
const { getTodayFile } = require("./getTodayFile");

const daily = () => {
  const todayFile = getTodayFile();

  if (!fs.existsSync(todayFile)) {
    return "No reading progress for today.";
  }

  const messages = JSON.parse(fs.readFileSync(todayFile, "utf8"));

  const stats = {};
  let totalPages = 0;

  for (const msg of messages) {
    const match = msg.text.match(/Book:\s*(.*?)\s*Pages:\s*(\d+)/i);

    if (!match) continue;

    const book = match[1];
    const pages = parseInt(match[2]);
    const user = msg.userName;

    if (!stats[user]) {
      stats[user] = {
        totalPages: 0,
        books: {},
      };
    }

    stats[user].totalPages += pages;
    totalPages += pages;

    if (!stats[user].books[book]) {
      stats[user].books[book] = 0;
    }

    stats[user].books[book] += pages;
  }

  const leaderboard = Object.entries(stats).sort(
    (a, b) => b[1].totalPages - a[1].totalPages,
  );

  let result = "📚 Daily Reading Leaderboard\n\n";

  leaderboard.forEach(([user, data], i) => {
    result += `${i + 1}. ${user} — ${data.totalPages} pages\n`;
  });

  result += `\nTotal pages today: ${totalPages}`;

  const statsDir = "stats";
  fs.mkdirSync(statsDir, { recursive: true });

  const statsFile = path.join(statsDir, path.basename(todayFile));

  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

  return result;
};

module.exports = { daily };
