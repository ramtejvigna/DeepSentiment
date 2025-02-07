import React, { useState } from 'react';
import { Menu, Home, Camera, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SentimentDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'facial', label: 'Facial Analysis', icon: Camera },
        { id: 'text', label: 'Text Analysis', icon: FileText },
    ];

    const DashboardContent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Analysis</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Facial Analyses</span>
                        <span className="text-blue-600 font-semibold">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Text Analyses</span>
                        <span className="text-green-600 font-semibold">36</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-4">
                    <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        New Facial Analysis
                    </button>
                    <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        New Text Analysis
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h1 className="ml-4 text-xl font-bold">Sentiment Analysis Hub</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                Sign In
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-white shadow-lg h-[calc(100vh-4rem)] fixed"
                        >
                            <div className="p-4 space-y-4">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className={`flex-1 transition-all ${isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
                    {activeTab === 'dashboard' && <DashboardContent />}
                    {activeTab === 'facial' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Facial Analysis</h2>
                            {/* Facial Analysis content would go here */}
                        </div>
                    )}
                    {activeTab === 'text' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Text Analysis</h2>
                            {/* Text Analysis content would go here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SentimentDashboard;