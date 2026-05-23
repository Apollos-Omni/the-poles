
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { Organization } from '@/entities/Organization';
import { OrganizationMember } from '@/entities/OrganizationMember';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added this import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Crown } from 'lucide-react';

function CreateOrganizationForm({ user, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      // 1. Create the organization
      const newOrg = await Organization.create({
        name,
        description,
        owner_id: user.id
      });

      // 2. Add the creator as the first admin member
      await OrganizationMember.create({
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'admin'
      });

      onCreated();
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
    setIsCreating(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="org-name" className="text-purple-200">Organization Name</Label>
        <Input
          id="org-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Team or Company Name"
          className="mt-2 bg-black/40 border-purple-700/50 text-white"
          required
        />
      </div>
      <div>
        <Label htmlFor="org-desc" className="text-purple-200">Description</Label>
        <Input
          id="org-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is your organization's mission?"
          className="mt-2 bg-black/40 border-purple-700/50 text-white"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isCreating} className="bg-purple-600 hover:bg-purple-700">
          {isCreating ? 'Creating...' : 'Create Organization'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Organizations() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const memberships = await OrganizationMember.filter({ user_id: currentUser.id });
      const orgIds = memberships.map(m => m.organization_id);

      if (orgIds.length > 0) {
        // This is a simplified query. In a real scenario, you'd likely have a more direct way
        // to fetch organizations for a user, e.g., an RPC call or a view.
        const allOrgs = await Organization.list();
        const userOrgs = allOrgs.filter(org => orgIds.includes(org.id));
        setOrganizations(userOrgs);
      } else {
        setOrganizations([]);
      }

    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOrgCreated = () => {
    setCreateDialogOpen(false);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-16 bg-black/20 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-black/20 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-black/20 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8" />
            Organizations
          </h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 text-white">
              <DialogHeader>
                <DialogTitle>Create a New Organization</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm user={user} onCreated={handleOrgCreated} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {organizations.length > 0 ? organizations.map(org => (
            <Card key={org.id} className="bg-black/40 border-purple-700/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-purple-200">
                  {org.name}
                  {org.owner_id === user.id && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                      <Crown className="w-3 h-3 mr-1" />
                      Owner
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-300/80 mb-4">{org.description || 'No description provided.'}</p>
                <Button variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-600/20">
                  Switch to this Organization
                </Button>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-16 border-2 border-dashed border-purple-700/50 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-200">You are not a member of any organization.</h3>
              <p className="text-purple-300/70 mt-2 mb-6">Create an organization to collaborate with others.</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Organization
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
