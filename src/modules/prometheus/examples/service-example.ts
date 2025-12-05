// import { Injectable, UseInterceptors } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import {
//   DatabaseMetricsInterceptor,
//   DatabaseOperation,
//   CacheMetricsInterceptor,
//   TrackCache,
//   SystemMetricsService,
// } from '../';

// /**
//  * Example service demonstrating how to use metrics interceptors
//  */
// @Injectable()
// export class ExampleService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     private readonly systemMetrics: SystemMetricsService,
//     private readonly redis: any, // Your Redis client
//   ) {}

//   // ============================================
//   // DATABASE OPERATIONS WITH METRICS
//   // ============================================

//   /**
//    * Find all users - tracks query duration and count
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('find', 'users')
//   async findAllUsers(): Promise<User[]> {
//     return await this.userRepository.find();
//   }

//   /**
//    * Find user by ID - tracks single record query
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('findOne', 'users')
//   async findUserById(id: string): Promise<User | null> {
//     return await this.userRepository.findOne({ where: { id } });
//   }

//   /**
//    * Create new user - tracks insert operations
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('save', 'users')
//   async createUser(data: CreateUserDto): Promise<User> {
//     const user = this.userRepository.create(data);
//     return await this.userRepository.save(user);
//   }

//   /**
//    * Update user - tracks update operations
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('update', 'users')
//   async updateUser(id: string, data: UpdateUserDto): Promise<User> {
//     await this.userRepository.update(id, data);
//     return await this.findUserById(id);
//   }

//   /**
//    * Delete user - tracks delete operations
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('delete', 'users')
//   async deleteUser(id: string): Promise<void> {
//     await this.userRepository.delete(id);
//   }

//   /**
//    * Complex query - tracks custom queries
//    */
//   @UseInterceptors(DatabaseMetricsInterceptor)
//   @DatabaseOperation('query', 'users')
//   async findActiveUsersWithQuestions(): Promise<User[]> {
//     return await this.userRepository
//       .createQueryBuilder('user')
//       .leftJoinAndSelect('user.questions', 'question')
//       .where('user.isActive = :isActive', { isActive: true })
//       .andWhere('question.id IS NOT NULL')
//       .getMany();
//   }

//   // ============================================
//   // CACHE OPERATIONS WITH METRICS
//   // ============================================

//   /**
//    * Get user from cache - tracks cache hits/misses
//    */
//   @UseInterceptors(CacheMetricsInterceptor)
//   @TrackCache('redis', 'user:*')
//   async getUserFromCache(userId: string): Promise<User | null> {
//     const cached = await this.redis.get(`user:${userId}`);
//     return cached ? JSON.parse(cached) : null;
//   }

//   /**
//    * Get question from cache
//    */
//   @UseInterceptors(CacheMetricsInterceptor)
//   @TrackCache('redis', 'question:*')
//   async getQuestionFromCache(questionId: string): Promise<Question | null> {
//     const cached = await this.redis.get(`question:${questionId}`);
//     return cached ? JSON.parse(cached) : null;
//   }

//   /**
//    * Get user list from cache
//    */
//   @UseInterceptors(CacheMetricsInterceptor)
//   @TrackCache('redis', 'users:list')
//   async getUserListFromCache(): Promise<User[] | null> {
//     const cached = await this.redis.get('users:list');
//     return cached ? JSON.parse(cached) : null;
//   }

//   // ============================================
//   // COMBINED OPERATIONS (CACHE + DATABASE)
//   // ============================================

//   /**
//    * Get user with cache-aside pattern
//    * This demonstrates using both cache and database metrics
//    */
//   async getUserWithCache(userId: string): Promise<User | null> {
//     // Try cache first (tracked)
//     const cached = await this.getUserFromCache(userId);
//     if (cached) {
//       return cached;
//     }

//     // Cache miss - get from database (tracked)
//     const user = await this.findUserById(userId);
//     if (user) {
//       // Store in cache for next time
//       await this.redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
//     }

//     return user;
//   }

//   // ============================================
//   // SYSTEM METRICS - CONNECTION TRACKING
//   // ============================================

//   /**
//    * Track WebSocket connections
//    */
//   handleWebSocketConnection(): void {
//     this.systemMetrics.incrementActiveConnections('websocket');
//   }

//   handleWebSocketDisconnection(): void {
//     this.systemMetrics.decrementActiveConnections('websocket');
//   }

//   /**
//    * Track database connections
//    */
//   async trackDatabaseConnections(): Promise<void> {
//     // Example: Get connection pool size
//     const connectionCount = 10; // Get this from your connection pool
//     this.systemMetrics.setActiveConnections('database', connectionCount);
//   }

//   /**
//    * Get system metrics snapshot
//    */
//   getSystemMetrics() {
//     return this.systemMetrics.getSystemSnapshot();
//   }
// }

// // ============================================
// // TYPE DEFINITIONS (for example purposes)
// // ============================================

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   isActive: boolean;
// }

// interface Question {
//   id: string;
//   title: string;
//   content: string;
//   userId: string;
// }

// interface CreateUserDto {
//   email: string;
//   name: string;
// }

// interface UpdateUserDto {
//   name?: string;
//   isActive?: boolean;
// }
