import knex from "knex";

export class FollowDatabase {
  private connection = knex({
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    },
  });

  private static TABLE_NAME = "Follow_Cookenu1";

  public async createFollow(
    id_followed: string,
    id_follower: string
  ): Promise<void> {
    await this.connection
      .insert({
        id_followed,
        id_follower
      })
      .into(FollowDatabase.TABLE_NAME);
  }

  public async getFollowById(id: string): Promise<any> {
    const result = await this.connection
      .select("*")
      .from(FollowDatabase.TABLE_NAME)
      .where({ id });    
    return result[0];
  }

  public async deleteFollow(id: string): Promise<any> {
    await this.connection
      .delete()
      .from(FollowDatabase.TABLE_NAME)
      .where({ id });
  }
}
