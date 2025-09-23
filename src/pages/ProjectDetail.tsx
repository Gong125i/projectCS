import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI, appointmentAPI } from '../services/api';
import type { Project, Appointment } from '../types/index.js';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  FileText,
  Edit,
  Save,
  X as XIcon,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    
    try {
      const [projectData, appointmentsData] = await Promise.all([
        projectAPI.getProject(id),
        appointmentAPI.getProjectAppointments(id)
      ]);
      setProject(projectData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
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
        return <Check className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        return 'รอการยืนยัน';
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

  const handleEditNotes = (appointmentId: string, currentNotes: string) => {
    setEditingNotes(appointmentId);
    setNotesText(currentNotes || '');
  };

  const handleSaveNotes = async (appointmentId: string) => {
    try {
      console.log('Updating notes for appointment:', appointmentId, 'with notes:', notesText);
      await appointmentAPI.updateAppointment(appointmentId, { notes: notesText });
      setEditingNotes(null);
      setNotesText('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText('');
  };

  // Calculate appointment statistics
  const calculateStats = () => {
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length;
    const failedAppointments = appointments.filter(apt => apt.status === 'failed').length;
    const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected').length;
    
    const successRate = totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : '0.0';
    const attendanceRate = (completedAppointments + failedAppointments) > 0 
      ? ((completedAppointments / (completedAppointments + failedAppointments)) * 100).toFixed(1) 
      : '0.0';

    return {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      confirmedAppointments,
      failedAppointments,
      rejectedAppointments,
      successRate,
      attendanceRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ไม่พบข้อมูลโปรเจค</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          กลับไปหน้ารายการโปรเจค
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-white hover:text-indigo-200 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-indigo-100 text-lg">รายละเอียดโปรเจค</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-indigo-200">จำนวนนัดหมาย</p>
              <p className="text-2xl font-bold text-white">{stats.totalAppointments}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200">อัตราความสำเร็จ</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-lg border border-indigo-100">
        <div className="px-6 py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 text-indigo-500 mr-2" />
            ข้อมูลโปรเจค
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Advisor Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">อาจารย์ที่ปรึกษา</h3>
                  <p className="text-sm text-blue-600">Project Advisor</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-lg font-medium text-gray-900">
                  {project.advisor.firstName} {project.advisor.lastName}
                </p>
                {project.advisor.email && (
                  <p className="text-sm text-gray-600 mt-1">{project.advisor.email}</p>
                )}
              </div>
            </div>

            {/* Students Count */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">จำนวนนักศึกษา</h3>
                  <p className="text-sm text-green-600">Total Students</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-3xl font-bold text-green-900">{project.students.length}</p>
                <p className="text-sm text-gray-600 mt-1">คน</p>
              </div>
            </div>
          </div>

          {/* Students List */}
          {project.students.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                รายชื่อนักศึกษา
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.students.map((student, index) => (
                  <div key={student.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.studentId && (
                          <p className="text-sm text-gray-600">{student.studentId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Statistics */}
      <div className="bg-white rounded-lg shadow-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            สถิติการนัดหมาย
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Appointments */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">นัดหมายทั้งหมด</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">อัตราความสำเร็จ</p>
                  <p className="text-3xl font-bold text-green-900">{stats.successRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">อัตราการมาตามนัด</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.attendanceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Completed Appointments */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">นัดหมายที่สำเร็จ</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.completedAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดสถานะ</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingAppointments}</p>
                <p className="text-sm text-yellow-600">รอการยืนยัน</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.confirmedAppointments}</p>
                <p className="text-sm text-blue-600">ยืนยันแล้ว</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.completedAppointments}</p>
                <p className="text-sm text-green-600">เสร็จสิ้น</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-900">{stats.failedAppointments}</p>
                <p className="text-sm text-red-600">ไม่มาตามนัด</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="h-4 w-4 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejectedAppointments}</p>
                <p className="text-sm text-gray-600">ปฏิเสธ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Appointments */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 text-gray-500 mr-2" />
            นัดหมายที่สำเร็จแล้ว
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {appointments.filter(apt => apt.status === 'completed').length} ครั้ง
            </span>
          </h2>
        </div>
        <div className="p-6">
          {appointments.filter(apt => apt.status === 'completed').length > 0 ? (
            <div className="space-y-6">
              {appointments
                .filter(apt => apt.status === 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((appointment, index) => {
                  const totalCompleted = appointments.filter(apt => apt.status === 'completed').length;
                  const appointmentNumber = totalCompleted - index;
                  return (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">#{appointmentNumber}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            การนัดหมายครั้งที่ {appointmentNumber}
                          </h3>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            เสร็จสิ้น
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600 bg-white rounded-lg p-3">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">{format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: th })}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-white rounded-lg p-3">
                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-white rounded-lg p-3">
                            <MapPin className="h-4 w-4 mr-2 text-red-500" />
                            <span className="font-medium">{appointment.location}</span>
                          </div>
                        </div>
                        
                        {/* Notes Section */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-base font-semibold text-gray-800 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-blue-500" />
                              บันทึกการนัดหมาย
                            </h4>
                            {user?.role === 'advisor' && (
                              <button
                                onClick={() => handleEditNotes(appointment.id, appointment.notes || '')}
                                className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                แก้ไข
                              </button>
                            )}
                          </div>
                          
                          {editingNotes === appointment.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder="เขียนบันทึกการนัดหมาย..."
                                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows={4}
                              />
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleSaveNotes(appointment.id)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  บันทึก
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <XIcon className="h-4 w-4 mr-2" />
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              {appointment.notes ? (
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{appointment.notes}</p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">ยังไม่มีบันทึกการนัดหมาย</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีการนัดหมายที่สำเร็จแล้ว</h3>
              <p className="text-gray-500">เมื่อมีการนัดหมายที่เสร็จสิ้น จะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>

      {/* Other Appointments */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            นัดหมายอื่นๆ
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {appointments.filter(apt => apt.status !== 'completed').length} รายการ
            </span>
          </h2>
        </div>
        <div className="p-6">
          {appointments.filter(apt => apt.status !== 'completed').length > 0 ? (
            <div className="space-y-4">
              {appointments
                .filter(apt => apt.status !== 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((appointment) => (
                <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            {appointment.project 
                              ? `โปรเจค: ${appointment.project.name}`
                              : user?.role === 'student' 
                                ? `อาจารย์ที่ปรึกษา: ${appointment.advisor.firstName} ${appointment.advisor.lastName}`
                                : appointment.student 
                                  ? `${appointment.student.firstName} ${appointment.student.lastName}`
                                  : 'ไม่ระบุผู้ใช้'
                            }
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="font-medium">{format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: th })}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <MapPin className="h-4 w-4 mr-2 text-red-500" />
                            <span className="font-medium">{appointment.location}</span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-sm text-gray-700">
                              <strong className="text-blue-800">หมายเหตุ:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีการนัดหมายอื่นๆ</h3>
              <p className="text-gray-500">เมื่อมีการนัดหมายใหม่ จะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;