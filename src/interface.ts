import { PlatformConfig } from 'homebridge';

// https://docs.hyperion-project.org/en/json/Control.html#set-effect
export interface IHyperionCommand {
  command: string;
  tan?: string;
}

export interface IHyperionEffectCommand extends IHyperionCommand {
  effect: IHyperionEffect;
  duration?: number;
  priority: number;
  origin: string;
}

export interface IHyperionClearCommand extends IHyperionCommand {
  priority: number;
}

export interface IHyperionEffect {
  name: string;
}

// If you add things to this interface, be sure to add them to the config.schema.json
export interface IPlatformConfig extends PlatformConfig {
  hyperionHost: string;
  hyperionPort: string;
  hyperionEffect: string;
}

export interface IHyperionDevice {
  host: string;
  port: string;
  displayName: string;
}