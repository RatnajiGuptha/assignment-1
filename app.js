const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const addDate = require("date-fns");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let db = null;

const initializationDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializationDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasWorkProperty = (requestQuery) => {
  return requestQuery.work !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndWorkProperties = (requestQuery) => {
  return requestQuery.category !== undefined && requestQuery.work !== undefined;
};

const convertTodoDbToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q, priority, category, work, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            status = '${status}' and
            priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            priority = '${priority}';`;
      break;
    case hasCategoryAndWorkProperties(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            category = '${category}' and
            work = '${work}';`;
      break;
    case hasCategoryAndWorkProperties(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            category = '${category}' and
            work = '${work}';`;
      break;
    case hasWorkProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
            work = '${work}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM todo
        WHERE 
           category = '${category}';`;
      break;
    default:
      getTodoQuery = `
      SELECT *
      FROM todo 
      WHERE
        todo = '${search_q}';`;
      break;
  }
  data = await db.all(getTodoQuery);
  response.send(data.map((each) => convertTodoDbToResponseObject(each)));
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getQueryList = `Select * from todo where id = ${todoId};`;
  const todoData = await db.get(getQueryList);
  response.send(convertTodoDbToResponseObject(todoData));
});

app.get("/todos/", async (request, response) => {
  const getQueryList = `Select * from todo;`;
  const todoData = await db.all(getQueryList);
  response.send(todoData.map((each) => convertTodoDbToResponseObject(each)));
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const addTodoQuery = `Insert into todo(id,todo, priority, status, category, due_date)
   VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQueryData = `Delete From todo Where id = ${todoId};`;
  await db.run(deleteQueryData);
  response.send("Todo Deleted");
});

/*app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getQueryResult = `Select * From todo Where due_date =' ${date}';`;
  const queryResult = await db.get(getQueryResult);
  response.send(queryResult);
  //response.send(convertTodoDbToResponseObject(queryResult));
});*/

module.exports = app;
