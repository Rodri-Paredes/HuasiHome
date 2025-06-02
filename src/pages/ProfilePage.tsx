import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProperties } from '../hooks/useProperties';
import { User, LogOut, Heart, Home } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getDatabase, ref, get } from 'firebase/database';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { properties, loading, favoritedProperties} = useProperties();
  const [activeTab, setActiveTab] = useState<'profile' | 'myProperties'>('profile');
  const [userDisplayName, setUserDisplayName] = useState('');

  // Get user's properties
  const userProperties = properties.filter(property => property.ownerId === user?.id);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.id) return;
      const db = getDatabase();
      const userRef = ref(db, `users/${user.id}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserDisplayName(data.displayName || '');
      }
    };
    fetchDisplayName();
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 text-center border-b border-secondary-200">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary-500 p-3 rounded-full inline-flex">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold">{userDisplayName}</h2>
                <p className="text-secondary-500">{user.email}</p>
              </div>
              
              <div className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                        activeTab === 'profile' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Información personal
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('myProperties')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                        activeTab === 'myProperties' 
                          ? 'bg-primary-50 text-primary-600' 
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Mis propiedades
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center text-secondary-700 hover:bg-secondary-50"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Información personal</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-secondary-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={userDisplayName || ''}
                      readOnly
                      className="input bg-secondary-50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={user.email || ''}
                      readOnly
                      className="input bg-secondary-50"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Estadísticas</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-3 rounded-full">
                            <Home className="h-6 w-6 text-primary-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-secondary-500">Propiedades publicadas</p>
                            <p className="text-xl font-semibold">{userProperties.length}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-3 rounded-full">
                            <Heart className="h-6 w-6 text-primary-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-secondary-500">Favoritos guardados</p>
                            <p className="text-xl font-semibold">{favoritedProperties?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'myProperties' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mis propiedades</h2>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : userProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-secondary-50 rounded-lg p-6 text-center">
                    <Home className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-800">No has publicado propiedades</h3>
                    <p className="mt-2 text-secondary-600">
                      Comienza a vender o alquilar propiedades publicando tu primer anuncio.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;