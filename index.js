// Discord 
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token, server_settings, defaultAudioLevel} = require('./config.json');
const fs = require('fs');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

process.on('uncaughtException', error => logger.log('error', error));

// Socket
const express = require('express');
const socket = require('socket.io');
const app = express();
var server;
var io;

// Funtion for starting the application server and the socket listener 
function startServer() {
	logger.log('info', 'Starting app server and socket listener');
	server = app.listen(server_settings.port, () => {
		 logger.log('info','Server running on port:' + server_settings.port);
	});
	io = socket(server);
	
	// Set socket callbacks
	io.on('connection', socket => {
		logger.log('debug', 'Socket connected' + socket.id);

		// Socket recieved an alarm
		socket.on('alarm', function(data) {
			const {id, level, type} = data;
			logger.log('debug', `${id}: ${type} ${level}`);

			if(type === 'trigger') { // Play sound
				dispatcher = connection.play(`./sound/alarm${level}.mp3`);
				dispatcher.setVolume(defaultAudioLevel);
			} else if (type === 'alarm_stop') { // Stop sound
				if(dispatcher)
					dispatcher.destroy();
			}
			
		});

	});
}

// Funtion for closing the server connection
function stopServer(){
	if(server && io){
		logger.log('info','Shutting down app server and socket listener');
		server.close();
		io.close();

		server = null;
		io = null;
	}
}


// VC connection and audio dispatcher
var connection, dispatcher;

client.commands = new Discord.Collection();

// Get command files
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

// Add command files to command collection
commandFiles.forEach(f => {
	logger.log('debug', 'Reading commandFile');

	const command = require(`./commands/${f}`);
	client.commands.set(command.info.name, command);
});

// Message callback
client.on('message', async message => {

	// Do not execute command if message is from another bot or not meant for this one
	if(!message.author.bot) {

		logger.log('debug', `Recieved message: ${message}`);
		
		// Parse command
		const args= message.content.slice(prefix.length).split(' ');
		const commandName = args.shift().toLowerCase();
	
		logger.log('debug', `Executing command: ${commandName}`);
	
		// VC commands
		if(message.member.voice.channel){
			
			// Join VC
			if(commandName === 'start') {
				logger.log('info', 'Connecting to VC');
				connection = await message.member.voice.channel.join();
				startServer();
			}
	
			// Leave VC
			else if(commandName === 'stop' && connection ) {
				logger.log('info', 'Disconnecting from VC');
				connection.disconnect();
				stopServer();
			}
		}
	
		// Execute command from command-collection 
		else {
			const command = client.commands.get(commandName);
	
			try {
				if(command) {
					command.run(client, message, args);
				}
			} catch (error) {
				logger.log('error', error);
			}
		}
	}
});

client.once('ready', () => {
	logger.info('The bot is online!')
});


// Starting the client
client.login(token);