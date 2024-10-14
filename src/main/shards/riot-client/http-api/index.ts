import { AxiosInstance } from 'axios'

import { PlayerAccountHttpApi } from './player-account'

export class RiotClientHttpApi {
  public readonly playerAccount: PlayerAccountHttpApi

  constructor(private _http: AxiosInstance) {
    this.playerAccount = new PlayerAccountHttpApi(this._http)
  }
}
