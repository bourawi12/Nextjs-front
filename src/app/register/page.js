"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
	const router = useRouter();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!username ||
			!email ||
			!firstName ||
			!lastName ||
			!password ||
			!passwordConfirm
		) {
			alert("Please fill in all fields.");
			return;
		}

		if (password !== passwordConfirm) {
			alert("Passwords do not match.");
			return;
		}

		try {
			const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username,
					email,
					first_name: firstName,
					last_name: lastName,
					password,
					password_confirm: passwordConfirm,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(JSON.stringify(data));
			}

			alert("User created successfully!");
			router.push("/login"); // Redirect to login page
		} catch (err) {
			console.error("Registration failed:", err);
			alert("Oops! Something went wrong.");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
				<h2 className="text-xl font-semibold text-center">Register</h2>

				<input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full text-black p-2 border rounded" />
				<input type="password" placeholder="Confirm Password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full text-black p-2 border rounded" />

				<button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Register</button>
			</form>
		</div>
	);
}
