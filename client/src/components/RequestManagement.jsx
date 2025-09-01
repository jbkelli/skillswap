// client/src/components/RequestManagement.jsx
import { useState, useEffect } from 'react';
import { swapRequestsAPI } from '../utils/api';

const RequestManagement = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        swapRequestsAPI.getReceivedRequests(),
        swapRequestsAPI.getSentRequests()
      ]);
      setReceivedRequests(receivedRes.data.data.requests);
      setSentRequests(sentRes.data.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    setUpdatingRequest(requestId);
    try {
      const response = await swapRequestsAPI.updateRequest(requestId, status);
      // Update local state
      if (activeTab === 'received') {
        setReceivedRequests(prev => prev.map(req => 
          req._id === requestId ? response.data.data.request : req
        ));
      }
      await fetchRequests(); // Refresh to get updated data
    } catch (err) {
      console.error('Failed to update request:', err);
    } finally {
      setUpdatingRequest(null);
    }
  };

  if (loading) return <div className="text-center">Loading requests...</div>;

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'received' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received Requests ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sent' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {activeTab === 'received' 
            ? 'No pending requests' 
            : "You haven't sent any requests yet"}
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">
                    {activeTab === 'received' ? request.fromUser.name : request.toUser.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'received' ? 'Wants to learn from you' : 'You want to learn from'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>

              {request.message && (
                <p className="text-gray-700 mb-3">"{request.message}"</p>
              )}

              {activeTab === 'received' && request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateRequest(request._id, 'accepted')}
                    disabled={updatingRequest === request._id}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {updatingRequest === request._id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleUpdateRequest(request._id, 'rejected')}
                    disabled={updatingRequest === request._id}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {updatingRequest === request._id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-800">Connection Established! 🎉</p>
                  {activeTab === 'received' && request.fromUser.socialLinks && (
                    <div className="mt-2 text-sm">
                      <p>Contact {request.fromUser.name} via:</p>
                      <div className="flex gap-3 mt-1">
                        {request.fromUser.socialLinks.instagram && (
                          <a href={`https://instagram.com/${request.fromUser.socialLinks.instagram}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:text-blue-800">
                            Instagram
                          </a>
                        )}
                        {request.fromUser.socialLinks.telegram && (
                          <a href={`https://t.me/${request.fromUser.socialLinks.telegram}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:text-blue-800">
                            Telegram
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;