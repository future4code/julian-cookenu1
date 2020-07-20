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
  private static COLUM_FOLLOWED_NAME = "id_followed";
  
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


  public async isValidId(id: string): Promise<any> {
    const result = await this.connection  
      .raw(`
        SELECT COUNT(*) as quantity FROM ${FollowDatabase.TABLE_NAME}
        WHERE ${FollowDatabase.COLUM_FOLLOWED_NAME}="${id}"`
      );
    return result[0][0]
  }

  public async deleteFollow(id_followed: string, id_follower: string): Promise<any> {
    try{
      await this.connection
      .delete()
      .from(FollowDatabase.TABLE_NAME)
      .where({ id_followed, id_follower });
    }catch(err){
      throw new Error(err.sqlMessage || err.message)
    }
  }
}
