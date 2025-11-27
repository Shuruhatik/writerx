import { PathLike } from 'node:fs'
import { rename, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function temp(file: PathLike): string {
  const path = file instanceof URL ? fileURLToPath(file) : file.toString()
  return join(dirname(path), `.${basename(path)}.tmp`)
}

type Done = () => void
type Fail = (error: Error) => void
type Content = Parameters<typeof writeFile>[1]

export class Writer {
  #target: PathLike
  #tmp: string
  #active = false
  #current: [Done, Fail] | null = null
  #waiting: [Done, Fail] | null = null
  #queued: Promise<void> | null = null
  #buffer: Content | null = null

  #defer(content: Content): Promise<void> {
    this.#buffer = content
    if (!this.#queued) {
      this.#queued = new Promise((done, fail) => {
        this.#waiting = [done, fail]
      })
    }
    return this.#queued
  }

  async #flush(content: Content): Promise<void> {
    this.#active = true
    try {
      await writeFile(this.#tmp, content, 'utf-8')
      await rename(this.#tmp, this.#target)
      this.#current?.[0]()
    } catch (err) {
      if (err instanceof Error) {
        this.#current?.[1](err)
      }
      throw err
    } finally {
      this.#active = false
      this.#current = this.#waiting
      this.#waiting = this.#queued = null
      if (this.#buffer !== null) {
        const next = this.#buffer
        this.#buffer = null
        await this.write(next)
      }
    }
  }

  constructor(file: PathLike) {
    this.#target = file
    this.#tmp = temp(file)
  }

  async write(content: Content): Promise<void> {
    return this.#active ? this.#defer(content) : this.#flush(content)
  }

  get path(): PathLike {
    return this.#target
  }

  get busy(): boolean {
    return this.#active
  }
}

export default Writer
