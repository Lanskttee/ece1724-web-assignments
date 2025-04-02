// This component displays a list of papers with edit and delete buttons

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/PaperList.module.css";

function PaperList() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // TODO: Fetch papers from the API when component mounts
  // 1. Use fetch() to GET /api/papers
  // 2. If successful: Set papers data and clear loading
  // 3. If fails (e.g., network error or server error): Set error to "Error loading papers", clear loading
  useEffect(() => {
    // Implementation here
    const fetchPapers = async () => {
      try {
        const response = await fetch("/api/papers");

        if (!response.ok) {
          throw new Error("Failed to fetch papers");
        }

        const papersData = await response.json();
        setPapers(Array.isArray(papersData) ? papersData : []);
      } catch (error) {
        console.error('Error fetching papers:', error);
        setPapers([]);
        setError("Error loading papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const handleDelete = async (paperId, paperTitle) => {
    // TODO: Implement delete functionality
    // 1. Show the browser's built-in confirmation dialog using `confirm()`:
    //    - This will show a dialog with "OK" and "Cancel" buttons
    //    - Example: if (confirm(`Are you sure you want to delete "${paperTitle}"?`))
    // 2. If user clicks "OK":
    //    - Send DELETE request to /api/papers/${paperId}
    //    - Remove paper from list if successful
    //    - Set message to "Paper deleted successfully"
    // 3. If deletion fails:
    //    - Set message to "Error deleting paper"
    // 4. If user clicks "Cancel":
    //    - Do nothing (dialog will close automatically)
    if (confirm(`Are you sure you want to delete "${paperTitle}"?`)) {
      try {
        const response = await fetch(`/api/papers/${paperId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete paper');
        }

        // Remove the paper from the list immediately
        setPapers((prevPapers) => prevPapers.filter((paper) => paper.id !== paperId));
        
        // Show success message
        setMessage("Paper deleted successfully");
        
        // Clear the message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } catch (error) {
        console.error('Error deleting paper:', error);
        setMessage("Error deleting paper");
      }
    }
  };

  
  if (loading) return <div>Loading papers...</div>;
  if (error) return <div>Error loading papers</div>;
  if (papers.length === 0) return <div>No papers found</div>;

  return (
    <div className={styles.container}>
      {message && <div>{message}</div>}
      {papers.length > 0 ? (
        papers.map((paper) => (
          <div key={paper.id} className={styles.paper}>
            <h3 className={styles.paperTitle}>{paper.title}</h3>
            <p>Published in {paper.publishedIn}, {paper.year}</p>
            <p>
              Authors: {paper.authors?.map((author) => author.name).join(", ") || "Unknown"}
            </p>
            <button onClick={() => navigate(`/edit/${paper.id}`)}>Edit</button>
            <button onClick={() => handleDelete(paper.id, paper.title)}>Delete</button>
          </div>
        ))
      ) : (
        <div>No papers found</div>
      )}
    </div>
  );
}

export default PaperList;
