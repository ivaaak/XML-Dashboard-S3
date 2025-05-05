import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import './UserProfile.css';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [subscribe, setSubscribe] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'age':
        setAge(value);
        break;
      case 'subscribe':
        setSubscribe(value === 'true');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div>
        <div className="container">
          {isAuthenticated && (
            <div>
              <h2>Welcome, {user?.name?.split('@')[0]}</h2>
              <p>{user?.email}</p>
            </div>
          )}
          <div className="content">

            <div>
              <h2>Profile Settings</h2>
              <input type="text" name="profileName" placeholder="Profile Name" />
              <br />
              <input type="email" name="profileEmail" placeholder="Profile Email" />
            </div>
            <div>
              <h2>Notifications Settings</h2>
              <input type="checkbox" name="subscribe" checked={subscribe} onChange={handleInputChange} />
              <label>Subscribe to newsletter</label>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Profile;