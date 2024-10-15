import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'

export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodos(userId) {
    console.log(`Getting All todos with userId ${userId}`)

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: '#userId = :i',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':i': userId
      }
    })

    return result.Items
  }

  async getTodo(userId, todoId) {
    const result = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: { userId, todoId }
    })

    return result.Item
  }

  async createTodo(todo) {
    console.log(`Creating a todo with id ${todo.todoId}`)

    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    return todo
  }

  async updateTodo(userId, todoId, updatedTodo) {
    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set #name = :n, dueDate=:dueDate, done=:done",
      ExpressionAttributeValues: {
        ":n": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
      },
      ExpressionAttributeNames: { '#name': 'name' },
      ReturnValues: "NONE"
    })
  }

  async updateAttachment(userId, todoId, attachmentUrl) {
    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl=:a",
      ExpressionAttributeValues: {
        ":a": attachmentUrl
      },
      ReturnValues: "NONE"
    })
  }

  async deleteTodo(userId, todoId) {
    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: { userId, todoId }
    })
  }

}


