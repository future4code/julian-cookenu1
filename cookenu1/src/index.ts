import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AddressInfo } from "net";
import { IdGenerator } from "./services/IdGenerator";
import { UserDatabase } from "./data/UserDatabase";
import { RecipeDatabase } from "./data/RecipeDatabase";
import { Authenticator } from "./services/Authenticator";
import HashManager from "./services/HashManager";
import { BaseDatabase } from "./data/BaseDatabase";
import { title } from "process";



dotenv.config();

const app = express();

app.use(express.json());

/*********************************************************************************************/
/*********************************************************************************************/
// CRIAR NOVO USUARIO FINALIZADO
/*********************************************************************************************/
/*********************************************************************************************/

app.post("/signup", async (req: Request, res: Response) => {
  try {    
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,

    };

    const idGenerator = new IdGenerator();
    const id = idGenerator.generate();

    const hashManager = new HashManager();
    const hashPassword = await hashManager.hash(userData.password);
    
    const userDb = new UserDatabase();
    await userDb.createUser(id, userData.name, userData.email, hashPassword);

    const authenticator = new Authenticator();
    const token = authenticator.generateToken({
      id      
    });

    res.status(200).send({
      token,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

/*********************************************************************************************/
/*********************************************************************************************/
// LOGIN FINALIZADO
/*********************************************************************************************/
/*********************************************************************************************/

app.post("/login", async (req: Request, res: Response) => {
  try {
   
    if (!req.body.email || req.body.email.indexOf("@") === -1) {
      throw new Error("Invalid email");
    }

    const userData = {
      email: req.body.email,
      password: req.body.password,
    };

    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserByEmail(userData.email);
    
    const hashManager = new HashManager();
    const compareResult = await hashManager.compare(
      userData.password,
      user.password
    );

    if (!compareResult) {
      throw new Error("Invalid password");
    }

    const authenticator = new Authenticator();
    const token = authenticator.generateToken({
      id: user.id
    });

    res.status(200).send({
      token,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
  await BaseDatabase.destroyConnection();
});

//app.delete("/user/:id", async (req: Request, res: Response) => {
//  try {
//    const token = req.headers.token as string;
//
//    const authenticator = new Authenticator();
//    const authenticationData = authenticator.getData(token);
//
//    if (authenticationData.role !== "admin") {
//      throw new Error("Only a admin user can access this funcionality");
//    }
//
//    const id = req.params.id;
//
//    const userDatabase = new UserDatabase();
//    await userDatabase.deleteUser(id);
//
//    res.sendStatus(200);
//  } catch (err) {
//    res.status(400).send({
//      message: err.message,
//    });
//  }
//  await BaseDatabase.destroyConnection();
//});


/*********************************************************************************************/
/*********************************************************************************************/
// POSTAR RECEITA EM ANDAMENTO
/*********************************************************************************************/
/*********************************************************************************************/

app.post("/recipe", async (req: Request, res: Response) => {
  try {
    const token = req.headers.token as string;
    
    const authenticator = new Authenticator();
    const authenticationData = authenticator.getData(token);
    const id_Author = authenticationData.id;

    console.log(id_Author)
    const recipeData = {
      title: req.body.title,
      recipe_description: req.body.recipe_description
    };

    const recipeDatabase = new RecipeDatabase();   
    await recipeDatabase.createRecipe(id_Author, recipeData.title, recipeData.recipe_description);

    res.status(200).send({
      mensagem: "Receita criada com sucesso!"
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

/*********************************************************************************************/
/*********************************************************************************************/
// PEGAR USUARIO PELO TOKEN FINALIZADO
/*********************************************************************************************/
/*********************************************************************************************/
app.get("/user/profile", async (req: Request, res: Response) => {
  try {
    const token = req.headers.token as string;

    const authenticator = new Authenticator();
    const authenticationData = authenticator.getData(token);

    
    const userDb = new UserDatabase();
    const user = await userDb.getUserById(authenticationData.id);

    console.log("Token", authenticationData)
    console.log("id", user)

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

/*********************************************************************************************/
/*********************************************************************************************/
// PEGAR USUARIO PELO ID FINALIZADO
/*********************************************************************************************/
/*********************************************************************************************/

app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const token = req.headers.token as string;

    const authenticator = new Authenticator();
    authenticator.getData(token);
		// a gente PRECISA verificar se o token não está expirado

    const id = req.params.id;

    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserById(id);

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email      
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }

});

const server = app.listen(process.env.PORT || 3000, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});
