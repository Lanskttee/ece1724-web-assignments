import prisma from "@/lib/prisma";
import { Author } from "@prisma/client";
import CreatePaperForm from "@/components/CreatePaperForm";

async function getAuthors(): Promise<Author[]> {
  // TODO: Fetch authors from Prisma, sorted by id ascending
  // return prisma.author.findMany({
  //   orderBy: { id: "asc" },
  // });
  try {
    // Fetch authors from Prisma, sorted by id ascending
    return await prisma.author.findMany({
      orderBy: { id: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch authors:", error);
    return []; // 返回空数组而不是抛出错误
  }
}

export default async function CreatePaper() {
  const authors = await getAuthors();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Paper</h1>
      <CreatePaperForm authors={authors} />
    </div>
  );
}
