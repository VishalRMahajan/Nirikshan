import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react'

const ProtectedLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
const session = await auth();
  if (!session?.user) {
    return redirect("/auth")
  }
  return (
    <>{children}</>
  )
}



export default ProtectedLayout