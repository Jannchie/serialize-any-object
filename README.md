# Serialize Any Object

SerializeAnything is a TypeScript / JavaScript library that provides stringify and parse functions which enable the following features:

- Support for serializing nested objects with circular references.
- Support for serializing anonymous functions.
- Support for restoring type information during deserialization.

## Setup

```bash
npm install serialize-any-object
```

## Usage

```typescript
import { parse, stringify } from 'serialize-any-object'
```

## API

### stringify(obj: any): string

Serialize an object into a JSON string.

- obj: The object to be serialized.
- Return value: The serialized JSON string.

### parse<T>(jsonString: string, typeObj: Map<string, any>): T

Deserialize a JSON string into an object.

- jsonString: The JSON string to be deserialized.
- typeObj: A mapping from class names to class constructors.
- Return value: The deserialized object.

## Example

```typescript
import { parse, stringify } from 'serialize-any-object'

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
const libraryParsed = parse<Library>(libraryString, { Library, Book })
```
