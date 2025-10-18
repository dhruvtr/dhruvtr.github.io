import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import PublicationsLayout from '@/layouts/PublicationsLayout'

export const metadata = genPageMetadata({ title: 'Publications' })

export default function PublicationsPage() {
  return <PublicationsLayout />
}
