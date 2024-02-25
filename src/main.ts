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

// This is a circular reference: books have a reference to library and library has a reference to books
// This is a problem for JSON.stringify, but not for our stringify function
class Book {
  library: Library | null = null
  constructor(public title: string, public author: string) {}
  toString() {
    return `${this.title} by ${this.author}`
  }
}

// This is a lambda function.
// Normally, it is impossible to serialize functions. But our's can.
const findTheGreatGatsby = (library: Library) => library.books.find(book => book.title === 'The Great Gatsby')

const library = new Library()
library.findMethod = findTheGreatGatsby

library.addBook(
  new Book('The Catcher in the Rye', 'J.D. Salinger'),
)
library.addBook(
  new Book('The Great Gatsby', 'F. Scott Fitzgerald'),
)

const libraryString = stringify(library)
// In general, the serialized json does not contain class information.
// But our's does. You should add a map of class names to class constructors.
const libraryParsed = parse<Library>(libraryString, new Map<string, any>([['Library', Library], ['Book', Book]]))

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>SerializeAnything</h1>
    <h2>Library</h2>
    <div>${library}</div>
    <h2>Library String</h2>
    <div>${libraryString}</div>
    <h2>Library Parsed</h2>
    <div>${libraryParsed}</div>
    <h2>Library Parsed Lambda</h2>
    <div>${libraryParsed.findMethod(libraryParsed)}</div>
  </div>
`
