import { ActivityType, Client } from 'discord.js'
import { Time } from './times/UnitTime.js';
import config from '../config.js';

export async function loginBot(client: Client): Promise<boolean> {
    let ok = false;
    let tries = 0;
    const maxTries = 3;

    if (config.token !== "") {
        try {
            // Tant que le bot n'est pas connecté et que le nombre de tentatives est inférieur à maxTries, tenter de se connecter.
            while (ok === false && tries < maxTries) {
                ok = await client.login(config.token)
                    .then(() => {
                        setActivity(client, 'La Démocratie', ActivityType.Watching)
                        client.once('ready', () => {
                            if(client.user){
                                console.log(`Connecté en tant que ${client.user.tag} sur ${client.guilds.cache.size} serveurs.`);
                            }

                            // Liste des serveurs sur lesquels le bot est connecté.
                            client.guilds.cache.forEach(guild => {
                                console.log(` - ${guild.name}`);
                            });
                        });
                        return true
                    })
                    .catch(async (error) => {
                        console.log(`${error} Nouvel essai...`);
                        await new Promise(resolve => setTimeout(resolve, Time.second.SEC_03.toMilliseconds()));
                        tries++;
                        return false
                    });
            }

            // Si après maxTries tentatives le bot n'est pas connecté, gérer l'erreur.
            if (tries === maxTries) {
                console.error('ERROR : Impossible de se connecter après plusieurs tentatives.');
                return false
            }
            return true

        } catch (error) {
            console.error(`ERROR : Connexion impossible : ${error}`)
        }
    }
    return false
}

export async function setActivity(client: Client, message: string = "you...", type: ActivityType){
    if(client && client.user){
        client.user.setActivity({
            name: message,
            type: type
        })
    }
}

export async function setRandomActivity(client: Client){

    const activities = [
        // Playing
        { type: ActivityType.Playing, message: "exterminer des Terminides pour la démocratie" },

        // Watching
        { type: ActivityType.Watching, message: "les escouades se battre pour la liberté" },
      
        // Listening
        { type: ActivityType.Listening, message: "les ordres de Super-Terre" },
        
        // Competing
        { type: ActivityType.Competing, message: "une mission suicide sur une planète hostile" },
      ];

    // Change l'activité toutes les heures
    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * activities.length);
        const randomActivity = activities[randomIndex]!;
        setActivity(client, randomActivity.message, randomActivity?.type)
    }, 1 *1000 *60 *60); // Intervalle de 1 heure
}