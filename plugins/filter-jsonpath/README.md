# JSONPath

A filter plugin that enables [JSONPath](https://en.wikipedia.org/wiki/JSONPath)
extraction and filtering for JSON responses, making it easy to extract specific values
from complex JSON structures.

![Screenshot of JSONPath filtering](screenshot.png)

## Overview

This plugin provides JSONPath filtering for responses in Yaak. JSONPath is a query
language for JSON, similar to XPath for XML, that provides the ability to extract data
from JSON documents using a simple, expressive syntax. This is useful for working with
complex API responses where you need to only view a small subset of response data.

## How JSONPath Works

JSONPath uses a dot-notation syntax to navigate JSON structures:

- `$` - Root element
- `.` - Child element
- `..` - Recursive descent
- `*` - Wildcard
- `[]` - Array index or filter

## JSONPath Syntax Examples

### Basic Navigation

```
$.store.book[0].title          # First book title
$.store.book[*].author         # All book authors
$.store.book[-1]               # Last book
$.store.book[0,1]              # First two books
$.store.book[0:2]              # First two books (slice)
```

### Filtering

```
$.store.book[?(@.price < 10)]           # Books under $10
$.store.book[?(@.author == 'Tolkien')]  # Books by Tolkien
$.store.book[?(@.category == 'fiction')] # Fiction books
```

### Recursive Search

```
$..author                      # All authors anywhere in the document
$..book[2]                     # Third book anywhere
$..price                       # All prices in the document
```

## Aggregate Functions

This plugin includes custom quality-of-life aggregate functions that can be chained onto the end of JSONPath expressions to perform calculations on numeric arrays:

- `.sum()` - Calculate the total of all values
- `.min()` - Find the minimum value
- `.max()` - Find the maximum value
- `.count()` - Count the number of items
- `.avg()` - Calculate the average

### Aggregate Function Examples

```
$.store.book[*].price.sum()              # Total price of all books
$.store.book[*].price.min()              # Cheapest book price
$.store.book[*].price.max()              # Most expensive book price
$.store.book[*].price.count()            # Number of books
$.store.book[*].price.avg()              # Average book price
$.products[?(@.category == 'electronics')].price.sum()  # Total price of electronics
```

**Note:** Aggregate functions require the JSONPath expression to return an array of numeric values. String numbers will be automatically converted to numbers.

## Usage

1. Make an API request that returns JSON data
2. Below the response body, click the filter icon
3. Enter a JSONPath expression (optionally with an aggregate function)
4. View the extracted data in the results panel
