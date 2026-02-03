import { Snowflake, GuildMember, Role, Guild } from 'discord.js';
import { client } from '../client.js';
import { sendMessage } from '../messages/messages.js';
  /**
   * Supprime un rôle spécifique d'un membre par son nom
   * @param member - Le membre concerné
   * @param roleName - Nom du rôle à supprimer
   */
  export async function removeRole(member: GuildMember, roleName: string): Promise<void> {
    sendMessage(`Suppression du rôle : ${roleName} pour : ${member.displayName}`);
    
    try {
      const roleToRemove = member.roles.cache.find(role => role.name === roleName);
      
      if (roleToRemove) {
        await member.roles.remove(roleToRemove);
      }
    } catch (removeError: unknown) {
      const errorMessage = removeError instanceof Error ? removeError.message : 'Erreur inconnue';
      console.error(`Erreur lors de la suppression du rôle: ${errorMessage}`);
    }
  }

export async function addRole(membreId: Snowflake,target_guild_id: string, roleId: Snowflake): Promise<boolean> {
    try {
      const guild: Guild | undefined = client.guilds.cache.get(target_guild_id);
      
      if (!guild) {
        sendMessage("Serveur introuvable");
        return false;
      }
  
      const [membre, role]: [GuildMember | null, Role | null] = await Promise.all([
        guild.members.fetch(membreId).catch(() => null),
        guild.roles.fetch(roleId).catch(() => null)
      ]);
  
      if (!membre || !role) {
        sendMessage(`Membre ou rôle non trouvé lors de l'assignation du rôle (Membre: <@${membreId}>, Rôle: <&@${roleId}>)`);
        return false;
      }
  
      await membre.roles.add(role);
      return true;
    } catch (error: unknown) {
      let errorMessage = "Erreur inconnue";
      
      if (error instanceof Error) {
        console.error("Erreur lors de l'ajout du rôle:", error);
        errorMessage = error.message;
      }
  
      sendMessage(`Erreur lors de l'ajout du rôle: ${errorMessage}`);
      return false;
    }
  }