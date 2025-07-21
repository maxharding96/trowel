import type { TInitiateDigInput } from '@trowel/types'
import { useEffect } from 'react'
import { useParams } from 'react-router'

export default function Dig() {
  const { collection, listings } = useParams<TInitiateDigInput>()

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `http://localhost:3000/dig/${collection}/${listings}`
      )
      console.log(await res.text())
    }

    fetchData()
  }, [collection, listings])

  return (
    <>
      <h1>Query Component</h1>
      <p>This is a placeholder for the Query component.</p>
      <p>More functionality will be added here later.</p>
    </>
  )
}
