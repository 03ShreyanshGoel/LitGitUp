'use client'
import useProject from '@/hooks/use-project'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react' // Import useEffect
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const InviteButton = () => {
    const { projectId } = useProject();
    const [open, setOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {  // Check if window is available
            setInviteLink(`${window.location.origin}/join/${projectId}`);
        }
    }, [projectId]);  // Re-run when projectId changes

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink); // Use inviteLink
            toast.success("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy to clipboard: ", err);
            toast.error("Failed to copy to clipboard. Please try again.");
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Members</DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-gray-500'>
                        Ask them to copy and paste this link
                    </p>
                    <Input
                        className='mt-4'
                        readOnly
                        onClick={handleCopyToClipboard}
                        value={inviteLink}
                        aria-label="Invitation Link"
                    />
                </DialogContent>
            </Dialog>
            <Button size='sm' onClick={() => setOpen(true)}>Invite Members</Button>
        </>
    );
}

export default InviteButton