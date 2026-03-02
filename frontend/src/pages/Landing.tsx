import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
    PlayCircleIcon,
    BellAlertIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    ChevronDownIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#eef2ff] to-[#faf5ff]">
            {/* Ambient Animated Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] animate-pulse-soft" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />

            {/* Floating Pills / Crosses (Abstract Shapes) */}
            <div className="absolute top-[20%] left-[35%] w-16 h-8 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 opacity-60 shadow-lg rotate-12 animate-float blur-[1px]"></div>
            <div className="absolute bottom-[40%] left-[10%] w-12 h-6 rounded-full bg-gradient-to-r from-white to-pink-200 shadow-lg -rotate-12 animate-float-delayed blur-[1px]"></div>
            <div className="absolute top-[18%] right-[45%] w-8 h-8 flex items-center justify-center bg-white/70 backdrop-blur-md rounded shadow-lg animate-float">
                <div className="w-4 h-1 bg-blue-400 rounded-full absolute"></div>
                <div className="w-1 h-4 bg-blue-400 rounded-full absolute"></div>
            </div>
            <div className="absolute bottom-[35%] right-[90%] w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-md rounded shadow-lg animate-float-delayed">
                <div className="w-5 h-1.5 bg-blue-300 rounded-full absolute"></div>
                <div className="w-1.5 h-5 bg-blue-300 rounded-full absolute"></div>
            </div>


            {/* Navigation */}
            <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl relative overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                        {/* Cloud-like logo representation */}
                        <div className="absolute inset-0 bg-blue-600"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-5 h-5 bg-white rounded-full"></div>
                        <div className="absolute bottom-2 left-1 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute bottom-2 right-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <a href="#home" className="text-gray-900 hover:text-blue-600 transition-colors">Home</a>
                    <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-blue-600 transition-colors opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()} title="Coming soon">Pricing</a>
                    <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                    <a href="#contact" className="hover:text-blue-600 transition-colors opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()} title="Coming soon">Contact</a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Button onClick={() => navigate(`/${user.role}`)} className="bg-white text-blue-600 hover:bg-gray-50 rounded-full px-6 border border-blue-100 shadow-sm">
                            Dashboard
                        </Button>
                    ) : (
                        <Button onClick={() => navigate('/login')} className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 py-2 border border-blue-100 shadow-sm transition-all duration-300">
                            Login
                        </Button>
                    )}
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20">
                <div id="home" className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-10 mt-[-40px]">

                    {/* Left Hero Content */}
                    <div className="max-w-xl">
                        <h1 className="text-[3.5rem] leading-[1.1] font-bold text-slate-800 tracking-tight mb-6">
                            Token Appointment <br />
                            System
                        </h1>
                        <h2 className="text-2xl font-bold text-blue-700 mb-6">
                            Book Smart, Wait Less.
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-10">
                            Revolutionize the way you book and manage appointments with our real-time token management system designed for patients, doctors, and admins to streamline the queue efficiently.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {!user && (
                                <button onClick={() => navigate('/register/patient')} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5">
                                    Get Started
                                </button>
                            )}
                            {user && (
                                <button onClick={() => navigate(`/${user.role}`)} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5">
                                    Enter Dashboard
                                </button>
                            )}
                            <button className="w-full sm:w-auto px-6 py-3.5 bg-white/80 hover:bg-white text-slate-700 rounded-xl font-medium border border-white/50 shadow-sm flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5">
                                <PlayCircleIcon className="w-5 h-5 text-blue-600" />
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Right Mock UI Composition */}
                    <div className="relative h-[600px] w-full mt-10 lg:mt-0 perspective-1000">
                        {/* Main App Window Mock */}
                        <div className="absolute right-0 top-0 w-[500px] max-w-full bg-white/90 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden z-10 animate-float">
                            {/* Window Header */}
                            <div className="bg-gray-50/50 border-b border-gray-100 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">T</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm">Bok Your Appointment</h3>
                                </div>
                                <div className="flex gap-2 text-gray-400">
                                    <BellAlertIcon className="w-5 h-5" />
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] text-gray-500">...</span></div>
                                </div>
                            </div>

                            <div className="flex">
                                {/* Sidebar Mock */}
                                <div className="w-16 bg-blue-600/5 border-r border-gray-100 p-4 flex flex-col gap-4 items-center min-h-[400px]">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm overflow-hidden p-0.5">
                                        <div className="w-full h-full bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                                        <CalendarDaysIcon className="w-5 h-5" />
                                    </div>
                                    <div className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center">
                                        <ClipboardDocumentListIcon className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Content Mock */}
                                <div className="flex-1 p-6 bg-gradient-to-br from-white to-blue-50/30">
                                    <p className="text-sm font-medium text-slate-600 mb-4">Welcome, John!</p>

                                    <p className="text-sm font-semibold text-slate-800 mb-2">Select Your Doctor</p>
                                    <div className="bg-white border text-left border-gray-100 rounded-xl p-3 flex justify-between items-center shadow-sm mb-4 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-white shadow-sm overflow-hidden">
                                                <img src="https://i.pravatar.cc/150?img=47" alt="Doctor" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Dr. Sarah Williams</p>
                                                <p className="text-[10px] text-gray-500">Cardiologist | 10 Years Experience</p>
                                            </div>
                                        </div>
                                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                    </div>

                                    <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 mb-6 transition-colors">
                                        Get Your Token
                                    </button>

                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                            <p className="text-xs font-semibold text-slate-600 mb-1">Token Number</p>
                                            <p className="text-3xl font-bold text-slate-800">25</p>
                                        </div>
                                        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                            <p className="text-xs font-semibold text-slate-600 mb-1">Current Token Running</p>
                                            <p className="text-3xl font-bold text-blue-600">18</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Tokens Ahead: 6</p>
                                        </div>
                                    </div>

                                    {/* Live Queue Status Mock */}
                                    <div className="bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl overflow-hidden shadow-lg p-4 text-white">
                                        <h4 className="text-xs font-medium text-blue-100 mb-3">Live Queue Status</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-white/20 px-3 py-2 rounded text-sm">
                                                <span className="font-semibold">Now Serving</span>
                                                <span className="font-bold flex items-center gap-1"><PlayCircleIcon className="w-4 h-4" /> Token 25</span>
                                            </div>
                                            <div className="flex justify-between items-center px-3 py-1.5 text-blue-100 text-sm border-b border-white/10">
                                                <span>Token 25</span>
                                            </div>
                                            <div className="flex justify-between items-center px-3 py-1.5 text-blue-100 text-sm border-b border-white/10">
                                                <span>Token 26</span>
                                            </div>
                                            <div className="flex justify-between items-center px-3 py-1.5 text-blue-100 text-sm">
                                                <span>Token 27</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating "Check" Card (Overlaps main window) */}
                        <div className="absolute left-[-20px] bottom-[100px] w-72 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-4 z-30 animate-float-delayed">
                            <div className="flex justify-between items-center mb-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="font-semibold">Check</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Doctor 1 */}
                                <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-blue-50 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border">
                                            <img src="https://i.pravatar.cc/150?img=47" alt="Doctor" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Dr. Sarah Williams</p>
                                            <p className="text-[9px] text-gray-500">Cardiologist <br />10 Years Experience</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Consulting</span>
                                </div>

                                {/* Doctor 2 */}
                                <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border">
                                            <img src="https://i.pravatar.cc/150?img=60" alt="Doctor" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Dr. James Clark</p>
                                            <p className="text-[9px] text-gray-500">Orthopedic Specialist <br />Next on Token</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Completed</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Feature Cards */}
                <div id="features" className="mt-20 grid md:grid-cols-3 gap-6 relative z-10 pt-10 mt-[-40px]">
                    {/* Card 1 */}
                    <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xl">🔔</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">Real-Time Updates</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Get instant notifications when your token is called.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                            <span className="text-xl">📅</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">Easy Booking</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Quickly book appointments with the best doctors in a few taps.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">Queue Management</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Streamline patient queues for efficient and organized consultations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div id="about" className="mt-32 relative z-10 pt-10 mt-[-40px]">
                    <div className="glass-panel rounded-3xl p-10 md:p-14 text-center overflow-hidden relative">
                        {/* Decorative background blurs inside the panel */}
                        <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[150%] rounded-full bg-blue-300/10 blur-[80px]" />
                        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[150%] rounded-full bg-purple-300/10 blur-[80px]" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide uppercase">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Academic Initiative
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 tracking-tight">
                                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Team RASH</span>
                            </h3>

                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                This Token Appointment System is proudly developed as a comprehensive <strong className="text-slate-800 font-medium">Second Year Mini-Project</strong>. Our goal was to engineer a robust, scalable, and user-centric healthcare scheduling solution that addresses the modern challenges of patient queue management.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {/* You can optionally put actual names here, or just keep it abstract for the team acronym R.A.S.H */}
                                <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mx-auto mb-3">R</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1" style={{ animationDelay: "100ms" }}>
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg mx-auto mb-3">A</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1" style={{ animationDelay: "200ms" }}>
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mx-auto mb-3">S</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-1" style={{ animationDelay: "300ms" }}>
                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg mx-auto mb-3">H</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
