import { readFileSync } from 'fs'
import { join } from 'path'
const bibtexParser = require('bibtex-parser')

interface SelectedPublicationsProps {
  selectedKeys?: string[]
  maxItems?: number
}

function getSelectedPublications(selectedKeys?: string[], maxItems: number = 3) {
  try {
    const bibPath = join(process.cwd(), 'data', 'references-data.bib')
    const bibContent = readFileSync(bibPath, 'utf8')
    const parsed = bibtexParser(bibContent)
    
    // Check if parsed is valid and has entries
    if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
      console.error('BibTeX parsing failed or no entries found:', parsed)
      return []
    }
    
    let publications = Object.values(parsed)
      .sort((a: any, b: any) => (b.year || 0) - (a.year || 0))
    
    // Filter by selected keys if provided
    if (selectedKeys && selectedKeys.length > 0) {
      publications = publications.filter((pub: any) => 
        selectedKeys.includes(pub.key)
      )
    }
    
    // Limit to maxItems
    return publications.slice(0, maxItems)
  } catch (error) {
    console.error('Error reading publications:', error)
    return []
  }
}

export default function SelectedPublications({ selectedKeys, maxItems = 3 }: SelectedPublicationsProps) {
  const publications = getSelectedPublications(selectedKeys, maxItems)

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
      notes
    }
  }

  if (publications.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Selected Publications
      </h3>
      <div className="space-y-4">
        {publications.map((pub: any, index: number) => {
          const formatted = formatPublication(pub)
          return (
            <div key={index} className="border-l-2 border-blue-500 pl-4 py-2">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {formatted.year}
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {formatted.title}
              </div>
              <div className="text-gray-700 dark:text-gray-300 mb-1">
                {formatted.authors}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {formatted.journal}
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
      <div className="mt-4">
        <a href="/publications" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          View all publications →
        </a>
      </div>
    </div>
  )
}
