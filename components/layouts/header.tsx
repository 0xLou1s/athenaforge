"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowUpRight, PlugZap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollDirection } from "@/lib/hooks/useScrollDirection";
import { siteConfig } from "@/config/site-config";
import ThemeToggler from "../theme/toggler";
import ConnectWalletBtn from "../connect-wallet-btn";
import { NAV_LINKS } from "./navigation-links";
import AnnouncementBar from "../announcement-bar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isVisible } = useScrollDirection(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AnimatePresence>
        {(mounted && isVisible) || mobileMenuOpen ? (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 w-full max-w-[90rem] mx-auto lg:px-0"
          >
            <AnnouncementBar />
            <div
              id="nav"
              className="w-full h-14 flex items-center justify-end border bg-background max-w-[90rem] lg:px-0 divide-x"
            >
              <div
                id="brand"
                className="font-mono text-sm flex-1 flex items-center h-full px-3 uppercase"
              >
                <Link
                  href="/"
                  className="hover:underline hidden md:inline-block"
                >
                  athena forge
                </Link>
                <Link href="/" className="hover:underline md:hidden">
                  af
                </Link>
              </div>

              <div className="hidden lg:flex h-full  divide-x">
                <Button className="h-full" size="lg" variant="ghost" asChild>
                  <Link
                    href="/hackathons"
                    className="flex items-center gap-2 group/nav"
                  >
                    <span>Hackathons</span>
                    <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
                      <ArrowUpRight className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
                      <ArrowUpRight className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
                    </div>
                  </Link>
                </Button>

                <Button className="h-full" size="lg" variant="ghost" asChild>
                  <Link
                    href="/create-hackathon"
                    className="flex items-center gap-2 group/nav"
                  >
                    <span>Create</span>
                    <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
                      <PlugZap className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
                      <PlugZap className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
                    </div>
                  </Link>
                </Button>

                <Button className="h-full" size="lg" variant="ghost" asChild>
                  <Link
                    href="/submit-project"
                    className="flex items-center gap-2 group/nav"
                  >
                    <span>Submit</span>
                    <div className="relative z-10 size-4 overflow-hidden flex items-center justify-center">
                      <ArrowUpRight className="-z-10 absolute opacity-100 scale-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/nav:-translate-y-5 group-hover/nav:translate-x-5 group-hover/nav:opacity-0 group-hover/nav:scale-0 transition-all duration-200" />
                      <ArrowUpRight className="absolute -z-10 -bottom-4 -left-4 opacity-0 scale-0 group-hover/nav:-translate-y-[15px] group-hover/nav:translate-x-4 group-hover/nav:opacity-100 group-hover/nav:scale-100 transition-all duration-200" />
                    </div>
                  </Link>
                </Button>

                {Object.entries(siteConfig.socials).map(([key, value]) => {
                  const Icon = value.icon;
                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      asChild
                      className="h-full aspect-square hidden md:flex"
                    >
                      <Link href={value.href} target="_blank" className="gap-2">
                        <Icon className="size-4" />
                      </Link>
                    </Button>
                  );
                })}

                <ConnectWalletBtn />
                <ThemeToggler className="h-full" />
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center h-full">
                <Button
                  className="h-full px-4 aspect-square border-l"
                  variant="ghost"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  className="lg:hidden fixed inset-0 z-50 bg-background"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col h-full">
                    {/* Header with Logo and Close Button */}
                    <motion.div
                      className="flex justify-between items-center border-b pl-4 h-14"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        id="brand"
                        className="font-mono text-sm flex items-center h-full px-3 uppercase"
                      >
                        <Link href="/" className="hover:underline">
                          athena forge
                        </Link>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={toggleMobileMenu}
                        className="h-full aspect-square border-l"
                      >
                        <X size={24} />
                      </Button>
                    </motion.div>

                    {/* Navigation Links */}
                    <motion.div
                      className="flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {NAV_LINKS.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.1 + index * 0.1,
                            duration: 0.3,
                          }}
                        >
                          <Link
                            href={item.path}
                            className={`py-6 text-center font-medium hover:bg-muted block ${
                              index !== NAV_LINKS.length - 1 ? "border-b" : ""
                            }`}
                            onClick={toggleMobileMenu}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Social Links and Actions */}
                    <motion.div
                      className="mt-auto border-t"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex justify-center items-center gap-4 py-4">
                        {Object.entries(siteConfig.socials).map(
                          ([key, value]) => {
                            const Icon = value.icon;
                            return (
                              <Button
                                key={key}
                                variant="ghost"
                                asChild
                                className="aspect-square"
                              >
                                <Link
                                  href={value.href}
                                  target="_blank"
                                  className="gap-2"
                                >
                                  <Icon className="size-4" />
                                </Link>
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <div className="flex justify-center items-center gap-4 pb-4">
                        <ConnectWalletBtn />
                        <ThemeToggler />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="h-14"></div>
    </>
  );
}