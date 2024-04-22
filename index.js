require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', async message => {
    console.log("Message received: ", message.content);  // Log all messages to debug

    // Check if the message starts with 'Hi Sierra, ' and is not from a bot
    if (!message.content.startsWith('Hi Sierra,') || message.author.bot) {
        console.log("Message is not a command or sent by a bot");
        return;
    }

    console.log("Command recognized: ", message.content);  // If this logs, the command is recognized

    // Trim the command text and remove 'Hi Sierra, ' to isolate the query
    const query = message.content.slice(11).trim();
    console.log("Query extracted for OpenAI: ", query);  // Log the extracted query

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "The person you are talking to is called Sunshine. You should reply in a supportive manner and include an uplifting quote at the end of each response, keep responses brief." }, { role: "user", content: query }]
        });

        if (response && response.choices && response.choices.length > 0) {
            console.log("OpenAI Response: ", response.choices[0].message.content.trim());
            message.channel.send(response.choices[0].message.content.trim());
        } else {
            console.log("No choices available in response.");
            message.channel.send("I couldn't generate a reply. Please try again.");
        }
    } catch (error) {
        console.error('Error connecting to OpenAI:', error);
        message.channel.send('Sorry, I encountered an error while processing your request.');
    }
});

client.login(token);