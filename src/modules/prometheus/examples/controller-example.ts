// import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
// import { ExampleService } from './service-example';

// /**
//  * Example controller demonstrating HTTP metrics collection
//  *
//  * HTTP metrics are collected automatically by the HttpMetricsInterceptor
//  * which is registered globally in PrometheusModule.
//  *
//  * No additional decorators are needed for HTTP metrics!
//  */
// @Controller('users')
// export class UsersController {
//   constructor(private readonly exampleService: ExampleService) {}

//   /**
//    * GET /users
//    * Automatically tracked: method=GET, route=/users, status_code=200
//    */
//   @Get()
//   async findAll() {
//     return await this.exampleService.findAllUsers();
//   }

//   /**
//    * GET /users/:id
//    * Automatically tracked: method=GET, route=/users/:id, status_code=200|404
//    */
//   @Get(':id')
//   async findOne(@Param('id') id: string) {
//     const user = await this.exampleService.getUserWithCache(id);
//     if (!user) {
//       throw new Error('User not found'); // Will track as 500 error
//     }
//     return user;
//   }

//   /**
//    * POST /users
//    * Automatically tracked: method=POST, route=/users, status_code=201
//    */
//   @Post()
//   async create(@Body() createUserDto: any) {
//     return await this.exampleService.createUser(createUserDto);
//   }

//   /**
//    * PUT /users/:id
//    * Automatically tracked: method=PUT, route=/users/:id, status_code=200
//    */
//   @Put(':id')
//   async update(@Param('id') id: string, @Body() updateUserDto: any) {
//     return await this.exampleService.updateUser(id, updateUserDto);
//   }

//   /**
//    * DELETE /users/:id
//    * Automatically tracked: method=DELETE, route=/users/:id, status_code=200
//    */
//   @Delete(':id')
//   async remove(@Param('id') id: string) {
//     await this.exampleService.deleteUser(id);
//     return { message: 'User deleted successfully' };
//   }

//   /**
//    * GET /users/active/with-questions
//    * Automatically tracked: method=GET, route=/users/active/with-questions
//    */
//   @Get('active/with-questions')
//   async findActiveWithQuestions() {
//     return await this.exampleService.findActiveUsersWithQuestions();
//   }

//   /**
//    * GET /users/metrics/system
//    * Get system metrics snapshot
//    * Automatically tracked like any other endpoint
//    */
//   @Get('metrics/system')
//   async getSystemMetrics() {
//     return await this.exampleService.getSystemMetrics();
//   }
// }

// /**
//  * Example of what metrics are collected for each endpoint:
//  *
//  * For: GET /users/123
//  * ✅ http_request_duration_seconds{method="GET", route="/users/:id", status_code="200"}
//  * ✅ http_requests_total{method="GET", route="/users/:id", status_code="200"}
//  * ✅ http_request_errors_total{method="GET", route="/users/:id", status_code="200"} (if error)
//  *
//  * For: POST /users
//  * ✅ http_request_duration_seconds{method="POST", route="/users", status_code="201"}
//  * ✅ http_requests_total{method="POST", route="/users", status_code="201"}
//  *
//  * Errors are automatically tracked too:
//  * ❌ GET /users/invalid-id (throws error)
//  * ✅ http_request_duration_seconds{method="GET", route="/users/:id", status_code="500"}
//  * ✅ http_requests_total{method="GET", route="/users/:id", status_code="500"}
//  * ✅ http_request_errors_total{method="GET", route="/users/:id", status_code="500"}
//  */
