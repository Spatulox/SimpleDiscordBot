import { Guild, GuildMember, Collection} from 'discord.js';
import { sendMessage } from '../messages/messages.js';
import { setTimeout } from 'timers/promises';
import { Time } from '../times/UnitTime.js';


const MAX_ATTEMPTS = 3;
const RETRY_DELAY = Time.minute.MIN_05.toMilliseconds() // 5 minutes en millisecondes

/**
 * Récupère tous les membres d'un serveur Discord avec des tentatives en cas d'échec.
 * @param guild - Le serveur Discord cible.
 * @returns Une collection des membres du serveur.
 */
export async function fetchMembers(guild: Guild): Promise<Collection<string, GuildMember>> {
    console.log(`Fetching Members for ${guild.name} guild`)
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const members = await guild.members.fetch();
            console.log(`Membres récupérés avec succès à la tentative ${attempt}`);
            return members;
        } catch (err: any) {
            console.error(`Erreur à la tentative ${attempt}: ${err}`);
            sendMessage(`Erreur à la tentative ${attempt}: ${err}`);

            if (attempt < MAX_ATTEMPTS) {
                console.log(`Nouvelle tentative dans 5 minutes...`);
                try {
                    await setTimeout(RETRY_DELAY)
                } catch (delayErr: any) {
                    sendMessage(`${delayErr}`);
                }
            } else {
                console.error(`Échec après ${MAX_ATTEMPTS} tentatives.`);
                throw err;
            }
        }
    }

    throw new Error('Impossible de récupérer les membres après plusieurs tentatives.');
}