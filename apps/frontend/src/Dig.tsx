import { useEffect } from 'react'
import { api } from './api/client'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'

export default function Dig() {
  const { searchId } = useParams<{ searchId: string }>()

  const fetch = async () => {
    if (!searchId) return

    const { data: wantlist } = await api.wantlist({ searchId }).get()
    const { data: listings } = await api.listings({ searchId }).get()

    return { wantlist, listings }
  }

  useEffect(() => {
    fetch()
  })

  if (!searchId) {
    return null
  }

  return (
    <>
      <h1>Digging...</h1>
      <p>This is a placeholder for the Query component.</p>
      <p>More functionality will be added here later.</p>
    </>
  )
}
