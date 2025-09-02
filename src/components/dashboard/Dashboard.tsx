import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar, Gift, Cake, Heart, Users, Plus, Star, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Milestone {
  id: string;
  type: 'birthday' | 'work_anniversary' | 'personal_anniversary';
  date: string;
  user: {
    id: string;
    name: string;
    profilePhoto?: string;
    department?: string;
  };
  daysUntil: number;
}

interface Activity {
  id: string;
  type: 'celebration' | 'whiteboard' | 'milestone';
  title: string;
  description: string;
  time: string;
  user: {
    name: string;
    profilePhoto?: string;
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const [upcomingMilestones, setUpcomingMilestones] = useState<Milestone[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    // Mock data for upcoming milestones
    const milestones: Milestone[] = [
      {
        id: '1',
        type: 'birthday',
        date: '2024-01-15',
        user: {
          id: '2',
          name: 'Sarah Johnson',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          department: 'Design'
        },
        daysUntil: 3
      },
      {
        id: '2',
        type: 'work_anniversary',
        date: '2024-01-18',
        user: {
          id: '3',
          name: 'Mike Chen',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          department: 'Engineering'
        },
        daysUntil: 6
      },
      {
        id: '3',
        type: 'personal_anniversary',
        date: '2024-01-20',
        user: {
          id: '4',
          name: 'Emily Rodriguez',
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          department: 'Marketing'
        },
        daysUntil: 8
      }
    ];

    const activities: Activity[] = [
      {
        id: '1',
        type: 'celebration',
        title: 'Birthday Celebration',
        description: 'Alex received 12 birthday wishes!',
        time: '2 hours ago',
        user: {
          name: 'Alex Thompson',
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      },
      {
        id: '2',
        type: 'whiteboard',
        title: 'New Whiteboard Created',
        description: 'Team Frontend created a celebration board',
        time: '4 hours ago',
        user: {
          name: 'Team Frontend',
        }
      },
      {
        id: '3',
        type: 'milestone',
        title: 'Work Anniversary',
        description: 'Lisa completed 5 years with the company!',
        time: '1 day ago',
        user: {
          name: 'Lisa Park',
          profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        }
      }
    ];

    setUpcomingMilestones(milestones);
    setRecentActivity(activities);
  }, []);

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className="w-4 h-4 text-pink-500" />;
      case 'work_anniversary':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'personal_anniversary':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Gift className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMilestoneLabel = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'Birthday';
      case 'work_anniversary':
        return 'Work Anniversary';
      case 'personal_anniversary':
        return 'Personal Anniversary';
      default:
        return 'Milestone';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'whiteboard':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'milestone':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.firstName}! 🎉
          </h1>
          <p className="text-gray-600">
            Let's celebrate what's happening with your team today
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">This Month</p>
                  <p className="text-2xl">12</p>
                  <p className="text-sm text-purple-100">Celebrations</p>
                </div>
                <Gift className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Team Members</p>
                  <p className="text-2xl">47</p>
                  <p className="text-sm text-pink-100">Active</p>
                </div>
                <Users className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Whiteboards</p>
                  <p className="text-2xl">8</p>
                  <p className="text-sm text-blue-100">Created</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Upcoming</p>
                  <p className="text-2xl">{upcomingMilestones.length}</p>
                  <p className="text-sm text-green-100">Milestones</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Milestones */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-fit">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Upcoming Milestones
                  </CardTitle>
                  <CardDescription>
                    Don't miss these important celebrations
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMilestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={milestone.user.profilePhoto} />
                          <AvatarFallback>{milestone.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{milestone.user.name}</p>
                          <div className="flex items-center space-x-2">
                            {getMilestoneIcon(milestone.type)}
                            <span className="text-xs text-gray-500">
                              {getMilestoneLabel(milestone.type)}
                            </span>
                            {milestone.user.department && (
                              <Badge variant="secondary" className="text-xs">
                                {milestone.user.department}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-600">{milestone.daysUntil} days</p>
                        <p className="text-xs text-gray-500">{milestone.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Milestones
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/whiteboard/new">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Whiteboard
                  </Button>
                </Link>
                <Link to="/feed">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Share Update
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  Send Kudos
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  What's happening in your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                      {activity.user.profilePhoto && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.profilePhoto} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}