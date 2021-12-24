// Import the puppeteer
const puppeteer = require('puppeteer');
const sentenceBoundaryDetection = require('sbd');

async function robot(content) {
  // Search in Wikipedia
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);

  async function webScraping(searchTerm) {
    try {
      // Create a instance of browser
      const browser = await puppeteer.launch({
        headless: true, 
        args: ['--disable-setuid-sandbox'], // Disable the setuid sandox (Linux only)
        'ignoreHTTPSErrors': true,
      });

      // Initiate a new page
      const page = await browser.newPage();

      // Access the url
      const url = 'https://www.wikipedia.org/';
     
      await page.goto(url);

      // Type a search term
      await page.waitForSelector('.search-input');

      // Type the searchTerm in input field
      await page.type('#searchInput', searchTerm);
      
      // Click in button to search
      await page.click('button.pure-button');

      // Trying to find a result 
      try {
        // Waiting the page to be loaded
        // await page.waitForNavigation({ waitUntil: ['domcontentloaded'] });

        // Waiting for selector to appear
        await page.waitForSelector('.mw-parser-output', {visible: true});

        // Get all the paragraphs inside the page        
        var getParagraphsSearchTerm = await page.$$eval('.mw-parser-output p', elements => elements.map(item => item.textContent));

      } catch(err) {
        console.error('The search term could not be found. ', err);
      }
      
      await browser.close();
    } catch(err) {
      console.error(`Could not create a browser instance => : ${error}`);
    }
    return getParagraphsSearchTerm;

  }

  async function fetchContentFromWikipedia(content) {
    // Web Scraping in Wikipedia
    const wikipediaContent = await webScraping(content.searchTerm);
    // console.log('Wikipedia content: ', wikipediaContent);

    content.sourceContentOriginal = wikipediaContent;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal);
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);
    // console.log(withoutDatesInParentheses);

    content.sourceContentSanitized = withoutDatesInParentheses;

    function removeBlankLinesAndMarkdown(text) {
      // console.log('text: ', text);
      // const allLines = text.split('\n');
      // const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
      const withoutBlankLinesAndMarkDown = text.filter((line) => {
        if(line.trim().length === 0 || line.trim().startsWith('=') || line === '\n' || line.includes('Coordenadas')){
          return false;
        } 

        return true;
      });

      return withoutBlankLinesAndMarkDown.join(' ');
    }

    function removeDatesInParentheses(text) {
      return text.replace(/|((?:|([^()]*|)|[^()])*|)/gm, '').replace(/ /g, ' ').replace(/\[\d+\]/g, '').replace(/\n/g, '');
    }
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence, 
        keywords: [],
        images: []
      });
    });

    console.log(content.sentences);
  }
}

module.exports = robot;