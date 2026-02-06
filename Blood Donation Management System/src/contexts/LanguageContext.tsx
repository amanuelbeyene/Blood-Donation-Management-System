import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type SupportedLang = 'en' | 'am';

type Translations = Record<
  SupportedLang,
  {
    // Navigation
    dashboard: string;
    register: string;
    awards: string;
    findDonor: string;
    emergencyRequest: string;
    myRequests: string;
    myDonations: string;
    login: string;
    logout: string;
    language: string;
    home: string;
    // Footer
    quickLinks: string;
    support: string;
    helpCenter: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    contactUs: string;
    footerDesc: string;
    allRightsReserved: string;

    // Login
    welcomeBack: string;
    signInDesc: string;
    selectRoleTitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    forgotPassword: string;
    signInBtn: string;
    signingIn: string;
    newToPlatform: string;
    createAccount: string;

    // Auth Messages
    passwordsDoNotMatch: string;
    fanLengthError: string;
    phoneLengthError: string;
    ageError: string;
    weightError: string;
    medicalConditionRequired: string;
    disabilityRequired: string;
    idCardRequired: string;

    // Register
    donorRegForm: string;
    hospitalRegForm: string;
    frontId: string;
    backId: string;
    clickToUploadFront: string;
    clickToUploadBack: string;
    enterMedicalConditionsHint: string;
    gender: string;
    selectGender: string;
    male: string;
    female: string;
    maritalStatus: string;
    selectStatus: string;
    single: string;
    married: string;
    widowed: string;
    divorced: string;
    separated: string;
    fanNumber: string;
    enterFanNumber: string;
    getLocation: string;
    locationRequired: string;
    donors: string;
    hospitals: string;
    donations: string;
    bloodRequests: string;
    requestHistory: string;
    bloodStock: string;
    addDonor: string;
    manageAdmins: string;
    viewDonorDetails: string;
    editDonorDetails: string;

    deleteDonorDetails: string;
    manageDonors: string;
    addHospital: string;
    viewHospitalDetails: string;
    editHospitalDetails: string;
    deleteHospitalDetails: string;
    // Staff
    staff: string;
    addStaff: string;
    viewStaffDetails: string;
    editStaffDetails: string;

    deleteStaffDetails: string;
    manageStaff: string;
    // Admin Sidebar & Status
    donorStatus: string;
    pendingDonor: string;
    approveDonor: string;
    rejectDonor: string;
    hospitalStatus: string;
    pendingHospital: string;
    approveHospital: string;
    rejectHospital: string;

    // Staff Portal
    medicalStaffPortal: string;
    staffPortal: string;
    appointments: string;
    manageHospitalActivity: string;

    // Super Admin
    addAdmin: string;
    viewAdminDetails: string;
    editAdminDetails: string;
    deleteAdminDetails: string;

    // Languages
    english: string;
    amharic: string;

    // Navigation & Common
    hospitalPortal: string;
    donorMode: string;
    notifications: string;
    markAllRead: string;
    noNotifications: string;
    noNewNotifications: string;
    viewAllNotifications: string;
    seen: string;
    deleteProfile: string;
    deleteProfileConfirmation: string;
    deleteProfileSubmitted: string;
    confirm: string;
    viewing: string;
    appName: string;

    // Forms
    fullName: string;
    bloodType: string;
    bloodTypeUnknown: string;
    birthDate: string;
    donationAppointmentDate: string;
    age: string;
    weight: string;
    phoneNumber: string;
    hospitalPhoneNumber: string;
    emailAddress: string;
    location: string;
    region: string;
    city: string;
    subCity: string;
    woreda: string;
    kebele: string;
    street: string;
    homeNumber: string;
    disease: string;
    medicalCondition: string;
    // Actions
    addDonorBtn: string;
    updateDonor: string;
    cancel: string;
    submit: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    // Status
    ready: string;
    resting: string;
    available: string;
    unavailable: string;
    // Common
    name: string;
    phone: string;
    email: string;
    address: string;
    actions: string;
    results: string;
    showing: string;
    noDonorsFound: string;
    noDataFound: string;
    // Search
    findByName: string;
    findByNumber: string;
    findByBloodType: string;
    findByLocation: string;
    geolocationSearch: string;
    googleMaps: string;
    viewOnMap: string;
    call: string;
    // Donor Info
    totalDonations: string;
    lastDonation: string;
    availability: string;
    impactScore: string;
    // Placeholders
    enterFullName: string;
    selectBloodType: string;
    enterBirthDate: string;
    enterAppointmentDate: string;
    enterAge: string;
    enterPhoneNumber: string;
    enterHospitalPhone: string;
    enterEmail: string;
    enterLocation: string;
    enterRegion: string;
    enterCity: string;
    enterSubCity: string;
    enterWoreda: string;
    enterKebele: string;
    enterStreet: string;
    enterHomeNumber: string;
    enterMedicalConditions: string;
    // Registration
    createProfile: string;
    registerDescription: string;
    uploadProfilePicture: string;
    completeRegistration: string;
    accountCreatedSuccess: string;
    alreadyHaveAccount: string;
    editProfile: string;
    // Hospital
    hospitalName: string;
    enterHospitalName: string;
    contactPerson: string;
    contactDoctorName: string;
    contactDoctorPhone: string;
    enterContactPerson: string;
    enterContactDoctorName: string;
    enterContactDoctorPhone: string;
    hospitalType: string;
    governmentHospital: string;
    nonGovernmentHospital: string;
    businessLicense: string;
    businessLicenseName: string;
    businessLicenseNumber: string;
    enterBusinessLicenseName: string;
    enterBusinessLicenseNumber: string;
    uploadHospitalLicense: string;
    // Delete
    selectDonorToDelete: string;
    warningDeleteAction: string;
    confirmDeleteDonor: string;
    confirmDeleteMessage: string;
    confirmDelete: string;
    actionCannotBeUndone: string;
    deletedSuccessfully: string;
    // Hospital Delete
    findHospital: string;
    noHospitalsFound: string;
    confirmDeleteHospital: string;
    selectHospitalToDelete: string;
    // Landing Page

    heroSubtitleHtml: string; // Using HTML to support the span with gradient if needed, or just plain text and handle formatting in view. Let's stick to plain text parts if possible or just formatted. 
    // Actually the view has: 'Donate Blood, <span ...>Save a Life.</span>'.
    // I will separate: heroTitlePrefix, heroTitleSuffix.
    heroTitlePrefix: string;
    heroTitleSuffix: string;

    donateNow: string;
    requestBlood: string;

    // Stats
    registeredDonors: string;
    livesSaved: string;
    unitsAvailable: string;

    // Roles
    roleDonorTitle: string;
    roleDonorDesc: string;
    roleDonorCta: string;
    roleDonorFeatures: string[];

    roleHospitalTitle: string;
    roleHospitalDesc: string;
    roleHospitalCta: string;
    roleHospitalFeatures: string[];

    roleStaffTitle: string;
    roleStaffDesc: string;
    roleStaffCta: string;
    roleStaffFeatures: string[];

    roleMedicalStaffTitle: string;

    roleAdminTitle: string;
    roleAdminDesc: string;
    roleAdminCta: string;
    roleAdminFeatures: string[];

    roleSuperAdminTitle: string;
    roleSuperAdminDesc: string;
    roleSuperAdminCta: string;
    roleSuperAdminFeatures: string[];

    // Sections
    getStarted: string;
    selectRole: string;
    whyMatters: string;
    whyMattersDesc: string;

    // Benefits
    fastResponse: string;
    fastResponseDesc: string;
    secureData: string;
    secureDataDesc: string;
    liveTracking: string;
    liveTrackingDesc: string;
    community: string;
    communityDesc: string;

    // Impact
    monthlyGrowth: string;
    monthlyGrowthDesc: string;
    bloodTypeDemand: string;
    bloodTypeDemandDesc: string;
    highDemand: string;
    demand: string;
    beforeBdms: string;
    afterBdms: string;
    manualChaos: string;
    digitalEfficiency: string;
    impactBeforeList: string[];
    impactAfterList: string[];
  }
>;

const translations: Translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    register: 'Register',
    awards: 'Awards',
    findDonor: 'Find Donor',
    emergencyRequest: 'Emergency Request',
    myRequests: 'My Requests',
    myDonations: 'My Donations',
    login: 'Log In',
    logout: 'Log Out',
    language: 'Language',
    home: 'Home',
    donors: 'Donors',
    hospitals: 'Hospitals',
    donations: 'Donations',
    bloodRequests: 'Blood Requests',
    requestHistory: 'Request History',
    bloodStock: 'Blood Stock',
    addDonor: 'Add Donor',
    manageAdmins: 'Manage Admins',
    viewDonorDetails: 'View Donor Details',
    editDonorDetails: 'Edit Donor Details',

    deleteDonorDetails: 'Delete Donor Details',
    manageDonors: 'Manage Donors',
    addHospital: 'Add Hospital',
    viewHospitalDetails: 'View Hospital Details',
    editHospitalDetails: 'Edit Hospital Details',
    deleteHospitalDetails: 'Delete Hospital Details',
    // Staff
    staff: 'Staff',
    addStaff: 'Add Staff',
    viewStaffDetails: 'View Staff Details',
    editStaffDetails: 'Edit Staff Details',
    deleteStaffDetails: 'Delete Staff Details',
    manageStaff: 'Manage Staff',
    // Admin Sidebar & Status
    donorStatus: 'Donor Status',
    pendingDonor: 'Pending Donor',
    approveDonor: 'Approve Donor',
    rejectDonor: 'Reject Donor',
    hospitalStatus: 'Hospital Status',
    pendingHospital: 'Pending Hospital',
    approveHospital: 'Approve Hospital',
    rejectHospital: 'Reject Hospital',

    // Staff Portal
    medicalStaffPortal: 'Medical Staff Portal',
    staffPortal: 'Staff Portal',
    appointments: 'Appointments',
    manageHospitalActivity: 'Manage Hospital (Activity)',

    // Super Admin
    addAdmin: 'Add Admin',
    viewAdminDetails: 'View Admin Details',
    editAdminDetails: 'Edit Admin Details',
    deleteAdminDetails: 'Delete Admin Details',

    // Languages
    english: 'English',
    amharic: 'Amharic',

    // Navigation & Common
    hospitalPortal: 'HOSPITAL PORTAL',
    donorMode: 'Donor Mode',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications',
    noNewNotifications: 'No new notifications',
    viewAllNotifications: 'View All Notifications',
    seen: 'Seen',
    deleteProfile: 'Delete Profile',
    deleteProfileConfirmation: 'Are you sure you want to delete your profile? This action cannot be undone.',
    deleteProfileSubmitted: 'Profile delete request submitted.',
    confirm: 'Confirm',
    viewing: 'Viewing',
    appName: 'BDMS Ethiopia',

    // Forms
    fullName: 'Full Name',
    bloodType: 'Blood Type',
    bloodTypeUnknown: "I don't know",
    birthDate: 'Date of Birth',
    donationAppointmentDate: 'Donation Appointment Date',
    age: 'Age',
    weight: 'Weight (Kg)',
    phoneNumber: 'Phone Number',
    hospitalPhoneNumber: 'Hospital Phone (landline)',
    emailAddress: 'Email Address',
    location: 'Location',
    region: 'Region',
    city: 'City',
    subCity: 'Sub-City',
    woreda: 'Woreda',
    kebele: 'Kebele',
    street: 'Street',
    homeNumber: 'Home Number',
    disease: 'Disease',
    medicalCondition: 'Medical Condition',
    // Actions
    addDonorBtn: 'Add Donor',
    updateDonor: 'Update Donor',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    // Status
    ready: 'Ready',
    resting: 'Resting',
    available: 'Available',
    unavailable: 'Unavailable',
    // Common
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    actions: 'Actions',
    results: 'Results',
    showing: 'Showing',
    noDonorsFound: 'No donors found',
    noDataFound: 'No data found',
    // Search
    findByName: 'Find by name',
    findByNumber: 'Find by number',
    findByBloodType: 'Find by blood type',
    findByLocation: 'Find by location',
    geolocationSearch: 'Geolocation Search',
    googleMaps: 'Google Maps',
    viewOnMap: 'View on Map',
    call: 'Call',
    // Donor Info
    totalDonations: 'Total Donations',
    lastDonation: 'Last Donation',
    availability: 'Availability',
    impactScore: 'Impact Score',
    // Placeholders
    enterFullName: 'Enter full name',
    selectBloodType: 'Select blood type',
    enterBirthDate: 'Enter date of birth',
    enterAppointmentDate: 'Enter appointment date',
    enterAge: 'Enter age',
    enterPhoneNumber: '+251 9XX XXX XXX',
    enterHospitalPhone: '011 XXX XXXX',
    enterEmail: 'email@example.com',
    enterLocation: 'e.g., Addis Ababa, Bole',
    enterRegion: 'Enter region',
    enterCity: 'Enter city',
    enterSubCity: 'Enter sub-city',
    enterWoreda: 'Enter woreda',
    enterKebele: 'Enter kebele',
    enterStreet: 'Enter street',
    enterHomeNumber: 'Enter home number',
    enterMedicalConditions: 'Enter any medical conditions (if any)',
    // Registration
    createProfile: 'Create your profile',
    registerDescription: 'Donors and hospitals can onboard in minutes.',
    uploadProfilePicture: 'Upload Profile Picture',
    completeRegistration: 'Complete Registration',
    accountCreatedSuccess: 'Account created successfully!',
    alreadyHaveAccount: 'Already have an account?',
    editProfile: 'Edit Profile',
    // Hospital
    hospitalName: 'Hospital Name',
    enterHospitalName: 'Enter hospital name',
    contactPerson: 'Contact Person',
    contactDoctorName: 'Contact Doctor Name',
    contactDoctorPhone: 'Contact Doctor Phone',
    enterContactPerson: 'Enter contact person name',
    enterContactDoctorName: 'Enter contact doctor name',
    enterContactDoctorPhone: 'Enter contact doctor phone',
    hospitalType: 'Hospital Type',
    governmentHospital: 'Government Hospital',
    nonGovernmentHospital: 'Non-Government Hospital',
    businessLicense: 'Business License',
    businessLicenseName: 'Business License Name',
    businessLicenseNumber: 'Business License Number',
    enterBusinessLicenseName: 'Enter business license name',
    enterBusinessLicenseNumber: 'Enter business license number',
    uploadHospitalLicense: 'Upload Hospital License',
    // Delete
    selectDonorToDelete: 'Select Donor to Delete',
    warningDeleteAction: 'Warning: This action cannot be undone.',
    confirmDeleteDonor: 'Are you sure you want to delete donor',
    confirmDeleteMessage: 'This action cannot be undone.',
    confirmDelete: 'Confirm Delete',
    actionCannotBeUndone: 'This action cannot be undone.',
    deletedSuccessfully: 'deleted successfully',
    // Hospital Delete
    confirmDeleteHospital: 'Are you sure you want to delete hospital',
    selectHospitalToDelete: 'Select Hospital to Delete',
    findHospital: 'Find Hospital',
    noHospitalsFound: 'No hospitals found',

    // Landing Page
    heroTitlePrefix: 'Donate Blood, ',
    heroTitleSuffix: 'Save a Life.',
    heroSubtitleHtml: 'Join our community of heroes. BDMS Ethiopia connects donors with hospitals instantly to ensure no life is lost due to a shortage.',
    donateNow: 'Donate Now',
    requestBlood: 'Request Blood',

    // Stats
    registeredDonors: 'Registered Donors',
    livesSaved: 'Lives Saved',
    unitsAvailable: 'Units Available',

    // Roles
    roleDonorTitle: 'Donor',
    roleDonorDesc: 'Donate blood, history, and badges.',
    roleDonorCta: 'Login as Donor',
    roleDonorFeatures: ['Schedule Appointments', 'Health History', 'Rewards'],

    roleHospitalTitle: 'Hospital',
    roleHospitalDesc: 'Request blood and manage stock.',
    roleHospitalCta: 'Login as Hospital',
    roleHospitalFeatures: ['Urgent Requests', 'Inventory', 'Donor Database'],

    roleStaffTitle: 'Staff',
    roleStaffDesc: 'Manage check-ins and collections.',
    roleStaffCta: 'Login as Staff',
    roleStaffFeatures: ['Check-in System', 'Vitals', 'Collection Log'],

    roleMedicalStaffTitle: 'Medical Staff',

    roleAdminTitle: 'Admin',
    roleAdminDesc: 'Operations and user management.',
    roleAdminCta: 'Admin Portal',
    roleAdminFeatures: ['User Mgmt', 'Reporting', 'Status'],

    roleSuperAdminTitle: 'Super Admin',
    roleSuperAdminDesc: 'System configuration and logs.',
    roleSuperAdminCta: 'Master Portal',
    roleSuperAdminFeatures: ['Config', 'Audit Logs', 'Security'],

    // Sections
    getStarted: 'Get Started',
    selectRole: 'Select your role to access the portal',
    whyMatters: 'Why BDMS Matters',
    whyMattersDesc: 'See how digital transformation is saving lives across Ethiopia.',

    // Benefits
    fastResponse: 'Fast Response',
    fastResponseDesc: 'Reduce emergency response time by up to 60% with instant matching.',
    secureData: 'Secure Data',
    secureDataDesc: 'End-to-end encryption for all donor medical records.',
    liveTracking: 'Live Tracking',
    liveTrackingDesc: 'Real-time GPS tracking for critical blood deliveries.',
    community: 'Community',
    communityDesc: 'Building a nationwide network of life-savers.',

    // Impact
    monthlyGrowth: 'Monthly Donation Growth',
    monthlyGrowthDesc: 'Consistent growth in voluntary donations.',
    bloodTypeDemand: 'Blood Type Demand',
    bloodTypeDemandDesc: 'Current distribution of requested blood types.',
    highDemand: 'High',
    demand: 'Demand',
    beforeBdms: 'BEFORE',
    afterBdms: 'AFTER BDMS',
    manualChaos: 'Manual Chaos',
    digitalEfficiency: 'Digital Efficiency',
    impactBeforeList: ['Paper records & lost files', 'Slow phone-based coordination', 'Expired inventory wastage'],
    impactAfterList: ['Real-time digital inventory', 'Instant hospital-donor matching', 'Automated expiration alerts'],

    // Footer
    quickLinks: 'Quick Links',
    support: 'Support',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    contactUs: 'Contact Us',
    footerDesc: 'Connecting blood donors with hospitals in need. We bridge the gap to ensure every life gets a chance.',
    allRightsReserved: 'All rights reserved.',

    // Login
    welcomeBack: 'Welcome back',
    signInDesc: 'Sign in to manage donors, requests, and reports.',
    selectRoleTitle: 'Select Role',
    identifierLabel: 'Email, Username, or Phone Number',
    identifierPlaceholder: 'e.g., aman, +251..., or admin@blood.gov.et',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot Password?',
    signInBtn: 'Sign in',
    signingIn: 'Signing in...',
    newToPlatform: 'New to the platform?',
    createAccount: 'Create an account',

    // Register
    donorRegForm: 'Donor Registration Form',
    hospitalRegForm: 'Hospital Registration Form',
    frontId: 'Front ID',
    backId: 'Back ID',
    clickToUploadFront: 'Click to upload Front ID',
    clickToUploadBack: 'Click to upload Back ID',
    enterMedicalConditionsHint: 'Enter any medical conditions',
    gender: 'Gender',
    selectGender: 'Select Gender',
    male: 'Male',
    female: 'Female',
    maritalStatus: 'Marital Status',
    selectStatus: 'Select Status',
    single: 'Single',
    married: 'Married',
    widowed: 'Widowed',
    divorced: 'Divorced',
    separated: 'Separated',
    fanNumber: 'FAN Number',
    enterFanNumber: 'Enter 16-digit FAN Number',
    getLocation: 'Get Location',
    locationRequired: 'Location (GPS) is required',

    // Auth & Validation Messages
    passwordsDoNotMatch: 'Passwords do not match!',
    fanLengthError: 'FAN Number must be exactly 16 digits.',
    phoneLengthError: 'Phone number must be exactly 10 digits.',
    ageError: 'Age must be greater than 18.',
    weightError: 'Weight must be greater than 45 kg.',
    medicalConditionRequired: 'Medical Condition is required.',
    disabilityRequired: 'Please specify if you have any disabilities.',
    idCardRequired: 'Front ID Card image is required.',
  },
  am: {
    // Navigation
    dashboard: 'ዳሽቦርድ',
    register: 'መመዝገብ',
    awards: 'ሽልማት',
    findDonor: 'ደጋፊ ፈልግ',
    emergencyRequest: 'አደጋ ጥያቄ',
    myRequests: 'ጥያቄዎቼ',
    myDonations: 'ልገሳዎቼ',
    login: 'ግባ',
    logout: 'ውጣ',
    language: 'ቋንቋ',
    home: 'መነሻ',
    donors: 'ደጋፊዎች',
    hospitals: 'ሆስፒታሎች',
    donations: 'ልገሳዎች',
    bloodRequests: 'የደም ጥያቄዎች',
    requestHistory: 'የጥያቄ ታሪክ',
    bloodStock: 'የደም ክምችት',
    addDonor: 'ደጋፊ ጨምር',
    manageAdmins: 'አስተዳዳሪዎችን ያቀናብሩ',
    viewDonorDetails: 'የደጋፊ ዝርዝሮች ማየት',
    editDonorDetails: 'የደጋፊ ዝርዝሮች ማስተካከል',

    deleteDonorDetails: 'የደጋፊ ዝርዝሮች ሰርዝ',
    manageDonors: 'ደጋፊዎችን ያቀናብሩ',
    addHospital: 'ሆስፒታል ጨምር',
    viewHospitalDetails: 'የሆስፒታል ዝርዝሮች ማየት',
    editHospitalDetails: 'የሆስፒታል ዝርዝሮች ማስተካከል',
    deleteHospitalDetails: 'የሆስፒታል ዝርዝሮች ሰርዝ',
    // Staff
    staff: 'ሰራተኞች',
    addStaff: 'ሰራተኛ ጨምር',
    viewStaffDetails: 'የሰራተኛ ዝርዝሮች ማየት',
    editStaffDetails: 'የሰራተኛ ዝርዝሮች ማስተካከል',
    deleteStaffDetails: 'የሰራተኛ ዝርዝሮች ሰርዝ',
    manageStaff: 'ሰራተኞችን ያቀናብሩ',
    // Admin Sidebar & Status
    donorStatus: 'የደጋፊ ሁኔታ',
    pendingDonor: 'በመጠባበቅ ላይ ያለ ደጋፊ',
    approveDonor: 'ደጋፊ አፅድቅ',
    rejectDonor: 'ደጋፊ ውድቅ አድርግ',
    hospitalStatus: 'የሆስፒታል ሁኔታ',
    pendingHospital: 'በመጠባበቅ ላይ ያለ ሆስፒታል',
    approveHospital: 'ሆስፒታል አፅድቅ',
    rejectHospital: 'ሆስፒታል ውድቅ አድርግ',

    // Staff Portal
    medicalStaffPortal: 'የህክምና ሰራተኞች ፖርታል',
    staffPortal: 'የሰራተኞች ፖርታል',
    appointments: 'ቀጠሮዎች',
    manageHospitalActivity: 'የሆስፒታል ተግባራት',

    // Super Admin
    addAdmin: 'አስተዳዳሪ ጨምር',
    viewAdminDetails: 'አስተዳዳሪ ዝርዝሮች ይመልከቱ',
    editAdminDetails: 'አስተዳዳሪ ዝርዝሮች ያርትዑ',
    deleteAdminDetails: 'አስተዳዳሪ ዝርዝሮች ሰርዝ',

    // Languages
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',

    // Navigation & Common
    hospitalPortal: 'የሆስፒታል ፖርታል',
    donorMode: 'የደጋፊ ሁነታ',
    notifications: 'ማሳወቂያዎች',
    markAllRead: 'ሁሉንም እንደተነበበ ምልክት አድርግ',
    noNotifications: 'ምንም ማሳወቂያዎች የሉም',
    noNewNotifications: 'ምንም አዲስ ማሳወቂያዎች የሉም',
    viewAllNotifications: 'ሁሉንም ማሳወቂያዎች ይመልከቱ',
    seen: 'ታይቷል',
    deleteProfile: 'መገለጫ ሰርዝ',
    deleteProfileConfirmation: 'መገለጫዎን በእርግጠኝነት መሰረዝ ይፈልጋሉ? ይህ እርምጃ ሊቀለበስ አይችልም።',
    deleteProfileSubmitted: 'የመገለጫ መሰረዝ ጥያቄ ቀርቧል።',
    confirm: 'አረጋግጥ',
    viewing: 'እየተመለከቱ ነው',
    appName: 'BDMS ኢትዮጵያ',

    // Forms
    fullName: 'ሙሉ ስም',
    bloodType: 'የደም አይነት',
    bloodTypeUnknown: 'አላውቅም',
    birthDate: 'የልደት ቀን',
    donationAppointmentDate: 'የልገሳ ቀጠሮ ቀን',
    age: 'ዕድሜ',
    weight: 'ክብደት (ኪሎ)',
    phoneNumber: 'የስልክ ቁጥር',
    hospitalPhoneNumber: 'የሆስፒታል ስልክ (011...)',
    emailAddress: 'የኢሜይል አድራሻ',
    location: 'አካባቢ',
    region: 'ክልል',
    city: 'ከተማ',
    subCity: 'ንዑስ ከተማ',
    woreda: 'ወረዳ',
    kebele: 'ቀበሌ',
    street: 'መንገድ',
    homeNumber: 'የቤት ቁጥር',
    disease: 'በሽታ',
    medicalCondition: 'የጤና ሁኔታ',
    // Actions
    addDonorBtn: 'ደጋፊ ጨምር',
    updateDonor: 'ደጋፊ አዘምን',
    cancel: 'ተወው',
    submit: 'ላክ',
    save: 'አስቀምጥ',
    delete: 'ሰርዝ',
    edit: 'አስተካከል',
    view: 'ማየት',
    search: 'ፈልግ',
    filter: 'አጣል',
    // Status
    ready: 'ዝግጁ',
    resting: 'በመዝናናት',
    available: 'ይገኛል',
    unavailable: 'አይገኝም',
    // Common
    name: 'ስም',
    phone: 'ስልክ',
    email: 'ኢሜይል',
    address: 'አድራሻ',
    actions: 'ድርጊቶች',
    results: 'ውጤቶች',
    showing: 'የሚታይ',
    noDonorsFound: 'ደጋፊ አልተገኘም',
    noDataFound: 'ውሂብ አልተገኘም',
    // Search
    findByName: 'በስም ፈልግ',
    findByNumber: 'በቁጥር ፈልግ',
    findByBloodType: 'በደም አይነት ፈልግ',
    findByLocation: 'በአካባቢ ፈልግ',
    geolocationSearch: 'የመሬት አቀማመጥ ፈልግ',
    googleMaps: 'ጉግል ካርታ',
    viewOnMap: 'በካርታ ላይ ማየት',
    call: 'ደውል',
    // Donor Info
    totalDonations: 'ጠቅላላ ልገሳዎች',
    lastDonation: 'የመጨረሻ ልገሳ',
    availability: 'መገኘት',
    impactScore: 'የግምገማ ነጥብ',
    // Placeholders
    enterFullName: 'ሙሉ ስም ያስገቡ',
    selectBloodType: 'የደም አይነት ይምረጡ',
    enterBirthDate: 'የልደት ቀን ያስገቡ',
    enterAppointmentDate: 'የቀጠሮ ቀን ያስገቡ',
    enterAge: 'ዕድሜ ያስገቡ',
    enterPhoneNumber: '+251 9XX XXX XXX',
    enterHospitalPhone: '011 XXX XXXX',
    enterEmail: 'ኢሜይል@ምሳሌ.com',
    enterLocation: 'ምሳሌ፡ አዲስ አበባ፣ ቦሌ',
    enterRegion: 'ክልል ያስገቡ',
    enterCity: 'ከተማ ያስገቡ',
    enterSubCity: 'ንዑስ ከተማ ያስገቡ',
    enterWoreda: 'ወረዳ ያስገቡ',
    enterKebele: 'ቀበሌ ያስገቡ',
    enterStreet: 'መንገድ ያስገቡ',
    enterHomeNumber: 'የቤት ቁጥር ያስገቡ',
    enterMedicalConditions: 'የጤና ሁኔታዎች ያስገቡ (ካለ)',
    // Registration
    createProfile: 'መገለጫዎን ይፍጠሩ',
    registerDescription: 'ደጋፊዎች እና ሆስፒታሎች በጥቂት ደቂቃዎች ውስጥ ሊመዘገቡ ይችላሉ።',
    uploadProfilePicture: 'መገለጫ ፎቶ ይጭኑ',
    completeRegistration: 'መመዝገብ ያጠናቅቁ',
    accountCreatedSuccess: 'መለያ በተሳካ ሁኔታ ተፈጥሯል!',
    alreadyHaveAccount: 'አስቀድመው መለያ አሎት?',
    editProfile: 'መገለጫ አርትዕ',
    // Hospital
    hospitalName: 'የሆስፒታል ስም',
    enterHospitalName: 'የሆስፒታል ስም ያስገቡ',
    contactPerson: 'የገንኙ ሰው',
    contactDoctorName: 'የእንክብካቤ ዶክተር ስም',
    contactDoctorPhone: 'የእንክብካቤ ዶክተር ስልክ',
    enterContactPerson: 'የገንኙ ሰው ስም ያስገቡ',
    enterContactDoctorName: 'የዶክተሩን ስም ያስገቡ',
    enterContactDoctorPhone: 'የዶክተሩን ስልክ ያስገቡ',
    hospitalType: 'የሆስፒታል አይነት',
    governmentHospital: 'የመንግስት ሆስፒታል',
    nonGovernmentHospital: 'የግል ሆስፒታል',
    businessLicense: 'የንግድ ፈቃድ',
    businessLicenseName: 'የንግድ ፈቃድ ስም',
    businessLicenseNumber: 'የንግድ ፈቃድ ቁጥር',
    enterBusinessLicenseName: 'የንግድ ፈቃድ ስም ያስገቡ',
    enterBusinessLicenseNumber: 'የንግድ ፈቃድ ቁጥር ያስገቡ',
    uploadHospitalLicense: 'የሆስፒታል ፈቃድ አስገባ',
    // Delete
    selectDonorToDelete: 'ለመሰረዝ ደጋፊ ይምረጡ',
    warningDeleteAction: 'ማስጠንቀቂያ: ይህ ተግባር ሊመለስ አይችልም።',
    confirmDeleteDonor: 'ይህንን ደጋፊ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት',
    confirmDeleteMessage: 'ይህ ተግባር ሊመለስ አይችልም።',
    confirmDelete: 'ማረጋገጥ እና ሰርዝ',
    actionCannotBeUndone: 'ይህ ተግባር ሊመለስ አይችልም።',
    deletedSuccessfully: 'በተሳካ ሁኔታ ተሰርዟል',
    // Hospital Delete
    confirmDeleteHospital: 'ይህንን ሆስፒታል መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት',
    selectHospitalToDelete: 'ለመሰረዝ ሆስፒታል ይምረጡ',
    findHospital: 'ሆስፒታል ፈልግ',
    noHospitalsFound: 'ሆስፒታል አልተገኘም',

    // Landing Page
    heroTitlePrefix: 'ደም ይለግሱ፣ ',
    heroTitleSuffix: 'ሕይወት ያድኑ።',
    heroSubtitleHtml: 'የጀግኖች ማህበረሰባችንን ይቀላቀሉ። BDMS ኢትዮጵያ በደም እጥረት ምክንያት የትኛውም ህይወት እንዳያልፍ ደጋፊዎችን ከሆስፒታሎች ጋር በፍጥነት ያገናኛል።',
    donateNow: 'አሁን ይለግሱ',
    requestBlood: 'ደም ይጠይቁ',

    // Stats
    registeredDonors: 'የተመዘገቡ ደጋፊዎች',
    livesSaved: 'የዳኑ ህይወቶች',
    unitsAvailable: 'የሚገኙ ክፍሎች',

    // Roles
    roleDonorTitle: 'ደጋፊ',
    roleDonorDesc: 'ደም መለገስ፣ ታሪክ እና ባጆች።',
    roleDonorCta: 'እንደ ደጋፊ ይግቡ',
    roleDonorFeatures: ['ቀጠሮዎችን መያዝ', 'የጤና ታሪክ', 'ሽልማቶች'],

    roleHospitalTitle: 'ሆስፒታል',
    roleHospitalDesc: 'ደም መጠየቅ እና ክምችት ማስተዳደር።',
    roleHospitalCta: 'እንደ ሆስፒታል ይግቡ',
    roleHospitalFeatures: ['የአስቸኳይ ጊዜ ጥያቄዎች', 'ክምችት', 'የደጋፊዎች መረጃ'],

    roleStaffTitle: 'ሰራተኛ',
    roleStaffDesc: 'ተመዝጋቢዎችን እና ስብስቦችን ማስተዳደር።',
    roleStaffCta: 'እንደ ሰራተኛ ይግቡ',
    roleStaffFeatures: ['የመግቢያ ስርዓት', 'ወሳኝ ምልክቶች (Vitals)', 'የስብስብ መዝገብ'],

    roleMedicalStaffTitle: 'የህክምና ሰራተኛ',

    roleAdminTitle: 'አስተዳዳሪ',
    roleAdminDesc: 'ኦፕሬሽኖች እና የተጠቃሚዎች አስተዳደር።',
    roleAdminCta: 'የአስተዳዳሪ ፖርታል',
    roleAdminFeatures: ['ተጠቃሚ ማስተዳደር', 'ሪፖርት ማድረግ', 'ሁኔታ'],

    roleSuperAdminTitle: 'ከፍተኛ አስተዳዳሪ',
    roleSuperAdminDesc: 'የስርዓት ውቅር እና ምዝግብ ማስታወሻዎች።',
    roleSuperAdminCta: 'ዋና ፖርታል',
    roleSuperAdminFeatures: ['ውቅር (Config)', 'የኦዲት ምዝግብ ማስታወሻዎች', 'ደህንነት'],

    // Sections
    getStarted: 'ጀምር',
    selectRole: 'ወደ ፖርታሉ ለመግባት ሚናዎን ይምረጡ',
    whyMatters: 'BDMS ለምን አስፈለገ',
    whyMattersDesc: 'ዲጂታል ለውጥ በኢትዮጵያ እንዴት ህይወትን እያዳነ እንደሆነ ይመልከቱ።',

    // Benefits
    fastResponse: 'ፈጣን ምላሽ',
    fastResponseDesc: 'በፈጣን ማዛመድ የአደጋ ጊዜ ምላሽ ጊዜን እስከ 60% ይቀንሱ።',
    secureData: 'ደህንነቱ የተጠበቀ መረጃ',
    secureDataDesc: 'ለሁሉም የደጋፊዎች የህክምና መዛግብት ምስጠራ።',
    liveTracking: 'ቀጥታ ክትትል',
    liveTrackingDesc: 'ለወሳኝ የደም አቅርቦቶች የእውነተኛ ጊዜ GPS ክትትል።',
    community: 'ማህበረሰብ',
    communityDesc: 'አገር አቀፍ የህይወት አድን መረብ መገንባት።',

    // Impact
    monthlyGrowth: 'የወር በወር የልገሳ እድገት',
    monthlyGrowthDesc: 'በበጎ ፈቃደኝነት የሚደረግ ልገሳ ተከታታይ እድገት።',
    bloodTypeDemand: 'የደም አይነት ፍላጎት',
    bloodTypeDemandDesc: 'የተጠየቁ የደም አይነቶች ወቅታዊ ስርጭት።',
    highDemand: 'ከፍተኛ',
    demand: 'ፍላጎት',
    beforeBdms: 'ከዚህ በፊት',
    afterBdms: 'ከBDMS በኋላ',
    manualChaos: 'የእጅ ሥራ (Manual)',
    digitalEfficiency: 'ዲጂታል ቅልጥፍና',
    impactBeforeList: ['የወረቀት መዝገቦች እና የጠፉ ፋይሎች', 'ዘገምተኛ የስልክ ቅንጅት', 'ጊዜው ያለፈበት ክምችት ብክነት'],
    impactAfterList: ['የእውነተኛ ጊዜ ዲጂታል ክምችት', 'ፈጣን የሆስፒታል-ደጋፊ ግንኙነት', 'ራስ-ሰር ጊዜው የሚያበቃበት ማስጠንቀቂያዎች'],

    // Footer
    quickLinks: 'ፈጣን አገናኞች',
    support: 'ድጋፍ',
    helpCenter: 'የእርዳታ ማዕከል',
    privacyPolicy: 'የግላዊነት ፖሊሲ',
    termsOfService: 'የአገልግሎት ውሎች',
    cookiePolicy: 'የኩኪ ፖሊሲ',
    contactUs: 'ያግኙን',
    footerDesc: 'ደም ለጋሾችን ከሆስፒታሎች ጋር ማገናኘት። እያንዳንዱ ህይወት እድል ማግኘቱን ለማረጋገጥ ክፍተቱን እናገናኛለን።',
    allRightsReserved: 'መብቱ በህግ የተጠበቀ ነው።',

    // Login
    welcomeBack: 'እንኳን በደህና መጡ',
    signInDesc: 'ደጋፊዎችን፣ ጥያቄዎችን እና ሪፖርቶችን ለማስተዳደር ይግቡ።',
    selectRoleTitle: 'ሚና ይምረጡ',
    identifierLabel: 'ኢሜይል፣ የተጠቃሚ ስም ወይም ስልክ ቁጥር',
    identifierPlaceholder: 'ምሳሌ፡ አማን፣ +251...፣ ወይም admin@blood.gov.et',
    passwordLabel: 'የይለፍ ቃል',
    forgotPassword: 'የይለፍ ቃል ረሱ?',
    signInBtn: 'ግባት',
    signingIn: 'በመግባት ላይ...',
    newToPlatform: 'አዲስ ነዎት?',
    createAccount: 'መለያ ይፍጠሩ',

    // Register
    donorRegForm: 'የደጋፊ ምዝገባ ቅጽ',
    hospitalRegForm: 'የሆስፒታል ምዝገባ ቅጽ',
    frontId: 'የመታወቂያ ፊት',
    backId: 'የመታወቂያ ጀርባ',
    clickToUploadFront: 'የመታወቂያ ፊት ለመጫን እዚህ ይጫኑ',
    clickToUploadBack: 'የመታወቂያ ጀርባ ለመጫን እዚህ ይጫኑ',
    enterMedicalConditionsHint: 'የጤና ሁኔታዎች ያስገቡ',
    gender: 'ፆታ',
    selectGender: 'ፆታ ይምረጡ',
    male: 'ወንድ',
    female: 'ሴት',
    maritalStatus: 'የጋብቻ ሁኔታ',
    selectStatus: 'ሁኔታ ይምረጡ',
    single: 'ያላገባ/ች',
    married: 'ያገባ/ች',
    widowed: 'ባል/ሚስት የሞተበት/ባት',
    divorced: 'የተፋታ/ች',
    separated: 'የተለያየ/ች',
    fanNumber: 'የደጋፊ ቁጥር (FAN)',
    enterFanNumber: '16-አሃዝ የደጋፊ ቁጥር ያስገቡ',
    getLocation: 'አካባቢ ያግኙ',
    locationRequired: 'አካባቢ (GPS) ያስፈልጋል',

    // Auth & Validation Messages
    passwordsDoNotMatch: 'የይለፍ ቃሎች አይዛመዱም!',
    fanLengthError: 'የደጋፊ ቁጥር በትክክል 16 አሃዞች መሆን አለበት።',
    phoneLengthError: 'የስልክ ቁጥር በትክክል 10 አሃዞች መሆን አለበት።',
    ageError: 'እድሜ ከ 18 በላይ መሆን አለበት።',
    weightError: 'ክብደት ከ 45 ኪሎግራም በላይ መሆን አለበት።',
    medicalConditionRequired: 'የጤና ሁኔታ ያስፈልጋል።',
    disabilityRequired: 'እባክዎ አካል ጉዳት ካለብዎ ይግለጹ።',
    idCardRequired: 'የመታወቂያ ፊት ምስል ያስፈልጋል።',

  },
};

type LanguageContextType = {
  lang: SupportedLang;
  t: (key: keyof Translations[SupportedLang]) => any; // Changed from string to any to support string[]
  setLanguage: (lang: SupportedLang) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<SupportedLang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('bdms_lang') as SupportedLang | null;
    if (stored) {
      setLang(stored);
    }
  }, []);

  const setLanguage = (value: SupportedLang) => {
    setLang(value);
    localStorage.setItem('bdms_lang', value);
  };

  const toggleLanguage = () => setLanguage(lang === 'en' ? 'am' : 'en');

  const t = (key: keyof Translations[SupportedLang]) => translations[lang][key];

  const value = useMemo(
    () => ({
      lang,
      t,
      setLanguage,
      toggleLanguage,
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

// verified structure
