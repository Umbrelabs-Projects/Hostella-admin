"use client";

import React from "react";

export default function DevMigratePage() {
  return (
    <main className="p-6">
      <h2 className="text-lg font-semibold mb-4">Dev Migration (Disabled)</h2>
      <p className="mb-4">Migration UI has been disabled. Onboarding now posts to the backend and bookings are removed locally; members are fetched from the backend.</p>
    </main>
  );
}
