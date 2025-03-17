const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// TODO: Implement these database operations
const dbOperations = {
  createPaper: async (paperData) => {
    try {
      // TODO: Implement paper creation
      //
      // paperData includes:
      // - title: string
      // - publishedIn: string
      // - year: number
      // - authors: array of author objects
      //   each author has:
      //   - name: string
      //   - email: string (optional)
      //   - affiliation: string (optional)
      //
      // Steps:
      // 1. For each author in paperData.authors:
      //    - First try to find an existing author with matching name, email, and affiliation
      //    - If not found, create a new author
      // 2. Create the paper and connect it with the authors
      // 3. Make sure to include authors in the response
      //
      // Hint: Use prisma.author.findFirst() to find existing authors
      // and prisma.paper.create() with { connect: [...] } to connect authors
      const authorRecords = await Promise.all(
        paperData.authors.map(async (author) => {
          let existingAuthor = await prisma.author.findFirst({
            where: { 
              name: author.name,
              email: author.email || null,
              affiliation: author.affiliation || null,
              },
            orderBy: { id: "asc" } 
          });
          if (!existingAuthor) {
            existingAuthor = await prisma.author.create({
              data: {
                name: author.name,
                email: author.email ?? null, 
                affiliation: author.affiliation ?? null, 
              }
            });
          }
          return existingAuthor;
        })
      );
    
      
      authorRecords.sort((a, b) => a.id - b.id);
    
      return await prisma.paper.create({
        data: {
          title: paperData.title,
          publishedIn: paperData.publishedIn,
          year: paperData.year,
          authors: {
            connect: authorRecords.map((author) => ({ id: author.id })),
          },
        },
        include: {
          authors: true, // 返回作者信息
        },
      });
      
    } catch (error) {
      throw error;
    }
  },

  getAllPapers: async (filters = {}) => {
    try {
      // TODO: Implement getting all papers with filters
      //
      // filters can include:
      // - year: number
      // - publishedIn: string (partial match)
      // - author: string (partial match)
      // - limit: number (default: 10)
      // - offset: number (default: 0)
      //
      // Use await prisma.paper.findMany()
      // Include authors in the response
      // Return { papers, total, limit, offset }
      let limit = filters.limit || 10;
      if (limit > 100) limit = 100;
      let offset = filters.offset || 0;

      const where = {};
      if (filters.year) {
        where.year = filters.year;
      }
      if (filters.publishedIn) {
        where.publishedIn = {
          contains: filters.publishedIn,
          mode: "insensitive",
        };
      }
      if (filters.author) {
        
        const authorsFilter = Array.isArray(filters.author)
          ? filters.author
          : [filters.author];
        if (authorsFilter.length === 1) {
          where.authors = {
            some: {
              name: { contains: authorsFilter[0], mode: "insensitive" }
            }
          };
        } else {
          where.AND = authorsFilter.map((authorName) => ({
            authors: {
              some: {
                name: { contains: authorName, mode: "insensitive" },
              },
            },
          }));
        }
        
        
          
      }

      const papers = await prisma.paper.findMany({
        where,
        include: { 
          authors: { orderBy: { id: "asc" } } 
        },
        skip: offset,
        take: limit,
        orderBy: { id: "asc" },
      });
      const total = await prisma.paper.count({ where });
      return { papers, total, limit, offset };
   

    } catch (error) {
      throw error;
    }
  },

  getPaperById: async (id) => {
    try {
      // TODO: Implement getting paper by ID
      //
      // Use await prisma.paper.findUnique()
      // Include authors in the response
      // Return null if not found
      const paper = await prisma.paper.findUnique({
        where: { id: Number(id) },
        include: { 
          authors: { orderBy: { id: "asc" } } 
        },
      });
      return paper;
    } catch (error) {
      throw error;
    }
  },

  updatePaper: async (id, paperData) => {
    try {
      // TODO: Implement paper update
      //
      // paperData includes:
      // - title: string
      // - publishedIn: string
      // - year: number
      // - authors: array of author objects
      //   each author has:
      //   - name: string
      //   - email: string (optional)
      //   - affiliation: string (optional)
      //
      // Steps:
      // 1. For each author in paperData.authors:
      //    - First try to find an existing author with matching name, email, and affiliation
      //    - If not found, create a new author
      // 2. Update the paper with new field values
      // 3. Replace all author relationships with the new set of authors
      // 4. Make sure to include authors in the response
      //
      // Hint: Use prisma.author.findFirst() to find existing authors
      // and prisma.paper.update() with authors: { set: [], connect: [...] }
      // to replace author relationships
      const existingPaper = await prisma.paper.findUnique({
        where: { id: parseInt(id, 10) },
      });
  
      if (!existingPaper) {
        return null; 
      }
      const authorRecords = await Promise.all(
        paperData.authors.map(async (author) => {
          let existingAuthor = await prisma.author.findFirst({
          where: {
            name: author.name,
            email: author.email || null,
            affiliation: author.affiliation || null,
          },
          orderBy: { id: "asc" }
        });
        let authorRecord;
        if (existingAuthor) {
          authorRecord = existingAuthor;
        } else {
          authorRecord = await prisma.author.create({
            data: {
              name: author.name,
              email: author.email ?? null,
              affiliation: author.affiliation ?? null,
            },
          });
        }
        // authorConnections.push({ id: authorRecord.id });
        return authorRecord;
        // return existingAuthor;
        })
      );
      const updatedPaper = await prisma.paper.update({
        where: { id: Number(id) },
        data: {
          title: paperData.title,
          publishedIn: paperData.publishedIn,
          year: paperData.year,
          authors: {
            set: [], 
            connect: authorRecords.map((author) => ({ id: author.id })),
          },
        },
        include: { 
          authors: { orderBy: { id: "asc" } } 
        },
      });
      return updatedPaper;
    } catch (error) {
      throw error;
    }
  },

  deletePaper: async (id) => {
    try {
      // TODO: Implement paper deletion
      //
      // Use await prisma.paper.delete()
      // Return nothing (undefined)
      
      const paper = await prisma.paper.findUnique({ where: { id: parseInt(id, 10) } });
      if (!paper) {
        return "PaperNotFound";
      }
      await prisma.paper.delete({ where: { id: parseInt(id, 10) } });
      
    } catch (error) {
      throw error;
    }
  },

  // Author Operations
  createAuthor: async (authorData) => {
    try {
      // TODO: Implement author creation
      //
      // authorData includes:
      // - name: string
      // - email: string (optional)
      // - affiliation: string (optional)
      //
      // Use await prisma.author.create()
      // Return the created author
      const createdAuthor = await prisma.author.create({
        data: {
          name: authorData.name,
          email: authorData.email || null,
          affiliation: authorData.affiliation || null,
        },
        include: {
          papers: { orderBy: { id: "asc" } },
        },
      });
      return createdAuthor;
    } catch (error) {
      throw error;
    }
  },

  getAllAuthors: async (filters = {}) => {
    try {
      // TODO: Implement getting all authors with filters
      //
      // filters can include:
      // - name: string (partial match)
      // - affiliation: string (partial match)
      // - limit: number (default: 10)
      // - offset: number (default: 0)
      //
      // Use await prisma.author.findMany()
      // Include papers in the response
      // Return { authors, total, limit, offset }
      let limit = filters.limit || 10;
      if (limit > 100) limit = 100;
      let offset = filters.offset || 0;

      const where = {};
      if (filters.name) {
        where.name = { contains: filters.name, mode: "insensitive" };
      }
      if (filters.affiliation) {
        where.affiliation = { contains: filters.affiliation, mode: "insensitive" };
      }
      const authors = await prisma.author.findMany({
        where,
        include: { 
          papers: { orderBy: { id: "asc" } } 
        },
        skip: offset,
        take: limit,
        orderBy: { id: "asc" },
      });
      const total = await prisma.author.count({ where });
      return { authors, total, limit, offset };
    } catch (error) {
      throw error;
    }
  },

  getAuthorById: async (id) => {
    try {
      // TODO: Implement getting author by ID
      //
      // Use await prisma.author.findUnique()
      // Include papers in the response
      // Return null if not found
      const author = await prisma.author.findUnique({
        where: { id: Number(id) },
        include: { 
          papers: { orderBy: { id: "asc" } } 
        },
      });
      return author;
    } catch (error) {
      throw error;
    }
  },

  updateAuthor: async (id, authorData) => {
    try {
      // TODO: Implement author update
      //
      // Use await prisma.author.update()
      // Return updated author with papers
      const updatedAuthor = await prisma.author.update({
        where: { id: Number(id) },
        data: {
          name: authorData.name,
          email: authorData.email || null,
          affiliation: authorData.affiliation || null,
        },
        include: { 
          papers: { orderBy: { id: "asc" } } 
        },
      });
      return updatedAuthor;
    } catch (error) {
      throw error;
    }
  },

  deleteAuthor: async (id) => {
    try {
      // TODO: Implement author deletion
      //
      // First check if author is sole author of any papers
      // If yes, throw error
      // If no, delete author
      // Use await prisma.author.delete()
      const author = await prisma.author.findUnique({
        where: { id: Number(id) },
        include: { papers: { include: { authors: true } } },
      });
      if (!author) {
        return "AuthorNotFound";
      }
      // 检查每篇论文是否仅有该作者
      const hasSingleAuthoredPaper = author.papers.some(
        (paper) => paper.authors.length === 1
      );
  
      if (hasSingleAuthoredPaper) {
        const error = new Error(
          "Cannot delete author: they are the only author of one or more papers"
        );
        error.name = "ConstraintError";
        throw error;
      }
      await prisma.author.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  ...dbOperations,
};

