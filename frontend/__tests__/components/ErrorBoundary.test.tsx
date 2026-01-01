import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
    throw new Error('Test error');
};

// Component that doesn't throw  an error
const NoError = () => {
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <NoError />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when an error is thrown', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument();
        expect(
            screen.getByText('Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.')
        ).toBeInTheDocument();
    });

    it('shows error details in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Hata Detayları/)).toBeInTheDocument();
        expect(screen.getByText(/Test error/)).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('has a reset button', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const resetButton = screen.getByText('Sayfayı Yenile');
        expect(resetButton).toBeInTheDocument();
    });

    it('has a go home button', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const homeButton = screen.getByText('Ana Sayfaya Dön');
        expect(homeButton).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
        const customFallback = <div>Custom Error Fallback</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
    });

    it('calls onReset callback when reset is clicked', () => {
        const onReset = jest.fn();
        const mockReload = jest.fn();
        delete window.location;
        window.location = { reload: mockReload } as any;

        render(
            <ErrorBoundary onReset={onReset}>
                <ThrowError />
            </ErrorBoundary>
        );

        const resetButton = screen.getByText('Sayfayı Yenile');
        resetButton.click();

        expect(onReset).toHaveBeenCalled();
    });
});
