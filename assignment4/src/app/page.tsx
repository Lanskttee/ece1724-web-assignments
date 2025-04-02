import Link from "next/link";
import { Suspense } from "react";
import PaperList from "@/components/PaperList";
import { Paper } from "@prisma/client";

async function getPapers(): Promise<{
  papers: (Paper & { authors: { name: string }[] })[];
  error: string | null;
}> {
  try {
    // TODO: Fetch papers from /api/papers endpoint
    // const res = await fetch("/api/papers");
    // const res = await fetch("/api/papers", { cache: "no-store" });
  

    // 改为使用完整 URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/papers`, { cache: "no-store" });

    console.log("API response:", res);


    if (!res.ok) {
      throw new Error("Failed to fetch papers");
    }
    const papers = await res.json();

    console.log("Fetched papers:", papers);


    return { papers, error: null };
  } catch {
    
    return { papers: [], error: "Error loading papers" };
  }
}

async function PapersSection() {
  const { papers, error } = await getPapers();
  // TODO: Render papers or an error message based on getPapers() result
  console.error(error); 
  if (error) {
    return (
      <p data-testid="papers-error" className="text-sm">
        {error}
      </p>
    );
  }
  if (!papers || papers.length === 0) {
    return <p>No papers found</p>;
  }
 
  return <PaperList papers={papers} />;
}

export default async function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Paper Management System</h1>
      <nav className="space-x-4">
        <Link href="/papers/create" className="text-blue-500 underline">
          Create New Paper
        </Link>
        <Link href="/authors/create" className="text-blue-500 underline">
          Create New Author
        </Link>
      </nav>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Papers</h2>
        {/* TODO: Implement Suspense to handle loading states
         */}
        <Suspense fallback={<p>Loading papers...</p>}>
          <PapersSection />
        </Suspense>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
