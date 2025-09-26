import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, projectAPI } from '../services/api';
import type { Appointment, Project, User } from '../types/index';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FolderOpen,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [appointmentsData, projectsData] = await Promise.all([
        appointmentAPI.getAppointments(),
        projectAPI.getProjects()
      ]);
      
      // Filter projects that belong to the current advisor
      const advisorProjects = projectsData.filter(project => project.advisorId === user?.id);
      setProjects(advisorProjects);
      
      // Filter appointments that belong to the advisor's projects
      const advisorProjectIds = advisorProjects.map(project => project.id);
      const advisorAppointments = appointmentsData.filter(appointment => 
        appointment.projectId && advisorProjectIds.includes(appointment.projectId)
      );
      setAppointments(advisorAppointments);
      
      // Get all students from advisor's projects
      const allStudents = advisorProjects.flatMap(project => project.students || []);
      setUsers(allStudents);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics for this advisor
  const overallStats = {
    totalAppointments: appointments.length,
    totalProjects: projects.length,
    totalStudents: users.length, // All students from advisor's projects
    pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
    confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
    completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    failedAppointments: appointments.filter(apt => apt.status === 'failed').length,
    rejectedAppointments: appointments.filter(apt => apt.status === 'rejected').length,
    cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length
  };

  const attendanceRate = overallStats.totalAppointments > 0 
    ? ((overallStats.completedAppointments / (overallStats.completedAppointments + overallStats.failedAppointments)) * 100).toFixed(1)
    : '0.0';

  const confirmationRate = overallStats.totalAppointments > 0 
    ? ((overallStats.confirmedAppointments / overallStats.totalAppointments) * 100).toFixed(1)
    : '0.0';

  // Calculate project statistics
  const projectStats = projects.map(project => {
    const projectAppointments = appointments.filter(apt => apt.projectId === project.id);
    const completed = projectAppointments.filter(apt => apt.status === 'completed').length;
    const failed = projectAppointments.filter(apt => apt.status === 'failed').length;
    const total = completed + failed;
    const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    
    return {
      ...project,
      totalAppointments: projectAppointments.length,
      completedAppointments: completed,
      failedAppointments: failed,
      attendanceRate: rate
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">สถิติภาพรวม</h1>
            <p className="text-sm text-gray-600 mt-1">
              อาจารย์ที่ปรึกษา: {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">ยังไม่มีโปรเจค</h3>
          <p className="mt-1 text-sm text-gray-500">
            คุณยังไม่ได้รับผิดชอบโปรเจคใดๆ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สถิติภาพรวม</h1>
          <p className="text-sm text-gray-600 mt-1">
            อาจารย์ที่ปรึกษา: {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <BarChart3 className="h-5 w-5 mr-2" />
          สถิติโปรเจคที่รับผิดชอบ
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">นัดหมายทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.totalAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">โปรเจคทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.totalProjects}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">นักศึกษาในโปรเจค</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">อัตราการมา</dt>
                  <dd className="text-lg font-medium text-gray-900">{attendanceRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Status Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">รอการยืนยัน</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.pendingAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">มาตามนัด</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.completedAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ไม่มาตามนัด</dt>
                  <dd className="text-lg font-medium text-gray-900">{overallStats.failedAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Statistics */}

      {/* Project Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">สถิติตามโปรเจค</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">รายละเอียดสถิติการนัดหมายของแต่ละโปรเจค</p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    โปรเจค
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    นัดหมายทั้งหมด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    มาตามนัด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ไม่มาตามนัด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อัตราการมา
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectStats.map((project, index) => (
                  <tr key={`project-stat-${project.id}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.totalAppointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {project.completedAppointments}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {project.failedAppointments}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">อัตราการยืนยัน</dt>
                  <dd className="text-2xl font-bold text-white">{confirmationRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">อัตราการมา</dt>
                  <dd className="text-2xl font-bold text-white">{attendanceRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-purple-100 truncate">โปรเจคที่รับผิดชอบ</dt>
                  <dd className="text-2xl font-bold text-white">{overallStats.totalProjects}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
