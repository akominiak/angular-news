require('dotenv').config();
const fs = require('fs');
const Parser = require('rss-parser');

const parser = new Parser();
const RSS_FEED_URL = 'https://news.google.com/rss/search?q=angular';

async function fetchNews() {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    const newsData = feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
    }));

    fs.writeFileSync('news.json', JSON.stringify(newsData, null, 2));
    console.log('News zapisane do news.json');
  } catch (error) {
    console.error('Błąd pobierania newsów:', error);
  }
}

fetchNews();
