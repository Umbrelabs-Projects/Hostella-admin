"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProfileSettings from "./profile-settings/ProfileSettings";
import PasswordSettings from "./password-settings/PasswordSettings";
import VerificationSettings from "./verification/VerificationSettings";
import SettingsSidebar from "./components/SettingsSidebar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "password":
        return <PasswordSettings />;
      case "verification":
        return <VerificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content with animations */}
          <div className="md:flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab} // important for remounting animation
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
