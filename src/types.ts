/**
 * A bank account, the state of which is fully derived from
 * an array of `BankAccountEvent` objects.
 */
export interface IBankAccount {
  /**
   * Account status.
   */
  status: 'open'
  /**
   * An 8-digit numeric account number.
   */
  accountId: string
  /**
   * Name of the account holder.
   */
  ownerName: string
  /**
   * The current balance of the account.
   */
  balance: number
  /**
   * Is `true` when the balance of the account is below 0.
   */
  isOverdrawn: boolean
  /**
   * A list of transactions, with the most recent transactions first.
   */
  transactions: IBankAccountTransaction[]
  /**
   * A unix timestamp of the moment the account was opened.
   * @example 1644778352742
   */
  openedAt: number
}

interface IBankAccountTransaction {
  /**
   * The type of the transaction.
   */
  type: 'credit' | 'debit'
  /**
   * Monetary value of the transaction.
   * This is always a positive value, with debits represented with
   * `type: 'debit'`.
   */
  value: number
  /**
   * A unix timestamp of the moment the transaction occurred.
   * @example 1644778352742
   */
  timestamp: number
}

/**
 * A bank account event, with all the metadata.
 *
 * This is what gets saved / loaded from disk, and can be used to build up
 * an aggregate view of the data.
 */
export type BankAccountEvent = BankAccountEventBase & IBankAccountEventShared

/**
 * A "bank account" event.
 *
 * **Hint:** To complete the test, you'll need to extend this with an event
 * type of your own.
 */
export type BankAccountEventBase =
  | IAccountOpenedEventBase
  | IUpdateAccountEventBase
  | IMoneyDebitedEventBase
  | IMoneyCreditedEventBase

interface IAccountOpenedEventBase {
  type: 'AccountOpened'
  ownerName: string
}

interface IUpdateAccountEventBase {
  type: 'UpdateAccount'
  ownerName: string
}

interface IMoneyDebitedEventBase {
  type: 'MoneyDebited'
  value: number
}

interface IMoneyCreditedEventBase {
  type: 'MoneyCredited'
  value: number
}

interface IBankAccountEventShared {
  accountId: string
  position: number
  time: string
}
