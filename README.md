stenox [![NPM version](https://img.shields.io/npm/v/stenox.svg?style=flat-square&color=informational)](https://npmjs.com/package/stenox)
======


⚡ Fast atomic file writer inspired by [steno](https://github.com/typicode/steno) with performance optimizations.

Ensures atomic file writes using the [write-rename pattern](https://en.wikipedia.org/wiki/Atomic_operation) with write coalescing to prevent race conditions. Multiple concurrent writes are automatically merged, ensuring only the latest data is written safely.

## Why stenox?

stenox is built on the same proven algorithm as steno, but with performance optimizations that make it **2-3x faster** in most scenarios:

- ✅ **Faster**: 2-3x performance improvement over steno
- ✅ **Same reliability**: Uses the same atomic write strategy (temp file + rename)
- ✅ **Cleaner code**: Simplified implementation with better variable names
- ✅ **Zero dependencies**: Lightweight and minimal

## Installing

Install with [npm](https://www.npmjs.com/) / [yarn](https://yarnpkg.com) / [pnpm](https://pnpm.js.org/) / [bun](https://bun.sh/):

```sh
npm install stenox
yarn add stenox
pnpm add stenox
bun install stenox
```

## Usage

Using [Node.js](https://nodejs.org/) `require()`:

```js
const { Writer } = require('stenox');
```

[TypeScript](https://www.typescriptlang.org/)/ES Module support:

```ts
import { Writer } from 'stenox';
```

[Deno](https://deno.land):

```js
import { Writer } from 'https://esm.sh/stenox';
```

## Examples

### Basic Usage

```typescript
import { Writer } from 'stenox'

const writer = new Writer('data.json')

// Write data
await writer.write('{"name": "test"}')

// Check writer status
console.log(writer.busy) // false
console.log(writer.path) // 'data.json'
```

### Concurrent Writes (Automatic Coalescing)

```typescript
// Multiple concurrent writes are automatically coalesced
await Promise.all([
  writer.write('data 1'),
  writer.write('data 2'),
  writer.write('data 3'), // Only this data will be written
])
```

### Buffer Support

```typescript
// Write binary data
await writer.write(Buffer.from('binary data'))
```

## Performance Comparison

Benchmarked against steno (lower is better):

| Test | steno | stenox | Result |
|------|-------|--------|--------|
| 1KB × 1000 parallel | 4-9ms | 2.5-4.4ms | **2x faster** 🚀 |
| 1MB × 1000 parallel | 6-11ms | 6-7ms | **1.5x faster** ⚡ |
| 100B × 10000 burst | 25-33ms | 7-14ms | **3x faster** 🔥 |

**About these numbers:**
- Results are averaged from multiple runs to account for variance
- Ranges show typical performance variation due to OS caching, disk I/O, and system load
- Your results may differ based on hardware and system conditions
- Run `npm run benchmark` to test on your machine

**Key takeaway**: stenox consistently performs 1.5-3x faster than steno across different workloads.

## How it works

stenox uses the proven **atomic write pattern** (also known as write-rename or safe-write):

1. **Write to temp file**: Data is written to `.filename.tmp`
2. **Atomic rename**: The temp file is renamed to the target file (atomic operation at OS level)
3. **Write coalescing**: If multiple writes happen concurrently, only the latest data is written
4. **Promise resolution**: All pending promises resolve when the write completes

### Why is this safe?

The `rename()` system call is [atomic on most filesystems](https://en.wikipedia.org/wiki/Atomic_operation#File_systems), meaning:
- ✅ **No partial writes**: Either the full file is written or nothing changes
- ✅ **No race conditions**: Write coalescing prevents concurrent write conflicts
- ✅ **Data integrity**: Readers always see complete, valid data
- ✅ **Crash safety**: If the process crashes during write, the original file remains intact

This pattern is used by many tools including npm, git, and database systems.

## API

### `new Writer(file: PathLike)`

Creates a new atomic file writer.

**Parameters:**
- `file` - Path to the file to write to

**Example:**
```typescript
const writer = new Writer('data.json')
```

### `writer.write(data: string | Buffer): Promise<void>`

Writes data to the file atomically. Multiple concurrent writes are coalesced.

**Parameters:**
- `data` - Data to write (string or Buffer)

**Returns:**
- Promise that resolves when the write completes

**Example:**
```typescript
await writer.write('hello world')
await writer.write(Buffer.from('binary data'))
```

### `writer.busy: boolean`

Check if the writer is currently writing.

**Example:**
```typescript
console.log(writer.busy) // false
```

### `writer.path: PathLike`

Get the target file path.

**Example:**
```typescript
console.log(writer.path) // 'data.json'
```

## Relationship to steno

stenox is inspired by and based on [steno](https://github.com/typicode/steno) by [@typicode](https://github.com/typicode). 

**What's the same:**
- Core atomic write algorithm (temp file + rename)
- Write coalescing strategy
- API design and behavior

**What's different:**
- Performance optimizations (2-3x faster)
- Inlined code for reduced function call overhead
- Optimized promise handling
- Cleaner variable names for better code readability

If you need a battle-tested solution, use [steno](https://github.com/typicode/steno). If you want better performance with the same reliability, use stenox.

## License
MIT
