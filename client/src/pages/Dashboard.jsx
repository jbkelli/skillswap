// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, swapRequestsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  console.log('Dashboard component rendered');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ skillsOffered: '', skillsWanted: '' });
  const [sendingRequest, setSendingRequest] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Always try to fetch users after login
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    console.log('fetchUsers called, user:', user);
    try {
      const response = await usersAPI.getUsers();
      console.log('API /users response:', response);
      // Add null check for user
      const otherUsers = response.data.data.users.filter(u => 
        user && u._id !== user._id // Check if user exists before accessing ._id
      );
      console.log('Filtered otherUsers:', otherUsers);
      setUsers(otherUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      // If error is invalid token, log out and redirect
      if (err.response?.data?.message?.toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setError('Failed to load users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (toUserId) => {
    setSendingRequest(toUserId);
    try {
      await swapRequestsAPI.sendRequest({ toUserId });
      setUsers(prev => prev.map(u => 
        u._id === toUserId ? { ...u, hasSentRequest: true } : u
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const filteredUsers = users.filter(otherUser => {
    const matchesOffered = filters.skillsOffered ? 
      otherUser.skillsOffered?.some(skill => 
        skill.toLowerCase().includes(filters.skillsOffered.toLowerCase())
      ) : true;
    
    const matchesWanted = filters.skillsWanted ? 
      otherUser.skillsWanted?.some(skill => 
        skill.toLowerCase().includes(filters.skillsWanted.toLowerCase())
      ) : true;

    return matchesOffered && matchesWanted;
  });


  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Prevent rendering anything while redirecting
  }

  if (loading) return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading users...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
      <button 
        onClick={fetchUsers}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );

  // In your Dashboard.jsx, modify the loading state:
if (!user) {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading user data...</p>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          window.location.reload();
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Reset Authentication
      </button>
    </div>
  );
}
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Find Your Skill Swap Partner</h1>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills Offered</label>
            <input
              type="text"
              placeholder="e.g., JavaScript, Guitar"
              value={filters.skillsOffered}
              onChange={(e) => setFilters(prev => ({ ...prev, skillsOffered: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills Wanted</label>
            <input
              type="text"
              placeholder="e.g., Cooking, Design"
              value={filters.skillsWanted}
              onChange={(e) => setFilters(prev => ({ ...prev, skillsWanted: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      
      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((otherUser) => (
          <div key={otherUser._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800">{otherUser.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{otherUser.bio || 'No bio yet'}</p>
            
            <div className="mb-4">
              <h4 className="font-medium text-blue-600 mb-2">Offers:</h4>
              <div className="flex flex-wrap gap-2">
                {otherUser.skillsOffered?.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-green-600 mb-2">Wants:</h4>
              <div className="flex flex-wrap gap-2">
                {otherUser.skillsWanted?.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSendRequest(otherUser._id)}
              disabled={sendingRequest === otherUser._id || otherUser.hasSentRequest}
              className={`w-full py-2 px-4 rounded-md ${
                otherUser.hasSentRequest 
                  ? 'bg-gray-400 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              {sendingRequest === otherUser._id ? 'Sending...' : 
               otherUser.hasSentRequest ? 'Request Sent' : 'Send Swap Request'}
            </button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg">No users found matching your filters.</p>
          <p>Try adjusting your search criteria.</p>
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Welcome to SkillSwap, {user.name}!</h2>
            <p className="text-gray-600 mb-4">
              You're the first user here! Share SkillSwap with others to start swapping skills.
            </p>
            <p className="text-sm text-gray-500">
              Complete your profile to be ready when others join.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;