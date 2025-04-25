import React, { useState, useEffect } from 'react';
import { Menu, Home, Camera, FileText, Send, BarChart2, Settings, Moon, Sun, LogOut, ChevronDown, ChevronUp, Clock, Trash2, AlertTriangle, Smile, Meh, Frown, RefreshCw, User, Book, Info, PlusCircle, X, Eye, EyeOff, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// API base URL - adjust this based on your deployment
const API_BASE_URL = 'http://localhost:8000';

const SentimentDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [textInput, setTextInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [stats, setStats] = useState({
        facial_count: 0,
        text_count: 0,
        positive_percentage: 0,
        neutral_percentage: 0,
        negative_percentage: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isCharacterCountVisible, setIsCharacterCountVisible] = useState(false);

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'facial', label: 'Facial Analysis', icon: Camera },
        { id: 'text', label: 'Text Analysis', icon: FileText },
        { id: 'statistics', label: 'Statistics', icon: BarChart2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const handleInputChange = (event) => {
        setTextInput(event.target.value);
    };

    // Fetch stats when component loads
    useEffect(() => {
        fetchStats();
    }, []);

    // Toggle toast visibility
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/stats`);
            setStats(response.data);
            showToastNotification('Statistics updated successfully', 'success');
        } catch (error) {
            console.error('Error fetching stats:', error);
            showToastNotification('Failed to fetch statistics', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showToastNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleTextAnalysis = async () => {
        if (!textInput.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/analyze`, {
                text: textInput
            });

            setAnalysisResult(response.data);

            // Add to recent analyses
            const newAnalysis = {
                id: Date.now(),
                text: textInput,
                sentiment: response.data.sentiment,
                sentimentLabel: response.data.sentiment_label,
                timestamp: new Date().toLocaleString()
            };

            setRecentAnalyses(prev => [newAnalysis, ...prev.slice(0, 4)]);
            showToastNotification('Text analyzed successfully!');

            // Update stats
            fetchStats();

        } catch (error) {
            console.error('Error analyzing text:', error);
            showToastNotification('Error analyzing text. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getSentimentColor = (sentiment) => {
        if (sentiment === 1.0) return 'text-green-600 dark:text-green-400';
        if (sentiment === 0.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getSentimentIcon = (sentiment) => {
        if (sentiment === 1.0) return <Smile className="h-5 w-5 text-green-600 dark:text-green-400" />;
        if (sentiment === 0.0) return <Meh className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
        return <Frown className="h-5 w-5 text-red-600 dark:text-red-400" />;
    };

    const clearTextInput = () => {
        setTextInput('');
        setAnalysisResult(null);
    };

    const deleteRecentAnalysis = (id) => {
        setRecentAnalyses(prev => prev.filter(analysis => analysis.id !== id));
        showToastNotification('Analysis removed from history');
    };

    const filteredAnalyses = recentAnalyses.filter(
        analysis => analysis.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const Toast = () => (
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } text-white flex items-center space-x-2`}
                >
                    {toastType === 'success' ?
                        <Smile className="h-5 w-5" /> :
                        <AlertTriangle className="h-5 w-5" />
                    }
                    <span>{toastMessage}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const EmptyState = ({ icon: Icon, title, description, actionText, actionFn }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
        >
            <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{description}</p>
            {actionText && actionFn && (
                <button
                    onClick={actionFn}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                >
                    {actionText}
                </button>
            )}
        </motion.div>
    );

    const DashboardContent = () => (
        <AnimatePresence mode="wait">
            <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
            >
                {/* <motion.div
                    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${isDarkMode ? 'border border-gray-700' : ''}`}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                >
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Recent Analysis
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Camera className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                <span className="dark:text-gray-300">Facial Analyses</span>
                            </div>
                            <motion.span
                                className="text-blue-600 dark:text-blue-400 font-semibold"
                                key={stats.facial_count}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {stats.facial_count}
                            </motion.span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="dark:text-gray-300">Text Analyses</span>
                            </div>
                            <motion.span
                                className="text-green-600 dark:text-green-400 font-semibold"
                                key={stats.text_count}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {stats.text_count}
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${isDarkMode ? 'border border-gray-700' : ''}`}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white flex items-center">
                            <BarChart2 className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                            Sentiment Distribution
                        </h3>
                        <button
                            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            {isStatsExpanded ?
                                <ChevronUp className="h-5 w-5" /> :
                                <ChevronDown className="h-5 w-5" />
                            }
                        </button>
                    </div>

                    <AnimatePresence>
                        {isStatsExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                <div className="flex justify-between text-sm mb-1">
                                    <div className="flex items-center">
                                        <Smile className="h-4 w-4 mr-1 text-green-500 dark:text-green-400" />
                                        <span className="dark:text-gray-300">Positive</span>
                                    </div>
                                    <span className="dark:text-gray-300">{stats.positive_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        className="bg-green-500 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.positive_percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.1 }}
                                    ></motion.div>
                                </div>

                                <div className="flex justify-between text-sm mb-1 mt-3">
                                    <div className="flex items-center">
                                        <Meh className="h-4 w-4 mr-1 text-yellow-500 dark:text-yellow-400" />
                                        <span className="dark:text-gray-300">Neutral</span>
                                    </div>
                                    <span className="dark:text-gray-300">{stats.neutral_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.neutral_percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    ></motion.div>
                                </div>

                                <div className="flex justify-between text-sm mb-1 mt-3">
                                    <div className="flex items-center">
                                        <Frown className="h-4 w-4 mr-1 text-red-500 dark:text-red-400" />
                                        <span className="dark:text-gray-300">Negative</span>
                                    </div>
                                    <span className="dark:text-gray-300">{stats.negative_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        className="bg-red-500 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.negative_percentage}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                    ></motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${isDarkMode ? 'border border-gray-700' : ''}`}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                >
                    <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                        <PlusCircle className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Quick Actions
                    </h3>
                    <div className="space-y-4">
                        <motion.button
                            onClick={() => setActiveTab('facial')}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            New Facial Analysis
                        </motion.button>
                        <motion.button
                            onClick={() => setActiveTab('text')}
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            New Text Analysis
                        </motion.button>
                        <motion.button
                            onClick={fetchStats}
                            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Stats
                        </motion.button>
                    </div>
                </motion.div> */}

                {recentAnalyses.length > 0 && (
                    <motion.div
                        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg md:col-span-2 ${isDarkMode ? 'border border-gray-700' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                Recent Text Analyses
                            </h3>
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search analyses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {filteredAnalyses.length > 0 ? (
                                    filteredAnalyses.map((analysis) => (
                                        <motion.div
                                            key={analysis.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className={`p-3 border dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between mb-2">
                                                <div className="flex items-center">
                                                    {getSentimentIcon(analysis.sentiment)}
                                                    <span className={`ml-2 font-medium ${getSentimentColor(analysis.sentiment)}`}>
                                                        {analysis.sentimentLabel}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{analysis.timestamp}</span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deleteRecentAnalysis(analysis.id)}
                                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                            <p className="text-sm dark:text-gray-300 truncate">{analysis.text}</p>
                                        </motion.div>
                                    ))
                                ) : searchQuery ? (
                                    <EmptyState
                                        icon={Search}
                                        title="No matching results"
                                        description={`No analyses match "${searchQuery}". Try a different search term or clear the search.`}
                                        actionText="Clear Search"
                                        actionFn={() => setSearchQuery('')}
                                    />
                                ) : null
                                }
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    const TextAnalysisContent = () => 

    {
        !analysisResult && recentAnalyses.length === 0 && (
            <EmptyState
                icon={FileText}
                title="No text analyses yet"
                description="Enter some text above to analyze its sentiment and see the results here."
            />
        )
    }

    return (
        <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
            {/* Sidebar */}
            <motion.div 
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
                initial={false}
                animate={{ width: isSidebarOpen ? '16rem' : '5rem' }}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen ? (
                            <motion.h1 
                                key="full-logo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center"
                            >
                                <BarChart2 className="h-6 w-6 mr-2" />
                                DeepSentiment
                            </motion.h1>
                        ) : (
                            <motion.div 
                                key="icon-logo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <BarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="flex-grow py-4">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center px-4 py-2 ${
                                            activeTab === item.id 
                                                ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                                                : 'hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                        } transition-colors`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <AnimatePresence mode="wait">
                                            {isSidebarOpen && (
                                                <motion.span 
                                                    className="ml-3"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isDarkMode ? (
                            <>
                                <Sun className="h-5 w-5" />
                                {isSidebarOpen && <span className="ml-3">Light Mode</span>}
                            </>
                        ) : (
                            <>
                                <Moon className="h-5 w-5" />
                                {isSidebarOpen && <span className="ml-3">Dark Mode</span>}
                            </>
                        )}
                    </motion.button>
                    
                    <motion.button
                        className="mt-2 w-full flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="h-5 w-5" />
                        {isSidebarOpen && <span className="ml-3">Logout</span>}
                    </motion.button>
                </div>
            </motion.div>
            
            {/* Main content */}
            <div className="flex-grow overflow-auto">
                <div className={`p-6 h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
                    {activeTab === 'dashboard' && <DashboardContent />}
                    {activeTab === 'text' && 
                        (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="text-analysis"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6"
                                >
                                    <h2 className="text-2xl font-bold mb-6 dark:text-white flex items-center">
                                        <FileText className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                                        Text Sentiment Analysis
                                    </h2>
                    
                                    <motion.div
                                        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 ${isDarkMode ? 'border border-gray-700' : ''}`}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                                            <Info className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                            Enter Text to Analyze
                                        </h3>
                                        <div className="relative">
                                            <textarea
                                                className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-32 mb-1 
                                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white
                                                    ${textInput ? '' : 'focus:shadow-lg'}`}
                                                placeholder="Type or paste text here for sentiment analysis..."
                                                value={textInput}
                                                onChange={handleInputChange}
                                            ></textarea>
                    
                                            {textInput && (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    onClick={clearTextInput}
                                                >
                                                    <X className="h-5 w-5" />
                                                </motion.button>
                                            )}
                    
                                            <div className="flex justify-between mb-4">
                                                <motion.button
                                                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center"
                                                    onClick={() => setIsCharacterCountVisible(!isCharacterCountVisible)}
                                                >
                                                    {isCharacterCountVisible ? (
                                                        <><EyeOff className="h-3 w-3 mr-1" /> Hide character count</>
                                                    ) : (
                                                        <><Eye className="h-3 w-3 mr-1" /> Show character count</>
                                                    )}
                                                </motion.button>
                    
                                                <AnimatePresence>
                                                    {isCharacterCountVisible && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            className="text-xs text-gray-500 dark:text-gray-400"
                                                        >
                                                            {textInput.length} characters
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                    
                                            <motion.button
                                                onClick={handleTextAnalysis}
                                                disabled={isLoading || !textInput.trim()}
                                                className={`flex items-center justify-center w-full py-2 px-4 bg-blue-600 text-white rounded-lg
                                                    hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600`}
                                                whileHover={textInput.trim() ? { scale: 1.02 } : {}}
                                                whileTap={textInput.trim() ? { scale: 0.98 } : {}}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Analyze Sentiment
                                                        <Send className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                    
                                    <AnimatePresence>
                                        {analysisResult && (
                                            <motion.div
                                                key={analysisResult.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className={`p-3 border dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <div className="flex flex-row gap-4 items-center">
                                                        {getSentimentIcon(analysisResult.sentiment)}
                                                        <span className={`ml-2 font-medium ${getSentimentColor(analysisResult.sentiment)}`}>
                                                            {analysisResult.sentimentLabel}
                                                        </span>
                                                        <p className="text-lg dark:text-gray-300 truncate">{analysisResult.text}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{analysisResult.timestamp}</span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => deleteRecentAnalysis(analysisResult.id)}
                                                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-8 w-8" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    {activeTab === 'facial' && (
                        <EmptyState 
                            icon={Camera}
                            title="Facial Analysis Coming Soon"
                            description="This feature is under development and will be available in a future update."
                            actionText="Go to Text Analysis"
                            actionFn={() => setActiveTab('text')}
                        />
                    )}
                    {activeTab === 'statistics' && (
                        <EmptyState 
                            icon={BarChart2}
                            title="Detailed Statistics Coming Soon"
                            description="Advanced statistics and data visualization features are under development."
                            actionText="Go to Dashboard"
                            actionFn={() => setActiveTab('dashboard')}
                        />
                    )}
                    {activeTab === 'settings' && (
                        <EmptyState 
                            icon={Settings}
                            title="Settings Coming Soon"
                            description="Advanced configuration options are under development."
                            actionText="Go to Dashboard"
                            actionFn={() => setActiveTab('dashboard')}
                        />
                    )}
                </div>
            </div>
            
            {/* Toast notifications */}
            <Toast />
        </div>
    );
};

export default SentimentDashboard;