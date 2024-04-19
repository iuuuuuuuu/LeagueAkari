export interface PlayerList {
  championName: string
  isBot: boolean
  isDead: boolean
  items: Item[]
  level: number
  position: string
  rawChampionName: string
  respawnTimer: number
  runes: Runes
  scores: Scores
  skinID: number
  summonerName: string
  summonerSpells: SummonerSpells
  team: string
}

interface SummonerSpells {
  summonerSpellOne: SummonerSpellOne
  summonerSpellTwo: SummonerSpellOne
}

interface SummonerSpellOne {
  displayName: string
  rawDescription: string
  rawDisplayName: string
}

interface Scores {
  assists: number
  creepScore: number
  deaths: number
  kills: number
  wardScore: number
}

interface Runes {
  keystone: Keystone
  primaryRuneTree: Keystone
  secondaryRuneTree: Keystone
}

interface Keystone {
  displayName: string
  id: number
  rawDescription: string
  rawDisplayName: string
}

interface Item {
  canUse: boolean
  consumable: boolean
  count: number
  displayName: string
  itemID: number
  price: number
  rawDescription: string
  rawDisplayName: string
  slot: number
}
