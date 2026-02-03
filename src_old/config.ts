import dotenv from 'dotenv';
import configJson from './config.json' with { type: 'json' };

dotenv.config();

const { DISCORD_TOKEN } = process.env;

for (const [key, value] of Object.entries({ DISCORD_TOKEN })) {
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
}

if (!DISCORD_TOKEN) {
  throw new Error('Missing environment variables: DISCORD_TOKEN');
}

const config = parseConfig(configJson);
export default config;



function parseConfig(json: typeof configJson): Config {
  return {
    ...json,
    token: DISCORD_TOKEN || ''
  };
}


type Config = {
    dev: boolean,
    clientId: string,
    channelPingLogin:string,
    owner: string,

    logChannelId: string,
    errorChannel: string,
    
    excludedInvites: string[]

    token: string,
}














/*
function expandPath(path: string): string {
  if (!path) return path;
  return path.replace(/^\$HOME/, process.env.HOME || '');
}
*/