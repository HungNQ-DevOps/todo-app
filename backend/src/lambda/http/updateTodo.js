import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../../auth/utils.mjs'
import { updateTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
    const updatedTodo = JSON.parse(event.body)
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)

    const item = await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 201,
     body: JSON.stringify({
        item
      })
    }
  })