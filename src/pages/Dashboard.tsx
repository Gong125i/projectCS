import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { appointmentAPI, projectAPI } from '../services/api';
import type { Appointment, Project } from '../types/index';
import { 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  FolderOpen,
  Bell,
  MapPin,
  Edit
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    projectId: ''
  });
  const navigate = useNavigate();

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

  // คำนวณสถิติ
  const stats = {
    totalAppointments: appointments.length,
    totalProjects: projects.length,
    completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
    pendingAppointments: appointments.filter(apt => 
      apt.status === 'pending' || 
      apt.status === 'pending_student_confirmation' || 
      apt.status === 'pending_advisor_confirmation'
    ).length,
    confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
  };

  // กรองนัดหมายตามสถานะ
  const pendingAppointments = appointments
    .filter(apt => apt.status === 'pending' || apt.status === 'pending_student_confirmation' || apt.status === 'pending_advisor_confirmation')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingAppointments = appointments
    .filter(apt => {
      try {
        const aptDate = parseISO(apt.date);
        const today = new Date();
        return apt.status === 'confirmed' && aptDate >= today;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentCompletedAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getDateLabel = (date: string) => {
    try {
      const aptDate = parseISO(date);
      if (isToday(aptDate)) return 'วันนี้';
      if (isTomorrow(aptDate)) return 'พรุ่งนี้';
      return format(aptDate, 'dd MMM yyyy', { locale: th });
    } catch {
      return date;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_student_confirmation':
        return 'รอนักศึกษายืนยันการเปลี่ยนแปลง';
      case 'pending_advisor_confirmation':
        return 'รออาจารย์ยืนยันการเปลี่ยนแปลง';
      case 'pending':
        return 'รอดำเนินการ';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'rejected':
        return 'ปฏิเสธแล้ว';
      case 'failed':
        return 'ไม่มาตามนัด';
      default:
        return 'รอดำเนินการ';
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.confirmAppointment(appointmentId);
      await fetchData();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('เกิดข้อผิดพลาดในการยืนยันนัดหมาย');
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะปฏิเสธนัดหมายนี้?')) {
      try {
        await appointmentAPI.rejectAppointment(appointmentId);
        await fetchData();
      } catch (error) {
        console.error('Error rejecting appointment:', error);
        alert('เกิดข้อผิดพลาดในการปฏิเสธนัดหมาย');
      }
    }
  };

  const handleStudentAccept = async (appointmentId: string) => {
    try {
      await appointmentAPI.studentAcceptAppointment(appointmentId);
      await fetchData();
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('เกิดข้อผิดพลาดในการยอมรับนัดหมาย');
    }
  };

  const handleStudentReject = async (appointmentId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะปฏิเสธนัดหมายนี้?')) {
      try {
        await appointmentAPI.studentRejectAppointment(appointmentId);
        await fetchData();
      } catch (error) {
        console.error('Error rejecting appointment:', error);
        alert('เกิดข้อผิดพลาดในการปฏิเสธนัดหมาย');
      }
    }
  };

  const handleAttendanceConfirmation = async (appointmentId: string, status: 'completed' | 'failed') => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, status);
      await fetchData();
    } catch (error) {
      console.error('Failed to update attendance status:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสถานะการเข้าร่วม');
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    
    try {
      let appointmentData;
      
      if (user?.role === 'advisor') {
        // Advisor updates appointment
        appointmentData = {
          ...formData,
          date: new Date(formData.date),
          advisorId: user.id
        };
      } else if (user) {
        // Student updates appointment
        const studentProject = projects.find(project => 
          project.students?.some(student => student.id === user.id)
        );
        
        if (!studentProject) {
          alert('คุณยังไม่ได้เข้าร่วมโปรเจคใดๆ กรุณาติดต่ออาจารย์ที่ปรึกษา');
          return;
        }
        
        appointmentData = {
          title: formData.title,
          date: new Date(formData.date),
          time: formData.time,
          location: formData.location,
          notes: formData.notes,
          advisorId: studentProject.advisorId,
          projectId: studentProject.id
        };
      }
      
      if (!appointmentData) {
        alert('เกิดข้อผิดพลาดในการแก้ไขนัดหมาย');
        return;
      }
      
      await appointmentAPI.updateAppointment(selectedAppointment.id, appointmentData);
      
      // Refresh ข้อมูลทันทีก่อนปิด Modal
      await fetchData();
      
      setShowEditModal(false);
      setSelectedAppointment(null);
      setFormData({ title: '', date: '', time: '', location: '', notes: '', projectId: '' });
      
      // แสดงข้อความแจ้งเตือน
      if (user?.role === 'advisor') {
        alert('แก้ไขนัดหมายเรียบร้อย สถานะเปลี่ยนเป็น "รอนักศึกษายืนยันการเปลี่ยนแปลง"');
      } else {
        alert('แก้ไขนัดหมายเรียบร้อย สถานะเปลี่ยนเป็น "รออาจารย์ยืนยันการเปลี่ยนแปลง"');
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขนัดหมาย');
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          หน้าแรก
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.firstName} {user?.lastName} ({user?.role === 'student' ? 'นักศึกษา' : 'อาจารย์ที่ปรึกษา'})
        </p>
      </div>

      {/* สถิติแบบง่ายๆ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">นัดหมายทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">เสร็จสิ้น</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedAppointments}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">รอดำเนินการ</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pendingAppointments + stats.confirmedAppointments}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">โปรเจค</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* นัดหมายที่รอดำเนินการ - แสดงก่อน */}
      {pendingAppointments.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-yellow-800">
              รอการดำเนินการ ({pendingAppointments.length})
            </h2>
            </div>
          <div className="space-y-2">
            {pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white border border-yellow-200 rounded p-3"
              >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        📅 {getDateLabel(appointment.date)} เวลา {appointment.time}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        appointment.status === 'pending_student_confirmation' || appointment.status === 'pending_advisor_confirmation'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {getStatusText(appointment.status)}
                        </span>
                      </div>
                    <h3 className="font-semibold text-gray-900">{appointment.title || 'ไม่มีหัวข้อ'}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>โปรเจค: {appointment.project?.name || '-'}</div>
                      {appointment.location && <div>สถานที่: {appointment.location}</div>}
                    </div>
                  </div>

                  {/* ปุ่มจัดการ */}
                  <div className="flex flex-col space-y-1.5 ml-3">
                    {/* ปุ่มสำหรับอาจารย์ */}
                    {user?.role === 'advisor' && (appointment.status === 'pending' || appointment.status === 'pending_advisor_confirmation') && (
                      <>
                        <button
                          onClick={() => handleConfirmAppointment(appointment.id)}
                          className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded"
                        >
                          ✓ ยืนยัน
                        </button>
                        <button
                          onClick={() => handleRejectAppointment(appointment.id)}
                          className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          ✕ ปฏิเสธ
                        </button>
                      </>
                    )}
                    
                    {/* ปุ่มสำหรับนักศึกษา */}
                    {user?.role === 'student' && (appointment.status === 'pending' || appointment.status === 'pending_student_confirmation') && (
                      <>
                        <button
                          onClick={() => handleStudentAccept(appointment.id)}
                          className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded"
                        >
                          ✓ ยอมรับ
                        </button>
                        <button
                          onClick={() => handleStudentReject(appointment.id)}
                          className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          ✕ ปฏิเสธ
                        </button>
                      </>
                    )}
                    
                    {/* ปุ่มแก้ไข - แสดงเสมอยกเว้นสถานะรอยืนยัน */}
                    {appointment.status !== 'pending_student_confirmation' && appointment.status !== 'pending_advisor_confirmation' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setFormData({
                            title: appointment.title || '',
                            date: format(parseISO(appointment.date), 'yyyy-MM-dd'),
                            time: appointment.time,
                            location: appointment.location,
                            notes: appointment.notes || '',
                            projectId: appointment.projectId || ''
                          });
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1 text-xs text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded"
                      >
                        แก้ไข
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

      {/* นัดหมายที่กำลังจะมาถึง */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                📅 นัดหมายที่กำลังจะมาถึง
              </h2>
              <button
                onClick={() => navigate('/appointments')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ดูทั้งหมด →
              </button>
            </div>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-green-200 rounded p-3 bg-green-50"
                  >
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-medium ${
                            isToday(parseISO(appointment.date))
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            📅 {getDateLabel(appointment.date)} เวลา {appointment.time}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            ✓ ยืนยันแล้ว
                        </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{appointment.title || 'ไม่มีหัวข้อ'}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>โปรเจค: {appointment.project?.name || '-'}</div>
                          {appointment.location && <div>สถานที่: {appointment.location}</div>}
                        </div>
                      </div>

                      {/* ปุ่มจัดการ */}
                      <div className="flex flex-col space-y-1.5 ml-3">
                        {/* ปุ่มสำหรับอาจารย์ - บันทึกการเข้าร่วม */}
                        {user?.role === 'advisor' && (
                          <>
                            <button
                              onClick={() => handleAttendanceConfirmation(appointment.id, 'completed')}
                              className="px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded"
                            >
                              ✓ มาตามนัด
                            </button>
                            <button
                              onClick={() => handleAttendanceConfirmation(appointment.id, 'failed')}
                              className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                            >
                              ✕ ไม่มาตามนัด
                            </button>
                          </>
                        )}
                        
                        {/* ปุ่มแก้ไข */}
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setFormData({
                              title: appointment.title || '',
                              date: format(parseISO(appointment.date), 'yyyy-MM-dd'),
                              time: appointment.time,
                              location: appointment.location,
                              notes: appointment.notes || '',
                              projectId: appointment.projectId || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1 text-xs text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded"
                        >
                          แก้ไข
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">ไม่มีนัดหมายที่กำลังจะมาถึง</p>
                </div>
              )}
            </div>
          </div>

      {/* นัดหมายที่เสร็จสิ้นแล้ว */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              ✅ นัดหมายที่เสร็จสิ้น
            </h2>
          </div>
          <div className="p-6">
            {recentCompletedAppointments.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded p-3"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">
                        📅 {getDateLabel(appointment.date)} เวลา {appointment.time}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        เสร็จสิ้น
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{appointment.title || 'ไม่มีหัวข้อ'}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      โปรเจค: {appointment.project?.name || '-'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">ยังไม่มีนัดหมายที่เสร็จสิ้น</p>
              </div>
            )}
          </div>
        </div>

      {/* โปรเจค */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            โปรเจคของฉัน
          </h2>
          </div>
          <div className="p-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectAppointments = appointments.filter(apt => apt.projectId === project.id);
                const completedCount = projectAppointments.filter(apt => apt.status === 'completed').length;

                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">{project.name}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>นักศึกษา:</span>
                        <span className="font-medium">{project.students?.length || 0} คน</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>การนัดหมาย:</span>
                        <span className="font-medium">{projectAppointments.length} ครั้ง</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>เสร็จสิ้น:</span>
                        <span className="font-medium text-green-600">{completedCount} ครั้ง</span>
                      </div>
                      {project.academicYear && (
                        <div className="flex items-center justify-between">
                          <span>ปีการศึกษา:</span>
                          <span className="font-medium">{project.academicYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">ยังไม่มีโปรเจค</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แก้ไขนัดหมาย</h3>
              <form onSubmit={handleUpdateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">หัวข้อการนัดหมาย</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น ปรึกษาโครงงาน, รายงานความคืบหน้า"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">วันที่</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">เวลา</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">สถานที่</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">หมายเหตุ</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                {user?.role === 'advisor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">โปรเจค</label>
                    <select
                      required
                      value={formData.projectId}
                      onChange={(e) => setFormData({
                        ...formData,
                        projectId: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">เลือกโปรเจค</option>
                      {projects.map((project, index) => (
                        <option key={`project-${project.id}-${index}`} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;