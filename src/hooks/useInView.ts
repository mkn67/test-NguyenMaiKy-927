"use client";
import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
    const containerRef = useRef<T>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (typeof window === "undefined" || !element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, options);

        observer.observe(element);
        return () => observer.disconnect();
    }, [options?.root, options?.rootMargin, options?.threshold]);

    return { containerRef, isInView };
}