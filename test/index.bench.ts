import { bench, describe, expect } from 'vitest'
import { parse, stringify } from '../lib/main'

class Library {
  books: Book[] = []
  toString() {
    return `Library with ${this.books.length} books`
  }

  addBook(book: Book) {
    book.library = this
    this.books.push(book)
  }

  findMethod: (library: Library) => Book | undefined = library => library.books[0]
}

class Book {
  library: Library | null = null
  constructor(public title: string, public author: string) {}
  toString() {
    return `${this.title} by ${this.author}`
  }
}

describe('test', () => {
  function getLibrary() {
    const library = new Library()
    library.addBook(
      new Book('The Catcher in the Rye', 'J.D. Salinger'),
    )
    library.addBook(
      new Book('The Great Gatsby', 'F. Scott Fitzgerald'),
    )
    return library
  }

  bench('speed test', () => {
    const library = getLibrary()
    const recovered = parse<Library>(stringify(library), { Library, Book })
    expect(stringify(library)).toEqual(stringify(recovered))
  })
})
