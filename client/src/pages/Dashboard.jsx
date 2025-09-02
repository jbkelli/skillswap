// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { usersAPI, swapRequestsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ skillsOffered: '', skillsWanted: '' });
  const [sendingRequest, setSendingRequest] = useState(null);
  const [acceptedRequests, setAcceptedRequests] = useState([]); // Track accepted requests
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading || !user) {
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

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchAcceptedRequests();
    }
  }, [user]);

  // Refetch accepted requests after any update
  const handleUpdateRequest = async (requestId, status) => {
    try {
      await swapRequestsAPI.updateRequest(requestId, status);
      await fetchAcceptedRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    }
  };

  const fetchUsers = async () => {
    if (!user) return; // Prevent running if user is not defined
    try {
    const response = await usersAPI.getUsers();
    const allUsers = response.data.data.users;

    console.log('Fetched users:', allUsers); // ✅ confirm in DevTools
    setUsers(allUsers); // ✅ show everyone, including yourself
  } catch (err) {
    console.error('Failed to load users:', err);
    setError('Failed to load users: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  // Fetch accepted swap requests
  const fetchAcceptedRequests = async () => {
    try {
      const sentRes = await swapRequestsAPI.getSentRequests();
      const receivedRes = await swapRequestsAPI.getReceivedRequests();
      console.log('Sent Requests:', sentRes.data.data.requests);
      console.log('Received Requests:', receivedRes.data.data.requests);
      // Only keep accepted requests
      const accepted = [
        ...sentRes.data.data.requests.filter(r => r.status === 'accepted'),
        ...receivedRes.data.data.requests.filter(r => r.status === 'accepted')
      ];
      console.log('Accepted Requests:', accepted);
      setAcceptedRequests(accepted);
    } catch (err) {
      console.error('Error fetching accepted requests:', err);
      // Don't block dashboard if this fails
    }
  };

  const handleSendRequest = async (toUserId) => {
    setSendingRequest(toUserId);
    try {
      await swapRequestsAPI.sendRequest({ toUserId });
      setUsers(prev => prev.map(u => 
        u._id === toUserId ? { ...u, hasSentRequest: true } : u
      ));
      // Refetch accepted requests after sending
      setAcceptedRequests(prev => [...prev, response.data.data.request]);

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

  // Show loading until user data is available
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
  
  if (loading) return <div className="text-center py-8">Loading users...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  // Debug: log acceptedRequests on every render
  console.log('Dashboard Render - acceptedRequests:', acceptedRequests);
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
            {/* Show contact info if swap request is accepted */}
            {(() => {
              // Defensive: ensure user is defined before referencing
              if (!user) return null;
              // Find if there's an accepted request between current user and this other user
              const accepted = acceptedRequests.find(r =>
                (r.fromUser._id === user._id && r.toUser._id === otherUser._id) ||
                (r.toUser._id === user._id && r.fromUser._id === otherUser._id)
              );
              if (accepted) {
                // Show contact info
                const contactUser = accepted.fromUser._id === user._id ? accepted.toUser : accepted.fromUser;
                return (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-blue-800">Contact Info:</p>
                    {contactUser.phone && (
                      <p className="text-sm">Phone: {contactUser.phone}</p>
                    )}
                    {contactUser.socialLinks && (
                      <div className="mt-2 text-sm">
                        <p>Social Links:</p>
                        <ul className="list-disc ml-4">
                          {contactUser.socialLinks.instagram && (
                            <li><a href={`https://instagram.com/${contactUser.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Instagram</a></li>
                          )}
                          {contactUser.socialLinks.telegram && (
                            <li><a href={`https://t.me/${contactUser.socialLinks.telegram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Telegram</a></li>
                          )}
                          {contactUser.socialLinks.twitter && (
                            <li><a href={`https://twitter.com/${contactUser.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Twitter</a></li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              // Otherwise, show request button
              return (
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
              );
            })()}
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