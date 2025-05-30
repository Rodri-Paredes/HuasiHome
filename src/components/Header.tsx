import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Heart, Plus, User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-primary-500 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6" />
            <span className="text-xl font-bold">HuasiHome</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/map" 
              className={`flex items-center space-x-1 hover:text-primary-200 transition-colors ${isActive('/map') ? 'font-medium' : ''}`}
            >
              <MapPin className="h-5 w-5" />
              <span>Mapa</span>
            </Link>
            <Link 
              to="/favorites" 
              className={`flex items-center space-x-1 hover:text-primary-200 transition-colors ${isActive('/favorites') ? 'font-medium' : ''}`}
            >
              <Heart className="h-5 w-5" />
              <span>Favoritos</span>
            </Link>
            <Link 
              to="/list-property" 
              className={`flex items-center space-x-1 hover:text-primary-200 transition-colors ${isActive('/list-property') ? 'font-medium' : ''}`}
            >
              <Plus className="h-5 w-5" />
              <span>Publicar</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center space-x-1 hover:text-primary-200 transition-colors ${isActive('/profile') ? 'font-medium' : ''}`}
            >
              <User className="h-5 w-5" />
              <span>Perfil</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:text-primary-200 transition-colors ml-4"
            >
              <LogOut className="h-5 w-5" />
              <span>Salir</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-primary-600 focus:outline-none"
            onClick={toggleMenu}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-primary-500 pb-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 px-4">
            <Link 
              to="/map" 
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-primary-600 ${isActive('/map') ? 'bg-primary-600' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <MapPin className="h-5 w-5" />
              <span>Mapa</span>
            </Link>
            <Link 
              to="/favorites" 
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-primary-600 ${isActive('/favorites') ? 'bg-primary-600' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Heart className="h-5 w-5" />
              <span>Favoritos</span>
            </Link>
            <Link 
              to="/list-property" 
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-primary-600 ${isActive('/list-property') ? 'bg-primary-600' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Plus className="h-5 w-5" />
              <span>Publicar</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-primary-600 ${isActive('/profile') ? 'bg-primary-600' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Perfil</span>
            </Link>
            <button 
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-primary-600 text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;