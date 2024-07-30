import requests
import sys
from bs4 import BeautifulSoup as bs

class cnn:
    def __init__(self, url):
        article = requests.get(url)
        self.soup = bs(article.content, 'html.parser')
        self.body = self.getBody()
        self.title = self.getTitle()
        self.url = url

    # Returns the contents of the article, omitting leading/trailing whitespace and the '\xa0' non-breaking space character
    # This function is specific to CNN articles; to change it so that it works for other websites, you will need to change the arguments of the find() function
    # to match the class of the information on the website you are scraping
    # Use CMD + Shift + C to inspect the element on the website you are scraping to find the class of the information you want to scrape
    def getBody(self) -> str:
        body = self.soup.find(itemprop = 'articleBody')
        paragraphs = ''.join(p.text for p in body.find_all('p'))
        cleaned = paragraphs.replace('\xa0', ' ').replace('\n', ' ')
        cleaned = ' '.join(cleaned.split())
        return cleaned

    def getTitle(self) -> str:
        return self.soup.find(class_='headline__text').text

testArticle = cnn('https://www.cnn.com/2024/07/23/politics/pennsylvania-state-police-commissioner-reveals-stunning-info-about-trump-shooting/index.html')
# print(testArticle.getBody())

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        cnn_instance = cnn(url)
        print(cnn_instance.getBody())
    else:
        print("No URL provided")


