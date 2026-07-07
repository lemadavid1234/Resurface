
export default async function Home() {

  const res = await fetch("http://localhost:8000/health");
  const data = await res.json();

  return (
    <>
      <p>Endpoint status: {data.status}</p>
      <p>Database status: {data.db}</p>
    </>
  )
}