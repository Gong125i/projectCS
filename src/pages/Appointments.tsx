import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, projectAPI } from '../services/api';
import type { Appointment, Project } from '../types/index.js';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
    projectId: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [appointmentsData, projectsData] = await Promise.all([
        appointmentAPI.getAppointments(),
        projectAPI.getProjects()
      ]);
      
      // Remove duplicates based on ID
      const uniqueAppointments = appointmentsData.filter((appointment, index, self) => 
        index === self.findIndex(a => a.id === appointment.id)
      );
      
      setAppointments(uniqueAppointments);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let appointmentData;
      
      if (user?.role === 'advisor') {
        // Advisor creates project-based appointment
        appointmentData = {
          ...formData,
          advisorId: user.id
        };
      } else if (user) {
        // Student creates appointment to their advisor
        // Find the student's project
        const studentProject = projects.find(project => 
          project.students?.some(student => student.id === user.id)
        );
        
        if (!studentProject) {
          alert('คุณยังไม่ได้เข้าร่วมโปรเจคใดๆ กรุณาติดต่ออาจารย์ที่ปรึกษา');
          return;
        }
        
        appointmentData = {
          date: formData.date,
          time: formData.time,
          location: formData.location,
          notes: formData.notes,
          advisorId: studentProject.advisorId,
          projectId: studentProject.id
        };
      }
      
      if (!appointmentData) {
        alert('เกิดข้อผิดพลาดในการสร้างนัดหมาย');
        return;
      }
      
      await appointmentAPI.createAppointment(appointmentData);
      setShowCreateModal(false);
      setFormData({ date: '', time: '', location: '', notes: '', projectId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create appointment:', error);
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
      setShowEditModal(false);
      setSelectedAppointment(null);
      setFormData({ date: '', time: '', location: '', notes: '', projectId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบนัดหมายนี้?')) {
      try {
        await appointmentAPI.deleteAppointment(appointmentId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
      }
    }
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">จัดการนัดหมาย</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          สร้างนัดหมายใหม่
        </button>
      </div>


      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {appointments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((appointment) => (
            <li key={appointment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(appointment.status)}
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.project 
                            ? `โปรเจค: ${appointment.project.name}`
                            : user?.role === 'student' 
                              ? `อาจารย์ที่ปรึกษา: ${appointment.advisor.firstName} ${appointment.advisor.lastName}`
                              : appointment.student 
                                ? `${appointment.student.firstName} ${appointment.student.lastName}`
                                : 'ไม่ระบุผู้ใช้'
                          }
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(appointment.status, appointment)}
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: th })}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {appointment.time}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && user?.role === 'advisor' && appointment.studentId && (
                      <>
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
                      </>
                    )}
                    {appointment.status === 'pending' && user?.role === 'student' && !appointment.studentId && (
                      <>
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
                      </>
                    )}
                    {appointment.status === 'confirmed' && user?.role === 'advisor' && (
                      <>
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
                      </>
                    )}
                    {/* แสดงปุ่มแก้ไขและลบเฉพาะเมื่อนัดหมายยังไม่เสร็จสิ้นหรือถูกปฏิเสธ */}
                    {!['completed', 'failed', 'rejected'].includes(appointment.status) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setFormData({
                              date: format(new Date(appointment.date), 'yyyy-MM-dd'),
                              time: appointment.time,
                              location: appointment.location,
                              notes: appointment.notes || '',
                              projectId: appointment.projectId || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          ลบ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">สร้างนัดหมายใหม่</h3>
              <form onSubmit={handleCreateAppointment} className="space-y-4">
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
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    สร้าง
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แก้ไขนัดหมาย</h3>
              <form onSubmit={handleUpdateAppointment} className="space-y-4">
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

export default Appointments;
