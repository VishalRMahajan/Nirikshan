import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import React from 'react'

const AuthLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
const session = await auth();
  if (session?.user) {
    return redirect("/")
  }
  return (
    <>{children}</>
  )
}



export default AuthLayout