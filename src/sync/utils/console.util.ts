import * as util from 'util';

export class Console {
  static log(...args: unknown[]) {
    console.log(util.inspect(args, { depth: null, colors: true }));
  }
}
