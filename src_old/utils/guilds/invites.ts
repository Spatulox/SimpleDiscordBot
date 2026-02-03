import { Invite } from 'discord.js';
import config from '../../config.js';

/**
 * Vérifie si une invitation est ancienne (plus d'une heure).
 * @param invite - L'invitation à vérifier.
 * @returns `true` si l'invitation est ancienne, `false` sinon.
 */
export const isInviteOld = (invite: Invite): boolean => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 heure en millisecondes

    if (!invite.createdAt) {
        return false;
    }

    return (
        invite.maxAge !== 0 &&
        !config.excludedInvites.includes(invite.code) &&
        invite.createdAt < oneHourAgo
    );
};


/**
 * Supprime une invitation Discord.
 * @param invite - L'invitation à supprimer.
 * @returns `1` si la suppression a réussi, `0` en cas d'échec.
 */
export const deleteInvite = async (invite: Invite): Promise<boolean> => {
    try {
        await invite.delete();
        if (!invite.createdAt) {
            return false;
        }
        console.log(
            `L'invitation \`${invite.code}\` créée le ${invite.createdAt.toDateString()} a été supprimée.`
        );
        return true;
    } catch (error: any) {
        console.error(error.message);
        return false;
    }
};