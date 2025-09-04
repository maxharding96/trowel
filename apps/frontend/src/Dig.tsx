import { useMemo } from 'react'
import { api } from './api/client'
import { useParams } from 'react-router'

export default function Dig() {
  const { searchId } = useParams<{ searchId: string }>()

  if (!searchId) {
    return null
  }

  const { data: wantlist, error } = await api.listings({ searchId }).get({})

  const listings = await api.wantlist({ searchId }).get()

  const embeddedWantlist = useMemo(() => {
    if (error) {
      return []
    }

    return wantlist.filter((want) =>
      want.release.videos.forEach((video) => !!video.embedding)
    )
  }, [wantlist, error])

  return (
    <>
      <h1>Digging...</h1>
      <p>This is a placeholder for the Query component.</p>
      <p>More functionality will be added here later.</p>
    </>
  )
}
