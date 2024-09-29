# Advanced Markdown Showcase

## Introduction

This document showcases various advanced Markdown features. Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.

## Text Formatting

You can make text **bold**, *italic*, or ***both***. You can also use ~~strikethrough~~ for deleted text.

Sometimes you need to use `inline code` within a sentence.

## Lists

### Unordered List
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

### Ordered List
1. First item
2. Second item
   1. Subitem 2.1
   2. Subitem 2.2
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Code Blocks

Here's a Python function:

```python
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## Tables

| Name     | Age | Occupation    |
|----------|-----|---------------|
| John Doe | 30  | Developer     |
| Jane Smith | 28 | Designer     |
| Bob Johnson | 35 | Manager     |

## Links and Images

Visit [GitHub](https://github.com) for more information.

Here's how you would embed an image:

![Markdown Logo](https://markdown-here.com/img/icon256.png)

## Blockquotes

> "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."
>
> \- Albert Einstein

Nested blockquotes:

> First level
>> Second level
>>> Third level

## Horizontal Rules

You can create horizontal rules with three or more asterisks, dashes, or underscores:

***
