import fs from 'fs/promises'
import path from 'path'
import { AppError } from './errorHandling'
import type { BankAccountEvent } from '../types'
import e from 'express'

/**
 * Load events for the given `accountId`.
 *
 * TODO: Implement this function. This is part of the test.
 *
 * The implementation should return a promise that resolves to an array
 * of objects, sourced from the relevant directory inside of the "events"
 * directory at the root of this project.
 *
 * @see saveEvents
 */
export async function loadEvents(
  accountId: string
): Promise<BankAccountEvent[]> {
  if (accountId) {
    try {
      const files = await fs.readdir(`./events/${accountId}`, {
        withFileTypes: true,
      })
      // Filters non-files and only of type .json
      const filteredFiles = files.filter(
        (file) => file.isFile() && file.name.endsWith('.json')
      )

      const promisesOfFiles = filteredFiles.map((file) =>
        fs.readFile(`./events/${accountId}/${file.name}`, { encoding: 'utf-8' })
      )

      // Usage of promise all vs async await for every file
      const contentsOfFiles = await Promise.all(promisesOfFiles)
      const listOfEvents: BankAccountEvent[] = contentsOfFiles.map((item) =>
        JSON.parse(item)
      )
      return listOfEvents
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      } else {
        console.log(err) // Log the error but don't expose it to the client
        throw new AppError(500, 'Failed to process the data')
      }
    }
  } else {
    throw new AppError(400, 'Account Id not provided')
  }
}

/**
 * Saves new events.
 */
export async function saveEvents(events: BankAccountEvent[]) {
  await Promise.all(
    events.map(async (event) => {
      const filepath = path.join(
        __dirname,
        '../../events',
        event.accountId,
        `${event.position}.json`
      )
      console.log('Writing new event to', filepath)
      await fs.writeFile(filepath, JSON.stringify(event, null, 2), {
        // Fail if the file already exists
        flag: 'wx',
      })
    })
  )
}
