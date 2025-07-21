import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Shovel } from "lucide-react"
import { useNavigate } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { FormSchema } from "@trowel/types"
import { formSchema } from "@trowel/types"

function App() {

  const navigate = useNavigate()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collection: "",
      listings: "",
    },
  })

  const onSubmit = (data: FormSchema) => {
    navigate(`/${data.collection}/${data.listings}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-stone-900">Trowel</h1>
          <p className="mt-2 text-stone-600 text-base">Discover records on Discogs based on your favourite releases</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-stone-200 shadow-md">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Collection</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Discogs username" className="focus:ring-2 focus:ring-stone-400 text-base" {...field} />
                  </FormControl>
                  <FormDescription>
                    Discogs username for the collection you want to compare to.
                  </FormDescription>
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
                    <Input placeholder="Enter Discogs username" className="focus:ring-2 focus:ring-stone-400 text-base" {...field} />
                  </FormControl>
                  <FormDescription>
                    Discogs username for the listings you want to dig through.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />      
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-stone-800 hover:bg-stone-700 text-base">
              <Shovel className="mr-2 h-4 w-4" />
              Start digging
            </Button>
          </CardFooter>
        </Card>
        </form>
          </Form>

        <div className="text-center text-sm text-stone-500">
          <p>Trowel helps you discover records in Discogs listings based on users' collections.</p>
        </div>
      </div>
    </div>
  )
}

export default App
