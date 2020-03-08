import { numbers } from 'util-kit';

const { Counter } = numbers;

export const counter = new Counter();




const config: any = {
  objectCaching: true,

}

// todo save read and set
export function getConfig(prop: string) {

  return config[prop];
}


export function setConfig(prop: string, val: any) {

  if (config[prop]) {
    config[prop] = val;
  }

}