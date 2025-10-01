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
  Archive
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
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveData, setArchiveData] = useState({
    finalGrade: '',
    projectType: '',
    technologyUsed: '',
    keywords: ''
  });
  const [archiving, setArchiving] = useState(false);
  const [sortBy, setSortBy] = useState<'status' | 'date'>('status');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รอยืนยัน' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ยืนยันแล้ว' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'เสร็จสิ้น' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'ไม่มาตามนัด' },
      rejected: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ปฏิเสธ' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ยกเลิก' },
      pending_student_confirmation: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'รอนักศึกษายืนยัน' },
      pending_advisor_confirmation: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'รออาจารย์ยืนยัน' },
      no_response: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'ไม่ตอบรับ' }
    };

    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const handleEditNotes = (appointmentId: string, currentNotes: string) => {
    setEditingNotes(appointmentId);
    setNotesText(currentNotes || '');
  };

  const handleSaveNotes = async (appointmentId: string) => {
    try {
      await appointmentAPI.updateAppointment(appointmentId, { notes: notesText });
      setEditingNotes(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกหมายเหตุ');
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText('');
  };

  const handleArchiveProject = async () => {
    if (!project) {
      alert('ไม่พบข้อมูลโปรเจค');
      return;
    }

    setArchiving(true);
    try {
      const stats = calculateStats();
      const archivePayload = {
        projectId: project.id,
        projectName: project.name,
        advisorName: `${project.advisor.firstName} ${project.advisor.lastName}`,
        studentNames: project.students.map(student => `${student.firstName} ${student.lastName}`),
        totalAppointments: stats.totalAppointments,
        completedAppointments: stats.completedAppointments,
        successRate: stats.successRate,
        attendanceRate: stats.attendanceRate,
        appointmentDetails: appointments.map(apt => ({
          id: apt.id,
          title: apt.title,
          date: apt.date,
          time: apt.time,
          location: apt.location,
          status: apt.status,
          notes: apt.notes
        })),
        finalGrade: archiveData.finalGrade || 'A',
        projectType: archiveData.projectType || 'Web Application',
        technologyUsed: archiveData.technologyUsed ? archiveData.technologyUsed.split(',').map(tech => tech.trim()) : ['React', 'Node.js', 'PostgreSQL'],
        keywords: archiveData.keywords ? archiveData.keywords.split(',').map(keyword => keyword.trim()) : ['การนัดหมาย', 'ระบบจัดการ']
      };

      const response = await fetch('http://localhost:3001/api/project-archive/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(archivePayload)
      });

      if (response.ok) {
        await response.json();
        alert('จัดเก็บโปรเจคเรียบร้อยแล้ว!');
        setShowArchiveModal(false);
        setArchiveData({
          finalGrade: '',
          projectType: '',
          technologyUsed: '',
          keywords: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('เกิดข้อผิดพลาดในการจัดเก็บโปรเจค');
    } finally {
      setArchiving(false);
    }
  };

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600">ตารางการนัดหมาย</p>
            </div>
          </div>
          {user?.role === 'advisor' && (
            <button
              onClick={() => setShowArchiveModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              จัดเก็บโปรเจค
            </button>
          )}
        </div>
        
        {/* Mini Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-blue-600">การนัดทั้งหมด</p>
              <p className="text-xl font-bold text-blue-900">{stats.totalAppointments}</p>
            </div>
          </div>
          <div className="flex items-center justify-center bg-green-50 px-4 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-green-600">เสร็จสิ้นแล้ว</p>
              <p className="text-xl font-bold text-green-900">{stats.completedAppointments}</p>
            </div>
          </div>
          <div className="flex items-center justify-center bg-purple-50 px-4 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-purple-600">อัตราความสำเร็จ</p>
              <p className="text-xl font-bold text-purple-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-indigo-500 mr-2" />
          ข้อมูลโปรเจค
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">ชื่อโปรเจค:</span>
              <span className="text-sm text-gray-900">{project.name}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">อาจารย์ที่ปรึกษา:</span>
              <span className="text-sm text-gray-900">{project.advisor.firstName} {project.advisor.lastName}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">อีเมล:</span>
              <span className="text-sm text-gray-900">{project.advisor.email}</span>
            </div>
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">เบอร์โทร:</span>
              <span className="text-sm text-gray-900">{project.advisor.phone || '-'}</span>
            </div>
            {project.advisor.office && (
              <div className="flex items-start">
                <span className="text-sm font-semibold text-gray-700 w-32">ห้องทำงาน:</span>
                <span className="text-sm text-gray-900">{project.advisor.office}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">นักศึกษา:</span>
              <div className="flex-1">
                {project.students.map((student, index) => (
                  <div key={student.id} className="text-sm text-gray-900 mb-2">
                    <div className="font-medium">{index + 1}. {student.firstName} {student.lastName}</div>
                    <div className="text-xs text-gray-500 ml-4">
                      รหัส: {student.studentId} | {student.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {project.academicYear && (
              <div className="flex items-start">
                <span className="text-sm font-semibold text-gray-700 w-32">ปีการศึกษา:</span>
                <span className="text-sm text-gray-900">{project.academicYear}</span>
              </div>
            )}
            <div className="flex items-start">
              <span className="text-sm font-semibold text-gray-700 w-32">สร้างเมื่อ:</span>
              <span className="text-sm text-gray-900">{format(new Date(project.createdAt), 'dd MMMM yyyy', { locale: th })}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
              ตารางการนัดหมาย
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({filterStatus === 'all' ? `ทั้งหมด ${appointments.length}` : `${appointments.filter(a => a.status === filterStatus).length}`} ครั้ง)
              </span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">แสดง:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="failed">ไม่มาตามนัด</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'status' | 'date')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="status">สถานะ</option>
                  <option value="date">วันที่</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>ยังไม่มีการนัดหมาย</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    ลำดับที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    วันที่และเวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    หัวข้อการนัดหมาย
                  </th>
                  {user?.role === 'advisor' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมายเหตุ
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments
                  .filter(appointment => {
                    if (filterStatus === 'all') return true;
                    return appointment.status === filterStatus;
                  })
                  .sort((a, b) => {
                    if (sortBy === 'status') {
                      // Sort by status first (completed -> confirmed -> pending -> others)
                      const statusOrder: { [key: string]: number } = {
                        completed: 1,
                        confirmed: 2,
                        pending: 3,
                        pending_student_confirmation: 4,
                        pending_advisor_confirmation: 5,
                        rejected: 6,
                        failed: 7,
                        cancelled: 8,
                        no_response: 9
                      };
                      const statusDiff = (statusOrder[a.status] || 10) - (statusOrder[b.status] || 10);
                      if (statusDiff !== 0) return statusDiff;
                      
                      // Then sort by date
                      return new Date(a.date).getTime() - new Date(b.date).getTime();
                    } else {
                      // Sort by date only
                      return new Date(a.date).getTime() - new Date(b.date).getTime();
                    }
                  })
                  .map((appointment, index) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: th })}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{appointment.title || '-'}</div>
                        </div>
                      </td>
                      {user?.role === 'advisor' && (
                        <td className="px-6 py-4">
                          {editingNotes === appointment.id ? (
                            <div className="flex items-center space-x-2">
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                              />
                              <button
                                onClick={() => handleSaveNotes(appointment.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="บันทึก"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="ยกเลิก"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 text-sm text-gray-600">
                                {appointment.notes || '-'}
                              </div>
                              {appointment.status === 'completed' && (
                                <button
                                  onClick={() => handleEditNotes(appointment.id, appointment.notes || '')}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="แก้ไข"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Archive className="h-5 w-5 mr-2 text-green-600" />
                  ยืนยันการจัดเก็บโปรเจค
                </h3>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  คุณต้องการจัดเก็บโปรเจค <strong>"{project?.name}"</strong> หรือไม่?
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">ข้อมูลที่จะจัดเก็บ:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>การนัดหมายทั้งหมด:</strong> {stats.totalAppointments} ครั้ง</p>
                    <p><strong>การนัดหมายที่เสร็จสิ้น:</strong> {stats.completedAppointments} ครั้ง</p>
                    <p><strong>อัตราความสำเร็จ:</strong> {stats.successRate}%</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">ข้อมูลเพิ่มเติม (ไม่บังคับ):</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        เกรดสุดท้าย
                      </label>
                      <select
                        value={archiveData.finalGrade}
                        onChange={(e) => setArchiveData({ ...archiveData, finalGrade: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">เลือกเกรด</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        ประเภทโปรเจค
                      </label>
                      <select
                        value={archiveData.projectType}
                        onChange={(e) => setArchiveData({ ...archiveData, projectType: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">เลือกประเภท</option>
                        <option value="Web Application">Web Application</option>
                        <option value="Mobile Application">Mobile Application</option>
                        <option value="Desktop Application">Desktop Application</option>
                        <option value="Research Project">Research Project</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleArchiveProject}
                  disabled={archiving}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {archiving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังจัดเก็บ...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      ยืนยันจัดเก็บ
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;