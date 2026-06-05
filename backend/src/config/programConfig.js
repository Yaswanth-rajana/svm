export const PROGRAM_CONFIG = {
  "it-infrastructure": {
    title: "IT Infrastructure Engineering Roadmap",
    shortTitle: "IT Infrastructure",
    emailSubject: "🎉 Registration Confirmed - IT Infrastructure Engineering Roadmap",
    learningPoints: [
      "Understand what IT Infrastructure is and how it powers the modern world.",
      "Discover why this is a highly stable, AI-proof career path.",
      "Get insights into job opportunities and salary benchmarks."
    ]
  },

  "cloud-computing": {
    title: "Cloud Computing Engineering Roadmap",
    shortTitle: "Cloud Computing",
    emailSubject: "🎉 Registration Confirmed - Cloud Computing Engineering Roadmap",
    learningPoints: [
      "Master AWS, Microsoft Azure, and Google Cloud Platform.",
      "Understand cloud deployment models and enterprise architectures.",
      "Build hands-on cloud infrastructure projects.",
      "Prepare for Cloud Engineer interview opportunities."
    ]
  },

  "devops-engineering": {
    title: "DevOps Engineering Roadmap",
    shortTitle: "DevOps Engineering",
    emailSubject: "🎉 Registration Confirmed - DevOps Engineering Roadmap",
    learningPoints: [
      "Master CI/CD pipelines, Docker, Kubernetes, and IaC (Terraform).",
      "Understand software development lifecycles and automated testing.",
      "Build production-ready deployment workflows.",
      "Prepare for DevOps & Site Reliability Engineer (SRE) job roles."
    ]
  },

  "virtualization-engineering": {
    title: "Virtualization Engineering Roadmap",
    shortTitle: "Virtualization Engineering",
    emailSubject: "🎉 Registration Confirmed - Virtualization Engineering Roadmap",
    learningPoints: [
      "Master VMware vSphere, ESXi, and Microsoft Hyper-V.",
      "Configure virtualization clusters, resource allocation, and datastores.",
      "Implement high availability, fault tolerance, and load distribution.",
      "Design robust backup strategies and disaster recovery plans."
    ]
  },

  "server-engineering": {
    title: "Server Engineering Roadmap",
    shortTitle: "Server Engineering",
    emailSubject: "🎉 Registration Confirmed - Server Engineering Roadmap",
    learningPoints: [
      "Master Windows Server and Linux administration fundamentals.",
      "Configure Active Directory, Group Policies, DNS, and DHCP services.",
      "Perform server hardening, security configurations, and updates.",
      "Build automated server deployment and administration scripts."
    ]
  },

  "storage-engineering": {
    title: "Storage Engineering Roadmap",
    shortTitle: "Storage Engineering",
    emailSubject: "🎉 Registration Confirmed - Storage Engineering Roadmap",
    learningPoints: [
      "Master SAN and NAS enterprise storage networks and protocols.",
      "Configure RAID configurations, volume management, and pools.",
      "Administer Fibre Channel switch fabrics and host bus adapters (HBAs).",
      "Analyze latency, IOPS, and optimize data storage performance."
    ]
  },

  "backup-engineering": {
    title: "Backup Engineering Roadmap",
    shortTitle: "Backup Engineering",
    emailSubject: "🎉 Registration Confirmed - Backup Engineering Roadmap",
    learningPoints: [
      "Master Veeam Backup & Replication and enterprise Commvault solutions.",
      "Configure backup policies, retention schedules, and immutable vaults.",
      "Design high availability VM replicas and disaster recovery orchestrations.",
      "Execute restore tests and business continuity failover drills."
    ]
  }
};

export const getProgramConfig = (program) => {
  return PROGRAM_CONFIG[program] || PROGRAM_CONFIG["it-infrastructure"];
};
