require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
const databaseId = process.env.NOTION_DATABASE_ID;

async function fetchNewsWithoutRSS() {
  try {
    const { data } = await axios.get(process.env.SOURCE_URL);
    const $ = cheerio.load(data);
    const articles = [];
    $('al-article-card').each((index, element) => {
      const title = $(element).find('h3').text();
      const link = $(element).find('a').attr('href');
      articles.push({
        title: title,
        link: link,
        date: new Date().toISOString(),
      });
    });
    return articles.slice(0, 5);
  } catch (error) {
    console.error('Error loading the page:', error);
  }
}

async function addToNotion(newsItem) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Title: {
          title: [{ text: { content: newsItem.title || 'No title' } }],
        },
        URL: {
          url: process.env.SOURCE_URL + newsItem.link,
        },
        Published: {
          date: { start: new Date().toISOString() || null },
        },
      },
    });
  } catch (error) {
    console.error('Error adding to Notion', error);
  }
}

async function main() {
  const news = await fetchNewsWithoutRSS();
  if (news) {
    for (const item of news) {
      await addToNotion(item);
    }
  }
}

main();
