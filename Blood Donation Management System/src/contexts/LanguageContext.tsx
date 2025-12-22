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
    login: string;
    logout: string;
    language: string;
    home: string;
    donors: string;
    hospitals: string;
    donations: string;
    bloodRequests: string;
    requestHistory: string;
    bloodStock: string;
    addDonor: string;
    viewDonorDetails: string;
    editDonorDetails: string;
    deleteDonorDetails: string;
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
    // Forms
    fullName: string;
    bloodType: string;
    bloodTypeUnknown: string;
    birthDate: string;
    donationAppointmentDate: string;
    age: string;
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
    viewDonorDetails: 'View Donor Details',
    editDonorDetails: 'Edit Donor Details',
    deleteDonorDetails: 'Delete Donor Details',
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
    // Forms
    fullName: 'Full Name',
    bloodType: 'Blood Type',
    bloodTypeUnknown: "I don't know",
    birthDate: 'Date of Birth',
    donationAppointmentDate: 'Donation Appointment Date',
    age: 'Age',
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
  },
  am: {
    // Navigation
    dashboard: 'ዳሽቦርድ',
    register: 'መመዝገብ',
    awards: 'ሽልማት',
    findDonor: 'ደጋፊ ፈልግ',
    emergencyRequest: 'አደጋ ጥያቄ',
    myRequests: 'ጥያቄዎቼ',
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
    viewDonorDetails: 'የደጋፊ ዝርዝሮች ማየት',
    editDonorDetails: 'የደጋፊ ዝርዝሮች ማስተካከል',
    deleteDonorDetails: 'የደጋፊ ዝርዝሮች ሰርዝ',
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
    // Forms
    fullName: 'ሙሉ ስም',
    bloodType: 'የደም አይነት',
    bloodTypeUnknown: 'አላውቅም',
    birthDate: 'የልደት ቀን',
    donationAppointmentDate: 'የልገሳ ቀጠሮ ቀን',
    age: 'ዕድሜ',
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
  },
};

type LanguageContextType = {
  lang: SupportedLang;
  t: (key: keyof Translations[SupportedLang]) => string;
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

