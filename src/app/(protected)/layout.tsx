'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import { AppSidebar } from './dashboard/app-sidebar';

type Props = {
    children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
    return (
        <div className="flex min-h-screen bg-grya-50">
            {/* Sidebar Context */}
            <SidebarProvider>
                {/* Sidebar Component */}
                <AppSidebar />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col p-2  bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 border border-gray-300 bg-white shadow-md rounded-lg p-4">
                        {/* Sidebar Trigger */}
                        <SidebarTrigger className="  hover:bg-gray-200">
                            Open Sidebar
                        </SidebarTrigger>

                        {/* User Button */}
                        <UserButton />
                    </div>

                    {/* Spacer */}
                    <div className="h-4" />

                    {/* Content Area */}
                    <div className="flex-1 border border-gray-300 bg-white shadow-md rounded-lg overflow-y-auto p-6">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
};

export default SidebarLayout;
