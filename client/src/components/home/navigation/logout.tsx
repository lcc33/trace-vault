// components/SignOutButton.js
'use client'; // If used in a Client Component

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-500 hover:text-red-700 font-semibold">
      Sign Out
    </button>
  );
}