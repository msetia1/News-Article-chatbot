require('dotenv').config();
const { OpenAI } = require('openai');
const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');


const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Allows the chatbot to remember the conversation history by providing it with the previous messages
let conversationHistory = [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Remember, you are only to answer questions about the article I provide you and about topics related/relevant to the article' }
]


function getArticleBody(url) {
    return new Promise((resolve, reject) => {
        exec(`python3 src/websiteScraper.py ${url}`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing script: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Script error: ${stderr}`);
                return;
            }
            // Returns the body of the article
            resolve(stdout.trim());
        });
    });
}

// Generates a response from the OpenAI API given a user message
async function generateText(message) {
    conversationHistory.push({ role: 'user', content: message });
    try {
        // Get output from the GPT-4o model
        const completion = await openai.chat.completions.create({
            messages: conversationHistory,
            model: "gpt-4o",
        });
        let answer = completion.choices[0].message.content;
        conversationHistory.push({role: 'assistant', content: answer}); // add to conversation history
        console.log(`\nBot: ${answer}`);

        // If the conversation history is too long, summarize it to minimize number of input tokens
        if (conversationHistory.length > 10) {
            const summary = await summarizeHistory(conversationHistory);
            conversationHistory = [
                { role: 'system', content: 'You are a helpful assistant that only answers questions about the article you are provided and topics related/relevant to the article' },
                { role: 'user', content: `Here is a news article: ${articleContent}` },
                { role: 'assistant', content: `Summary ${summary}` }
            ]
        }
        return answer;
    } catch (e) {
        console.log(e);
    }
}

// Continuously prompts user to converse with the chatbot until 'exit' is typed
async function promptUser() {
    console.log('\nType "exit" to end the conversation\n');
    rl.question('Enter the URL of the CNN article you would like to talk about: ', async (url) => {
        if (url.toLowerCase().trim() === 'exit') {
            rl.close();
            return;
        }

        let urlParts = url.split('.');
        //Verifying the url provided is a CNN link
        if (urlParts.length > 1 && urlParts[1] === 'cnn') {
            try {
                const body = await getArticleBody(url);
                await generateText(`These are the contents of the article: ${body}`);
                continuePrompting();
            } catch (err) {
                console.error('Error: ', err);
                rl.close();
            }
        } else {
            console.log('Please enter a valid CNN article link');
            promptUser();
        }
    })
}

async function continuePrompting() {
    rl.question('You: ', async (question) => {
        if (question.toLowerCase().trim() === 'exit') {
            rl.close();
            return;
        }
        await generateText(question);
        continuePrompting();
    });
}

// Summarize the conversation history to reduce the number of input tokens
async function summarizeHistory(history) {
    const summaryResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that only answers questions about the article you are provided and topics related/relevant to the article'},
            { role: 'user', content: `Summarize this conversation in 300 tokens or less: ${JSON.stringify(history)}`}
        ],
    });
    return summaryResponse.choices[0].message.content;
}

let articleContent;
promptUser();

