'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Globe,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { School, Course, Profile } from '@/types/api';
import { formatDate, formatNumber, generateSlug } from '@/lib/utils';
import { toast } from 'sonner';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    private_domain: '',
    description: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMySchools();
      setSchools(response.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchool = async () => {
    try {
      if (!formData.name || !formData.private_domain) {
        toast.error('Please fill in all required fields');
        return;
      }

      const schoolData = {
        name: formData.name,
        private_domain: generateSlug(formData.private_domain),
        description: formData.description
      };

      await apiClient.createSchool(schoolData);
      toast.success('School created successfully');
      setIsCreateDialogOpen(false);
      setFormData({ name: '', private_domain: '', description: '' });
      fetchSchools();
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school');
    }
  };

  const handleUpdateSchool = async () => {
    try {
      if (!selectedSchool) return;

      const updateData: any = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.private_domain) updateData.private_domain = generateSlug(formData.private_domain);
      if (formData.description !== undefined) updateData.description = formData.description;

      await apiClient.updateSchool(updateData);
      toast.success('School updated successfully');
      setIsEditDialogOpen(false);
      setSelectedSchool(null);
      setFormData({ name: '', private_domain: '', description: '' });
      fetchSchools();
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school');
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSchoolStats = (school: School) => {
    return {
      courses: school.courses?.length || 0,
      students: school.profiles?.filter(p => p.role?.name === 'USER').length || 0,
      teachers: school.profiles?.filter(p => p.role?.name === 'TEACHER').length || 0,
      revenue: 0 // You'll need to implement this based on your payment data
    };
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schools</h1>
          <p className="text-muted-foreground">
            Manage your learning platforms and their content
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>
                Set up a new learning platform for your courses
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter school name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                  id="domain"
                  value={formData.private_domain}
                  onChange={(e) => setFormData({ ...formData, private_domain: e.target.value })}
                  placeholder="my-school"
                />
                <p className="text-xs text-muted-foreground">
                  This will be your school's URL: {formData.private_domain ? `${formData.private_domain}.skillforge.com` : 'your-domain.skillforge.com'}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your school"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchool}>Create School</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Schools Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSchools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schools found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'No schools match your search criteria.' : 'You haven\'t created any schools yet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First School
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => {
            const stats = getSchoolStats(school);
            return (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={school.logo?.url} />
                        <AvatarFallback>
                          {school.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {school.slug}.skillforge.com
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={school.is_active ? 'default' : 'secondary'}>
                        {school.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {school.description || 'No description provided'}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{stats.courses}</div>
                      <div className="text-xs text-muted-foreground">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{stats.students}</div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/schools/${school.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSchool(school);
                          setFormData({
                            name: school.name,
                            private_domain: school.slug,
                            description: school.description || ''
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit School Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update your school's information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">School Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-domain">Domain Name</Label>
              <Input
                id="edit-domain"
                value={formData.private_domain}
                onChange={(e) => setFormData({ ...formData, private_domain: e.target.value })}
                placeholder="my-school"
              />
              <p className="text-xs text-muted-foreground">
                This will be your school's URL: {formData.private_domain ? `${formData.private_domain}.skillforge.com` : 'your-domain.skillforge.com'}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your school"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchool}>Update School</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 