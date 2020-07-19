import knex from "knex";

export class RecipeDatabase {
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

  private static TABLE_NAME = "Recipe_Cookenu1";

  public async createRecipe(
    id_Author: string,
    title: string,
    recipe_description: string,  
  ): Promise<void> {
    await this.connection
      .insert({
        id_Author,
        title,
        recipe_description    
      })
      .into(RecipeDatabase.TABLE_NAME);
  }

  public async getRecipeById(id_Recipe: number): Promise<any> {
    const result = await this.connection
      .select("*")
      .from(RecipeDatabase.TABLE_NAME)
      .where({ id_Recipe });    
    return result[0];
  }

}
