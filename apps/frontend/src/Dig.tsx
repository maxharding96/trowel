import { api } from './api/client'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'

export default function Dig() {
  const { searchId } = useParams<{ searchId: string }>()

  const { data } = useQuery({
    queryKey: ['wantlist', searchId],
    queryFn: () => {
      if (!searchId) return
      return api
        .search({ searchId })
        .get()
        .then((res) => res.data)
    },
    refetchInterval: 10000,
  })

  if (!searchId) return null

  return (
    <div>
      <h1>Search ID: {searchId}</h1>
      <h2>Counts:</h2>
      <ul>
        <li>Wantlist: {data?.counts.wantlist}</li>
        <li>Listings: {data?.counts.listings}</li>
        <li>Embedded Wantlist: {data?.counts.embeddedWantlist}</li>
        <li>Embedded Listings: {data?.counts.embeddedListings}</li>
      </ul>

      <h2>Similarities:</h2>
      <ul>
        {data?.similarities.map((sim, i) => (
          <li key={i}>
            Listing: {sim.listing.release?.title}, Want ID:{' '}
            {sim.want.release?.title}, Score: {sim.score.toFixed(4)}
          </li>
        ))}
      </ul>
    </div>
  )
}
