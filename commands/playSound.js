const Discord = require('discord.js');
const fs = require('fs');
var dispatcher;

/**
 * PLays a sound
 * @param {VoiceConnection} connection - The current voice chat connection
 * @param {StreamDispatcher} dispatcher - The dispatcher that plays the audio
 * @param {number} level - The alarm level that was requested
 * @param {string} type - The type of alarm that was sent (trigger, stop, ..)
 */
module.exports.run = (connection, dispatcher, level, type) => {
    // OIS IM OASHC
}

module.exports.info = {
    name: 'playsound',
    description: 'Plays sound'
}