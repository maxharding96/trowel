import { useSearchParams } from "react-router"


function Dig() {
  const [searchParams] = useSearchParams();

  const collection = searchParams.get("collection");
  const wantlist = searchParams.get("wantlist");

  console.log("Collection:", collection)
  console.log("Wantlist:", wantlist);
  return (
    <>
      <h1>Query Component</h1>
      <p>This is a placeholder for the Query component.</p>
      <p>More functionality will be added here later.</p>
    </>
  )
}

export default Dig