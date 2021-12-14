import { Service, PlatformAccessory, CharacteristicValue, LogLevel } from 'homebridge';

import { HyperionRemote } from './platform';

import axios from 'axios';
import { IHyperionClearCommand, IHyperionCommand, IHyperionEffectCommand } from './interface';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class platformAccessory {
  private service: Service;
  private requestUrl: string;
  private isOn = false;
  private currentEffect = '';

  constructor(
    private readonly platform: HyperionRemote,
    private readonly accessory: PlatformAccessory,
    private readonly host: string,
    private readonly port: string,
  ) {
    this.platform.log.log(LogLevel.INFO, 'Hyperion Remote Host: ', this.platform.config.hyperionHost);
    this.platform.log.log(LogLevel.INFO, 'Hyperion Remote Port: ', this.platform.config.hyperionPort);
    this.requestUrl = `http://${host}:${port}/json-rpc`;

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn() {
    let response;
    if(!this.isOn) {
      const requestBody: IHyperionEffectCommand = {
        command: 'effect',
        effect: {
          name: this.getEffectName(),
        },
        priority: 50,
        origin: 'homebridge',
      };

      response = await axios.post(this.requestUrl, JSON.stringify(requestBody));
    } else {
      const requestBody: IHyperionClearCommand = {
        command: 'clear',
        priority: -1,
      };

      response = await axios.post(this.requestUrl, JSON.stringify(requestBody));
    }

    this.isOn = !this.isOn;
    this.platform.log.log(LogLevel.INFO, 'Switch response: ', response.data);
  }

  async getOn(): Promise<CharacteristicValue> {
    const requestBody: IHyperionCommand = {
      command: 'serverinfo',
    };
    const response = await axios.post(this.requestUrl, JSON.stringify(requestBody));
    const data = response.data;

    this.currentEffect = data.info?.activeEffects[0]?.name || '';
    this.isOn = !!data.info?.activeEffects?.length;
    return this.isOn;
  }

  private getEffectName(): string {
    if (!this.platform.config.hyperionEffect || this.platform.config.hyperionEffect.length < 1) {
      return this.currentEffect;
    }

    const index = Math.floor(Math.random() * this.platform.config.hyperionEffect.length);
    return this.platform.config.hyperionEffect[index];
  }
}
