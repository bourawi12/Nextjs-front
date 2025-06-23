// src/app/profile/page.js

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '../../../utils/auth'; 

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load profile if token exists
    const loadProfile = async () => {
      try {
        const userData = await getUserInfo();
        console.log('Fetched user data:', userData);
        setProfile(userData);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      }
    };

    loadProfile();
  }, [router]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p className="mb-2"><strong>Name:</strong> {profile.owner.first_name} {profile.owner.last_name}</p>
      <p className="mb-2"><strong>Email:</strong> {profile.owner.email}</p>
      <p className="mb-2"><strong>Position:</strong> {profile.position}</p>
      <p className="mb-2"><strong>Bio:</strong> {profile.bio}</p>
    </div>
  );
};

export default ProfilePage;
