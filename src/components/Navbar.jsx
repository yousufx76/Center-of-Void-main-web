import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from "../context/AuthContext" 
import { TEAM } from "../config/team"           
import logoImg from '../assets/logo.png'        

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Members', path: '/members' },
    { name: 'Gallery', path: '/gallery' },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <>
      <style>{`
        @keyframes aura-pulse {
          0% { text-shadow: 0 0 10px rgba(220, 38, 38, 0.4); }
          50% { text-shadow: 0 0 25px rgba(220, 38, 38, 0.9), 0 0 10px rgba(220, 38, 38, 0.4); }
          100% { text-shadow: 0 0 10px rgba(220, 38, 38, 0.4); }
        }
        .aura-text { animation: aura-pulse 3s infinite ease-in-out; }
      `}</style>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        isScrolled
          ? 'py-4 backdrop-blur-2xl bg-black/40 border-b border-crimson/20'
          : 'py-8 bg-transparent'
      }`}>

        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Logo"
              className="h-10 w-auto object-contain brightness-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            />
            <span className="hidden sm:block text-white font-black tracking-tighter text-xl italic uppercase">
              {TEAM.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-10 items-center">
            
            <div className="relative group">
              <span className="aura-text text-[13px] font-black uppercase tracking-[0.4em] text-crimson pr-6 border-r border-white/10">
                VOID
              </span>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 py-1 ${
                  location.pathname === item.path
                    ? 'text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-crimson transition-all duration-500 shadow-[0_0_10px_#DC143C] ${
                  location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}

            {user ? (
              <button
                onClick={logout}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-crimson transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 border border-crimson/40 text-crimson hover:bg-crimson hover:text-white rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                Login
              </Link>
            )}

          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden absolute top-20 left-4 right-4 rounded-3xl bg-black/90 backdrop-blur-3xl border border-white/5 overflow-hidden shadow-2xl transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="flex flex-col px-8 py-10 gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-xl font-black uppercase tracking-[0.2em] transition-colors ${
                  location.pathname === item.path ? 'text-crimson' : 'text-white/40'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="w-full h-[1px] bg-white/5" />

            {user ? (
              <button 
                onClick={() => { logout(); setIsOpen(false); }} 
                className="text-left text-white/20 font-bold uppercase tracking-widest"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-5 bg-crimson text-white rounded-2xl text-center font-black uppercase tracking-widest"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}