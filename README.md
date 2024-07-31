# News Article ChatBot Using OpenAI API
For this project, I wanted to play around with the OpenAI API, so I decided to create a chatbot that could take in the contents of any given CNN article and then answer questions about it. To do so, I created a short webscraping script with Python and BeautfiulSoup that extracts just the article body.\
\
Since using the ChatGPT-4o model through the API won't store the conversation history on its own, I created a conversation history variable so that the bot will still have memory of the earlier parts of the conversation. API usage is counted and charged through the number of input and output tokens, so to minimize the number of input tokens I implemented a `summarizeHistory` function in order to limit the number of input tokens sent to the model every time the `conversationHistory` variable is passed to the model.
 

## How to Run the Chatbot
Make sure you are in the website-bot directory on your machine. In the command line, run:
``` console
node src/openai.js
```
It will then prompt you to enter the URL for a CNN article, and you can begin conversing with the chatbot. Whenever you are finished, type `exit` to end the conversation\
\
**_Note: The chatbot is limited so that it can only answer questions about the article. If you would like to change this, delete the second entry of the `conversationHistory` variable_**
```javascript
let conversationHistory = [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Remember, you are only to answer questions about the article I provide you' }
]
```

<br>


_For Lumin Digital employees: If you are having trouble getting past Zscaler, export the Zscaler Root CA from Keychain Access on your computer as a .pem file, and then in the `requests` module, add the file path to the Zscaler Root CA as a string to the `verify` variable._ 
