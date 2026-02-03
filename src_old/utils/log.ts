import path from 'path';
import fs from 'fs';

//----------------------------------------------------------------------------//

export function log(str: string): void {
  // Déterminer le chemin du fichier globalFunct.js

  // Déterminer le chemin du dossier et du fichier log
  const logDir: string = path.join(__dirname.split(path.sep + 'utils')[0]!, 'log')
  const filePath: string = path.join(logDir, 'log.txt');

  // Créer le dossier log s'il n'existe pas
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
  } catch (error) {
    console.error('ERROR : Impossible de créer le dossier log : ', error);
    return;
  }

  // Vérifier la taille du fichier log.txt
  try {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes: number = stats.size;
    const fileSizeInKilobytes: number = fileSizeInBytes / 1024;
    const fileSizeInMegabytes: number = fileSizeInKilobytes / 1024;

    if (fileSizeInMegabytes >= 3) {
      let fileList: string[] | 'Error';
      try {
        fileList = fs.readdirSync(logDir);
      } catch (err) {
        console.error('ERROR : Erreur lors de la lecture du répertoire : ' + err);
        fileList = 'Error';
      }

      if (fileList !== 'Error') {
        const newFileName = `${filePath.split('.txt')[0]}${fileList.length}.txt`;
        try {
          fs.renameSync(filePath, newFileName);
          console.log('INFO : Fichier renommé avec succès.');
          fs.appendFileSync(
            newFileName,
            `Fichier renommé avec succès.\nSuite du fichier au fichier log.txt ou log${fileList.length + 1}.txt`
          );
        } catch (err) {
          console.error('ERROR : Erreur lors du renommage ou écriture dans le fichier de log : ', err);
        }
      }
    }
  } catch (err) {
    console.error('ERROR : Erreur lors de la récupération de la taille du fichier : ', err);
  }

  // Écrire dans le fichier log.txt
  const today = new Date();
  const previousStr: string = `[${today.toLocaleDateString()} - ${today.toLocaleTimeString()}] `;
  
  console.log(previousStr + str);
  
  try {
    fs.appendFileSync(filePath, previousStr + str + '\n');
  } catch (error) {
    console.error('ERROR : Impossible d\'écrire dans le fichier log... ', error);
  }
}

