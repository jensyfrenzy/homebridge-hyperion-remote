// https://docs.hyperion-project.org/en/json/Control.html#set-effect
export interface IHyperionCommand {
  command: string;
  effect: IHyperionEffect;
  duration?: number;
  priorty: number;
  origin: string;
}

export interface IHyperionEffect {
  name: string;
}