import { beforeEach, describe, expect, it } from 'vitest'
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
  let library: Library
  beforeEach(() => {
    library = new Library()
    library.addBook(
      new Book('The Catcher in the Rye', 'J.D. Salinger'),
    )
    library.addBook(
      new Book('The Great Gatsby', 'F. Scott Fitzgerald'),
    )
  })
  it('should work', () => {
    expect(library.toString()).toBe('Library with 2 books')
  })

  it('should equal', () => {
    const recovered = parse<Library>(stringify(library), { Library, Book })
    expect(stringify(library)).toEqual(stringify(recovered))
  })
})
