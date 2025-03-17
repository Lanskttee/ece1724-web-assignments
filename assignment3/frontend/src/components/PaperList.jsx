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
    // fetch("http://localhost:3000/api/papers")
    fetch("/api/papers")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error loading papers");
        }
        return res.json();
      })
      .then((data) => {
        
        setPapers(data.papers || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading papers");
        setLoading(false);
        // setPapers([]);
        // setLoading(false);
      });
    
  }, []);
  // console.log(papers);

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
        const res = await fetch(`/api/papers/${paperId}`, {
          //发现绝对路径有cors错误
          // const res = await fetch(`http://localhost:3000/api/papers/${paperId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          setMessage("Error deleting paper");
        } else {
          // 移除删除的论文
          setPapers((prevPapers) =>
            prevPapers.filter((paper) => paper.id !== paperId)
          );
          setMessage("Paper deleted successfully");

          // 3s
          setTimeout(() => {
            setMessage(null);
          }, 3000);
        }
      } catch (error) {
        setMessage("Error deleting paper");
      }
    }
  };

  if (loading) return <div>Loading papers...</div>;
  if (error) return <div>Error loading papers</div>;
  if (!papers || papers.length === 0) return <div>No papers found</div>;

  return (
    <div className={styles.container}>
      {message && <div>{message}</div>}
      {papers.map((paper) => (
        <div key={paper.id} className={styles.paper}>
          <h3 className={styles.paperTitle}>{paper.title}</h3>
          <p>
            Published in {paper.publishedIn}, {paper.year}
          </p>
          <p>
            Authors: {paper.authors.map((author) => author.name).join(", ")}
          </p>
          <button onClick={() => navigate(`/edit/${paper.id}`)}>Edit</button>
          <button onClick={() => handleDelete(paper.id, paper.title)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default PaperList;
