# Serialize Any Object

SerializeAnything 是一个 TypeScript / Javascript 库，该库提供了 stringify 和 parse 函数，能够做到：

1. 支持序列化包含循环引用的嵌套对象
2. 支持序列化匿名函数
3. 支持反序列化时还原类型信息。

## Setup

```bash
npm install serialize-any-object
```

## Usage

```typescript
import { stringify, parse } from 'serialize-any-object';
```

## API

### stringify(obj: any): string

将对象序列化为 JSON 字符串。

- obj: 要序列化的对象。
- 返回值：序列化后的 JSON 字符串。

### parse<T>(jsonString: string, classMap: Map<string, any>): T

将 JSON 字符串反序列化为对象。

- jsonString: 要反序列化的 JSON 字符串。
- classMap: 类名到类构造函数的映射。
- 返回值：反序列化后的对象。

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
const libraryParsed = parse<Library>(libraryString, new Map<string, any>([['Library', Library], ['Book', Book]]))
```
