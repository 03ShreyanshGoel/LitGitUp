"use client"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import useProject from "@/hooks/use-project"
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Presentation
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const { open } = useSidebar()
    const { projects, projectId, setProjectId } = useProject()
    return (
        <Sidebar collapsible="icon" variant="floating" className="bg-gray-50" >
            <SidebarHeader  >
                <div className="flex items-center gap-1"> {/* Use flex for horizontal alignment */}
                    <Image src="/logo.png" width={40} height={40} alt="logo" />
                    {open && (
                        <p className="text-xl font-bold text-primary ml-2"> {/* Add left margin to the logo name */}
                            LitGitUp
                        </p>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname === item.url
                                            }, 'list-none')}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            }
                            )}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map((project) => {
                                return (
                                    <SidebarMenuItem key={project.id}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={() => setProjectId(project.id)} >
                                                <div className={cn(
                                                    "rounded-md border border-b-2 -ml-[8px] w-8 h-8 flex items-center justify-center text-sm bg-white text-primary px-2.5",
                                                    {
                                                        "bg-primary text-white": project.id === projectId,
                                                    }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                <span>{project.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            }
                            )}
                            <div className="h-2"></div>
                            {open && <SidebarMenuItem>
                                <Link href='/create'>
                                    <Button size="sm" variant={"outline"} className="w-fit">
                                        <Plus />
                                        Create Project
                                    </Button></Link>
                            </SidebarMenuItem>}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar >
    )
}
