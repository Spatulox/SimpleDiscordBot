import isOnline from 'is-online';
import { log } from '../log.js'
import { Time } from '../times/UnitTime.js';

const RETRY_TIME = Time.second.SEC_60.toMilliseconds()

export async function checkInternetCo(): Promise<boolean> {
  let internetCo = 0;

  while (internetCo === 0) {
    const online = await isOnline();
    log('INFO : CheckingInternet')

    if (online) {
        log('INFO : Internet connection is available.');
        internetCo = 1;
        return true
    } else {
        log('INFO : No internet connection, waiting 1 minute.');
        try{
          await new Promise((resolve) => setTimeout(resolve, RETRY_TIME));
        }
        catch{
          log('ERROR : When awaiting the promise to await 1 minutes')
        }
    }

  }
  return false
}

// ------------------------------------------------------------------------------ //

export async function checkXTimesInternetCo(xTime: number): Promise<boolean> {
  let count = 0;

  while (count < xTime || count !== -1) {
    
    log('INFO : CheckingInternet')
    const online = await isOnline();

    if (online) {
        log('INFO : Internet connection is available.');
        count = -1;
        return true
    } else {
      count ++
        log('INFO : No internet connection, waiting 1 minute.');
        try{
          await new Promise((resolve) => setTimeout(resolve, RETRY_TIME));
        }
        catch{
          log('ERROR : When awaiting the promise to await 1 minutes')
        }
    }
  }
  return false
}