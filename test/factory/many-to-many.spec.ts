/*
* @adonisjs/lucid
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import test from 'japa'
import { ManyToMany } from '@ioc:Adonis/Lucid/Relations'
import { column, manyToMany } from '../../src/Orm/Decorators'

import {
  setup,
  getDb,
  cleanup,
  ormAdapter,
  resetTables,
  getBaseModel,
  getFactoryModel,
} from '../../test-helpers'

let db: ReturnType<typeof getDb>
let BaseModel: ReturnType<typeof getBaseModel>
const FactoryModel = getFactoryModel()

test.group('Factory | ManyToMany | make', (group) => {
  group.before(async () => {
    db = getDb()
    BaseModel = getBaseModel(ormAdapter(db))
    await setup()
  })

  group.after(async () => {
    await cleanup()
    await db.manager.closeAll()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('make model with relationship', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, () => {
      const skill = new Skill()
      skill.name = 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory.with('skills').make()

    assert.isFalse(user.$isPersisted)
    assert.lengthOf(user.skills, 1)
    assert.instanceOf(user.skills[0], Skill)
    assert.isFalse(user.skills[0].$isPersisted)
  })

  test('pass custom attributes to relationship', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, (_, attributes?: any) => {
      const skill = new Skill()
      skill.name = attributes?.name || 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory.with('skills', 1, (related) => {
      related.fill({ name: 'Dancing' })
    }).make()

    assert.isFalse(user.$isPersisted)
    assert.lengthOf(user.skills, 1)
    assert.instanceOf(user.skills[0], Skill)
    assert.isFalse(user.skills[0].$isPersisted)
    assert.equal(user.skills[0].name, 'Dancing')
  })

  test('make many relationship', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, (_, attributes?: any) => {
      const skill = new Skill()
      skill.name = attributes?.name || 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory.with('skills', 2, (related) => {
      related.fill({ name: 'Dancing' })
    }).make()

    assert.isFalse(user.$isPersisted)
    assert.lengthOf(user.skills, 2)

    assert.instanceOf(user.skills[0], Skill)
    assert.isFalse(user.skills[0].$isPersisted)
    assert.equal(user.skills[0].name, 'Dancing')

    assert.instanceOf(user.skills[1], Skill)
    assert.isFalse(user.skills[1].$isPersisted)
    assert.equal(user.skills[1].name, 'Dancing')
  })
})

test.group('Factory | HasMany | create', (group) => {
  group.before(async () => {
    db = getDb()
    BaseModel = getBaseModel(ormAdapter(db))
    await setup()
  })

  group.after(async () => {
    await cleanup()
    await db.manager.closeAll()
  })

  group.afterEach(async () => {
    await resetTables()
  })

  test('create model with relationship', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, () => {
      const skill = new Skill()
      skill.name = 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory.with('skills').create()

    assert.isTrue(user.$isPersisted)
    assert.lengthOf(user.skills, 1)
    assert.instanceOf(user.skills[0], Skill)
    assert.isTrue(user.skills[0].$isPersisted)
    assert.deepEqual(user.skills[0].$extras, {
      user_id: user.id,
      skill_id: user.skills[0].id,
    })
  })

  test('pass custom attributes', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, (_, attributes?: any) => {
      const skill = new Skill()
      skill.name = attributes?.name || 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory
      .with('skills', 1, (related) => related.fill({ name: 'Dancing' }))
      .create()

    assert.isTrue(user.$isPersisted)
    assert.lengthOf(user.skills, 1)
    assert.instanceOf(user.skills[0], Skill)
    assert.isTrue(user.skills[0].$isPersisted)
    assert.equal(user.skills[0].name, 'Dancing')
    assert.deepEqual(user.skills[0].$extras, {
      user_id: user.id,
      skill_id: user.skills[0].id,
    })
  })

  test('create many relationships', async (assert) => {
    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, (_, attributes?: any) => {
      const skill = new Skill()
      skill.name = attributes?.name || 'Programming'
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    const user = await factory
      .with('skills', 2, (related) => related.fill([
        { name: 'Dancing' },
        { name: 'Programming' },
      ]))
      .create()

    assert.isTrue(user.$isPersisted)
    assert.lengthOf(user.skills, 2)
    assert.instanceOf(user.skills[0], Skill)
    assert.isTrue(user.skills[0].$isPersisted)
    assert.equal(user.skills[0].name, 'Dancing')
    assert.deepEqual(user.skills[0].$extras, {
      user_id: user.id,
      skill_id: user.skills[0].id,
    })

    assert.instanceOf(user.skills[1], Skill)
    assert.isTrue(user.skills[1].$isPersisted)
    assert.equal(user.skills[1].name, 'Programming')
    assert.deepEqual(user.skills[1].$extras, {
      user_id: user.id,
      skill_id: user.skills[1].id,
    })
  })

  test('rollback changes on error', async (assert) => {
    assert.plan(4)

    class Skill extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public name: string
    }
    Skill.boot()

    class User extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public username: string

      @column()
      public points: number = 0

      @manyToMany(() => Skill)
      public skills: ManyToMany<typeof Skill>
    }

    const postFactory = new FactoryModel(Skill, () => {
      const skill = new Skill()
      return skill
    }).build()

    const factory = new FactoryModel(User, () => new User())
      .related('skills', () => postFactory)
      .build()

    try {
      await factory.with('skills').create()
    } catch (error) {
      assert.exists(error)
    }

    const users = await db.from('users').exec()
    const skills = await db.from('skills').exec()
    const userSkills = await db.from('skill_user').exec()

    assert.lengthOf(users, 0)
    assert.lengthOf(skills, 0)
    assert.lengthOf(userSkills, 0)
  })
})
