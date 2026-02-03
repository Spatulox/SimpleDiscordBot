import { client } from "../client.js";
import { Guild } from "discord.js";

/**
 * Vérifie si un membre est toujours dans un serveur Discord.
 * @param memberId - ID du membre à vérifier.
 * @param guildId - ID du serveur Discord.
 * @returns `true` si le membre est toujours dans le serveur, `false` sinon.
 */
export async function isMemberStillInGuild(memberId: string, guildId: string): Promise<boolean> {
    try {
        const guild: Guild = await client.guilds.fetch(guildId);
        await guild.members.fetch({ user: memberId, force: true });
        return true;
    } catch (error: any) {
        //"Unknown Member"
        return error.code !== 10007;
    }
}
