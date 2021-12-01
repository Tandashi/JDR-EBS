import { EmitSocketIOEvent } from '@socket-io/event';

export default class NextUpClearedEmitEvent extends EmitSocketIOEvent<undefined> {
  constructor() {
    super();
  }

  get name(): string {
    return 'v1/next-up:cleared';
  }

  data(): undefined {
    return undefined;
  }
}
