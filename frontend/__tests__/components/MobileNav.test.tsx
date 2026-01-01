import React from 'react';
import { render, screen } from '@testing-library/react';
import { MobileNav } from '@/components/MobileNav';
import { useAuth } from '@/app/providers';
import { usePathname } from 'next/navigation';

// Mock dependencies
jest.mock('@/app/providers', () => ({
    useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('MobileNav', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render when user is not logged in', () => {
        mockUseAuth.mockReturnValue({ user: null } as any);
        mockUsePathname.mockReturnValue('/dashboard');

        const { container } = render(<MobileNav />);
        expect(container.firstChild).toBeNull();
    });

    it('does not render on auth page', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/auth');

        const { container } = render(<MobileNav />);
        expect(container.firstChild).toBeNull();
    });

    it('renders navigation items when user is logged in', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/dashboard');

        render(<MobileNav />);

        expect(screen.getByText('Ana Sayfa')).toBeInTheDocument();
        expect(screen.getByText('Yeni Analiz')).toBeInTheDocument();
        expect(screen.getByText('Koç')).toBeInTheDocument();
        expect(screen.getByText('Profil')).toBeInTheDocument();
    });

    it('highlights active route', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/chat');

        render(<MobileNav />);

        const chatLink = screen.getByText('Koç').closest('a');
        expect(chatLink).toHaveClass('text-blue-600');
    });

    it('does not highlight inactive routes', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/dashboard');

        render(<MobileNav />);

        const chatLink = screen.getByText('Koç').closest('a');
        expect(chatLink).toHaveClass('text-gray-500');
    });

    it('renders all navigation icons', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/dashboard');

        const { container } = render(<MobileNav />);

        // Check that SVGs are rendered (lucide icons render as SVGs)
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(4); // 4 navigation items
    });

    it('has correct href for all links', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com', id: 1 },
        } as any);
        mockUsePathname.mockReturnValue('/dashboard');

        render(<MobileNav />);

        const dashboardLink = screen.getByText('Ana Sayfa').closest('a');
        const analysisLink = screen.getByText('Yeni Analiz').closest('a');
        const chatLink = screen.getByText('Koç').closest('a');
        const profileLink = screen.getByText('Profil').closest('a');

        expect(dashboardLink).toHaveAttribute('href', '/dashboard');
        expect(analysisLink).toHaveAttribute('href', '/analysis/new');
        expect(chatLink).toHaveAttribute('href', '/chat');
        expect(profileLink).toHaveAttribute('href', '/profile');
    });
});
