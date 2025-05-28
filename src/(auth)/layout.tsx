"use client";

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/Auth'
import { useRouter } from 'next/router';



const Layout = ({children}: {children: React.ReactNode}) => {

    const { session } = useAuthStore();
    const router = useRouter()


    useEffect(() => {
        if(session) {
            router.push("/")
        }
    }, [session, router])

    if (session) {
        return null
    }



    return (
        <div className="">
            <div className="">{children}</div>
        </div>
    )
}



export default Layout