'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (in production, send to error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // In production, you would send this to an error tracking service like Sentry
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        if (this.props.onReset) {
            this.props.onReset();
        } else {
            // Default behavior: reload the page
            window.location.reload();
        }
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="max-w-2xl w-full"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                    className="flex justify-center mb-6"
                                >
                                    <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                                        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4"
                                >
                                    Bir Hata Oluştu
                                </motion.h1>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center text-gray-600 dark:text-gray-300 mb-8"
                                >
                                    Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
                                </motion.p>

                                {/* Error Details (Development Only) */}
                                {isDevelopment && this.state.error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                    >
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                                            Hata Detayları (Sadece Development):
                                        </p>
                                        <p className="text-xs font-mono text-red-700 dark:text-red-400 break-words">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <details className="mt-3">
                                                <summary className="text-sm text-red-700 dark:text-red-400 cursor-pointer hover:underline">
                                                    Component Stack
                                                </summary>
                                                <pre className="mt-2 text-xs text-red-600 dark:text-red-500 overflow-auto max-h-40 whitespace-pre-wrap">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </details>
                                        )}
                                    </motion.div>
                                )}

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center"
                                >
                                    <button
                                        onClick={this.handleReset}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Sayfayı Yenile
                                    </button>

                                    <button
                                        onClick={this.handleGoHome}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-300 dark:border-gray-600"
                                    >
                                        <Home className="w-5 h-5" />
                                        Ana Sayfaya Dön
                                    </button>
                                </motion.div>

                                {/* Support Note */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8"
                                >
                                    Sorun devam ederse, lütfen destek ekibimizle iletişime geçin.
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
