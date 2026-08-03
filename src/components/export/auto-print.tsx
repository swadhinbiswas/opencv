"use client";

import { useEffect } from "react";

/** Opens the browser print dialog once the (print) page has finished painting. */
export function AutoPrint() {
  useEffect(() => {
    const id = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}