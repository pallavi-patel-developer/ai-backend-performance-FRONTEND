import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Bell, Key, Moon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-[#A1A1AA]">Manage your account, preferences, and API keys.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white block mb-1">First Name</label>
                <input type="text" defaultValue="John" className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]" />
              </div>
              <div>
                <label className="text-sm font-medium text-white block mb-1">Last Name</label>
                <input type="text" defaultValue="Doe" className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-white block mb-1">Email Address</label>
              <input type="email" defaultValue="john.doe@example.com" className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]" />
            </div>
            <button className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium rounded-md transition-colors border border-[#222222]">
              Save Changes
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4" /> API Keys</CardTitle>
            <CardDescription>Manage keys used for CI/CD integration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white block mb-1">Production Key</label>
              <div className="flex items-center gap-2">
                <input type="password" readOnly defaultValue="sk_prod_xxxxxxxxxxxxxxxx" className="flex-1 bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-[#A1A1AA] cursor-not-allowed" />
                <button className="px-4 py-2 bg-[#222222] text-white text-sm font-medium rounded-md hover:bg-[#333333] transition-colors">
                  Revoke
                </button>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#111111] text-[#06B6D4] text-sm font-medium rounded-md hover:bg-[#1A1A1A] transition-colors border border-[#222222]">
              Generate New Key
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
            <CardDescription>Choose what alerts you receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" defaultChecked className="rounded border-[#222222] bg-[#111111] text-[#7C3AED] focus:ring-[#7C3AED]" />
              <div>
                <p className="text-sm font-medium text-white">Email Alerts</p>
                <p className="text-xs text-[#A1A1AA]">Receive an email when a critical issue is detected.</p>
              </div>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-[#222222] bg-[#111111] text-[#7C3AED] focus:ring-[#7C3AED]" />
              <div>
                <p className="text-sm font-medium text-white">Weekly Digest</p>
                <p className="text-xs text-[#A1A1AA]">A summary of performance across all projects.</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
