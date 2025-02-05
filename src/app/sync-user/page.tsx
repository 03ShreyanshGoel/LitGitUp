import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/server/db'
import { notFound, redirect } from 'next/navigation'
const SyncUser = async () => {
    const { userId } = await auth()

    if (!userId) {
        return redirect('/sign-in');
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user.emailAddresses[0]?.emailAddress) {
        return notFound()
    }

    await db.user.upsert({
        where: {
            emailAddress: user.emailAddresses[0].emailAddress ?? "",
        },
        update: {
            imageURL: user.imageUrl,
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
        },
        create: {
            id: userId,
            emailAddress: user.emailAddresses[0].emailAddress ?? "",
            imageURL: user.imageUrl,
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
        }
    })

    return redirect('/dashboard')
}

export default SyncUser
