import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, ok, serverError } from '../../helpers/http-helpers'
import type { AddAccount, Controller, EmailValidator, HttpRequest, HttpResponse } from './signup-protocols'

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly AddAccount: AddAccount

  constructor (emailValidator: EmailValidator, AddAccount: AddAccount) {
    this.emailValidator = emailValidator
    this.AddAccount = AddAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const isValid = this.emailValidator.isValid(email)
      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      const account = await this.AddAccount.add({
        name, email, password
      })

      return ok(account)
    } catch (error) {
      return serverError()
    }
  }
}
