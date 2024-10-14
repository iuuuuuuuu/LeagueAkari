import { LoginQueueState } from '@shared/types/lcu/login'
import { makeAutoObservable, observable } from 'mobx'

export class LoginState {
  loginQueueState: LoginQueueState | null = null

  constructor() {
    makeAutoObservable(this, { loginQueueState: observable.struct })
  }

  setLoginQueueState(state: LoginQueueState | null) {
    this.loginQueueState = state
  }
}
