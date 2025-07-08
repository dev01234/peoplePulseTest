'use client';

import { useState } from 'react';
import { Project, Employee, Comment } from '@/types';
import { MessageSquare, Send, Plus, FolderKanban, Users2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const projectsData: Project[] = [
    {
      id: '1',
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with Next.js and Supabase',
      status: 'active',
      team: {
        rm: {
          id: '1',
          name: 'John Doe',
          role: 'RM',
          comments: [],
        },
        pms: [
          {
            id: '2',
            name: 'Sarah Smith',
            role: 'PM',
            comments: [],
          }
        ],
        tls: [
          {
            id: '4',
            name: 'Mike Johnson',
            role: 'TL',
            comments: [],
          }
        ],
        developers: [
          {
            id: '7',
            name: 'Alex Brown',
            role: 'Developer',
            comments: [],
          },
          {
            id: '8',
            name: 'Emma Wilson',
            role: 'Developer',
            comments: [],
          }
        ]
      }
    },
    {
      id: '2',
      name: 'CRM System',
      description: 'Customer relationship management system with real-time analytics',
      status: 'active',
      team: {
        rm: {
          id: '1',
          name: 'John Doe',
          role: 'RM',
          comments: [],
        },
        pms: [
          {
            id: '3',
            name: 'James Williams',
            role: 'PM',
            comments: [],
          }
        ],
        tls: [
          {
            id: '5',
            name: 'Lisa Davis',
            role: 'TL',
            comments: [],
          },
          {
            id: '6',
            name: 'Robert Martin',
            role: 'TL',
            comments: [],
          }
        ],
        developers: [
          {
            id: '9',
            name: 'Chris Taylor',
            role: 'Developer',
            comments: [],
          },
          {
            id: '10',
            name: 'Diana Lee',
            role: 'Developer',
            comments: [],
          }
        ]
      }
    }
  ];

export default function ProjectTeams() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectData, setProjectData] = useState(projectsData);
  const [newComment, setNewComment] = useState('');
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);

  const handleProjectSelect = (projectId: string) => {
    const project = projectData.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setActiveCommentBox(null);
  };

  const updateEmployeeComments = (project: Project, employeeId: string, newComment: Comment): Project => {
    const updateEmployee = (employee: Employee): Employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          comments: [...(employee.comments || []), newComment],
        };
      }
      return employee;
    };

    return {
      ...project,
      team: {
        rm: project.team.rm.id === employeeId ? updateEmployee(project.team.rm) : project.team.rm,
        pms: project.team.pms.map(pm => pm.id === employeeId ? updateEmployee(pm) : pm),
        tls: project.team.tls.map(tl => tl.id === employeeId ? updateEmployee(tl) : tl),
        developers: project.team.developers.map(dev => dev.id === employeeId ? updateEmployee(dev) : dev),
      }
    };
  };

  const handleAddComment = (employeeId: string) => {
    if (!newComment.trim() || !selectedProject) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      text: newComment,
      timestamp: new Date(),
    };

    const updatedProject = updateEmployeeComments(selectedProject, employeeId, comment);
    setProjectData(projectData.map(p => 
      p.id === selectedProject.id ? updatedProject : p
    ));
    setSelectedProject(updatedProject);
    setNewComment('');
    setActiveCommentBox(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'RM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'TL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Developer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'on-hold':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => {
    const comments = employee.comments || [];
    const isCommentBoxActive = activeCommentBox === employee.id;
    const roleColor = getRoleColor(employee.role);

    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor}`}>
                {employee.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">{comments.length}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setActiveCommentBox(isCommentBoxActive ? null : employee.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Comment
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">
                      {format(new Date(comment.timestamp), 'MMM d, yyyy HH:mm')}
                    </p>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {isCommentBoxActive && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[60px] text-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(employee.id);
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleAddComment(employee.id)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectView = ({ project }: { project: Project }) => {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        <div className="grid gap-8">
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Project Leadership
            </h3>
            <div className="grid gap-4">
              <EmployeeCard employee={project.team.rm} />
              <div className="grid md:grid-cols-2 gap-4">
                {project.team.pms.map(pm => (
                  <EmployeeCard key={pm.id} employee={pm} />
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Technical Leadership</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {project.team.tls.map(tl => (
                <EmployeeCard key={tl.id} employee={tl} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Development Team</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.team.developers.map(dev => (
                <EmployeeCard key={dev.id} employee={dev} />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          Project Teams
        </CardTitle>
        <CardDescription>
          View project teams and manage communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Select value={selectedProject?.id || ''} onValueChange={handleProjectSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project to view the team" />
            </SelectTrigger>
            <SelectContent>
              {projectData.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProject && (
          <div className="mt-8">
            <ProjectView project={selectedProject} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}