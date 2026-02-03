export const SPACE = "\u200B"


export const URL_REGEX = /(https?:\/\/[^s]+)/;

/* DISCORD REGEX */
export const USER_REGEX = /<@\d{18}>/
export const BOT_REGEX = /<@\d{19}>/
export const CHANNEL_REGEX = /(<#\d{19}>)|(<id:(browse|customize|guide)>)/
export const ROLE_REGEX = /<@&\d{19}>/

/**
 * Mention a User
 * Mention a Role
 */
export const DISCORD_PING_REGEX = new RegExp(`(${USER_REGEX.source})|(${BOT_REGEX.source})|(${ROLE_REGEX.source})`)

/**
 * Mention a User
 * Mention a Role
 * Mention a Channnel
 */
export const DISCORD_MENTION_REGEX = new RegExp(`(${DISCORD_PING_REGEX.source})|(${CHANNEL_REGEX.source})`)