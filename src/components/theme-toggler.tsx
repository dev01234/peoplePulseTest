'use client'
import { useEffect, useState } from "react"
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react';
import { Button } from "./ui/button";

export default function ThemeToggler() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    },[])

    if(!mounted) return null

  return (
    <Button 
        size='sm'
        variant='ghost'
        onClick={() => {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        }}
        className="rounded-full"
    >
        {resolvedTheme === "dark" ? 
        (
            <Sun size={16}/>
        ) : (
            <Moon size={16}/>
        )}
        <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
