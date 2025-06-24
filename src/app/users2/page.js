
'use client';

import React, { useState, useEffect  } from 'react';
import { User, Edit2, Mail, Calendar, Briefcase, Users, FileText } from 'lucide-react';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/navigation';

const UserProfilesApp = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  
  const getCurrentUser = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { 
        id: payload.user_id, 
        username: payload.username 
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setError('Please login to access profiles.');
      setLoading(false);
      return;
    }
    
    setCurrentUser(user);
    fetchProfiles();
  }, []);

  
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch('http://127.0.0.1:8000/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/profiles/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        
        const refreshed = await refreshToken();
        if (refreshed) {
          
          return fetchProfiles();
        } else {
          setError('Authentication expired. Please login again.');
          setLoading(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfiles(data.results);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profiles: ' + err.message);
      setLoading(false);
    }
  };
  const fetchSkillsperuser = async (userId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    setError('No authentication token found. Please login.');
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/profiles/${userId}/skills/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return fetchSkillsperuser(userId); // retry
      } else {
        setError('Authentication expired. Please login again.');
        return;
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch skills');
    }

    const skillsData = await response.json();

    // Update the selected user with their skills
    setSelectedUser((prevUser) => ({
      ...prevUser,
      skills: skillsData // Assuming this is an array of skills
    }));

  } catch (err) {
    setError('Failed to fetch skills: ' + err.message);
  }
};

const handleDeleteSkill = async (skillId) => {
  console.log("i'm in handleDeleteSkill", skillId, selectedUser);
  if (!isCurrentUser(selectedUser)) return;
  
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found. Please login.');
      return;
    }

    const response = await fetch(`http://127.0.0.1:8000/api/skills/${skillId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return handleDeleteSkill(skillId); // retry
      } else {
        setError('Authentication expired. Please login again.');
        return;
      }
    }

    if (!response.ok) {
      throw new Error('Failed to delete skill');
    }

    // Remove the skill from the UI
    setSelectedUser((prevUser) => ({
      ...prevUser,
      skills: prevUser.skills.filter((skill) => skill.id !== skillId)
    }));

  } catch (err) {
    setError('Failed to delete skill: ' + err.message);
  }
};



  const handleUserClick = (profile) => {
  if (!profile || !profile.id) {
    console.error('Invalid profile selected:', profile);
    return;
  }

  setSelectedUser(profile);
  setIsEditing(false);
  fetchSkillsperuser(profile.id);
};


  const handleEditClick = () => {
    setEditForm({
      first_name: selectedUser.owner.first_name,
      last_name: selectedUser.owner.last_name,
      email: selectedUser.owner.email,
      bio: selectedUser.bio,
      position: selectedUser.position
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setError('No authentication token found. Please login.');
      return;
    }

    const response = await fetch(`http://127.0.0.1:8000/api/profiles/${selectedUser.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bio: editForm.bio,
        position: editForm.position
      })
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return handleSaveEdit();
      } else {
        setError('Authentication expired. Please login again.');
        return;
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    const updatedProfile = await response.json();
    
     
    updatedProfile.owner = selectedUser.owner;
    
    const updatedProfiles = profiles.map(profile => {
      if (profile.id === selectedUser.id) {
        return updatedProfile;
      }
      return profile;
    });
  
    setProfiles(updatedProfiles);
    setSelectedUser(updatedProfile);
    setIsEditing(false);
    
  } catch (err) {
    setError('Failed to update profile: ' + err.message);
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  

  const isCurrentUser = (profile) => {
    return currentUser && profile.owner.id === currentUser.id;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Team Profiles</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Users List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                All Users ({profiles.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleUserClick(profile)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUser?.id === profile.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile.owner.first_name} {profile.owner.last_name}
                        {isCurrentUser(profile) && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{profile.position}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <FileText className="h-3 w-3 mr-1" />
                        {profile.skills_count} skills  • {profile.projects_count} projects 
                      </div>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow-md">
            {selectedUser ? (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
                    {isCurrentUser(selectedUser) && !isEditing && (
                      <button
                        onClick={handleEditClick}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedUser.owner.first_name} {selectedUser.owner.last_name}
                          </h3>
                          <p className="text-gray-600">@{selectedUser.owner.username}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{selectedUser.owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{selectedUser.position}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">
                            Joined {formatDate(selectedUser.joined_at)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Bio</h4>
                        <p className="text-gray-700 leading-relaxed">{selectedUser.bio}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedUser.skills_count}</div>
                          <div className="text-sm text-blue-800">Skills</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedUser.projects_count}</div>
                          <div className="text-sm text-green-800" onClick={() => router.push('/skills')}>Projects</div>
                        </div>
                      </div>
                     <div>
  <h4 className="text-lg font-semibold text-gray-900 mb-2">Skills</h4>
  <div className="flex flex-wrap gap-2">
    
    {selectedUser.skills && selectedUser.skills.length > 0 ? (
  selectedUser.skills.map((skill, index) => {
    return (
      <span
        key={skill.id || index}
        className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-3 py-1 rounded-full flex items-center"
      >
        {skill.name} 
        
          <button
            onClick={() => handleDeleteSkill(skill.id)}
            className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
          >
            ×
          </button>
        
      </span>
    );
  })
) : (
  <p className="text-gray-600">No skills available</p>
)}

  </div>
</div>


                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a user to view their details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default UserProfilesApp;