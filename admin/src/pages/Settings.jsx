import { useState } from "react"

const Settings = () => {
const [isEditingEmail, setIsEditingEmail] = useState(false)

return ( <div className="min-h-screen bg-slate-50 px-6 py-6"> <div className="max-w-4xl mx-auto">


    {/* Header */}
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-500">
        Manage your account settings and preferences
      </p>
    </div>

    {/* CHANGE EMAIL */}
    <div className="bg-white border border-slate-200 rounded-xl mb-6">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-800">Change Email</h2>
        <p className="text-xs text-slate-500 mt-1">
          Update your email address
        </p>
      </div>

      <div className="p-5">
        <label className="text-xs text-slate-500">Current Email</label>

        <input
          type="email"
          disabled={!isEditingEmail}
          defaultValue="neha.s@gmail.com"
          className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
        />

        <button
          onClick={() => setIsEditingEmail(!isEditingEmail)}
          className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ✏️ Edit
        </button>
      </div>
    </div>

    {/* CHANGE PASSWORD */}
    <div className="bg-white border border-slate-200 rounded-xl mb-6">
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-800">Change Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Update your account password
        </p>
      </div>

      <div className="p-5 space-y-4">

        <div>
          <label className="text-xs text-slate-500">Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">
            Change Password
          </button>

          <button className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>

    {/* DELETE ACCOUNT */}
    <div className="bg-white border border-red-200 rounded-xl">
      <div className="p-5 border-b border-red-200">
        <h2 className="text-sm font-semibold text-red-600">Delete Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Permanently delete your account and all data
        </p>
      </div>

      <div className="p-5">
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-4">
          ⚠️ This action cannot be undone. Deleting your account will permanently
          remove all your data including profile information and activity history.
        </div>

        <button className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>

  </div>
</div>

)
}

export default Settings
