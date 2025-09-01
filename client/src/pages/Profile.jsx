// client/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { usersAPI, swapRequestsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import RequestManagement from '../components/RequestManagement';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('edit');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skillsOffered: [],
    skillsWanted: [],
    socialLinks: { instagram: '', telegram: '', twitter: '' }
  });
  const [currentSkillOffered, setCurrentSkillOffered] = useState('');
  const [currentSkillWanted, setCurrentSkillWanted] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        socialLinks: user.socialLinks || { instagram: '', telegram: '', twitter: '' }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platform]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = (type) => {
    const currentSkill = type === 'offered' ? currentSkillOffered : currentSkillWanted;
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    
    if (currentSkill.trim() && !formData[field].includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], currentSkill.trim()]
      }));
      if (type === 'offered') setCurrentSkillOffered('');
      else setCurrentSkillWanted('');
    }
  };

  const removeSkill = (type, skillToRemove) => {
    const field = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await usersAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'edit' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'requests' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Requests
        </button>
      </div>

      {activeTab === 'edit' ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (Similar form fields to Signup page, but for editing) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Skills Offered */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills You Offer</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={currentSkillOffered}
                  onChange={(e) => setCurrentSkillOffered(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addSkill('offered')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skillsOffered.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                    <button type="button" onClick={() => removeSkill('offered', skill)} className="ml-2">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills Wanted */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills You Want</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={currentSkillWanted}
                  onChange={(e) => setCurrentSkillWanted(e.target.value)}
                  placeholder="Add a skill"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addSkill('wanted')}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skillsWanted.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                    <button type="button" onClick={() => removeSkill('wanted', skill)} className="ml-2">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              <div className="space-y-2">
                <input type="text" name="social.instagram" value={formData.socialLinks.instagram} onChange={handleInputChange} placeholder="Instagram username" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" name="social.telegram" value={formData.socialLinks.telegram} onChange={handleInputChange} placeholder="Telegram username" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <input type="text" name="social.twitter" value={formData.socialLinks.twitter} onChange={handleInputChange} placeholder="Twitter username" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      ) : (
        <RequestManagement />
      )}
    </div>
  );
};

export default Profile;