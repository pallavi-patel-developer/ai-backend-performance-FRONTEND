import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MoreVertical, Plus } from "lucide-react";

const teamMembers = [
  { name: "John Doe", role: "Owner", email: "john@example.com", status: "Active" },
  { name: "Sarah Smith", role: "Admin", email: "sarah@example.com", status: "Active" },
  { name: "Mike Johnson", role: "Developer", email: "mike@example.com", status: "Pending" },
];

export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Collaboration</h1>
          <p className="text-[#A1A1AA]">Manage team members and their access levels.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white text-sm font-medium rounded-md transition-opacity">
          <Plus className="h-4 w-4" /> Invite Member
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A1A1AA] uppercase bg-[#111111] border-b border-[#222222]">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.email} className="border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-[#A1A1AA] text-xs flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[#A1A1AA]">{member.role}</td>
                    <td className="px-4 py-4">
                      <Badge variant={member.status === 'Active' ? 'success' : 'warning'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-[#A1A1AA] hover:text-white transition-colors">
                        <MoreVertical className="h-4 w-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
