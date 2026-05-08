export const DEPARTMENTS = [
  { value: "AERO", label: "Aeronautical Engineering (AERO)" },
  { value: "AUTO", label: "Automobile Engineering (AUTO)" },
  { value: "BME", label: "Biomedical Engineering (BME)" },
  { value: "BT", label: "Biotechnology (BT)" },
  { value: "CHEM", label: "Chemical Engineering (CHEM)" },
  { value: "CIVIL", label: "Civil Engineering (CIVIL)" },
  { value: "CSE", label: "Computer Science and Engineering (CSE)" },
  { value: "CSE-CS", label: "Computer Science and Engineering - Cyber Security (CSE-CS)" },
  { value: "CSBS", label: "Computer Science and Business Systems (CSBS)" },
  { value: "CSD", label: "Computer Science and Design (CSD)" },
  { value: "EEE", label: "Electrical and Electronics Engineering (EEE)" },
  { value: "ECE", label: "Electronics and Communication Engineering (ECE)" },
  { value: "FT", label: "Food Technology (FT)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "AIML", label: "Artificial Intelligence and Machine Learning (AIML)" },
  { value: "AIDS", label: "Artificial Intelligence and Data Science (AIDS)" },
  { value: "MECH", label: "Mechanical Engineering (MECH)" },
  { value: "MCT", label: "Mechatronics Engineering (MCT)" },
  { value: "RA", label: "Robotics & Automation (R&A)" },
] as const;

export type DepartmentCode = typeof DEPARTMENTS[number]["value"];

export function getDepartmentLabel(code: string): string {
  const dept = DEPARTMENTS.find(d => d.value === code);
  return dept ? dept.label : code;
}
