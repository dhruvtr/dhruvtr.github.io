import { readFileSync } from 'fs'
import { join } from 'path'
import bibtexParser from 'bibtex-parser'

interface SelectedPublicationsProps {
  selectedKeys?: string[]
  maxItems?: number
}

type BibEntry = Record<string, string>

function getSelectedPublications(selectedKeys?: string[], maxItems: number = 3) {
  try {
    const bibPath = join(process.cwd(), 'data', 'references-data.bib')
    const bibContent = readFileSync(bibPath, 'utf8')
    const parsed = bibtexParser(bibContent) as Record<string, BibEntry>

    // Check if parsed is valid and has entries
    if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
      console.error('BibTeX parsing failed or no entries found:', parsed)
      return []
    }

    let publications = Object.values(parsed).sort(
      (a: BibEntry, b: BibEntry) => Number(b.YEAR ?? b.year ?? 0) - Number(a.YEAR ?? a.year ?? 0)
    )

    // Filter by selected keys if provided
    if (selectedKeys && selectedKeys.length > 0) {
      publications = publications.filter((pub: BibEntry) => selectedKeys.includes(pub.key))
    }

    // Limit to maxItems
    return publications.slice(0, maxItems)
  } catch (error) {
    console.error('Error reading publications:', error)
    return []
  }
}

export default function SelectedPublications({
  selectedKeys,
  maxItems = 3,
}: SelectedPublicationsProps) {
  const publications = getSelectedPublications(selectedKeys, maxItems)

  const formatAuthors = (authors: string) => {
    if (!authors) return ''

    // Split by 'and' and format
    const authorList = authors.split(/\s+and\s+/i)
    return authorList
      .map((author, index) => {
        const trimmed = author.trim()
        if (index === authorList.length - 1 && authorList.length > 1) {
          return `and ${trimmed}`
        }
        return trimmed
      })
      .join(', ')
  }

  const formatPublication = (pub: BibEntry) => {
    const authors = formatAuthors(pub.AUTHOR || pub.author || '')
    const title = pub.TITLE || pub.title || ''
    const journal = pub.JOURNAL || pub.BOOKTITLE || pub.journal || pub.booktitle || ''
    const year = pub.YEAR || pub.year || ''
    const url = pub.URL || pub.url || ''

    // Collect all notes and their URLs
    const notes: Array<{ text: string; url: string }> = []
    let noteIndex = 1
    while (pub[`NOTE${noteIndex}`] || pub[`note${noteIndex}`]) {
      const noteText = pub[`NOTE${noteIndex}`] || pub[`note${noteIndex}`] || ''
      const noteUrl = pub[`NOTE${noteIndex}URL`] || pub[`note${noteIndex}url`] || ''
      if (noteText) {
        notes.push({ text: noteText, url: noteUrl })
      }
      noteIndex++
    }

    return {
      authors,
      title,
      journal,
      year,
      url,
      notes,
    }
  }

  if (publications.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Selected Publications
      </h3>
      <div className="space-y-4">
        {publications.map((pub: BibEntry, index: number) => {
          const formatted = formatPublication(pub)
          return (
            <div key={index} className="border-l-2 border-blue-500 py-2 pl-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">{formatted.year}</div>
              <div className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                {formatted.title}
              </div>
              <div className="mb-1 text-gray-700 dark:text-gray-300">{formatted.authors}</div>
              <div className="text-gray-600 dark:text-gray-400">
                {formatted.journal}
                {formatted.notes && formatted.notes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatted.notes.map((note, noteIndex: number) => (
                      <span key={noteIndex} className="inline-block">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {note.url ? (
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {note.text}
                            </a>
                          ) : (
                            note.text
                          )}
                        </span>
                        {noteIndex < formatted.notes.length - 1 && (
                          <span className="mx-1 text-gray-400">•</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {formatted.url && (
                  <a
                    href={formatted.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    [Link]
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4">
        <a
          href="/publications"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all publications →
        </a>
      </div>
    </div>
  )
}
