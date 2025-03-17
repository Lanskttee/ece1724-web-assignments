// This component renders a form for creating or editing a paper

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthorSelect from "./AuthorSelect";
import styles from "../styles/PaperForm.module.css";

function PaperForm({ paper, onSubmit }) {
  // paper prop will be undefined for create, or contain paper data for edit
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: paper?.title || "",
    publishedIn: paper?.publishedIn || "",
    year: paper?.year || new Date().getFullYear(),
    // year: paper?.year || "",
    authorIds: paper?.authors?.map((author) => author.id) || [],
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting paper:", formData);

    // TODO: Validate form data
    // Show appropriate error messages for:
    // - "Title is required"
    // - "Publication venue is required"
    // - "Publication year is required"
    // - "Valid year after 1900 is required"
    // - "Please select at least one author"
    // Note: Display only the first error encountered and stop checking further
    setError(null);
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.publishedIn.trim()) {
      setError("Publication venue is required");
      return;
    }
    if (!formData.year) {
      setError("Publication year is required");
      return;
    }
    if (isNaN(formData.year) || formData.year < 1901) {
      setError("Valid year after 1900 is required");
      return;
    }
    if (!formData.authorIds || formData.authorIds.length === 0) {
      setError("Please select at least one author");
      return;
    }

    // TODO: Call onSubmit(formData) if validation passes
    

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(paper ? "Error updating paper" : "Error creating paper");
    }

  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Convert year value to number since backend expects a number
      // and we need to do numerical comparison for validation
      // Other fields can remain as strings
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="publishedIn">Published In:</label>
        <input
          type="text"
          id="publishedIn"
          name="publishedIn"
          value={formData.publishedIn}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="year">Year:</label>
        <input
          type="number"
          id="year"
          name="year"
          value={formData.year}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Authors:</label>
        <AuthorSelect
          selectedAuthorIds={formData.authorIds}
          onChange={(authorIds) =>
            setFormData((prev) => ({ ...prev, authorIds }))
          }
        />
      </div>

      <div>
        <button type="submit">{paper ? "Update Paper" : "Create Paper"}</button>
        {paper && ( // Only show Cancel button in edit mode
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default PaperForm;
