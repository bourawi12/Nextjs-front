"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username || !password) {
			alert("Please fill in all fields.");
			return;
		}

		try {
			const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || "Login failed");
			}

			localStorage.setItem("access_token", data.access);
			localStorage.setItem("refresh_token", data.refresh);

			alert("Logged in successfully!");
			router.push("/"); // Redirect to homepage
		} catch (err) {
			console.error("Login error:", err);
			alert("Login failed.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
				<h2 className="text-xl font-semibold text-center">Login</h2>

				<input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full text-black p-2 border rounded" />

				<button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Login</button>
			</form>
		</div>
	);
}
