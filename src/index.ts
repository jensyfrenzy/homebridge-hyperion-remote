import { API } from 'homebridge';
import { HyperionRemote } from './accessory';

/**
  * This method registers the platform with Homebridge
  */
  export = (api: API) => {
    api.registerAccessory('HyperionRemote', HyperionRemote);
  };