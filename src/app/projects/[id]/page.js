
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DeleteProjectButton from "../../../components/DeleteProjectButton";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://127.0.0.1:8000/api/projects/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Failed to fetch project details"
          );
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading project details...</p>
      </div>
    );
  }

  const handleDeleteClick = () => {
  const confirmDelete = window.confirm("Are you sure you want to delete this project?");
  
  if (confirmDelete) {
    handleDeleteProject();
  }
};
const handleDeleteProject = async () => {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete project");
    }

    alert("Project deleted successfully!");
    router.push(`/profile/${userId}`); // Redirect back to user's profile or project list
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            {project.title}
          </h1>

          <p className="text-gray-700 leading-relaxed text-center">
            {project.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Technologies Used
              </h4>
              <p className="text-gray-600">{project.technologies_used}</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Project Duration
              </h4>
              <p className="text-gray-600">
                {project.start_date} to {project.end_date}
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Project URL
              </h4>
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-words"
              >
                {project.project_url}
              </a>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Project Owner
              </h4>
              <p className="text-gray-600">Profile ID: {project.profile}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              onClick={() => router.back()}
            >
              Go Back
            </button>

            <button
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              onClick={() =>
                router.push(`/projects/${id}/edit?userId=${userId}`)
              }
            >
              Edit Project
            </button>

            <DeleteProjectButton projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
