import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shovel } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-stone-900">Trowel</h1>
          <p className="mt-2 text-stone-600 text-base">Discover records on Discogs based on your favourite releases</p>
        </div>

        <Card className="border-stone-200 shadow-md">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection" className="text-base">Collection</Label>
              <Input id="collection" placeholder="Enter Discogs username" className="focus:ring-2 focus:ring-stone-400 text-base" />
              <p className="text-sm text-stone-500">Discogs username for the collection you want to compare to.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listings" className="text-base">Listings</Label>
              <Input id="listings" placeholder="Enter Discogs username" className="focus:ring-2 focus:ring-stone-400 text-base" />
              <p className="text-sm text-stone-500">Discogs username for the listings you want to dig through.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-stone-800 hover:bg-stone-700 text-base">
              <Shovel className="mr-2 h-4 w-4" />
              Start digging
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-stone-500">
          <p>Trowel helps you discover records in Discogs listings based on users' collections.</p>
        </div>
      </div>
    </div>
  )
}

export default App
