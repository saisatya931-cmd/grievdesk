import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Bot,
  Building2,
  Lock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Users,
  AlertCircle,
  HelpCircle,
  Star,
  ExternalLink,
  MessageSquare,
  Zap,
  Search,
  Check,
  X,
  Compass,
  FileCheck,
  Layers,
  PhoneCall,
  Info,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { complaintAPI } from '../services/api';
import BackgroundPattern from '../components/BackgroundPattern';

// 6 Curated High-Resolution Capabilities
const FEATURE_CARDS = [
  {
    id: 1,
    tag: 'Smart Submission',
    title: 'Multi-Category Grievance Lodging',
    description:
      'Lodge complaints across 14 campus domains—including academics, hostels, canteen, and Wi-Fi—with precise campus location tags and supporting evidence.',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 0,
    details: {
      subtitle: 'Structured, frictionless reporting for students',
      bullets: [
        'Over 14 verified university categories: Hostel, IT, Academic, Facilities, Canteen, Transport & Fees',
        'Specific location mapping down to Block, Wing, Floor, and Room number',
        'Support for photo and document evidence attachments up to 10MB',
        'Option for confidential/sensitive case lodging with protected identity',
      ],
      ctaText: 'Lodge a Complaint in Portal',
      ctaRole: 'student',
    },
  },
  {
    id: 2,
    tag: 'End-to-End Transparency',
    title: 'Real-Time Resolution Tracking',
    description:
      'Follow your grievance as it progresses through each stage. See exact timestamped remarks, assigned officers, and department action plans in real time.',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 3,
    details: {
      subtitle: 'Complete case visibility without paper trails',
      bullets: [
        'Live 5-stage progress indicator: Submitted → Under Review → Assigned → In Progress → Resolved',
        'Direct tracking code lookup accessible without prior login',
        'Official timestamped remarks logged by department officers',
        'Automated notifications as ticket milestones are reached',
      ],
      ctaText: 'Open Live Complaint Tracker',
      action: 'open_tracker',
    },
  },
  {
    id: 3,
    tag: 'Intelligent Assistance',
    title: 'Automated AI Categorization',
    description:
      'Built-in NLP instantly reads issue descriptions, classifies urgency (Low to Critical), generates concise summaries, and suggests responsible departments.',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 1,
    details: {
      subtitle: 'Natural language analysis for faster triage',
      bullets: [
        'Instant severity detection (Low, Medium, High, Critical)',
        'One-sentence executive summary generation for department heads',
        'Smart department routing suggestions matching university domains',
        'Semantic correlation to detect duplicate or related complaints across campus',
      ],
      ctaText: 'Explore AI Assistant Portal',
      ctaRole: 'student',
    },
  },
  {
    id: 4,
    tag: 'Institutional Governance',
    title: 'Department Delegation & Strict SLAs',
    description:
      'Tickets route directly to designated department heads with transparent turnaround expectations, eliminating paperwork bottlenecks and delayed action.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 2,
    details: {
      subtitle: 'Targeted service level agreements with accountability',
      bullets: [
        'Target 24-48 hour resolution window for maintenance and utilities',
        'Direct administrative delegation to specialized department heads',
        'Automated escalation alerts when SLA thresholds approach',
        'Formal audit trail preserved for University Syndicate review',
      ],
      ctaText: 'View Administrator Console',
      ctaRole: 'admin',
    },
  },
  {
    id: 5,
    tag: 'Data Integrity',
    title: 'Encrypted Evidence & Student Privacy',
    description:
      'Attach photos and supporting documents with confidence. Case data and student identity remain protected under institutional privacy standards.',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 0,
    details: {
      subtitle: 'Enterprise-grade privacy protections for students',
      bullets: [
        'Strict role-based access control protecting sensitive case details',
        'Anonymized tracking IDs displayed in public monitoring widgets',
        'Encrypted file storage for evidence attachments and photographs',
        'Zero retaliation policy enforced under University Ethics guidelines',
      ],
      ctaText: 'Read Confidentiality Policy',
      action: 'open_policy_confidentiality',
    },
  },
  {
    id: 6,
    tag: 'Systemic Improvement',
    title: 'Campus Analytics & Bottleneck Prevention',
    description:
      'University leadership monitors recurring issue patterns and average resolution speeds, ensuring campus facilities continuously improve.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    pipelineStep: 4,
    details: {
      subtitle: 'Data-driven campus maintenance and facility upgrades',
      bullets: [
        'Departmental performance benchmarks and resolution speed rankings',
        'Heatmaps identifying recurring issues across hostels and academic blocks',
        'Categorical trend analysis to allocate campus infrastructure budgets',
        'Student satisfaction scoring logged post-resolution',
      ],
      ctaText: 'View Institutional Analytics',
      ctaRole: 'admin',
    },
  },
];

// 5-Step Resolution Pipeline
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Submit Grievance',
    badge: 'Step 1 • Student Action',
    summary:
      'The student logs into the portal and completes a structured complaint form with a clear title, category, description, and campus location.',
    time: '2 - 3 minutes',
    actor: 'Student',
    details: [
      'Enter issue title & detailed description',
      'Select category (Academic, Hostel, IT, etc.)',
      'Specify exact location (Block, Room, Floor)',
      'Upload optional photo or document evidence',
    ],
  },
  {
    step: '02',
    title: 'AI Analysis',
    badge: 'Step 2 • Automated Intelligence',
    summary:
      'GrievDesk AI evaluates the grievance text, estimates severity (Low/Medium/High/Critical), and provides automatic department routing suggestions.',
    time: 'Instant (< 2 seconds)',
    actor: 'GrievDesk AI Engine',
    details: [
      'Instant severity & priority detection',
      'One-line executive problem summary',
      'Automated department match recommendation',
      'Duplicate ticket correlation check',
    ],
  },
  {
    step: '03',
    title: 'Admin Review & Assignment',
    badge: 'Step 3 • Institutional Routing',
    summary:
      'Institutional administrators review the verified ticket, validate priority, and assign it to the appropriate department officer with targeted deadlines.',
    time: 'Under 4 hours',
    actor: 'University Administration',
    details: [
      'Ticket verification & priority sign-off',
      'Direct routing to department in-charge',
      'Formal administrator remark logging',
      'Real-time status notification dispatched',
    ],
  },
  {
    step: '04',
    title: 'Remediation & Resolution',
    badge: 'Step 4 • Department Action',
    summary:
      'The designated department executes physical repair, policy correction, or remediation, updating ticket status and posting official resolution remarks.',
    time: '24 - 48 hours',
    actor: 'Responsible Department Head',
    details: [
      'Active physical inspection & remediation work',
      'Live timeline status set to "In Progress"',
      'Official resolution notes posted to file',
      'Ticket marked as "Resolved"',
    ],
  },
  {
    step: '05',
    title: 'Student Feedback & Closure',
    badge: 'Step 5 • Student Verification',
    summary:
      'The student inspects the resolution notes, confirms the issue has been satisfactorily fixed on campus, and the grievance is formally closed.',
    time: 'Immediate on verification',
    actor: 'Student & System',
    details: [
      'Student reviews resolution outcome',
      'Feedback & satisfaction rating logged',
      'Ticket securely archived in audit log',
      'Continuous institutional quality score updated',
    ],
  },
];

const METRICS = [
  { value: '96.4%', label: 'Resolution Rate', detail: 'Verified resolved tickets' },
  { value: '< 24 hrs', label: 'Initial Intake SLA', detail: 'Average time to officer assignment' },
  { value: '14', label: 'Connected Domains', detail: 'Hostel, IT, Exams, Facilities & more' },
  { value: '100%', label: 'Case Traceability', detail: 'Complete timestamped audit trail' },
];

const TESTIMONIALS = [
  {
    quote:
      'Reported an electrical issue and water heater failure in Hostel Block C. Within hours it was assigned, and repairs were finished by the next morning with continuous status alerts.',
    author: 'Chandra M.',
    course: 'Computer Science & Engineering',
    tag: 'Hostel & Residential',
  },
  {
    quote:
      'Campus Wi-Fi connectivity in the central library reading hall was constantly dropping. The ticket was routed to IT Support and resolved within 24 hours without any paperwork hassle.',
    author: 'Priya K.',
    course: 'Electronics & Communication',
    tag: 'IT & Infrastructure',
  },
  {
    quote:
      'An examination hall ticket discrepancy was fixed seamlessly through the portal before semester exams began. Fully transparent and reliable.',
    author: 'Rahul V.',
    course: 'Mechanical Engineering',
    tag: 'Examination Cell',
  },
];

// Interactive FAQ Data
const FAQS = [
  {
    id: 'faq-1',
    category: 'Tracking & Process',
    question: 'How do I track my grievance status in real time?',
    answer:
      'You can track your grievance directly using the "Live Tracking" button in the navigation bar or Hero section. Simply enter your unique Ticket ID (e.g. COMP-2026-0042) to view the live 5-stage resolution stepper, responsible department, officer remarks, and estimated completion time without having to sign in. Registered students can also view all their active tickets in the Student Dashboard.',
  },
  {
    id: 'faq-2',
    category: 'Privacy & Security',
    question: 'Is student identity kept confidential when lodging sensitive complaints?',
    answer:
      'Yes. GrievDesk adheres to institutional confidentiality standards. When submitting complaints concerning sensitive matters (such as ragging, harassment, or grading disputes), only authorized University Ethics Committee members can inspect student details. Public tracking views completely sanitize student names, email addresses, and contact numbers.',
  },
  {
    id: 'faq-3',
    category: 'SLA & Turnaround',
    question: 'What are the expected turnaround times (SLAs) for different categories?',
    answer:
      'Turnaround times depend on severity and category: Critical safety and utility failures (water/power disruptions) are addressed within 12 to 24 hours. General hostel, IT, and campus maintenance tickets carry a 24 to 48 hour resolution target. Academic grievances and fee discrepancies undergo formal verification within 3 to 5 business days.',
  },
  {
    id: 'faq-4',
    category: 'AI Engine',
    question: 'How does the GrievDesk AI Categorization engine work?',
    answer:
      'Our integrated Natural Language Processing model evaluates the grievance title and description immediately upon submission. It estimates priority level (Low, Medium, High, or Critical), extracts key facility points, generates a concise one-line executive summary, and suggests the most appropriate university department for rapid routing.',
  },
  {
    id: 'faq-5',
    category: 'Escalation',
    question: 'What happens if a complaint is not resolved satisfactorily?',
    answer:
      'When a department marks a grievance as "Resolved", the student receives an alert to inspect the remediation. If the issue persists or the repair is inadequate, the student can submit feedback and reopen the ticket, which automatically escalates the matter to the Office of the Dean of Student Affairs.',
  },
  {
    id: 'faq-6',
    category: 'Departments',
    question: 'Which university departments are integrated into GrievDesk?',
    answer:
      'GrievDesk connects 14 campus departments: Hostel Administration, Examination Cell, IT Support & Networking, Library Services, Canteen & Food Safety, Campus Transport, Laboratory Equipment, Estate & Civil Maintenance, Accounts & Scholarships, and Student Welfare.',
  },
];

// Sample Live Tracking Data (Demo)
const DEMO_COMPLAINT = {
  complaintId: 'COMP-2026-0042',
  title: 'Solar Water Heater Disruption & Low Water Pressure',
  category: 'Hostel & Residential',
  priority: 'High',
  status: 'In Progress',
  department: { name: 'Hostel Maintenance & Utilities', code: 'HOSTEL-MAINT' },
  location: 'Hostel Block C, 2nd Floor Washrooms',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  aiAnalysis: {
    category: 'Hostel & Residential',
    priority: 'High',
    summary: 'Water heater malfunction impacting 40+ hostel residents during morning hours.',
    recommendedDepartment: 'Hostel Maintenance',
  },
  statusHistory: [
    {
      status: 'Submitted',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      remark: 'Complaint digitally registered by student via portal.',
    },
    {
      status: 'Viewed',
      timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      remark: 'Ticket opened and reviewed by Central Admin Desk.',
    },
    {
      status: 'Assigned',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      remark: 'Delegated to Chief Hostel Warden with 24h SLA target.',
    },
    {
      status: 'In Progress',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      remark: 'Plumbing contractor dispatched to Block C rooftop solar array for valve replacement.',
    },
  ],
  adminRemarks: [
    {
      remark: 'Assigned high urgency due to winter season weather and resident count.',
      addedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    },
    {
      remark: 'Spare pressure valve fetched from university central stores; technician on site.',
      addedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Live Tracking Modal State
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [trackerInput, setTrackerInput] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Feature Detail Modal State
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Policy Modal State
  const [policyModal, setPolicyModal] = useState({ open: false, title: '', content: '' });

  // FAQ Accordion State
  const [expandedFaqId, setExpandedFaqId] = useState('faq-1');
  const [faqSearch, setFaqSearch] = useState('');

  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  // Function to execute Live Tracking Search
  const handlePerformTracking = async (idToSearch) => {
    const queryId = (idToSearch || trackerInput).trim();
    if (!queryId) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackerModalOpen(true);

    // If query matches demo ticket or demo pattern
    if (queryId.toUpperCase() === 'COMP-2026-0042' || queryId.toLowerCase().includes('demo')) {
      setTimeout(() => {
        setTrackingData(DEMO_COMPLAINT);
        setTrackingLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await complaintAPI.trackPublic(queryId);
      if (res.data?.data) {
        setTrackingData(res.data.data);
      } else {
        setTrackingData(null);
        setTrackingError(`No complaint found matching ID "${queryId}". Try demo ticket COMP-2026-0042.`);
      }
    } catch (err) {
      console.warn('Public tracking lookup failed:', err);
      // Fallback message with demo ticket option
      setTrackingData(null);
      setTrackingError(
        err.response?.data?.message ||
          `Ticket "${queryId}" not found in institutional registry. Please verify the ID or test with our active demo ticket COMP-2026-0042.`
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const openDemoTracking = () => {
    setTrackerInput('COMP-2026-0042');
    handlePerformTracking('COMP-2026-0042');
  };

  const handleOpenPolicy = (type) => {
    if (type === 'confidentiality') {
      setPolicyModal({
        open: true,
        title: 'Institutional Grievance Confidentiality Policy',
        content: `
          GrievDesk guarantees strict protection of student privacy under University Statute section 14-B:
          
          1. Identity Shielding: Grievances categorized under sensitive areas (Faculty Conduct, Gender Equity, Hostel Security) are restricted to designated University Ethics Committee officers.
          2. No Retaliation Guarantee: Lodging an official grievance through GrievDesk carries strict institutional immunity against academic or disciplinary victimisation.
          3. Sanitized Audit Logs: Public tracking queries and open dashboards display anonymized codes without exposing contact information or student roll numbers.
          4. Data Encryption: Evidence attachments and personal statements are encrypted at rest with AES-256 and transmitted over verified SSL/TLS channels.
        `,
      });
    } else if (type === 'terms') {
      setPolicyModal({
        open: true,
        title: 'Terms of Campus Grievance Redressal',
        content: `
          GrievDesk terms of service governing complaints:
          
          1. Authenticity: All submitted statements and photo evidence must be truthful and related to legitimate campus operations.
          2. Official Turnaround: University departments must acknowledge tickets within 24 hours and provide verified resolution updates within standard SLA thresholds (24-72 hours).
          3. Student Right to Reopen: Students hold the unconditional right to reject a closure report within 48 hours if physical remediation remains unverified.
          4. Appellate Redressal: Cases pending beyond SLA limits escalate automatically to the Vice Chancellor's Monitoring Cell.
        `,
      });
    } else if (type === 'sla') {
      setPolicyModal({
        open: true,
        title: 'University Department SLA Guidelines',
        content: `
          Standard Institutional Turnaround Benchmarks:
          
          • Critical Safety & Water/Power Disruption: 12 - 24 Hours
          • Hostel & Campus Maintenance: 24 - 48 Hours
          • IT, Network & Laboratory Systems: 24 - 48 Hours
          • Academic & Examination Hall Tickets: 48 - 72 Hours
          • Accounts, Fee Receipts & Scholarships: 3 - 5 Business Days
          • Department Head Acknowledgment: Under 4 Hours
        `,
      });
    } else if (type === 'emergency') {
      setPolicyModal({
        open: true,
        title: 'Campus Emergency Support & Helplines',
        content: `
          Immediate Emergency Assistance Contacts:
          
          • Campus Security Control Room: Ext 100 / +91-80-2345-6789
          • University Health Centre & Ambulance: Ext 108 / +91-80-2345-6788
          • Chief Hostel Warden Desk: Block A Admin Suite
          • Anti-Ragging & Student Helpline: 1800-180-5522 (Toll-Free 24x7)
          • Women's Safety & Internal Complaints Committee: icc@grievdesk.edu
        `,
      });
    }
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-[#F7F8F6] dark:bg-[#171B22] text-[#171B22] dark:text-[#F7F8F6] selection:bg-[#C49A4A] selection:text-[#171B22] transition-colors">
      {/* 1. HERO SECTION (55/45 Layout) with id="home" */}
      <section
        id="home"
        className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F7F8F6] dark:bg-[#171B22] border-b border-[#EEF1F2] dark:border-[#2B3038]"
      >
        {/* Subtle Brand Workflow Background Pattern (3-6% opacity) */}
        <BackgroundPattern opacity="opacity-[0.05] dark:opacity-[0.06]" />

        {/* Very Faint Ambient Champagne Glow (No blue/green) */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-[#C49A4A]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Description & CTAs (55% width ~ 7 cols) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Refined Institutional Tagline Badge with Official Logo */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#21262F] border border-[#EEF1F2] dark:border-[#2B3038] text-xs font-semibold text-[#171B22] dark:text-[#F7F8F6] shadow-xs">
                <img src="/logo.png" alt="GrievDesk" className="w-5 h-5 rounded-full object-cover shadow-xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49A4A] animate-pulse" />
                <span className="text-[#C49A4A] font-bold">GrievDesk Official</span>
                <span className="text-[#5F6875]">•</span>
                <span>Institutional Grievance & SLA Resolution System</span>
              </div>

              {/* Impactful Heading with Specified Color Balance */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#171B22] dark:text-white">
                Transparent campus grievance resolution.{' '}
                <span className="text-[#C49A4A]">
                  Built for accountability.
                </span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-lg text-[#5F6875] dark:text-[#CBD1D6] max-w-2xl leading-relaxed font-normal">
                GrievDesk digitizes and accelerates the university complaint lifecycle.
                Submit issues in seconds, leverage smart AI categorization, and monitor departmental action through transparent real-time tracking.
              </p>

              {/* Action Buttons: Student Portal, Admin Portal & Live Tracking */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login?role=student')}
                  className="font-semibold px-7 shadow-md"
                >
                  <span>Student Portal</span>
                  <ArrowRight size={18} className="text-[#E7D6AE]" />
                </Button>

                {/* Prominent Live Tracking CTA Button */}
                <button
                  type="button"
                  onClick={openDemoTracking}
                  className="btn bg-gradient-to-r from-[#B0883A] via-[#C49A4A] to-[#B0883A] hover:from-[#C49A4A] hover:to-[#D6BE80] text-[#171B22] font-bold px-5 py-2.5 rounded-lg shadow-md shadow-[#C49A4A]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Search size={17} />
                  <span>Live Tracking</span>
                </button>
              </div>

              {/* Direct Quick-Lookup Tracking Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformTracking();
                }}
                className="pt-2 max-w-xl"
              >
                <div className="relative flex items-center">
                  <input
                    id="public-tracking-input"
                    name="trackingId"
                    aria-label="Enter Tracking ID"
                    type="text"
                    value={trackerInput}
                    onChange={(e) => setTrackerInput(e.target.value)}
                    placeholder="Enter Tracking ID (e.g. COMP-2026-0042)..."
                    className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-[#CBD1D6] dark:border-[#2B3038] bg-white dark:bg-[#21262F] text-sm font-medium focus:ring-2 focus:ring-[#C49A4A]/50 focus:border-[#C49A4A] shadow-xs text-[#171B22] dark:text-white"
                  />
                  <Search size={16} className="absolute left-3.5 text-[#5F6875]" />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#171B22] hover:bg-black text-white dark:bg-[#2B3038] dark:hover:bg-[#343B45] border border-[#2B3038] hover:border-[#C49A4A]/60 transition-all"
                  >
                    Track Live
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1.5 text-xs text-[#5F6875] dark:text-[#9AA4AF]">
                  <span>Try active sample:</span>
                  <button
                    type="button"
                    onClick={openDemoTracking}
                    className="font-mono font-bold text-[#C49A4A] hover:underline"
                  >
                    COMP-2026-0042
                  </button>
                </div>
              </form>

              {/* Trust & SLA Strip */}
              <div className="pt-6 border-t border-[#EEF1F2] dark:border-[#2B3038] space-y-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#5F6875] dark:text-[#9AA4AF]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#C49A4A]" />
                    <span>24-48h Department SLA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#C49A4A]" />
                    <span>Protected Student Privacy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-[#C49A4A]" />
                    <span>14 Campus Domains</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#5F6875] dark:text-[#9AA4AF]">
                  <div className="flex text-[#C49A4A]">
                    {'★'.repeat(5)}
                  </div>
                  <span className="font-semibold text-[#171B22] dark:text-[#F7F8F6]">4.9 / 5</span>
                  <span>Student Trust Score across university facilities</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: High-Quality Website-Related Campus Resolution Photograph (45% width ~ 5 cols) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Ambient Soft Gold Halo */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#C49A4A]/20 via-[#E7D6AE]/10 to-transparent rounded-3xl blur-xl opacity-60 -z-10" />

                {/* Large Rounded Image Container with Soft Shadow & Subtle Champagne-Gold Border */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#171B22]/15 dark:shadow-black/50 border border-[#C49A4A]/30 group bg-[#171B22]">
                  <img
                    src="/hero-students.jpg"
                    alt="University students collaborating with student support services"
                    className="w-full h-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-700 ease-out block"
                  />

                  {/* Subtle Gradient Vignette at Bottom for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171B22]/70 via-[#171B22]/10 to-transparent pointer-events-none" />

                  {/* Integrated Bottom Caption Tag */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C49A4A] animate-pulse" />
                      <span className="text-xs font-semibold tracking-wide text-white/95">
                        Campus Support Services
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#E7D6AE]">
                      Active Governance
                    </span>
                  </div>
                </div>

                {/* Floating Subtle Metric Badge 1: SLA Target */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 sm:-right-6 bg-white dark:bg-[#171B22] rounded-2xl p-3.5 shadow-xl border border-[#EEF1F2] dark:border-[#2B3038] z-20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C49A4A]/15 text-[#C49A4A] flex items-center justify-center font-bold border border-[#C49A4A]/30">
                    <Zap size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#171B22] dark:text-white">
                      24 - 48 Hours
                    </div>
                    <div className="text-[10px] text-[#5F6875] dark:text-[#9AA4AF]">Department Turnaround</div>
                  </div>
                </motion.div>

                {/* Floating Subtle Metric Badge 2: Verified Resolution Rate */}
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -left-4 sm:-left-6 bg-white dark:bg-[#171B22] rounded-2xl p-3.5 shadow-xl border border-[#EEF1F2] dark:border-[#2B3038] z-20 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#171B22] dark:bg-[#2B3038] text-[#C49A4A] flex items-center justify-center font-bold border border-[#C49A4A]/30">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#171B22] dark:text-white">
                      96.4% Verified
                    </div>
                    <div className="text-[10px] text-[#5F6875] dark:text-[#9AA4AF]">Case Resolution Target</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STATS & INSTITUTIONAL TRANSPARENCY METRICS */}
      <section className="py-12 border-b border-[#EEF1F2] dark:border-[#2B3038] bg-[#EEF1F2] dark:bg-[#1B2028] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {METRICS.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center space-y-1"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-[#C49A4A]">
                  {m.value}
                </div>
                <div className="text-sm font-bold text-[#171B22] dark:text-[#F7F8F6]">
                  {m.label}
                </div>
                <div className="text-xs text-[#5F6875] dark:text-[#9AA4AF]">
                  {m.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES (Comprehensive Capabilities) with id="features" */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="features">
        <BackgroundPattern opacity="opacity-[0.03] dark:opacity-[0.04]" />
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C49A4A]/10 text-[#C49A4A] border border-[#C49A4A]/30 text-xs font-semibold uppercase tracking-wider">
            Comprehensive Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171B22] dark:text-white tracking-tight">
            Engineered for accountability and swift resolution
          </h2>
          <p className="text-sm sm:text-base text-[#5F6875] dark:text-[#CBD1D6]">
            Every feature in GrievDesk is designed to make voicing concerns frictionless for students and management effortless for university administration.
          </p>
        </div>

        {/* Feature Cards Grid (2x3 Layout with high-res photos and interactive Explore links) */}
        <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURE_CARDS.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedFeature(card)}
              className="card group overflow-hidden border border-[#EEF1F2] dark:border-[#2B3038] rounded-2xl flex flex-col hover:shadow-xl hover:border-[#C49A4A]/50 transition-all cursor-pointer bg-white dark:bg-[#21262F]"
            >
              {/* Image Container with Zoom Effect */}
              <div className="relative aspect-[16/10] overflow-hidden bg-silver-100 dark:bg-charcoal-800">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 dark:bg-charcoal-950/95 text-charcoal-900 dark:text-white backdrop-blur shadow-sm border border-silver-200/50 dark:border-charcoal-700/50">
                  {card.tag}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow space-y-3">
                <h3 className="font-bold text-lg text-charcoal-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-silver-300 leading-relaxed flex-grow">
                  {card.description}
                </p>

                {/* Fully Functional Explore Feature Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFeature(card);
                  }}
                  className="pt-2 flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 group-hover:translate-x-1 transition-transform text-left"
                >
                  <span>Explore specifications</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. ANIMATED HOW IT WORKS (5-Stage Resolution Pipeline) with id="how-it-works" */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EEF1F2] dark:bg-[#1B2028] border-y border-[#E2E6E9] dark:border-[#2B3038]"
        id="how-it-works"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C49A4A]/10 text-[#C49A4A] border border-[#C49A4A]/30 text-xs font-semibold uppercase tracking-wider">
              Resolution Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
              How GrievDesk resolves grievances
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 dark:text-silver-300">
              A transparent 5-stage workflow connecting students directly with responsible department officers.
            </p>
          </div>

          {/* Interactive Step Switcher Bar */}
          <div className="relative mb-10">
            {/* Connecting Track Line */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-silver-200 dark:bg-charcoal-700 -z-0" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isSelected = activeStepIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-white dark:bg-charcoal-900 border-gold-500 shadow-lg ring-2 ring-gold-500/20'
                        : 'bg-white/80 dark:bg-charcoal-900/60 border-silver-200 dark:border-charcoal-700 hover:border-silver-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-gold-500 text-charcoal-950'
                            : 'bg-silver-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-silver-300'
                        }`}
                      >
                        {step.step}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-charcoal-900 dark:text-silver-100 truncate">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-silver-400 truncate mt-0.5">
                      {step.actor}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector Card for Selected Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="card p-6 sm:p-8 rounded-2xl border border-silver-200 dark:border-charcoal-700 shadow-xl bg-white dark:bg-charcoal-900"
            >
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left: Step Description */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-xs font-bold">
                    {activeStep.badge}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-white">
                    {activeStep.step}. {activeStep.title}
                  </h3>

                  <p className="text-sm sm:text-base text-charcoal-600 dark:text-silver-300 leading-relaxed">
                    {activeStep.summary}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-silver-400 mb-2">
                      Key Actions in this stage:
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {activeStep.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="flex items-center gap-2 text-xs sm:text-sm text-charcoal-700 dark:text-silver-300"
                        >
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Step Metadata Pill Box */}
                <div className="lg:col-span-5 p-6 rounded-xl bg-silver-50 dark:bg-charcoal-800/50 border border-silver-200 dark:border-charcoal-700 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-silver-200 dark:border-charcoal-700">
                    <span className="text-xs font-semibold text-silver-500">Responsible Role</span>
                    <span className="text-xs font-bold text-charcoal-900 dark:text-silver-100">
                      {activeStep.actor}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-silver-200 dark:border-charcoal-700">
                    <span className="text-xs font-semibold text-silver-500">Expected Duration</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Clock size={13} />
                      {activeStep.time}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-silver-200 dark:border-charcoal-700">
                    <span className="text-xs font-semibold text-silver-500">Audit Status</span>
                    <span className="text-xs font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1">
                      <ShieldCheck size={13} />
                      Digitally Logged
                    </span>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/login?role=student')}
                      className="w-full text-xs font-semibold"
                    >
                      <span>Experience this flow</span>
                      <ArrowRight size={14} className="text-gold-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 5. AUTHENTIC STUDENT VOICES & REAL-WORLD RESOLUTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-silver-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-silver-300 border border-silver-300 dark:border-charcoal-700 text-xs font-semibold uppercase tracking-wider">
            Verified Experiences
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Real complaints, real institutional resolution
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 dark:text-silver-300">
            See how GrievDesk helps university students get facility concerns fixed transparently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="card p-6 sm:p-7 border border-silver-200 dark:border-charcoal-800 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-lg hover:border-gold-500/40 transition-all bg-white dark:bg-charcoal-900"
            >
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                  {t.tag}
                </span>
                <p className="text-sm text-charcoal-700 dark:text-silver-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-silver-100 dark:border-charcoal-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-gold-400 flex items-center justify-center font-bold text-sm border border-gold-500/30">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-charcoal-900 dark:text-silver-100">
                    {t.author}
                  </div>
                  <div className="text-xs text-silver-400">
                    {t.course}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEW FREQUENTLY ASKED QUESTIONS SECTION with id="faq" */}
      <section
        id="faq"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EEF1F2] dark:bg-[#1B2028] border-y border-[#E2E6E9] dark:border-[#2B3038]"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C49A4A]/10 text-[#C49A4A] border border-[#C49A4A]/30 text-xs font-semibold uppercase tracking-wider">
              Student Helpdesk & FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#171B22] dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-[#5F6875] dark:text-[#CBD1D6]">
              Clear answers on complaint tracking, case privacy, SLA timelines, and resolution policies.
            </p>

            {/* FAQ Search Bar */}
            <div className="pt-3 max-w-md mx-auto relative">
              <input
                id="faq-search-input"
                name="faqSearch"
                aria-label="Search frequently asked questions"
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions (e.g. tracking, privacy, SLA)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBD1D6] dark:border-[#2B3038] bg-white dark:bg-[#21262F] text-sm focus:ring-2 focus:ring-[#C49A4A]/50 focus:border-[#C49A4A] shadow-xs text-[#171B22] dark:text-white"
              />
              <Search size={16} className="absolute left-3.5 top-5 text-silver-400" />
              {faqSearch && (
                <button
                  onClick={() => setFaqSearch('')}
                  className="absolute right-3.5 top-5 text-silver-400 hover:text-charcoal-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-[#E2E6E9] dark:border-[#2B3038] rounded-xl overflow-hidden bg-white dark:bg-[#21262F] transition-colors shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#EEF1F2]/50 dark:hover:bg-[#2B3038]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EEF1F2] dark:bg-[#2B3038] text-[#171B22] dark:text-[#F7F8F6] border border-[#CBD1D6] dark:border-[#3D4450]">
                          {faq.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#171B22] dark:text-white">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-[#C49A4A] transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[#EEF1F2] dark:border-[#2B3038] px-5 py-4 bg-[#F7F8F6] dark:bg-[#171B22]"
                        >
                          <p className="text-xs sm:text-sm text-[#5F6875] dark:text-[#CBD1D6] leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-silver-400 text-sm">
                No matching questions found for "{faqSearch}". Try searching "tracking" or "privacy".
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. MODERN PREMIUM SAAS CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-[#171B22] text-white p-8 sm:p-14 shadow-2xl border border-[#C49A4A]/30">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C49A4A]/15 text-[#E7D6AE] border border-[#C49A4A]/30 text-xs font-semibold">
              <Sparkles size={13} />
              <span>GrievDesk Official Framework</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Ready to make your campus voice heard?
            </h2>
            <p className="text-base sm:text-lg text-[#CBD1D6] max-w-xl mx-auto">
              Access the central portal to file grievances, review departmental resolutions, and experience accountability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login?role=student')}
                className="w-full sm:w-auto font-bold px-8 shadow-lg shadow-[#C49A4A]/20"
              >
                <span>Student Login</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Ambient Lighting Accents */}
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#C49A4A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#EEF1F2]/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* 8. PROFESSIONAL 2026 SAAS FOOTER WITH WORKING LINKS */}
      <footer className="bg-[#0F1217] text-[#9AA4AF] border-t border-[#21262F] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-silver-400 via-gold-400 to-silver-300 shadow-md">
                <img
                  src="/logo.png"
                  alt="GrievDesk Official Logo"
                  className="w-full h-full object-cover rounded-full bg-charcoal-900"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Griev<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-500 font-extrabold">Desk</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-silver-400 max-w-sm leading-relaxed">
              Institutional Grievance Management & Resolution Framework. Empowering students and holding university departments accountable.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Portal Operational • All 14 Departments Online</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/login?role=student" className="hover:text-gold-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openDemoTracking}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Live Complaint Tracker
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-gold-400 transition-colors">
                  Resolution Workflow
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-gold-400 transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-gold-400 transition-colors">
                  FAQ & Knowledge Base
                </a>
              </li>
            </ul>
          </div>

          {/* Department Coverage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Departments</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Hostel Administration
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Examination Cell
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  IT Support & Networking
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Accounts & Scholarships
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Campus Infrastructure
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Institutional</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenPolicy('confidentiality')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Confidentiality Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenPolicy('terms')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Terms of Grievance Redressal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenPolicy('sla')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  SLA Benchmarks
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenPolicy('emergency')}
                  className="hover:text-gold-400 transition-colors text-left"
                >
                  Campus Emergency Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 GrievDesk Framework. Official Institutional Grievance Redressal Platform.</p>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => handleOpenPolicy('confidentiality')}
              className="hover:text-white transition-colors"
            >
              Confidentiality Policy
            </button>
            <button
              type="button"
              onClick={() => handleOpenPolicy('terms')}
              className="hover:text-white transition-colors"
            >
              Terms of Grievance Redressal
            </button>
            <button
              type="button"
              onClick={() => handleOpenPolicy('emergency')}
              className="hover:text-white transition-colors"
            >
              Support Desk
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 1: LIVE GRIEVANCE TRACKER (Hero & Section Feature)      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {trackerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-charcoal-900 border border-silver-200 dark:border-charcoal-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-silver-200 dark:border-charcoal-800 flex items-center justify-between bg-silver-50/60 dark:bg-charcoal-950/60 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center border border-gold-500/30">
                    <Search size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
                      Live Grievance Tracker
                    </h3>
                    <p className="text-xs text-silver-500 dark:text-silver-400">
                      Real-time institutional audit and resolution status
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackerModalOpen(false)}
                  className="p-2 rounded-lg text-silver-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-silver-100 dark:hover:bg-charcoal-800"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Search Bar */}
              <div className="p-6 border-b border-silver-200 dark:border-charcoal-800 space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePerformTracking();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-grow">
                    <input
                      id="modal-tracking-input"
                      name="trackingId"
                      aria-label="Enter Ticket ID"
                      type="text"
                      value={trackerInput}
                      onChange={(e) => setTrackerInput(e.target.value)}
                      placeholder="Enter Ticket ID (e.g. COMP-2026-0042)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-silver-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm focus:ring-2 focus:ring-gold-500/50"
                    />
                    <Search size={16} className="absolute left-3.5 top-3.5 text-silver-400" />
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    type="submit"
                    disabled={trackingLoading}
                    className="font-bold whitespace-nowrap"
                  >
                    {trackingLoading ? 'Searching...' : 'Track Ticket'}
                  </Button>
                </form>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-silver-500">Quick test:</span>
                  <button
                    type="button"
                    onClick={openDemoTracking}
                    className="font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                  >
                    <span>Load Live Demonstration Ticket (COMP-2026-0042)</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Modal Content / Tracking Result */}
              <div className="p-6 space-y-6">
                {trackingLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-silver-400">Querying central grievance registry...</p>
                  </div>
                ) : trackingError ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle size={16} />
                      <span>Notice</span>
                    </div>
                    <p>{trackingError}</p>
                    <button
                      type="button"
                      onClick={openDemoTracking}
                      className="btn bg-charcoal-900 text-white dark:bg-charcoal-800 text-xs px-3 py-1.5 rounded-lg font-semibold mt-2"
                    >
                      View Live Sample Ticket
                    </button>
                  </div>
                ) : trackingData ? (
                  <div className="space-y-6">
                    {/* Ticket Header Pill */}
                    <div className="p-4 rounded-xl bg-silver-50 dark:bg-charcoal-800/70 border border-silver-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-charcoal-900 text-gold-400 border border-gold-500/30">
                            {trackingData.complaintId}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                            {trackingData.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-charcoal-900 dark:text-silver-100 mt-2">
                          {trackingData.title}
                        </h4>
                        {trackingData.location && (
                          <p className="text-xs text-silver-500 dark:text-silver-400 mt-0.5">
                            📍 {trackingData.location}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {trackingData.status}
                        </span>
                        <div className="text-[11px] text-silver-400 mt-1">
                          Priority: <strong>{trackingData.priority}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Stepper Progress Visualizer */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-silver-400">
                        Resolution Timeline
                      </h5>
                      <div className="relative pl-6 space-y-6 border-l-2 border-silver-200 dark:border-charcoal-700 ml-3">
                        {(trackingData.statusHistory && trackingData.statusHistory.length > 0
                          ? trackingData.statusHistory
                          : [
                              {
                                status: trackingData.status,
                                timestamp: trackingData.updatedAt || trackingData.createdAt,
                                remark: 'Ticket currently in progress.',
                              },
                            ]
                        ).map((h, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-gold-500 border-4 border-white dark:border-charcoal-900" />
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-charcoal-900 dark:text-white">
                                {h.status}
                              </span>
                              <span className="text-[11px] text-silver-400">
                                {h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="text-xs text-charcoal-600 dark:text-silver-300 mt-1">
                              {h.remark || 'Status updated in registry.'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Department & Officer Details */}
                    {trackingData.department && (
                      <div className="p-3.5 rounded-xl bg-silver-50 dark:bg-charcoal-800/50 border border-silver-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-gold-500" />
                          <span className="text-silver-500">Assigned Department:</span>
                          <strong className="text-charcoal-900 dark:text-silver-100">
                            {trackingData.department.name || 'Campus Maintenance'}
                          </strong>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-silver-200 dark:bg-charcoal-700 text-charcoal-700 dark:text-silver-300">
                          {trackingData.department.code || 'DEPT'}
                        </span>
                      </div>
                    )}

                    {/* Admin Remarks (if available) */}
                    {trackingData.adminRemarks && trackingData.adminRemarks.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-silver-400">
                          Official Administrative Remarks
                        </h5>
                        <div className="space-y-2">
                          {trackingData.adminRemarks.map((r, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 rounded-xl bg-silver-50 dark:bg-charcoal-800/50 border border-silver-200 dark:border-charcoal-700 text-xs space-y-1"
                            >
                              <p className="text-charcoal-800 dark:text-silver-200">{r.remark}</p>
                              {r.addedAt && (
                                <span className="text-[10px] text-silver-400 block">
                                  Logged: {new Date(r.addedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution Section if Resolved */}
                    {trackingData.resolution?.resolutionText && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                          <CheckCircle2 size={16} />
                          <span>Final Department Resolution</span>
                        </div>
                        <p className="text-emerald-800 dark:text-emerald-200">
                          {trackingData.resolution.resolutionText}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3">
                    <Search size={32} className="mx-auto text-silver-300 dark:text-charcoal-600" />
                    <p className="text-xs text-silver-400">
                      Enter a complaint tracking code above or try our demo ticket to preview live tracking.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-silver-50 dark:bg-charcoal-950/80 border-t border-silver-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login?role=student')}
                  className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  <span>Need to file a new grievance? Log in to Student Portal</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setTrackerModalOpen(false)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Close Tracker
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 2: FEATURE SPOTLIGHT MODAL (Comprehensive Capabilities)  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-charcoal-900 border border-silver-200 dark:border-charcoal-700 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden"
            >
              {/* Feature Header Image */}
              <div className="relative aspect-[16/8] overflow-hidden bg-silver-100 dark:bg-charcoal-800">
                <img
                  src={selectedFeature.image}
                  alt={selectedFeature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500 text-charcoal-950 uppercase tracking-wider">
                    {selectedFeature.tag}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">{selectedFeature.title}</h3>
                </div>
              </div>

              {/* Feature Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-silver-300 leading-relaxed">
                  {selectedFeature.description}
                </p>

                <div className="p-4 rounded-xl bg-silver-50 dark:bg-charcoal-800/60 border border-silver-200 dark:border-charcoal-700 space-y-2.5">
                  <h4 className="text-xs font-bold text-charcoal-900 dark:text-white uppercase tracking-wider">
                    {selectedFeature.details.subtitle}
                  </h4>
                  <ul className="space-y-2">
                    {selectedFeature.details.bullets.map((b, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-2 text-xs text-charcoal-700 dark:text-silver-300"
                      >
                        <Check size={14} className="text-gold-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature Action Buttons */}
              <div className="p-4 bg-silver-50 dark:bg-charcoal-950/80 border-t border-silver-200 dark:border-charcoal-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const stepIdx = selectedFeature.pipelineStep;
                    setSelectedFeature(null);
                    setActiveStepIndex(stepIdx);
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  <span>See in 5-Step Pipeline</span>
                  <ArrowRight size={13} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(null)}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Close
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (selectedFeature.details.action === 'open_tracker') {
                        setSelectedFeature(null);
                        openDemoTracking();
                      } else if (selectedFeature.details.action === 'open_policy_confidentiality') {
                        setSelectedFeature(null);
                        handleOpenPolicy('confidentiality');
                      } else {
                        navigate(`/login?role=${selectedFeature.details.ctaRole || 'student'}`);
                      }
                    }}
                    className="text-xs font-semibold"
                  >
                    <span>{selectedFeature.details.ctaText}</span>
                    <ArrowRight size={14} className="text-gold-400" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 3: INSTITUTIONAL POLICY MODAL                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {policyModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-charcoal-900 border border-silver-200 dark:border-charcoal-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-silver-200 dark:border-charcoal-800 pb-3">
                <div className="flex items-center gap-2 text-charcoal-900 dark:text-white">
                  <ShieldCheck size={20} className="text-gold-500" />
                  <h3 className="font-bold text-base">{policyModal.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPolicyModal({ open: false, title: '', content: '' })}
                  className="p-1 rounded-lg text-silver-400 hover:text-charcoal-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-charcoal-600 dark:text-silver-300 leading-relaxed whitespace-pre-line bg-silver-50 dark:bg-charcoal-800/40 p-4 rounded-xl border border-silver-200 dark:border-charcoal-700">
                {policyModal.content}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPolicyModal({ open: false, title: '', content: '' })}
                >
                  Understood
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

