const { REST, Routes } = require('discord.js');
const config = require('../../config.json');

const rest = new REST().setToken(config.token);

rest.delete(Routes.applicationGuildCommand(config.clientId, config.guildId, '1358911647292326010'))
    .then(() => console.log('Commande supprimée avec succès'))
    .catch(console.error);
