const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./paper_management.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// TODO: Create a table named papers with the schema specified in the handout
db.run(`CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  published_in TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year > 1900),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
// TODO: Implement these database operations
const dbOperations = {
  //数据库操作（如插入、查询、更新）通常需要一定的时间完成，尤其是在处理大数据或远程数据库时。
  //SQLite 的 db.run() 方法本身是非阻塞的，即它会立即返回，而不会等待数据库操作完成。这种行为避免了主线程被阻塞。
  createPaper: async (paper) => {
    // Your implementation here
    // Hint: You need to:
    // 1. Create and execute an INSERT SQL statement
    // 2. Use await to handle the promise
    // 3. Return the created paper with its ID
    // Example structure:
    // try {
    //   const result = await new Promise((resolve, reject) => {
    //     db.run(
    //       "INSERT INTO ... VALUES ...",
    //       [...values],
    //       function(err) {
    //         if (err) reject(err);
    //         else resolve(this.lastID);
    //       }
    //     );
    //   });
    //   return { id: result, ...paper };
    // } catch (error) {
    //   throw error;
    // }
    //用于从对象或数组中提取值，并将其赋值给变量。
    //等价于
    //const title = paper.title;
    // const authors = paper.authors;
    // const published_in = paper.published_in;
    // const year = paper.year;

    const { title, authors, published_in, year } = paper;
    try {
      //SQLite 的 db.run 方法是基于回调函数的，它不会返回 Promise，也不支持 await。
      //我们需要将 db.run 包装成 Promise，以便可以在 async 函数中用 await 处理。
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO papers (title, authors, published_in, year) VALUES (?, ?, ?, ?)`,
          [title, authors, published_in, year],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      //... 是扩展运算符（spread syntax），可以将对象或数组的内容展开。
      return { id: result, ...paper };
    } catch (error) {
      throw error;
    }
  },

  getAllPapers: async (filters = {}) => {
    // Your implementation here
    // Remember to handle filters (year, published_in)
    // Hint:
    // 1. Start with a basic SELECT query
    // 2. Add WHERE clauses based on filters:
    //    - If filters.year exists, add "year = ?"
    //    - If filters.published_in exists, add "published_in LIKE ?"
    // 3. Use an array to store query parameters
    // Example structure:
    // let query = "SELECT * FROM papers";
    // const params = [];
    // if (filters.year) {
    //   query += " WHERE year = ?";
    //   params.push(filters.year);
    // }
    // ...
    // const result = await new Promise((resolve, reject) => {
    //   db.all(query, params, (err, rows) => {
    //     if (err) reject(err);
    //     else resolve(rows);
    //   });
    // });
    try {
      let query = "SELECT * FROM papers";
      //params 数组存储了对应的值，稍后会通过参数化查询的方式传递给数据库，避免直接将值拼接到 SQL 字符串中，从而避免 SQL 注入问题。
      const params = [];

      if (filters.year || filters.published_in) {
        const conditions = [];
        if (filters.year) {
          conditions.push("year = ?");
          params.push(filters.year);
        }
        if (filters.published_in) {
          conditions.push("published_in LIKE ?");
          params.push(`%${filters.published_in}%`);
        }
        query += " WHERE " + conditions.join(" AND ");
      }
      //举例
      //conditions  ["year = ?", "published_in LIKE ?"]。
      //params  [2020, "%Science%"]。

      const result = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  getPaperById: async (id) => {
    // Your implementation here
    // Hint: Use await with a new Promise that wraps the db.get() operation
    try {
      const result = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM papers WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  },

  updatePaper: async (id, paper) => {
    // Your implementation here
    const { title, authors, published_in, year } = paper;
    try {
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE papers 
          SET title = ?, authors = ?, published_in = ?, year = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [title, authors, published_in, year, id], (err) => {
            if (err) reject(err);
            else resolve(this.changes);  
          }
        );
      });
    } catch (error) {
      throw error;
    }
  },

  deletePaper: async (id) => {
    // Your implementation here
    try {
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM papers WHERE id = ?", [id], (err) => {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
    } catch (error) {
      throw error;
    }
  },

};

module.exports = dbOperations;
