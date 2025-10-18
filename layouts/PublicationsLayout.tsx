import { ReactNode } from 'react'
import { readFileSync } from 'fs'
import { join } from 'path'
const bibtexParser = require('bibtex-parser')

interface Props {
  children?: ReactNode
}

// Read and parse the BibTeX file
function getPublications() {
  try {
    const bibPath = join(process.cwd(), 'data', 'references-data.bib')
    const bibContent = readFileSync(bibPath, 'utf8')
    const parsed = bibtexParser(bibContent)
    
    // Check if parsed is valid and has entries
    if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
      console.error('BibTeX parsing failed or no entries found:', parsed)
      return []
    }
    
    // Convert to array and sort by year (newest first)
    return Object.values(parsed)
      .sort((a: any, b: any) => (b.year || 0) - (a.year || 0))
  } catch (error) {
    console.error('Error reading publications:', error)
    return []
  }
}

export default function PublicationsLayout({ children }: Props) {
  const publications = getPublications()

  const formatAuthors = (authors: string) => {
    if (!authors) return ''
    
    // Split by 'and' and format
    const authorList = authors.split(/\s+and\s+/i)
    return authorList.map((author, index) => {
      const trimmed = author.trim()
      if (index === authorList.length - 1 && authorList.length > 1) {
        return `and ${trimmed}`
      }
      return trimmed
    }).join(', ')
  }

  const formatPublication = (pub: any) => {
    const authors = formatAuthors(pub.AUTHOR || pub.author || '')
    const title = (pub.TITLE || pub.title) ? `"${pub.TITLE || pub.title}"` : ''
    const journal = pub.JOURNAL || pub.BOOKTITLE || pub.journal || pub.booktitle || ''
    const year = pub.YEAR || pub.year || ''
    const pages = (pub.PAGES || pub.pages) ? `, pp. ${pub.PAGES || pub.pages}` : ''
    const volume = (pub.VOLUME || pub.volume) ? `, vol. ${pub.VOLUME || pub.volume}` : ''
    const number = (pub.NUMBER || pub.number) ? `, no. ${pub.NUMBER || pub.number}` : ''
    const publisher = (pub.PUBLISHER || pub.publisher) ? `, ${pub.PUBLISHER || pub.publisher}` : ''
    const url = (pub.URL || pub.url) ? ` [${pub.URL || pub.url}]` : ''
    
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
      pages,
      volume,
      number,
      publisher,
      url,
      notes,
      type: pub.ENTRYTYPE || pub.type || 'article'
    }
  }

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Publications
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="prose dark:prose-invert max-w-none pt-8 pb-8 xl:col-span-3">
            {publications.length === 0 ? (
              <p>No publications found. Add your publications to <code>data/references-data.bib</code></p>
            ) : (
              <div className="space-y-6">
                {publications.map((pub: any, index: number) => {
                  const formatted = formatPublication(pub)
                  return (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formatted.year} • {formatted.type.toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {formatted.title}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mb-1">
                        {formatted.authors}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatted.journal}
                        {formatted.volume}
                        {formatted.number}
                        {formatted.pages}
                        {formatted.publisher}
                        {formatted.notes && formatted.notes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formatted.notes.map((note, noteIndex: number) => (
                              <span key={noteIndex} className="inline-block">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  {note.url ? (
                                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {note.text}
                                    </a>
                                  ) : (
                                    note.text
                                  )}
                                </span>
                                {noteIndex < formatted.notes.length - 1 && (
                                  <span className="text-gray-400 mx-1">•</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        {formatted.url && (
                          <a href={formatted.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-2">
                            [Link]
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
