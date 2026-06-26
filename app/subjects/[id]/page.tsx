import SubjectDetailClient from "./client"
import { seedSubjects } from "@/lib/data"

export function generateStaticParams() {
  return seedSubjects.map(s => ({ id: s.id }))
}

export default function Page({ params }: { params: { id: string }}) {
  return <SubjectDetailClient id={params.id} />
}
