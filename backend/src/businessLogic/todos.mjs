import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todosAccess.mjs'
import { createLogger } from '../utils/logger.mjs';
import { getUploadUrl, deleteAttachment } from '../fileStorage/attachmentUtils.mjs';

const todoAccess = new TodoAccess()
const logger = createLogger('todos')
const bucketName = process.env.IMAGES_S3_BUCKET

export async function createTodo(createTodoRequest, userId) {
  logger.info('create todo of user', userId)
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate
  })
}

export async function getAllTodos(userId) {
  logger.info('Get todos of user', userId)
  const items = await todoAccess.getAllTodos(userId)
  return items
}

export async function deleteTodo(userId, todoId) {
  logger.info('Deleting todo', todoId)

  await deleteAttachment(todoId)
  await todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(userId, todoId, updatedTodo) {
  const validTodo = await todoAccess.getTodo(userId, todoId)

  if (!validTodo) {
    throw new Error('404')
  }

  return await todoAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function createPresignedUrl(userId, todoId) {
  logger.info('Creating attachment url', todoId)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
  const validTodo = await todoAccess.getTodo(userId, todoId)

  if (!validTodo) {
    throw new Error('404')
  }

  const uploadUrl = getUploadUrl(todoId)
  await todoAccess.updateAttachment(userId, todoId, attachmentUrl)
  return uploadUrl
}





