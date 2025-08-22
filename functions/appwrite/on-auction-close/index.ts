export interface AuctionCloseEvent { auctionId: string }

export async function main(evt: AuctionCloseEvent) {
  console.log('[on-auction-close] closing auction', evt.auctionId)
  // TODO: finalize bids, write results
  return { ok: true }
}

export default main
