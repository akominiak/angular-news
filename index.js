require('dotenv').config();
const axios = require('axios');
const { Client } = require('@notionhq/client');
const Parser = require('rss-parser');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
const databaseId = process.env.NOTION_DATABASE_ID;
const parser = new Parser();

// Źródło RSS z newsami o Angularze
const RSS_FEED_URL = 'https://news.google.com/rss/search?q=angular';

async function fetchNews() {
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    return feed.items.slice(0, 5);
  } catch (error) {
    console.error('Error while download news', error);
    return [];
  }
}

async function addToNotion(newsItem) {
  const formattedDate = new Date(newsItem.pubDate).toISOString();

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: newsItem.title } }],
        },
        URL: {
          url: newsItem.link,
        },
        Published: {
          date: { start: new Date(newsItem.pubDate).toISOString() },
        },
      },
    });
    console.log(`Dodano do Notion: ${newsItem.title}`);
  } catch (error) {
    console.error('Error while add to Notion', error);
  }
}

async function main() {
  const news = await fetchNews();
  for (const item of news) {
    await addToNotion(item);
  }
}

main();
