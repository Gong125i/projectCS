import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { appointmentAPI, projectAPI } from '../services/api';
import type { Appointment, Project } from '../types/index';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FolderOpen, 
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [appointmentsData, projectsData] = await Promise.all([
        appointmentAPI.getAppointments(),
        projectAPI.getProjects()
      ]);
      setAppointments(appointmentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleStatusChange = async (appointmentId: string, status: 'confirm' | 'reject') => {
    try {
      if (status === 'confirm') {
        await appointmentAPI.confirmAppointment(appointmentId);
      } else {
        await appointmentAPI.rejectAppointment(appointmentId);
      }
      fetchData();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleStudentAccept = async (appointmentId: string) => {
    try {
      await appointmentAPI.studentAcceptAppointment(appointmentId);
      fetchData();
    } catch (error) {
      console.error('Student accept error:', error);
    }
  };

  const handleStudentReject = async (appointmentId: string) => {
    try {
      await appointmentAPI.studentRejectAppointment(appointmentId);
      fetchData();
    } catch (error) {
      console.error('Student reject error:', error);
    }
  };

  const handleAttendanceConfirmation = async (appointmentId: string, status: 'completed' | 'failed') => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, status);
      fetchData();
    } catch (error) {
      console.error('Failed to update attendance status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string, appointment: any) => {
    switch (status) {
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        // Check who created the appointment
        if (appointment.studentId && appointment.studentId !== null) {
          // Student created appointment, waiting for advisor
          return 'รอการยืนยันจากอาจารย์';
        } else {
          // Advisor created appointment, waiting for student
          return 'รอการยืนยันจากนักศึกษา';
        }
      case 'cancelled':
        return 'ยกเลิก';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'failed':
        return 'ไม่มาตามนัด';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          สวัสดี, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'student' ? 'นักศึกษา' : 'อาจารย์ที่ปรึกษา'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">นัดหมายทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">นัดหมายที่ยืนยัน</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">รอการยืนยัน</p>
              <p className="text-2xl font-semibold text-gray-900">
                {appointments.filter(apt => apt.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">โครงงาน</p>
              <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">นัดหมายที่กำลังจะมาถึง</h3>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={`upcoming-${appointment.id}-${appointment.date}-${appointment.time}-${index}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.project 
                            ? `โปรเจค: ${appointment.project.name}`
                            : user?.role === 'student' 
                              ? `อาจารย์ที่ปรึกษา: ${appointment.advisor.firstName} ${appointment.advisor.lastName}`
                              : appointment.student 
                                ? `${appointment.student.firstName} ${appointment.student.lastName}`
                                : 'ไม่ระบุผู้ใช้'
                          }
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: th })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {appointment.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(appointment.status, appointment)}
                        </span>
                        {appointment.status === 'pending' && user?.role === 'advisor' && appointment.studentId && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(appointment.id, 'confirm')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              ยืนยัน
                            </button>
                            <button
                              onClick={() => handleStatusChange(appointment.id, 'reject')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                        {appointment.status === 'pending' && user?.role === 'student' && !appointment.studentId && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStudentAccept(appointment.id)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              ยอมรับ
                            </button>
                            <button
                              onClick={() => handleStudentReject(appointment.id)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                        {appointment.status === 'confirmed' && user?.role === 'advisor' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAttendanceConfirmation(appointment.id, 'completed')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              มาตามนัด
                            </button>
                            <button
                              onClick={() => handleAttendanceConfirmation(appointment.id, 'failed')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              ไม่มาตามนัด
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีนัดหมายที่กำลังจะมาถึง</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">การแจ้งเตือนล่าสุด</h3>
          </div>
          <div className="p-6">
            {recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification, index) => (
                  <div key={`notification-${notification.id}-${notification.createdAt}-${index}`} className={`p-4 border-l-4 rounded-r-lg ${
                    notification.isRead ? 'border-gray-200 bg-gray-50' : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start">
                      <Bell className={`h-5 w-5 mt-0.5 mr-3 ${
                        notification.isRead ? 'text-gray-400' : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          notification.isRead ? 'text-gray-600' : 'text-blue-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(notification.createdAt), 'd MMM yyyy HH:mm', { locale: th })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ไม่มีการแจ้งเตือนใหม่</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
