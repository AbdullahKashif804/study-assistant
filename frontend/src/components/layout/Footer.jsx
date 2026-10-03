import {
    GraduationCap,
    Copyright
} from 'lucide-react'
import { Link } from 'react-router-dom'

function Footer(){
    return(
        <footer className="w-full bg-slate-50/90 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-6 py-20 lg:py-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr] lg:py-10 lg:px-8">
                    <div className="items-center">
                        <Link to="/" className="flex items-center justify-center md:justify-start">
                        <img
                        src="/images/Logo.png"
                        alt="Study Assistant Logo"
                        className="h-8 w-40 rounded-xl object-cover"
                        />
                        </Link>
                        <p className="mt-2 max-w-xs mx-auto md:mx-0 leading-7 text-slate-600 dark:text-gray-400">
                            Organize your notes, assignments, quizzes, projects, 
                            and daily study tasks in one place. Study smarter 
                            and stay productive.
                        </p>
                    </div>
                    <div>
                        <h3 className='text-slate-800 dark:text-white text-base font-semibold mb-4'>
                            Quick Links
                        </h3>
                        <ul className='space-y-2 text-sm text-slate-600 dark:text-gray-400'>
                            <li>
                                <Link
                                to='/'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Home</Link>
                            </li>
                            <li>
                                <a
                                href='#features'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Features</a>
                            </li>
                            <li>
                                <a
                                href='#how-it-works'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >How it Works</a>
                            </li>
                            <li>
                                <Link
                                to='/login'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Login</Link>
                            </li>
                            <li>
                                <Link
                                to='/signup'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Get Started</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-slate-800 dark:text-white text-base font-semibold mb-4'>
                            Resources
                        </h3>
                        <ul className='space-y-2 text-sm text-slate-600 dark:text-gray-400'>
                            <li>
                                <Link
                                to='/privacy-policy'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Privacy Policy</Link>
                            </li>
                            <li>
                                <Link
                                to='/terms'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Terms & Conditions</Link>
                            </li>
                            <li>
                                <a
                                href='https://github.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >GitHub</a>
                            </li>
                            <li>
                                <a
                                href='https://linkedin.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Linkedin</a>
                            </li>
                            <li>
                                <Link
                                to='/contact'
                                className='transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                                >Contact</Link>
                            </li>
                        </ul>
                    </div>
                    
                </div>
                <div className='pt-6 border-t border-slate-200 dark:border-slate-800 text-center'>
                    <p className='text-xs flex items-center justify-center gap-1 md:text-sm font-semibold text-slate-600 dark:text-gray-400'>
                    <Copyright className='h-4 w-4 text-gray-700 dark:text-gray-300'/>
                    2026 Study Assistant. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer