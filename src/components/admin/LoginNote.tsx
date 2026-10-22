import React from 'react'

/** Heading above the sign-in form, in TailAdmin's auth layout style; says who signs in here and where customers go. */
export function LoginNote() {
  return (
    <div className="ta mb-6">
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800">Sign in</h1>
      <p className="text-sm text-gray-500">
        For SDG staff who look after the website, enquiries and the AI assistant. Customers do not sign in here; they use <strong className="font-medium text-gray-700">My Portal</strong> on
        the website with a one-time code.
      </p>
    </div>
  )
}
