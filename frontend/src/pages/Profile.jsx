import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentSubscription, getSubscriptionHistory } from '../api/subscriptionApi';
import { getImageUrl } from '../utils/imageHelper';
import './Profile.css';

function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile Update State
  const [name, setName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture ? getImageUrl(user.profilePicture) : null);
  const [profileMsg, setProfileMsg] = useState('');
  const fileInputRef = useRef(null);

  // Subscription State
  const [currentSub, setCurrentSub] = useState(null);
  const [subHistory, setSubHistory] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoadingSub(true);
      const currentRes = await getCurrentSubscription();
      if (currentRes.success && currentRes.data) {
        setCurrentSub(currentRes.data);
      }
    } catch (error) {
      // 404 means no active subscription
      console.log("No current subscription");
    }

    try {
      const historyRes = await getSubscriptionHistory();
      if (historyRes.success && historyRes.data) {
        setSubHistory(historyRes.data);
      }
    } catch (error) {
      console.error("Failed to load subscription history", error);
    } finally {
      setLoadingSub(false);
    }
  };

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    const formData = new FormData();
    formData.append('name', name);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const res = await updateProfile(formData);
    setProfileMsg(res.message);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    if (newPassword !== confirmPassword) {
      setPwdMsg('New passwords do not match');
      return;
    }
    const res = await changePassword(oldPassword, newPassword);
    setPwdMsg(res.message);
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <div className="profile-section">
        <h3>Update Profile</h3>
        {profileMsg && <p className="msg">{profileMsg}</p>}
        <div className="profile-forms-split">
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <h4>Profile Picture</h4>
            <div className="form-group avatar-group">
              <div className="avatar-preview" onClick={() => fileInputRef.current.click()}>
                {preview ? (
                  <img src={preview} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">Upload</div>
                )}
              </div>
              <button type="button" className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ marginTop: '0.5rem' }}>
                Select Image
              </button>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }}
              />
            </div>
            <button type="submit" className="btn-primary">Update Profile Picture</button>
          </form>
          
          <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <h4>Profile Details</h4>
            <div className="form-group">
              <label>Email (Read-only)</label>
              <input type="email" value={user?.email || ''} readOnly disabled />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn-primary">Update Name</button>
          </form>
        </div>
      </div>

      <div className="profile-section">
        <h3>Change Password</h3>
        {pwdMsg && <p className="msg">{pwdMsg}</p>}
        <form onSubmit={handlePasswordSubmit} className="profile-form">
          <div className="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-secondary">Change Password</button>
        </form>
      </div>

      <div className="profile-section">
        <h3>My Subscription</h3>
        {loadingSub ? (
          <p>Loading subscription details...</p>
        ) : (
          <div>
            <h4>My Coins</h4>
            <div style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Current Balance</div>
              <div style={{ fontSize: '3rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span role="img" aria-label="coin" style={{ fontSize: '2.5rem' }}>🪙</span>
                {currentSub ? currentSub.remainingTokens : 0}
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>
                {currentSub ? `Out of ${currentSub.allocatedTokens} total tokens in your active plan` : 'Subscribe to a plan to get coins'}
              </p>
            </div>

            <h4>Active Plan</h4>
            {currentSub ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <p><strong>Status:</strong> <span style={{ color: currentSub.status === 'ACTIVE' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>{currentSub.status}</span></p>
                <p><strong>Valid Until:</strong> {new Date(currentSub.endDate).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="mb-6 text-gray-500 dark:text-gray-400">You do not have an active subscription.</p>
            )}

            <h4>Subscription History</h4>
            {subHistory.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th className="p-3 border-b border-gray-200 dark:border-gray-600">Plan ID</th>
                      <th className="p-3 border-b border-gray-200 dark:border-gray-600">Status</th>
                      <th className="p-3 border-b border-gray-200 dark:border-gray-600">Start Date</th>
                      <th className="p-3 border-b border-gray-200 dark:border-gray-600">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subHistory.map(sub => (
                      <tr key={sub.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="p-3">{sub.subscriptionPlanId}</td>
                        <td className="p-3">{sub.status}</td>
                        <td className="p-3">{new Date(sub.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(sub.endDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No past subscriptions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
