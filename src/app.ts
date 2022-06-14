import express from 'express'
import { AppError, expressErrorHandler } from './lib/errorHandling'
import { loadEvents, saveEvents } from './lib/events'
import { BankAccountEvent, IBankAccount } from './types'

export const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.contentType('text/html')
  res.send(`
    <style>
      html { font-family: sans-serif; }
      body { padding: 4rem; line-height: 1.5; }
    </style>

    <h1>Ticknovate test</h1>

    <p>Hello! Add your two routes to this app to complete the test.</p>
    
    <p>The boilerplate of the <a href="/accounts/12060626">first one</a> has been done for you, but you'll
    have to complete the implementation, and add the second route for
    changing an account owner's name. See the README for more information.</p>
    
    <p>Good luck!</p>
  `)
})

const generateAccountFromEvents = (
  accountId: string,
  events: BankAccountEvent[]
) => {
  const account: IBankAccount = {
    status: 'open',
    accountId: '',
    ownerName: '',
    openedAt: 0,
    transactions: [],
    isOverdrawn: false,
    balance: 0,
  }

  events.forEach((event) => {
    switch (event.type) {
      case 'AccountOpened':
        account.accountId = event.accountId
        account.ownerName = event.ownerName
        account.openedAt = new Date(event.time).getTime()
        break
      case 'UpdateAccount':
        account.ownerName = event.ownerName
        break
      case 'MoneyDebited':
        account.transactions.push({
          type: 'debit',
          value: event.value,
          timestamp: new Date(event.time).getTime(),
        })
        account.balance = account.balance - event.value
        if (account.balance < 0) {
          account.isOverdrawn = true
        }
        break
      case 'MoneyCredited':
        account.transactions.push({
          type: 'credit',
          value: event.value,
          timestamp: new Date(event.time).getTime(),
        })
        account.balance = account.balance + event.value
        if (account.balance > 0) {
          account.isOverdrawn = false
        }
        break
      default:
        // log the error for us and throw an error for the client without exposing the actual error
        console.error(
          `Invalid type of ${event} event when processing account: ${accountId}`
        )
        throw new AppError(500, 'Failed when processing account')
    }
  })

  return account
}

app.get('/accounts/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    if (!id && id !== '') {
      throw new AppError(400, 'Either id is not provided')
    }
    const events: BankAccountEvent[] = await loadEvents(id)

    const account: IBankAccount = generateAccountFromEvents(
      req.params.id,
      events
    )

    res.json(account)
  } catch (err) {
    next(err)
  }
})

// For the sake of simplicity I have decided to do it this way
// I would normally do a post request with using a json body
// Also the endpoint name would be different (updateAccount) as to not confuse anyone
app.get('/accounts/:id/:ownerName', async (req, res, next) => {
  try {
    const id = req.params.id
    const ownerName = req.params.ownerName
    if (!id && !ownerName && id !== '' && ownerName !== '') {
      throw new AppError(400, 'Either id or the owner name is not provided')
    }
    console.log(id, ownerName)
    const events: BankAccountEvent[] = await loadEvents(id)

    const updateAccountEvent: BankAccountEvent = {
      accountId: id,
      type: 'UpdateAccount',
      ownerName,
      time: new Date().toISOString(),
      // a more efficient way to get position would be to do readdir on the directory
      // and get the last file number + 1
      position: events[events.length - 1].position + 1,
    }

    saveEvents([updateAccountEvent])

    res.json({
      message: 'Sucessfully updated the name of the account holder',
    })
  } catch (err) {
    next(err)
  }
})

app.use(expressErrorHandler)
