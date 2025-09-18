import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Shovel } from 'lucide-react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { InitiateDigInput } from '@trowel/types'
import { InitiateDigInputSchema } from '@trowel/types'
import { api } from './api/client'

function App() {
  const navigate = useNavigate()

  const form = useForm<InitiateDigInput>({
    resolver: zodResolver(InitiateDigInputSchema),
    defaultValues: {
      wantlist: '',
      listings: '',
    },
  })

  const onSubmit = async (input: InitiateDigInput) => {
    const { data, error } = await api.initiate.post(input)

    if (error) {
      console.error('Error initiating dig:', error)
      return
    }

    navigate(`/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-stone-900">
            Trowel
          </h1>
          <p className="mt-2 text-stone-600 text-base">
            Discover records on Discogs based on your wantlist.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-stone-200 shadow-md">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="wantlist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Wantlist</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Discogs username"
                          className="focus:ring-2 focus:ring-stone-400 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Your Discogs username.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="listings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Listings</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Discogs username"
                          className="focus:ring-2 focus:ring-stone-400 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Discogs username for the listings you want to dig
                        through.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-700 text-base"
                >
                  <Shovel className="mr-2 h-4 w-4" />
                  Start digging
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default App
