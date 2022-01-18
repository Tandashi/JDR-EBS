import { EmitSocketIOEvent } from '@socket-io/event';

import { UserDataDocPopulated } from '@mongo/schema/user-data';
import UserDataDto, { UserDataJSONStructure } from '@mongo/dto/v1/user-data-dto';

export default class UserDataUpdatedEmitEvent extends EmitSocketIOEvent<UserDataJSONStructure> {
  private userData: UserDataDocPopulated;

  constructor(userData: UserDataDocPopulated) {
    super();
    this.userData = userData;
  }

  get name(): string {
    return 'v1/userdata:updated';
  }

  data(): UserDataJSONStructure {
    return UserDataDto.getJSON(this.userData);
  }
}
