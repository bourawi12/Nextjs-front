"use client";
import { logoutUser, getUserInfo, refreshToken } from "../../utils/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
	const [user, setUser] = useState(null);
	const router = useRouter();
	
	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (!token) {
		router.push('/login');
		return;
		}
		const loaduser = async () => {
		  try {
			const userData = await getUserInfo();
			console.log('Fetched user data:', userData);
			setUser(userData);
		  } catch (err) {
			console.error('Error loading profile:', err);
			setError('Failed to load profile');
		  }
		};
	
		loaduser();

		
	  }, [router]);

	

	const handleLogout = async () => {
		await logoutUser();
		router.push("/login");
	};

  const handleRefresh = async () => {
    await refreshToken();
  }
	return (
		<div className="min-h-screen bg-gray-100 items-center flex flex-col justify-center">
			<div className="bg-gray-600 p-8 flex flex-col rounded-lg">
			{user ? <h1>Hi, {user.owner.first_name}</h1> : <h1>Welcome stranger!</h1>}

			<button className="bg-blue-400 p-1 rounded-sm m-1" onClick={handleLogout}>Logout</button>
			
			<button className="bg-blue-400 p-1 rounded-sm m-1" onClick={handleRefresh}>refresh token</button>
			</div>
		</div>
	);
}