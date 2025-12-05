import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark a method as a database operation for metrics tracking
 *
 * @param operation - The type of operation (find, save, update, delete, etc.)
 * @param table - The table/entity name being operated on
 *
 * @example
 * @DatabaseOperation('find', 'users')
 * async findUserById(id: string) { ... }
 *
 * @example
 * @DatabaseOperation('save', 'questions')
 * async createQuestion(data: CreateQuestionDto) { ... }
 */
export const DatabaseOperation = (operation: string, table: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('db:operation', operation)(target, propertyKey, descriptor);
    SetMetadata('db:table', table)(target, propertyKey, descriptor);
    return descriptor;
  };
};
