export type InstrumentSlim = {
  active: boolean | null
  assetBase: string | null
  assetQuote: string | null
  categories: string[]
  createdAt: string | null
  digit: number | null
  exchange: string | null
  id: string
  industry: string | null
  isIn: string | null
  marketCap: number | null
  name: string | null
  picture: string | null
  raw: Record<string, unknown>
  sector: string | null
  symbol: string
  takerSymbol: string | null
  topMarket: boolean | null
  tradeSymbol: string | null
  type: string | null
}
