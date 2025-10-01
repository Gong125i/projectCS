import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, projectAPI } from '../services/api';
import type { Appointment, Project } from '../types/index';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  FolderOpen,
  TrendingUp,
  BarChart3,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const Statistics: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

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

      setProjects(projectsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique academic years
  const academicYears = ['all', ...new Set(projects.map(p => p.academicYear).filter(Boolean))];

  // Filter projects by selected year
  const filteredProjects = selectedYear === 'all' 
    ? projects 
    : projects.filter(p => p.academicYear === selectedYear);

  const filteredProjectIds = filteredProjects.map(p => p.id);
  const filteredAppointments = appointments.filter(apt => 
    apt.projectId && filteredProjectIds.includes(apt.projectId)
  );

  // Calculate overall statistics
  const overallStats = {
    totalAppointments: filteredAppointments.length,
    totalProjects: filteredProjects.length,
    totalStudents: [...new Set(filteredProjects.flatMap(p => p.students?.map(s => s.id) || []))].length,
    completedAppointments: filteredAppointments.filter(apt => apt.status === 'completed').length,
    failedAppointments: filteredAppointments.filter(apt => apt.status === 'failed').length,
    pendingAppointments: filteredAppointments.filter(apt => 
      apt.status === 'pending' || 
      apt.status === 'pending_student_confirmation' || 
      apt.status === 'pending_advisor_confirmation'
    ).length,
    confirmedAppointments: filteredAppointments.filter(apt => apt.status === 'confirmed').length,
    rejectedAppointments: filteredAppointments.filter(apt => apt.status === 'rejected').length,
    noResponseAppointments: filteredAppointments.filter(apt => apt.status === 'no_response').length
  };

  const attendanceRate = (overallStats.completedAppointments + overallStats.failedAppointments) > 0
    ? ((overallStats.completedAppointments / (overallStats.completedAppointments + overallStats.failedAppointments)) * 100).toFixed(1)
    : '0.0';

  const successRate = overallStats.totalAppointments > 0
    ? ((overallStats.completedAppointments / overallStats.totalAppointments) * 100).toFixed(1)
    : '0.0';

  // Group appointments by project
  const projectStats = filteredProjects.map(project => {
    const projectAppointments = filteredAppointments.filter(apt => apt.projectId === project.id);
    const completed = projectAppointments.filter(apt => apt.status === 'completed');
    const failed = projectAppointments.filter(apt => apt.status === 'failed').length;

    return {
      project,
      appointments: projectAppointments,
      completedCount: completed.length,
      failedCount: failed,
      totalMeetings: projectAppointments.length
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สถิติภาพรวม</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.role === 'advisor' 
              ? `อาจารย์ที่ปรึกษา: ${user?.firstName} ${user?.lastName}`
              : `นักศึกษา: ${user?.firstName} ${user?.lastName}`
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">ปีการศึกษา:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทั้งหมด</option>
            {academicYears.filter(y => y !== 'all').map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">นัดหมายทั้งหมด</dt>
                  <dd className="text-3xl font-bold text-gray-900">{overallStats.totalAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">มาตามนัด</dt>
                  <dd className="text-3xl font-bold text-gray-900">{overallStats.completedAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-red-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ไม่มาตามนัด</dt>
                  <dd className="text-3xl font-bold text-gray-900">{overallStats.failedAppointments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-purple-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">อัตราความสำเร็จ</dt>
                  <dd className="text-3xl font-bold text-gray-900">{successRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">โปรเจคทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalProjects}</p>
            </div>
            <FolderOpen className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">นักศึกษาทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">อัตราการมาตามนัด</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
            <BarChart3 className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Appointments by Project */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 text-indigo-600 mr-2" />
            การนัดหมายแยกตามโปรเจค
          </h3>
        </div>
        <div className="p-6">
          {projectStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>ไม่มีโปรเจคในปีการศึกษาที่เลือก</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projectStats.map((stat) => (
                <div key={stat.project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{stat.project.name}</h4>
                      <p className="text-sm text-gray-600">
                        ปีการศึกษา: {stat.project.academicYear || '-'}
                      </p>
                      <p className="text-sm text-gray-600">
                        นักศึกษา: {stat.project.students?.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">การนัดหมายทั้งหมด</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.totalMeetings}</p>
                    </div>
                  </div>

                  {/* Appointment List */}
                  {stat.appointments.length > 0 ? (
                    <div className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ครั้งที่</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">วันที่และเวลา</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อ</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {stat.appointments
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map((appointment, index) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                      <div>
                                        <div>{format(new Date(appointment.date), 'dd MMM yyyy', { locale: th })}</div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {appointment.time}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {appointment.title || '-'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {appointment.status === 'completed' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        เสร็จสิ้น
                                      </span>
                                    )}
                                    {appointment.status === 'confirmed' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        ยืนยันแล้ว
                                      </span>
                                    )}
                                    {appointment.status === 'pending' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        รอยืนยัน
                                      </span>
                                    )}
                                    {appointment.status === 'failed' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        ไม่มาตามนัด
                                      </span>
                                    )}
                                    {appointment.status === 'rejected' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        ปฏิเสธ
                                      </span>
                                    )}
                                    {appointment.status === 'no_response' && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        ไม่ตอบรับ
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Project Summary */}
                      <div className="mt-4 grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">ทั้งหมด</p>
                          <p className="text-lg font-bold text-gray-900">{stat.totalMeetings}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-green-600">เสร็จสิ้น</p>
                          <p className="text-lg font-bold text-green-900">{stat.completedCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-red-600">ไม่มาตามนัด</p>
                          <p className="text-lg font-bold text-red-900">{stat.failedCount}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีการนัดหมาย</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            สรุปสถานะการนัดหมาย
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวน
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เปอร์เซ็นต์
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-green-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">เสร็จสิ้น</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-green-900">{overallStats.completedAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.completedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">ยืนยันแล้ว</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-blue-900">{overallStats.confirmedAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.confirmedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-yellow-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">รอยืนยัน</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-yellow-900">{overallStats.pendingAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.pendingAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-red-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">ไม่มาตามนัด</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-red-900">{overallStats.failedAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.failedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">ปฏิเสธ</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-gray-900">{overallStats.rejectedAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.rejectedAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-orange-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">ไม่ตอบรับ</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-orange-900">{overallStats.noResponseAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    {overallStats.totalAppointments > 0 ? ((overallStats.noResponseAppointments / overallStats.totalAppointments) * 100).toFixed(1) : '0.0'}%
                  </span>
                </td>
              </tr>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">รวมทั้งหมด</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-2xl font-bold text-gray-900">{overallStats.totalAppointments}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-900">
                    100%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-100 truncate">อัตราการมาตามนัด</dt>
                  <dd className="text-4xl font-bold text-white">{attendanceRate}%</dd>
                  <dd className="text-xs text-green-100 mt-1">
                    จาก {overallStats.completedAppointments + overallStats.failedAppointments} นัดที่เกิดขึ้น
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden shadow-lg rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-100 truncate">อัตราความสำเร็จ</dt>
                  <dd className="text-4xl font-bold text-white">{successRate}%</dd>
                  <dd className="text-xs text-blue-100 mt-1">
                    {overallStats.completedAppointments} / {overallStats.totalAppointments} นัดหมาย
                  </dd>
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