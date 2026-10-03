import {
  Menu,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
function Header({ variant = "home" }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)
  
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  )

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.dispatchEvent(new Event("userChanged"));

  setIsLoggedIn(false);
  setIsOpen(false);
}

  return (
    <header className='sticky top-0 z-50 w-full border-b border-slate-200 bg-slate-50/90 transition-colors dark:border-slate-800 dark:bg-slate-950/90 dark:backdrop-blur-md'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'>
        <Link to='/' className='flex items-center'>
          <img
            src='/images/Logo.png'
            alt="Study Assistant Logo"
            className="h-8 w-40 rounded-xl object-cover"
          />
        </Link>
        {/* Desktop Nav Links */}
<div className='hidden items-center gap-6 font-medium text-slate-700 transition-colors dark:text-slate-300 md:flex'>

  <Link 
    to='/'
    className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
  >
    Home
  </Link>

  {variant === "home" && (
    <>
      <a 
        href='#features'
        className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
      >
        Features
      </a>

      <a 
        href='#how-it-works'
        className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
      >
        How it works
      </a>
    </>
  )}

</div>

        {/* Desktop Auth Buttons */}
        <div className='hidden items-center gap-3 md:flex'>
          {isLoggedIn ? (
            <>
              <Link
                to='/dashboard'
                className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              >
                Dashboard
              </Link>

              <button
                type='button'
                onClick={handleLogout}
                className='rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              >
                Login
              </Link>

              <Link
                to='/signup'
                className='rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className='flex md:hidden'>
          <button
            onClick={toggleMenu}
            type='button'
            className='inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-200/60 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-800'
            aria-label='Toggle Menu'
          >
            {isOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </nav>

      
{/* Mobile Dropdown Menu */}
{isOpen && (
  <div className='border-b border-slate-200 bg-slate-50 px-4 pb-6 pt-2 transition-colors dark:border-slate-800 dark:bg-slate-900 md:hidden'>
    
    <div className='flex flex-col space-y-3 font-medium text-slate-700 dark:text-slate-300'>

      {/* Home */}
      <Link
        to='/'
        onClick={() => setIsOpen(false)}
        className='rounded-md px-3 py-2 transition-colors hover:bg-slate-200/50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400'
      >
        Home
      </Link>

      {/* Home Page Navigation */}
      {variant === "home" && (
        <>
          <a
            href='#features'
            onClick={() => setIsOpen(false)}
            className='rounded-md px-3 py-2 transition-colors hover:bg-slate-200/50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400'
          >
            Features
          </a>

          <a
            href='#how-it-works'
            onClick={() => setIsOpen(false)}
            className='rounded-md px-3 py-2 transition-colors hover:bg-slate-200/50 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400'
          >
            How it works
          </a>
        </>
      )}

      <hr className='my-2 border-slate-200 dark:border-slate-800' />

      {/* Mobile Auth Actions */}
      <div className='flex flex-col gap-2 pt-1'>

        {isLoggedIn ? (
          <>
            <Link
              to='/dashboard'
              onClick={() => setIsOpen(false)}
              className='w-full rounded-lg border border-slate-300 bg-white py-2 text-center text-sm font-bold text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              Dashboard
            </Link>

            <button
              type='button'
              onClick={handleLogout}
              className='w-full rounded-lg bg-red-600 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to='/login'
              onClick={() => setIsOpen(false)}
              className='w-full rounded-lg border border-slate-300 bg-white py-2 text-center text-sm font-bold text-slate-700 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              Login
            </Link>

            <Link
              to='/signup'
              onClick={() => setIsOpen(false)}
              className='w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
            >
              Sign up
            </Link>
          </>
        )}

      </div>

    </div>
  </div>
)}
    </header>
  )
}

export default Header