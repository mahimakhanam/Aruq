import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from './Layout';
import {
  BarChart3,
  Upload,
  FileText,
  CheckCircle,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  Bell,
  ChevronRight,
  X,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

type CurrentUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type SubmissionStatus =
  | 'AI Auto-Check'
  | 'AI Approved'
  | 'Flagged'
  | 'Heritage Check'
  | 'Published'
  | 'Needs Revision';

type SubmissionCategory =
  | 'safe'
  | 'unsafe'
  | 'system_error'
  | 'pending'
  | '';

type Submission = {
  id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  fileName: string;
  fileSize: string;
  dateSubmitted: string;
  status: SubmissionStatus;
  authorEmail: string;
  authorId?: string;
  source?: 'Firestore' | 'Local';
  createdAtMillis?: number;
  aiCategory?: SubmissionCategory;
  moderationReason?: string;
};

type NewSubmissionInput = {
  title: string;
  type: string;
  category: string;
  description: string;
  fileName: string;
  fileSize: string;
  file: File;
};

const CURRENT_USER_KEY = 'aruqCurrentUser';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const API_BASE = 'https://aruq-backend.onrender.com';

const ALLOWED_FILE_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'png',
  'jpg',
  'jpeg',
  'mp3',
  'mp4',
  'wav',
];

const getCurrentUser = (): CurrentUser | null => {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const getWorkflowStep = (status?: SubmissionStatus) => {
  if (!status) return 0;

  if (
    status === 'AI Auto-Check' ||
    status === 'AI Approved' ||
    status === 'Flagged'
  ) {
    return 2;
  }

  if (status === 'Heritage Check' || status === 'Needs Revision') return 3;
  if (status === 'Published') return 4;

  return 1;
};

const getStatusDescription = (status: SubmissionStatus) => {
  if (status === 'AI Auto-Check') {
    return 'The item has been uploaded and is waiting for automated review.';
  }

  if (status === 'AI Approved') {
    return 'The item passed automated review and is ready for the next verification stage.';
  }

  if (status === 'Flagged') {
    return 'The item was flagged during automated review and needs attention before continuing.';
  }

  if (status === 'Heritage Check') {
    return 'The item is waiting for cultural or historical review by a Heritage Partner.';
  }

  if (status === 'Needs Revision') {
    return 'The item needs correction before it can continue through the verification workflow.';
  }

  return 'The item has completed the verification process and is ready for public archive publishing.';
};

const isAllowedFileType = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? ALLOWED_FILE_EXTENSIONS.includes(extension) : false;
};

const getReadableBackendError = (error: unknown) => {
  console.error('Dashboard Firebase Error:', error);

  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || '';
  const message = firebaseError.message || '';

  if (code === 'permission-denied') {
    return 'Permission denied. Please check Firestore Rules and make sure you are logged in.';
  }

  if (code === 'unavailable') {
    return 'The database is temporarily unavailable. Please check your internet connection and try again.';
  }

  return `Backend error: ${code || message || 'Unknown error'}`;
};

const convertFirestoreDocToSubmission = (
  documentId: string,
  data: any
): Submission => {
  return {
    id: documentId,
    title: data.title || 'Untitled Submission',
    type: data.type || 'Document',
    category: data.category || 'Historical Document',
    description: data.description || '',
    fileName: data.fileName || 'No file name',
    fileSize: data.fileSize || 'Unknown size',
    dateSubmitted: data.dateSubmitted || 'Unknown date',
    status: data.status || 'AI Auto-Check',
    authorEmail: data.authorEmail || '',
    authorId: data.authorId || '',
    source: 'Firestore',
    createdAtMillis: data.createdAtMillis || 0,
    aiCategory: data.aiCategory || '',
    moderationReason: data.moderationReason || '',
  };
};

const NavItem = ({
  icon,
  label,
  active,
  badge,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between px-6 py-4 border-l-4 transition-colors text-left w-full ${
      active
        ? 'bg-stone-50 border-pal-red text-pal-red font-medium'
        : 'border-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900'
    } ${danger ? 'text-red-500 hover:bg-red-50 hover:text-red-600' : ''}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>

    {badge && (
      <span className="bg-pal-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all hover:border-stone-200 h-full min-w-0">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-3xl font-bold text-stone-900 leading-none">
          {value}
        </p>

        <p className="text-xs text-stone-600 uppercase tracking-wide font-medium leading-tight mt-4">
          {label}
        </p>
      </div>

      <div
        className={`w-14 h-14 rounded-lg ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const Step = ({
  number,
  title,
  active,
  current,
}: {
  number: string;
  title: string;
  active?: boolean;
  current?: boolean;
}) => (
  <div
    className={`relative z-10 flex flex-col items-center gap-2 text-center ${
      active || current ? 'opacity-100' : 'opacity-40'
    }`}
  >
    <div
      className={`
        w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors
        ${current ? 'bg-white border-pal-red text-pal-red' : ''}
        ${active && !current ? 'bg-pal-red border-pal-red text-white' : ''}
        ${!active && !current ? 'bg-stone-200 border-stone-200 text-stone-500' : ''}
      `}
    >
      {active && !current ? <CheckCircle className="w-5 h-5" /> : number}
    </div>

    <span
      className={`text-xs font-bold ${
        current ? 'text-pal-red' : 'text-stone-500'
      }`}
    >
      {title}
    </span>
  </div>
);

const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
  const style =
    status === 'Published'
      ? 'bg-green-100 text-green-700 border-green-200'
      : status === 'Flagged'
      ? 'bg-red-100 text-red-700 border-red-200'
      : status === 'Needs Revision'
      ? 'bg-red-100 text-red-700 border-red-200'
      : status === 'Heritage Check'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : status === 'AI Approved'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [backendError, setBackendError] = useState('');
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const showFutureFeature = (featureName: string) => {
    alert(`${featureName} is planned for a future version of A'ruq.`);
  };

  const loadSubmissionsFromFirestore = async () => {
    if (!currentUser) return;

    try {
      setIsLoadingSubmissions(true);
      setBackendError('');

      const submissionsRef = collection(db, 'submissions');
      const submissionsQuery = query(
        submissionsRef,
        where('authorEmail', '==', currentUser.email)
      );

      const querySnapshot = await getDocs(submissionsQuery);

      const loadedSubmissions = querySnapshot.docs
        .map((document) =>
          convertFirestoreDocToSubmission(document.id, document.data())
        )
        .sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));

      setSubmissions(loadedSubmissions);
    } catch (error) {
      setBackendError(getReadableBackendError(error));
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissionsFromFirestore();
  }, [currentUser?.email]);

  const userSubmissions = useMemo(() => {
    if (!currentUser) return [];
    return submissions.filter((item) => item.authorEmail === currentUser.email);
  }, [submissions, currentUser]);

  const publishedCount = userSubmissions.filter(
    (item) => item.status === 'Published'
  ).length;

  const pendingCount = userSubmissions.filter(
    (item) =>
      item.status === 'AI Auto-Check' || item.status === 'Heritage Check'
  ).length;

  const revisionCount = userSubmissions.filter(
    (item) => item.status === 'Needs Revision' || item.status === 'Flagged'
  ).length;

  const latestSubmission = userSubmissions[0];
  const workflowStep = getWorkflowStep(latestSubmission?.status);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem(CURRENT_USER_KEY);
      navigate('/auth');
    }
  };

  const callModeration = async (
    endpoint: string,
    body: FormData | object,
    isFormData = false
  ) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      body: isFormData ? (body as FormData) : JSON.stringify(body),
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return { response, data };
  };

  const moderateText = async (description: string) => {
    return callModeration('/moderate', { text: description });
  };

  const moderateFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      return callModeration('/moderate-document', formData, true);
    }

    if (file.type.startsWith('image/')) {
      return callModeration('/moderate-image', formData, true);
    }

    return {
      response: { ok: true },
      data: {
        status: 'approved',
        category: 'safe',
      },
    };
  };

  const handleAddSubmission = async (newSubmission: NewSubmissionInput) => {
    if (!currentUser) {
      setBackendError('You must be logged in before uploading a submission.');
      return;
    }

    try {
      setBackendError('');

      const createdAtMillis = Date.now();

      const firestoreSubmission = {
        title: newSubmission.title,
        type: newSubmission.type,
        category: newSubmission.category,
        description: newSubmission.description,
        fileName: newSubmission.fileName,
        fileSize: newSubmission.fileSize,
        dateSubmitted: getTodayDate(),
        status: 'AI Auto-Check' as SubmissionStatus,
        authorEmail: currentUser.email,
        authorId: auth.currentUser?.uid || '',
        isPublished: false,
        verificationStage: 'AI Auto-Check',
        aiCheckResult: 'Pending',
        aiCategory: 'pending',
        moderationReason: '',
        heritageReviewNote: '',
        createdAtMillis,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'submissions'), firestoreSubmission);

      const savedSubmission: Submission = {
        id: docRef.id,
        ...firestoreSubmission,
        source: 'Firestore',
      };

      setSubmissions((previousSubmissions) => [
        savedSubmission,
        ...previousSubmissions,
      ]);

      const { response: textResponse, data: textData } = await moderateText(
        newSubmission.description || ''
      );

      if (!textResponse.ok || textData.status === 'error') {
        throw new Error(textData.reason || 'Text moderation failed.');
      }

      let finalStatus: SubmissionStatus = 'AI Approved';
      let aiCheckResult = 'Approved';
      let aiCategory: SubmissionCategory = 'safe';
      let moderationReason = '';

      if (textData.status === 'flagged') {
        finalStatus = 'Flagged';
        aiCheckResult = 'Flagged';
        aiCategory = 'unsafe';
        moderationReason =
          textData.reason || 'Description flagged by AI moderation.';
      } else if (newSubmission.file) {
        const { response: fileResponse, data: fileData } = await moderateFile(
          newSubmission.file
        );

        if (!fileResponse.ok || fileData.status === 'error') {
          throw new Error(fileData.reason || 'File moderation failed.');
        }

        if (fileData.status === 'flagged') {
          finalStatus = 'Flagged';
          aiCheckResult = 'Flagged';
          aiCategory = 'unsafe';
          moderationReason =
            fileData.reason || 'File content flagged by AI moderation.';
        }
      }

      await updateDoc(doc(db, 'submissions', docRef.id), {
        status: finalStatus,
        verificationStage: 'AI Auto-Check',
        aiCheckResult,
        aiCategory,
        moderationReason,
        heritageReviewNote: moderationReason,
      });

      await loadSubmissionsFromFirestore();

      setIsUploadOpen(false);

      if (finalStatus === 'Flagged') {
        setSuccessMessage('');
        setBackendError(
          moderationReason
            ? `Submission was flagged during AI moderation: ${moderationReason}`
            : 'Submission was flagged during AI moderation.'
        );
      } else {
        setBackendError('');
        setSuccessMessage(
          'Submission uploaded successfully and approved by AI moderation.'
        );
      }
    } catch (error: any) {
      setBackendError(error.message || getReadableBackendError(error));
      throw error;
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="bg-stone-50 min-h-screen flex items-center justify-center px-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-stone-100 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-pal-red mx-auto mb-4" />

            <h1 className="text-2xl font-bold text-stone-800 mb-2">
              Please log in first
            </h1>

            <p className="text-stone-500 mb-6">
              You need to sign in before accessing the contributor dashboard.
            </p>

            <Link
              to="/auth"
              className="inline-flex bg-pal-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-stone-50 min-h-screen py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-white to-stone-50 p-6 rounded-xl shadow-sm border border-stone-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pal-green to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {currentUser.firstName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </h3>

                  <p className="text-xs text-stone-600 uppercase tracking-wider mt-0.5 font-medium">
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
              <NavItem
                icon={<BarChart3 className="w-5 h-5" />}
                label="Overview"
                active
              />

              <NavItem
                icon={<FileText className="w-5 h-5" />}
                label="My Contributions"
                onClick={() => showFutureFeature('My Contributions')}
              />

              <NavItem
                icon={<Bell className="w-5 h-5" />}
                label="Notifications"
                badge={pendingCount > 0 ? String(pendingCount) : undefined}
                onClick={() => showFutureFeature('Notifications')}
              />

              <NavItem
                icon={<User className="w-5 h-5" />}
                label="Profile Settings"
                onClick={() => showFutureFeature('Profile Settings')}
              />

              <div className="border-t border-stone-100 my-2" />

              <NavItem
                icon={<LogOut className="w-5 h-5" />}
                label="Sign Out"
                danger
                onClick={handleSignOut}
              />
            </nav>

            <div className="bg-gradient-to-br from-pal-black to-stone-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Need Help?</h4>

                <p className="text-stone-300 text-sm mb-4 leading-relaxed">
                  Contact support for archival submission or verification help.
                </p>

                <button
                  type="button"
                  onClick={() => showFutureFeature('Contact Support')}
                  className="text-xs font-bold uppercase tracking-wider text-pal-green hover:text-green-400 transition-colors"
                >
                  Contact Support →
                </button>
              </div>

              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-pal-green/10 rounded-full blur-2xl" />
            </div>
          </aside>

          <main className="lg:col-span-3 space-y-6 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-stone-900">
                  Contributor Dashboard
                </h1>

                <p className="text-stone-600 mt-2">
                  Track your cultural submissions through the verification workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="bg-pal-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
              >
                <Upload className="w-5 h-5" />
                Upload New Item
              </button>
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-300 text-green-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />

                <div className="flex-1">
                  <p className="font-bold">Upload Received</p>

                  <p className="text-sm mt-1 text-green-700">
                    {successMessage}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccessMessage('')}
                  className="text-green-700 hover:text-green-900 transition-colors"
                  aria-label="Close success message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {backendError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

                <div className="flex-1">
                  <p className="font-bold">Submission Flagged</p>

                  <p className="text-sm mt-1">{backendError}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setBackendError('')}
                  className="text-red-700 hover:text-red-900 transition-colors"
                  aria-label="Close backend error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Contributions"
                value={userSubmissions.length}
                icon={<FileText className="text-blue-500 w-6 h-6" />}
                color="bg-blue-50"
              />

              <StatCard
                label="Published Items"
                value={publishedCount}
                icon={<CheckCircle className="text-green-500 w-6 h-6" />}
                color="bg-green-50"
              />

              <StatCard
                label="Pending Review"
                value={pendingCount}
                icon={<Clock className="text-orange-500 w-6 h-6" />}
                color="bg-orange-50"
              />

              <StatCard
                label="Needs Revision"
                value={revisionCount}
                icon={<AlertCircle className="text-red-500 w-6 h-6" />}
                color="bg-red-50"
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Verification Workflow
                  </h3>

                  <p className="text-sm text-stone-600 mt-1">
                    All content must pass review before becoming public.
                  </p>
                </div>

                {latestSubmission && (
                  <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                    Tracking: <strong>{latestSubmission.title}</strong>
                  </span>
                )}
              </div>

              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-1 bg-stone-100 z-0" />

                <div
                  className="absolute top-5 left-0 h-1 bg-pal-green/30 z-0"
                  style={{
                    width:
                      workflowStep === 0
                        ? '0%'
                        : workflowStep === 1
                        ? '16%'
                        : workflowStep === 2
                        ? '33%'
                        : workflowStep === 3
                        ? '66%'
                        : workflowStep === 4
                        ? '100%'
                        : '0%',
                  }}
                />

                <Step
                  number="1"
                  title="Submission"
                  active={workflowStep > 1}
                  current={workflowStep === 1}
                />

                <Step
                  number="2"
                  title="AI Auto-Check"
                  active={workflowStep > 2}
                  current={workflowStep === 2}
                />

                <Step
                  number="3"
                  title="Heritage Check"
                  active={workflowStep > 3}
                  current={workflowStep === 3}
                />

                <Step
                  number="4"
                  title="Published"
                  current={workflowStep === 4}
                />
              </div>

              {latestSubmission && (
                <div className="mt-6 bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-pal-green shrink-0 mt-0.5" />

                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        Current Status
                      </p>

                      <p className="text-sm text-stone-700 mt-1 leading-relaxed">
                        {getStatusDescription(latestSubmission.status)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!latestSubmission && (
                <div className="mt-6 bg-stone-50 border border-dashed border-stone-300 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-500">
                    No submissions yet. Click <strong>Upload New Item</strong> to get started.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Your Submissions
                  </h3>

                  <p className="text-sm text-stone-600 mt-1">
                    These remain private until verification is complete.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadSubmissionsFromFirestore}
                  disabled={isLoadingSubmissions}
                  className="text-sm text-pal-red font-medium hover:underline self-start sm:self-auto flex items-center gap-2 disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      isLoadingSubmissions ? 'animate-spin' : ''
                    }`}
                  />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-100 text-xs uppercase font-bold text-stone-700">
                    <tr>
                      <th className="px-6 py-4 font-bold">Title</th>
                      <th className="px-6 py-4 font-bold">Type</th>
                      <th className="px-6 py-4 font-bold">Date</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 text-right font-bold">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {isLoadingSubmissions ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="text-center">
                            <RefreshCw className="w-10 h-10 text-stone-300 mx-auto mb-3 animate-spin" />

                            <p className="text-stone-600 font-medium">
                              Loading submissions...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : userSubmissions.length > 0 ? (
                      userSubmissions.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-stone-800">
                            {item.title}
                          </td>

                          <td className="px-6 py-4">{item.type}</td>

                          <td className="px-6 py-4 text-stone-500">
                            {item.dateSubmitted}
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedSubmission(item)}
                              className="text-stone-400 hover:text-pal-black"
                              aria-label={`View details for ${item.title}`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-stone-300 mx-auto mb-3" />

                            <p className="text-stone-600 font-medium mb-1">
                              No submissions yet
                            </p>

                            <p className="text-sm text-stone-500">
                              Click <strong>Upload New Item</strong> to start contributing.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {isUploadOpen && (
        <UploadModal
          currentUser={currentUser}
          onClose={() => setIsUploadOpen(false)}
          onAddSubmission={handleAddSubmission}
        />
      )}

      {selectedSubmission && (
        <SubmissionDetailsModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </Layout>
  );
};

const UploadModal = ({
  currentUser,
  onClose,
  onAddSubmission,
}: {
  currentUser: CurrentUser;
  onClose: () => void;
  onAddSubmission: (submission: NewSubmissionInput) => Promise<void>;
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Document');
  const [category, setCategory] = useState('Historical Document');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !file) {
      setError('Please enter the title, description, and upload a file.');
      return;
    }

    if (!isAllowedFileType(file)) {
      setError(
        'Unsupported file type. Please upload PDF, DOC, DOCX, PNG, JPG, JPEG, MP3, MP4, or WAV.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 50 MB.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onAddSubmission({
        title: title.trim(),
        type,
        category,
        description: description.trim(),
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        file,
      });
    } catch (uploadError: any) {
      setError(uploadError.message || getReadableBackendError(uploadError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-stone-800">
              Submit Cultural Content
            </h2>

            <p className="text-sm text-stone-500">
              Upload documents, photos, audio, or videos for preservation review.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-pal-red"
            aria-label="Close upload form"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-stone-700 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-pal-green shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold text-stone-800">
                Verification required before publishing
              </p>

              <p className="mt-1">
                After submission, the item starts at AI Auto-Check. It will not
                be displayed in the public archive until it passes the full
                verification workflow.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-pal-green focus:border-pal-green text-stone-900 placeholder:text-stone-400 bg-white"
              placeholder="Example: Poem from 1948"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Content Type
              </label>

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:ring-pal-green focus:border-pal-green"
                disabled={isSubmitting}
              >
                <option>Document</option>
                <option>Image</option>
                <option>Audio</option>
                <option>Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 focus:ring-pal-green focus:border-pal-green"
                disabled={isSubmitting}
              >
                <option>Historical Document</option>
                <option>Literary Work</option>
                <option>Historical Photo</option>
                <option>Oral History</option>
                <option>Folk Performance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-pal-green focus:border-pal-green min-h-28 text-stone-900 placeholder:text-stone-400 bg-white"
              placeholder="Write a short description about the uploaded item..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Upload File
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp3,.mp4,.wav"
              onChange={(event) => {
                setError('');
                setFile(event.target.files?.[0] || null);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-900 file:mr-4 file:rounded-md file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-stone-700 hover:file:bg-stone-200"
              disabled={isSubmitting}
            />

            <p className="text-xs text-stone-400 mt-2">
              Supported files: PDF, DOC, DOCX, PNG, JPG, JPEG, MP3, MP4, WAV.
              Maximum size: 50 MB.
            </p>

            {file && (
              <p className="text-xs text-stone-500 mt-2">
                Selected file: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
            Workflow: <b>Submit Form</b> → <b>AI Auto-Check</b> →{' '}
            <b>Heritage Check</b> → <b>Published</b>.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-pal-red text-white font-semibold hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading and checking...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmissionDetailsModal = ({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800">
              Submission Details
            </h2>

            <p className="text-sm text-stone-500 mt-1">
              Review the uploaded item and its current verification status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-pal-red"
            aria-label="Close submission details"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {submission.title}
            </h3>

            <div className="mt-2">
              <StatusBadge status={submission.status} />
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-sm text-stone-600">
            <p>
              <span className="font-semibold text-stone-800">Type:</span>{' '}
              {submission.type}
            </p>

            <p>
              <span className="font-semibold text-stone-800">Category:</span>{' '}
              {submission.category}
            </p>

            <p>
              <span className="font-semibold text-stone-800">File:</span>{' '}
              {submission.fileName}
            </p>

            <p>
              <span className="font-semibold text-stone-800">File Size:</span>{' '}
              {submission.fileSize}
            </p>

            <p>
              <span className="font-semibold text-stone-800">
                Date Submitted:
              </span>{' '}
              {submission.dateSubmitted}
            </p>

            {submission.moderationReason && (
              <p>
                <span className="font-semibold text-stone-800">AI Note:</span>{' '}
                {submission.moderationReason}
              </p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-stone-800 mb-2">Description</h4>

            <p className="text-sm text-stone-600 leading-relaxed bg-white border border-stone-200 rounded-xl p-4">
              {submission.description}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-stone-800 mb-2">
              Current Workflow Meaning
            </h4>

            <p className="text-sm text-stone-600 leading-relaxed">
              {getStatusDescription(submission.status)}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-pal-red text-white font-semibold hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
