"use client";

import { Button } from "@/components/ui/button";
import { Author } from "@prisma/client";

interface PaperFormProps {
  action: (formData: FormData) => void;
  authors: Author[];
}

export function PaperForm({ action, authors }: PaperFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        {/* TODO: Add a text input for the title, styled with Tailwind */}
        <input
          type="text"
          id="title"
          name="title"
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="publishedIn" className="block text-sm font-medium">
          Published In
        </label>
        {/* TODO: Add a text input for the publication venue, styled with Tailwind */}
        <input
          type="text"
          id="publishedIn"
          name="publishedIn"
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="year" className="block text-sm font-medium">
          Year
        </label>
        {/* TODO: Add a number input for the publication year, styled with Tailwind */}
        <input
          type="number"
          id="year"
          name="year"
          className="border p-2 w-full"
          min="1901"
          required
        />
      </div>
      <div>
        <label htmlFor="authorIds" className="block text-sm font-medium">
          Authors
        </label>
        {/* TODO: Add a multi-select dropdown for authors using the `authors` prop.
            If no authors are available, display a disabled option:
            {authors.length === 0 ? (
              <option disabled>No authors available</option>
            ) : (
              // Render author options here
            )}
        */}
        <select
          multiple
          name="authorIds"
          id="authorIds"
          className="border p-2 w-full"
          data-testid="author-dropdown"
          required
        >
          {authors.length === 0 ? (
            <option disabled>No authors available</option>
          ) : (
            authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))
          )}
        </select>
      </div>
      <Button data-testid="create-paper-btn" type="submit">
        Create Paper
      </Button>
    </form>
  );
}
