import { notFound } from 'next/navigation'

/** Any public URL that no page claims renders the branded not-found page inside the site chrome. */
export default function CatchAll() {
  notFound()
}
