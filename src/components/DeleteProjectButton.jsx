"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function DeleteProjectButton({ projectId }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  // ... (inside DeleteProjectButton component)

const deleteProject = async () => {
    const BACKEND_BASE_URL = "http://127.0.0.1:8000";
    const accessToken = localStorage.getItem('access_token'); // Make sure this actually retrieves a valid token

    if (!accessToken) {
        alert("You are not logged in. Please log in first.");
        router.push("/login"); // Or handle as appropriate
        return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/projects/${projectId}/`, { // Ensure trailing slash!
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json', // Add this
            'Authorization': `Bearer ${accessToken}` // THIS IS THE MOST IMPORTANT PART
        }
      });

      if (res.ok) {
        router.push("/users2");
      } else {
        // Log more details if not OK
        alert("Failed to delete the project. Status: " + res.status);
        const errorDetails = await res.text(); // Get text if JSON parsing fails
        console.error("Failed response status:", res.status);
        console.error("Failed response body:", errorDetails);
      }
    } catch (error) {
      alert("Error deleting the project.");
      console.error("Fetch error:", error);
    }
  };

  return (
    <>
      <button
        onClick={deleteProject}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete this project
      </button>
    </>
  );
}

export default DeleteProjectButton;
