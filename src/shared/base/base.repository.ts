import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  EntityTarget,
  EntityManager,
  QueryRunner,
} from 'typeorm';

export abstract class BaseRepository<
  T extends { id: string },
> extends Repository<T> {
  constructor(
    target: EntityTarget<T>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }

  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.create(data);
    return this.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.find();
  }

  async findOneById(
    id: T extends { id: infer ID } ? ID : never,
  ): Promise<T | null> {
    return this.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async updateEntity(
    id: T extends { id: infer ID } ? ID : never,
    data: DeepPartial<T>,
  ): Promise<T | null> {
    const entity = await this.findOneById(id);
    if (!entity) return null;

    const updated = this.merge(entity, data);
    return this.save(updated);
  }

  async deleteEntity(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
