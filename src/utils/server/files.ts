import { log } from "../log.js";
import path from 'path'
import fs from 'fs'
import { createErrorEmbed, returnToSendEmbed } from "../messages/embeds.js";
import { TextChannel } from "discord.js";

//----------------------------------------------------------------------------//

export function readJsonFile(fileName: string): any | string {
    try {
        const data = fs.readFileSync(fileName, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        log(`ERROR : Erreur de lecture du fichier JSON ${fileName}: ${error}`);
        return 'Error';
    }
}

export async function listDirectory(directoryPath: string): Promise<string[] | boolean> {
    try {
        const files = await fs.promises.readdir(directoryPath, { withFileTypes: true });
        const directories = files.filter(file => file.isDirectory()).map(dir => dir.name);
        return directories;
    } catch (error) {
        console.log(`ERROR: Impossible de lire le dossier : ${directoryPath} : ${error}`);
        return false;
    }
}


//----------------------------------------------------------------------------//

export async function listJsonFile(directoryPath: string): Promise<string[] | false> {
    try {
        const files = await fs.promises.readdir(directoryPath);
        return files.filter(file => path.extname(file) === '.json');
    } catch (err) {
        log('ERROR : impossible to read the directory: '+err);
        return false;
    }
}

//----------------------------------------------------------------------------//

export async function listFile(directoryPath: string, type: string): Promise<string[] | string> {
    
    if(typeof(type) !== 'string' || typeof(directoryPath) !== 'string'){
        return 'Type and path must me string'
    }

    try {
        if(type.includes(".")){
            type = type.split('.')[1]!
        }
        const files = await fs.promises.readdir(directoryPath);
        return files.filter(file => path.extname(file) === '.' + type);
    } catch (err) {
        log('ERROR : impossible to read the directory: '+err);
        return 'Error';
    }
}

//----------------------------------------------------------------------------//

export async function writeJsonFileRework(
  directoryPath: string,
  name: string,
  array: any,
  channelToSendMessage: TextChannel | null = null,
): Promise<boolean> {
  if (Array.isArray(array) && array.length === 1 && array[0] === 'Error') {
    log(`Impossible to save the data for ${name}, the data are 'Error'`);
    return false;
  }
  try {
    const directories = directoryPath.split(path.sep);
    let currentPath = '';
    const json = JSON.stringify(array, null, 2);

    for (const directory of directories) {
      currentPath = path.join(currentPath, directory);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }

    name = name.split('.json')[0] ?? '';
    
    if(name == ''){
        log("ERROR : Impossible to write the Json file, name = ''")
        return false
    }
    const filePath = path.join(directoryPath, `${name}.json`);

    await fs.promises.writeFile(filePath, json);

    log(`INFO : Data written to ${filePath}`);

    return true;
  } catch (err) {
    name = name.split('.json')[0] ?? '';
    
    if(name == ''){
        log("ERROR : Impossible to write the Json file, name = ''")
        return false
    }
    log(`ERROR : Error while writing file ${directoryPath}/${name}.json, ${err}`);
    if (channelToSendMessage && typeof channelToSendMessage !== 'string') {
      try {
        await channelToSendMessage.send(returnToSendEmbed(createErrorEmbed(`ERROR : Error when writing file ${directoryPath}/${name}.json : ${err}`)));
      } catch {}
    }
    return false;
  }
}